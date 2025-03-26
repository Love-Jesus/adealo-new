# Claude AI Integration - Temporarily Disabled

This document explains the changes made to disable the Claude AI integration due to CORS issues, and how to re-enable it in the future.

## Changes Made

1. **Modified `processWithClaude` function in `chat.ts`**:
   - Removed the call to the Firebase function `processClaudeMessage`
   - Replaced it with a placeholder response
   - Kept the rest of the AI functionality intact (conversation history formatting, message storage, etc.)

## CORS Issue

The following CORS error was occurring when the chat widget tried to call the Claude AI function:

```
Access to fetch at 'https://us-central1-adealo-ce238.cloudfunctions.net/processClaudeMessage' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

This error occurs because the Firebase function `processClaudeMessage` is not configured to allow requests from the development server at `http://localhost:5173`.

## Current Behavior

With the changes made:

1. The AI functionality is still "enabled" in the UI (the `aiEnabled` flag is still present in conversations)
2. When a user sends a message that would normally be processed by Claude AI, they will receive a placeholder response: "AI functionality is temporarily disabled. A support agent will assist you shortly."
3. The message is still stored in the database with the sender set to 'ai'
4. The conversation is updated with the last message info

## How to Re-enable Claude AI in the Future

To re-enable the Claude AI integration:

1. **Fix CORS Configuration**:
   - Update the Firebase function to include the appropriate CORS headers
   - Add the development server origin (`http://localhost:5173`) to the allowed origins

2. **Update `processWithClaude` function in `chat.ts`**:
   - Restore the original code that calls the Firebase function
   - Remove the placeholder response

### Example CORS Configuration for Firebase Functions

Add the following code to the Firebase function:

```typescript
// In functions/src/claude.ts
import * as cors from 'cors';

const corsHandler = cors({
  origin: [
    'http://localhost:5173',
    'https://your-production-domain.com'
  ],
  methods: ['GET', 'POST'],
  credentials: true
});

export const processClaudeMessage = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    corsHandler(req, res, () => {
      // Original function code here
    });
  });
});
```

### Restoring the Original Code

To restore the original code in `chat.ts`, replace the current `processWithClaude` function with:

```typescript
// Process message with Claude AI
export const processWithClaude = async (
  conversationId: string,
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ClaudeResponse> => {
  try {
    // Get the conversation to check if AI is enabled
    const conversation = await getConversationById(conversationId);
    
    if (!conversation || !conversation.aiEnabled) {
      throw new Error('AI is not enabled for this conversation');
    }
    
    // Format conversation history for Claude
    const formattedHistory = conversationHistory
      .filter(msg => !msg.isInternal) // Filter out internal messages
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
    
    // Add the current message
    formattedHistory.push({
      role: 'user',
      content: message
    });
    
    // Call Claude API via Firebase Function
    const processAI = httpsCallable(functions, 'processClaudeMessage');
    const result = await processAI({
      conversationId,
      messages: formattedHistory
    });
    
    const response = result.data as ClaudeResponse;
    
    // Add AI response to the conversation
    if (response.text) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const messageData = {
        conversationId,
        text: response.text,
        sender: 'ai',
        senderId: 'claude-ai',
        senderName: 'AI Assistant',
        timestamp: serverTimestamp(),
        isRead: false,
        isInternal: false
      };
      
      // Add message to conversation
      await addDoc(messagesCollection(conversationId), messageData);
      
      // Update conversation with last message info
      await updateDoc(doc(conversationsCollection(), conversationId), {
        lastMessage: response.text,
        lastMessageSender: 'ai',
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error processing message with Claude:', error);
    throw error;
  }
};
```

## Alternative Approaches

If CORS issues persist, consider these alternative approaches:

1. **Proxy the Request**: Create a proxy server that forwards requests to the Claude API
2. **Use a CORS Proxy**: Use a CORS proxy service for development
3. **Implement the Claude API Client-Side**: Call the Claude API directly from the client (requires secure handling of API keys)
4. **Use a Different AI Provider**: Consider using a different AI provider that has better CORS support

## Next Steps

The AI chat functionality will be fully implemented in a future update. For now, the chat widget will function without AI assistance, and users will be directed to human support agents.
