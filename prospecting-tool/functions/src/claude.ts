import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin if not already initialized
try {
  admin.initializeApp();
} catch (error) {
  // App already initialized
}

// Initialize Firestore
const db = admin.firestore();

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  messages: Message[];
  max_tokens: number;
  temperature: number;
  system?: string;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Process a message with Claude AI
 * This function is called by the client to get AI responses
 */
export const processClaudeMessage = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to use this feature'
      );
    }
    
    // Get data from request
    const { conversationId, messages } = data;
    
    if (!conversationId || !messages || !Array.isArray(messages)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Conversation ID and messages array are required'
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Claude API key is not configured'
      );
    }
    
    // Get conversation from Firestore to check if AI is enabled
    const conversationRef = db.collection('chatConversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    
    if (!conversationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Conversation not found'
      );
    }
    
    const conversation = conversationDoc.data();
    
    if (!conversation || !conversation.aiEnabled) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'AI is not enabled for this conversation'
      );
    }
    
    // Get widget information to customize AI behavior
    let systemPrompt = "You are a helpful customer support assistant. Be friendly, professional, and concise. If you don't know the answer to a question, offer to connect the customer with a human agent.";
    
    if (conversation.widgetId) {
      const widgetRef = db.collection('widgets').doc(conversation.widgetId);
      const widgetDoc = await widgetRef.get();
      
      if (widgetDoc.exists) {
        const widget = widgetDoc.data();
        
        if (widget && widget.type === 'Chat Support' && widget.chatConfig) {
          // Customize system prompt based on widget configuration
          systemPrompt = `You are a helpful customer support assistant for ${widget.content.title || 'our company'}. 
Be friendly, professional, and concise. If you don't know the answer to a question, offer to connect the customer with a human agent.
Your name is ${widget.chatConfig.teamName || 'Support Assistant'}.`;
        }
      }
    }
    
    // Prepare request to Claude API
    const claudeRequest: ClaudeRequest = {
      model: 'claude-3-opus-20240229', // Using the latest Claude model
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt
    };
    
    // Call Claude API
    const response = await axios.post<ClaudeResponse>(
      CLAUDE_API_URL,
      claudeRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    // Extract text from response
    const aiResponse = response.data.content[0]?.text || '';
    
    // Log usage for billing purposes
    await db.collection('aiUsage').add({
      conversationId,
      teamId: conversation.teamId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      inputTokens: response.data.usage.input_tokens,
      outputTokens: response.data.usage.output_tokens,
      model: response.data.model,
      cost: calculateCost(response.data.usage.input_tokens, response.data.usage.output_tokens, response.data.model)
    });
    
    // Return AI response
    return {
      text: aiResponse,
      isComplete: response.data.stop_reason === 'end_turn',
      model: response.data.model,
      usage: response.data.usage
    };
  } catch (error: any) {
    console.error('Error processing Claude message:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Claude API error
      throw new functions.https.HttpsError(
        'internal',
        `Claude API error: ${error.response.data.error?.message || 'Unknown error'}`,
        error.response.data
      );
    } else if (error instanceof functions.https.HttpsError) {
      // Re-throw Firebase errors
      throw error;
    } else {
      // Generic error
      throw new functions.https.HttpsError(
        'internal',
        `Error processing message: ${error.message}`,
        error
      );
    }
  }
});

/**
 * Calculate the cost of Claude API usage
 * This is a simplified calculation based on current pricing
 */
function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  // Pricing per 1M tokens (in USD)
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-opus-20240229': { input: 15, output: 75 },
    'claude-3-sonnet-20240229': { input: 3, output: 15 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'claude-2.1': { input: 8, output: 24 },
    'claude-2.0': { input: 8, output: 24 },
    'claude-instant-1.2': { input: 1.63, output: 5.51 }
  };
  
  // Default to opus pricing if model not found
  const { input: inputPrice, output: outputPrice } = pricing[model] || pricing['claude-3-opus-20240229'];
  
  // Calculate cost in USD
  const inputCost = (inputTokens / 1000000) * inputPrice;
  const outputCost = (outputTokens / 1000000) * outputPrice;
  
  return inputCost + outputCost;
}

/**
 * Update Claude API key
 * This function is called by the admin to update the API key
 */
export const updateClaudeApiKey = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated and is an admin
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to use this feature'
      );
    }
    
    // Check if user is an admin
    const userRef = db.collection('users').doc(context.auth.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can update the API key'
      );
    }
    
    // Get API key from request
    const { apiKey } = data;
    
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'API key is required'
      );
    }
    
    // Store API key in environment configuration
    // Note: This is a simplified example. In a real implementation,
    // you would use a more secure method to store API keys.
    await db.collection('settings').doc('claude').set({
      apiKey,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating Claude API key:', error);
    
    if (error instanceof functions.https.HttpsError) {
      // Re-throw Firebase errors
      throw error;
    } else {
      // Generic error
      throw new functions.https.HttpsError(
        'internal',
        `Error updating API key: ${error.message}`,
        error
      );
    }
  }
});
