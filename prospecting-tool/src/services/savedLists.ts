import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  orderBy
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Company } from "@/types/company";

export interface SavedList {
  id?: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  companyIds: string[];
  filterOptions?: any[];
}

// Save a new list
export const saveList = async (
  name: string, 
  description: string, 
  companyIds: string[],
  filterOptions?: any[]
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const now = Timestamp.now();
    
    const savedList: SavedList = {
      name,
      description,
      createdAt: now,
      updatedAt: now,
      userId: user.uid,
      companyIds,
      filterOptions
    };

    const docRef = await addDoc(collection(db, "savedLists"), savedList);
    return docRef.id;
  } catch (error) {
    console.error("Error saving list:", error);
    throw error;
  }
};

// Get all saved lists for the current user
export const getSavedLists = async (): Promise<SavedList[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "savedLists"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SavedList));
  } catch (error) {
    console.error("Error getting saved lists:", error);
    throw error;
  }
};

// Update a saved list
export const updateSavedList = async (
  listId: string,
  updates: Partial<SavedList>
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const listRef = doc(db, "savedLists", listId);
    
    await updateDoc(listRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating saved list:", error);
    throw error;
  }
};

// Delete a saved list
export const deleteSavedList = async (listId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    await deleteDoc(doc(db, "savedLists", listId));
  } catch (error) {
    console.error("Error deleting saved list:", error);
    throw error;
  }
};
