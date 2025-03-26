import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  DocumentReference,
  writeBatch,
  QueryDocumentSnapshot
} from "firebase/firestore";

// Types
export interface SupportMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Timestamp;
  read: boolean;
  userId: string;
  userEmail?: string;
  userName?: string;
}

export interface SupportSettings {
  enabled: boolean;
  lastUpdated: Timestamp;
  updatedBy: string;
}

export interface SupportContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
}

// Default settings
const defaultSettings: Omit<SupportSettings, 'lastUpdated' | 'updatedBy'> = {
  enabled: false
};

// Get support settings
export const getSupportSettings = async (): Promise<SupportSettings> => {
  try {
    const settingsRef = doc(db, 'settings', 'support');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as SupportSettings;
    } else {
      // Create default settings if they don't exist
      const user = auth.currentUser;
      const newSettings = {
        ...defaultSettings,
        lastUpdated: serverTimestamp(),
        updatedBy: user?.uid || 'system'
      };
      
      await setDoc(settingsRef, newSettings);
      return newSettings as SupportSettings;
    }
  } catch (error) {
    console.error("Error getting support settings:", error);
    throw error;
  }
};

// Update support settings
export const updateSupportSettings = async (settings: Partial<SupportSettings>): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const settingsRef = doc(db, 'settings', 'support');
    
    await updateDoc(settingsRef, {
      ...settings,
      lastUpdated: serverTimestamp(),
      updatedBy: user.uid
    });
  } catch (error) {
    console.error("Error updating support settings:", error);
    throw error;
  }
};

// Send a support message
export const sendSupportMessage = async (text: string, chatId?: string): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    // If no chatId is provided, create a new chat
    if (!chatId) {
      const chatRef = await addDoc(collection(db, 'supportChats'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        status: 'open'
      });
      
      chatId = chatRef.id;
    }
    
    // Add message to the chat
    const messageRef = await addDoc(collection(db, 'supportChats', chatId, 'messages'), {
      text,
      sender: 'user',
      timestamp: serverTimestamp(),
      read: false,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName
    });
    
    // Update the chat's lastMessageAt
    await updateDoc(doc(db, 'supportChats', chatId), {
      lastMessageAt: serverTimestamp()
    });
    
    return chatId;
  } catch (error) {
    console.error("Error sending support message:", error);
    throw error;
  }
};

// Send a contact form
export const submitContactForm = async (
  name: string, 
  email: string, 
  subject: string, 
  message: string
): Promise<string> => {
  try {
    const contactRef = await addDoc(collection(db, 'supportContacts'), {
      name,
      email,
      subject,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
    
    return contactRef.id;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
};

// Listen to messages in a chat
export const listenToSupportMessages = (
  chatId: string, 
  callback: (messages: SupportMessage[]) => void
): (() => void) => {
  const messagesRef = collection(db, 'supportChats', chatId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
  
  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const messages: SupportMessage[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        sender: data.sender,
        timestamp: data.timestamp,
        read: data.read,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName
      });
    });
    
    callback(messages);
  });
  
  return unsubscribe;
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const messagesRef = collection(db, 'supportChats', chatId, 'messages');
    const messagesQuery = query(messagesRef, where('read', '==', false), where('sender', '!=', user.uid));
    
    const snapshot = await getDocs(messagesQuery);
    
    const batch = writeBatch(db);
    snapshot.forEach((docSnapshot: QueryDocumentSnapshot) => {
      batch.update(docSnapshot.ref, { read: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Check if admin is available
export const isAdminAvailable = async (): Promise<boolean> => {
  try {
    const settings = await getSupportSettings();
    return settings.enabled;
  } catch (error) {
    console.error("Error checking if admin is available:", error);
    return false;
  }
};
