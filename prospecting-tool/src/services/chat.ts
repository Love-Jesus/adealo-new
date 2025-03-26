import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  onSnapshot,
  limit,
  startAfter,
  DocumentSnapshot,
  writeBatch,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'user' | 'agent' | 'ai';
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: Date;
  isRead: boolean;
  isInternal: boolean;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  mentions?: string[]; // Array of user IDs mentioned in the message
}

export interface ChatConversation {
  id: string;
  widgetId: string;
  teamId: string;
  status: 'active' | 'closed' | 'archived';
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  lastMessage?: string;
  lastMessageSender?: 'user' | 'agent' | 'ai';
  assignedTo?: string;
  assignedToName?: string;
  visitor: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    ip?: string;
    userAgent?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
  tags?: string[];
  metadata?: Record<string, any>;
  aiEnabled: boolean;
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  averageResponseTime: number;
  messagesPerConversation: number;
  aiHandledPercentage: number;
}

// Collection references
const conversationsCollection = () => collection(db, 'chatConversations');
const messagesCollection = (conversationId: string) => 
  collection(db, 'chatConversations', conversationId, 'messages');

// Convert Firestore data to ChatConversation
const convertToConversation = (doc: any): ChatConversation => {
  const data = doc.data();
  
  return {
    id: doc.id,
    widgetId: data.widgetId,
    teamId: data.teamId,
    status: data.status,
    subject: data.subject,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    lastMessageAt: data.lastMessageAt?.toDate(),
    lastMessage: data.lastMessage,
    lastMessageSender: data.lastMessageSender,
    assignedTo: data.assignedTo,
    assignedToName: data.assignedToName,
    visitor: data.visitor,
    tags: data.tags || [],
    metadata: data.metadata || {},
    aiEnabled: data.aiEnabled
  };
};

// Convert Firestore data to ChatMessage
const convertToMessage = (doc: any): ChatMessage => {
  const data = doc.data();
  
  return {
    id: doc.id,
    conversationId: data.conversationId,
    text: data.text,
    sender: data.sender,
    senderId: data.senderId,
    senderName: data.senderName,
    senderAvatar: data.senderAvatar,
    timestamp: data.timestamp?.toDate(),
    isRead: data.isRead,
    isInternal: data.isInternal || false,
    attachments: data.attachments || [],
    mentions: data.mentions || []
  };
};

// Get conversations for the current team
export const getConversations = async (
  status: 'active' | 'closed' | 'archived' | 'all' = 'active',
  pageSize = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ items: ChatConversation[], lastDoc: DocumentSnapshot | null, hasMore: boolean }> => {
  try {
    const userId = auth.currentUser?.uid;
    const teamId = localStorage.getItem('currentTeamId') || 'default';
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    let q = query(
      conversationsCollection(),
      where('teamId', '==', teamId),
      orderBy('lastMessageAt', 'desc')
    );
    
    if (status !== 'all') {
      q = query(q, where('status', '==', status));
    }
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc), limit(pageSize));
    } else {
      q = query(q, limit(pageSize));
    }
    
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(convertToConversation);
    
    return {
      items: conversations,
      lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

// Get a single conversation by ID
export const getConversationById = async (conversationId: string): Promise<ChatConversation | null> => {
  try {
    const conversationDoc = await getDoc(doc(conversationsCollection(), conversationId));
    
    if (!conversationDoc.exists()) {
      return null;
    }
    
    return convertToConversation(conversationDoc);
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (
  widgetId: string,
  visitor: ChatConversation['visitor'],
  subject?: string,
  aiEnabled = true
): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    const teamId = localStorage.getItem('currentTeamId') || 'default';
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const now = serverTimestamp();
    const conversationData = {
      widgetId,
      teamId,
      status: 'active',
      subject,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      visitor,
      aiEnabled
    };
    
    const docRef = await addDoc(conversationsCollection(), conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Update conversation status
export const updateConversationStatus = async (
  conversationId: string, 
  status: 'active' | 'closed' | 'archived'
): Promise<void> => {
  try {
    await updateDoc(doc(conversationsCollection(), conversationId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    throw error;
  }
};

// Assign conversation to agent
export const assignConversation = async (
  conversationId: string,
  agentId: string,
  agentName: string
): Promise<void> => {
  try {
    await updateDoc(doc(conversationsCollection(), conversationId), {
      assignedTo: agentId,
      assignedToName: agentName,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning conversation:', error);
    throw error;
  }
};

// Add tags to conversation
export const addTagsToConversation = async (
  conversationId: string,
  tags: string[]
): Promise<void> => {
  try {
    const conversationRef = doc(conversationsCollection(), conversationId);
    
    await updateDoc(conversationRef, {
      tags: arrayUnion(...tags),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding tags to conversation:', error);
    throw error;
  }
};

// Remove tag from conversation
export const removeTagFromConversation = async (
  conversationId: string,
  tag: string
): Promise<void> => {
  try {
    const conversationRef = doc(conversationsCollection(), conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }
    
    const data = conversationDoc.data();
    const tags = data.tags || [];
    const updatedTags = tags.filter((t: string) => t !== tag);
    
    await updateDoc(conversationRef, {
      tags: updatedTags,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error removing tag from conversation:', error);
    throw error;
  }
};

// Get messages for a conversation
export const getMessages = async (
  conversationId: string,
  pageSize = 50,
  lastDoc?: DocumentSnapshot
): Promise<{ items: ChatMessage[], lastDoc: DocumentSnapshot | null, hasMore: boolean }> => {
  try {
    let q = query(
      messagesCollection(conversationId),
      orderBy('timestamp', 'desc')
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc), limit(pageSize));
    } else {
      q = query(q, limit(pageSize));
    }
    
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(convertToMessage);
    
    // Reverse the messages to get them in ascending order
    messages.reverse();
    
    return {
      items: messages,
      lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[0] : null, // First doc because we reversed the order
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Listen to messages in a conversation
export const listenToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const q = query(
    messagesCollection(conversationId),
    orderBy('timestamp', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(convertToMessage);
    callback(messages);
  });
  
  return unsubscribe;
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  text: string,
  isInternal = false,
  attachments: File[] = [],
  mentions: string[] = []
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Upload attachments if any
    const uploadedAttachments = [];
    
    if (attachments.length > 0) {
      for (const file of attachments) {
        const fileRef = ref(storage, `chat-attachments/${conversationId}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        
        uploadedAttachments.push({
          name: file.name,
          url: downloadUrl,
          type: file.type,
          size: file.size
        });
      }
    }
    
    // Create message
    const messageData = {
      conversationId,
      text,
      sender: 'agent',
      senderId: user.uid,
      senderName: user.displayName || 'Agent',
      senderAvatar: user.photoURL || null, // Use null instead of undefined
      timestamp: serverTimestamp(),
      isRead: false,
      isInternal,
      attachments: uploadedAttachments,
      mentions
    };
    
    // Add message to conversation
    const messageRef = await addDoc(messagesCollection(conversationId), messageData);
    
    // Update conversation with last message info
    await updateDoc(doc(conversationsCollection(), conversationId), {
      lastMessage: text,
      lastMessageSender: 'agent',
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const q = query(
      messagesCollection(conversationId),
      where('isRead', '==', false),
      where('sender', '!=', 'agent')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return;
    }
    
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get chat statistics
export const getChatStats = async (teamId?: string): Promise<ChatStats> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const currentTeamId = teamId || localStorage.getItem('currentTeamId') || 'default';
    
    // Get total conversations
    const totalQuery = query(
      conversationsCollection(),
      where('teamId', '==', currentTeamId)
    );
    
    const activeQuery = query(
      conversationsCollection(),
      where('teamId', '==', currentTeamId),
      where('status', '==', 'active')
    );
    
    const resolvedQuery = query(
      conversationsCollection(),
      where('teamId', '==', currentTeamId),
      where('status', '==', 'closed')
    );
    
    const [totalSnapshot, activeSnapshot, resolvedSnapshot] = await Promise.all([
      getDocs(totalQuery),
      getDocs(activeQuery),
      getDocs(resolvedQuery)
    ]);
    
    // Calculate stats
    const totalConversations = totalSnapshot.size;
    const activeConversations = activeSnapshot.size;
    const resolvedConversations = resolvedSnapshot.size;
    
    // For more detailed stats, we would need to process each conversation
    // This is a simplified version
    return {
      totalConversations,
      activeConversations,
      resolvedConversations,
      averageResponseTime: 0, // Would require more complex calculations
      messagesPerConversation: 0, // Would require more complex calculations
      aiHandledPercentage: 0 // Would require more complex calculations
    };
  } catch (error) {
    console.error('Error getting chat stats:', error);
    throw error;
  }
};

// Claude AI integration
interface ClaudeResponse {
  text: string;
  isComplete: boolean;
}

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
    
    // CORS issue with processClaudeMessage function - temporarily disabled
    // Instead of calling the API, we'll return a placeholder response
    const placeholderResponse = {
      text: "AI functionality is temporarily disabled. A support agent will assist you shortly.",
      isComplete: true
    };
    
    // Add AI response to the conversation
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const messageData = {
      conversationId,
      text: placeholderResponse.text,
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
      lastMessage: placeholderResponse.text,
      lastMessageSender: 'ai',
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return placeholderResponse;
  } catch (error) {
    console.error('Error processing message with Claude:', error);
    throw error;
  }
};

// Toggle AI for a conversation
export const toggleAI = async (
  conversationId: string,
  enabled: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(conversationsCollection(), conversationId), {
      aiEnabled: enabled,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling AI:', error);
    throw error;
  }
};
