// src/services/firestore.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  DocumentData,
  writeBatch,
  serverTimestamp,
  QueryConstraint,
  startAfter,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from "firebase/firestore";

// Re-export Firestore types and functions that we need in other files
export { QueryConstraint, where, orderBy, limit, startAfter, DocumentSnapshot };
// src/services/firestore.ts
import { db, auth } from "@/lib/firebase";
import { Company, Stakeholder } from "@/types/company";

// Collection references
const companiesRef = collection(db, "companies");
const stakeholdersRef = collection(db, "stakeholders");
const usersRef = collection(db, "users");

// Batch size for Firestore operations
const BATCH_SIZE = 500;

// Company CRUD operations
export const addCompany = async (company: Company): Promise<string> => {
  try {
    // Generate a company ID if not provided
    if (!company.companyId) {
      company.companyId = `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Add metadata
    const enhancedCompany = {
      ...company,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'system'
    };
    
    // Use company ID as document ID
    await setDoc(doc(companiesRef, company.companyId), enhancedCompany);
    return company.companyId;
  } catch (error) {
    console.error('Error adding company:', error);
    throw error;
  }
};

export const getCompany = async (companyId: string): Promise<Company | null> => {
  try {
    const docSnap = await getDoc(doc(companiesRef, companyId));
    if (docSnap.exists()) {
      return docSnap.data() as Company;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting company ${companyId}:`, error);
    throw error;
  }
};

export const updateCompany = async (companyId: string, data: Partial<Company>): Promise<void> => {
  try {
    // Add metadata
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid || 'system'
    };
    
    await updateDoc(doc(companiesRef, companyId), updateData);
  } catch (error) {
    console.error(`Error updating company ${companyId}:`, error);
    throw error;
  }
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  try {
    // Delete associated stakeholders first
    const stakeholdersQuery = query(stakeholdersRef, where("companyId", "==", companyId));
    const stakeholderDocs = await getDocs(stakeholdersQuery);
    
    const batch = writeBatch(db);
    stakeholderDocs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the company
    batch.delete(doc(companiesRef, companyId));
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error(`Error deleting company ${companyId}:`, error);
    throw error;
  }
};

// Pagination interface
export interface PaginatedResult<T> {
  items: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

// Get companies with pagination
export const getCompanies = async (
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot | null,
  filters: QueryConstraint[] = []
): Promise<PaginatedResult<Company>> => {
  try {
    let queryConstraints: QueryConstraint[] = [
      orderBy("name"),
      limit(pageSize + 1) // Get one extra to check if there are more
    ];
    
    // Add starting point for pagination if provided
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }
    
    // Add any additional filters
    queryConstraints = [...queryConstraints, ...filters];
    
    // Create and execute query
    const q = query(companiesRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    // Check if there are more results
    const hasMore = querySnapshot.docs.length > pageSize;
    
    // Remove the extra item if there are more
    const docs = hasMore ? querySnapshot.docs.slice(0, pageSize) : querySnapshot.docs;
    
    // Get the last document for next pagination
    const lastVisible = docs.length > 0 ? docs[docs.length - 1] : null;
    
    // Map documents to Company objects
    const companies = docs.map(doc => doc.data() as Company);
    
    return {
      items: companies,
      lastDoc: lastVisible,
      hasMore
    };
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

// Query functions
export const queryCompaniesByIndustry = async (
  industry: string,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot | null
): Promise<PaginatedResult<Company>> => {
  const filters = [where("info.proffIndustries", "==", industry)];
  return getCompanies(pageSize, lastDoc, filters);
};

export const queryCompaniesByLocation = async (
  municipality: string,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot | null
): Promise<PaginatedResult<Company>> => {
  const filters = [where("location.municipality", "==", municipality)];
  return getCompanies(pageSize, lastDoc, filters);
};

// Enhanced search function with fuzzy matching and multi-field search
export const searchCompanies = async (
  searchQuery: string,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot | null
): Promise<PaginatedResult<Company>> => {
  try {
    // If search query is empty, return regular paginated results
    if (!searchQuery.trim()) {
      return getCompanies(pageSize, lastDoc);
    }
    
    // Normalize the search query
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    // For server-side search, we would use Firestore's array-contains-any or similar
    // Since we're implementing client-side fuzzy search for now, we'll fetch more results
    // and filter them in memory
    
    // Get a larger batch of companies to filter
    const result = await getCompanies(pageSize * 5, lastDoc);
    
    // Implement fuzzy matching by checking if the search query is contained
    // within any of the searchable fields
    const filteredCompanies = result.items.filter(company => {
      // Check company name
      if (company.name?.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check industry/naceCategories
      if (company.info?.naceCategories?.toLowerCase().includes(normalizedQuery) ||
          (company as any).naceCategories?.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check location fields
      if (company.location?.municipality?.toLowerCase().includes(normalizedQuery) ||
          company.location?.county?.toLowerCase().includes(normalizedQuery) ||
          (company as any).location_municipality?.toLowerCase().includes(normalizedQuery) ||
          (company as any).location_county?.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check organization number
      if (company.organisationNumber?.includes(normalizedQuery)) {
        return true;
      }
      
      // Check postal address
      if (company.postalAddress?.postPlace?.toLowerCase().includes(normalizedQuery) ||
          company.postalAddress?.addressLine?.toLowerCase().includes(normalizedQuery) ||
          (company as any).postalAddress_postPlace?.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check stakeholders
      if (company.stakeholders?.some(stakeholder => 
        stakeholder.name?.toLowerCase().includes(normalizedQuery) ||
        stakeholder.role?.toLowerCase().includes(normalizedQuery) ||
        stakeholder.email?.toLowerCase().includes(normalizedQuery)
      )) {
        return true;
      }
      
      return false;
    });
    
    // Limit to requested page size
    const paginatedCompanies = filteredCompanies.slice(0, pageSize);
    
    // Determine if there are more results
    const hasMore = filteredCompanies.length > pageSize;
    
    // Get the last document for pagination
    const lastVisible = paginatedCompanies.length > 0 
      ? result.items.findIndex(company => company.companyId === paginatedCompanies[paginatedCompanies.length - 1].companyId)
      : -1;
    
    // Return the paginated result
    return {
      items: paginatedCompanies,
      lastDoc: lastVisible >= 0 && lastVisible < result.items.length ? result.lastDoc : null,
      hasMore
    };
  } catch (error) {
    console.error('Error searching companies:', error);
    throw error;
  }
};

// Stakeholder operations
export const addStakeholder = async (companyId: string, stakeholder: Stakeholder): Promise<string> => {
  try {
    // Generate an ID if not provided
    if (!stakeholder.id) {
      stakeholder.id = `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Add metadata
    const enhancedStakeholder = {
      ...stakeholder,
      companyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'system'
    };
    
    // Add stakeholder to the stakeholders collection
    await setDoc(doc(stakeholdersRef, stakeholder.id), enhancedStakeholder);
    
    // Update the company's stakeholders array
    const companyRef = doc(companiesRef, companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      const company = companyDoc.data() as Company;
      const stakeholders = company.stakeholders || [];
      
      await updateDoc(companyRef, {
        stakeholders: [...stakeholders, stakeholder],
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'system'
      });
    }
    
    return stakeholder.id;
  } catch (error) {
    console.error(`Error adding stakeholder to company ${companyId}:`, error);
    throw error;
  }
};

export const updateStakeholder = async (
  stakeholderId: string,
  data: Partial<Stakeholder>
): Promise<void> => {
  try {
    // Add metadata
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid || 'system'
    };
    
    // Update the stakeholder document
    await updateDoc(doc(stakeholdersRef, stakeholderId), updateData);
    
    // If companyId is available, update the stakeholder in the company's array
    const stakeholderDoc = await getDoc(doc(stakeholdersRef, stakeholderId));
    if (stakeholderDoc.exists()) {
      const stakeholder = stakeholderDoc.data() as Stakeholder & { companyId: string };
      if (stakeholder.companyId) {
        const companyRef = doc(companiesRef, stakeholder.companyId);
        const companyDoc = await getDoc(companyRef);
        
        if (companyDoc.exists()) {
          const company = companyDoc.data() as Company;
          const stakeholders = company.stakeholders || [];
          
          // Find and update the stakeholder in the array
          const updatedStakeholders = stakeholders.map(s => 
            s.id === stakeholderId ? { ...s, ...data } : s
          );
          
          await updateDoc(companyRef, {
            stakeholders: updatedStakeholders,
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser?.uid || 'system'
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error updating stakeholder ${stakeholderId}:`, error);
    throw error;
  }
};

export const deleteStakeholder = async (stakeholderId: string): Promise<void> => {
  try {
    // Get the stakeholder to find its company
    const stakeholderDoc = await getDoc(doc(stakeholdersRef, stakeholderId));
    if (stakeholderDoc.exists()) {
      const stakeholder = stakeholderDoc.data() as Stakeholder & { companyId: string };
      
      // Remove from company's stakeholders array if companyId exists
      if (stakeholder.companyId) {
        const companyRef = doc(companiesRef, stakeholder.companyId);
        const companyDoc = await getDoc(companyRef);
        
        if (companyDoc.exists()) {
          const company = companyDoc.data() as Company;
          const stakeholders = company.stakeholders || [];
          
          // Filter out the stakeholder to delete
          const updatedStakeholders = stakeholders.filter(s => s.id !== stakeholderId);
          
          await updateDoc(companyRef, {
            stakeholders: updatedStakeholders,
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser?.uid || 'system'
          });
        }
      }
    }
    
    // Delete the stakeholder document
    await deleteDoc(doc(stakeholdersRef, stakeholderId));
  } catch (error) {
    console.error(`Error deleting stakeholder ${stakeholderId}:`, error);
    throw error;
  }
};

export const getCompanyStakeholders = async (companyId: string): Promise<Stakeholder[]> => {
  try {
    const q = query(stakeholdersRef, where("companyId", "==", companyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Stakeholder);
  } catch (error) {
    console.error(`Error getting stakeholders for company ${companyId}:`, error);
    throw error;
  }
};

// Data import functions
export const importCompaniesFromJSON = async (companies: Company[]): Promise<{
  successful: number;
  failed: number;
  errors: string[];
}> => {
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];
  
  try {
    // Process in batches for better performance
    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const currentBatch = companies.slice(i, i + BATCH_SIZE);
      
      for (const company of currentBatch) {
        try {
          // Ensure company has an ID
          if (!company.companyId) {
            company.companyId = `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          }
          
          // Add metadata
          const enhancedCompany = {
            ...company,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: auth.currentUser?.uid || 'system',
            importedAt: serverTimestamp()
          };
          
          // Add to batch
          batch.set(doc(companiesRef, company.companyId), enhancedCompany);
          successful++;
        } catch (error) {
          console.error(`Error processing company ${company.companyId || 'unknown'}:`, error);
          failed++;
          errors.push(`Error processing company ${company.companyId || 'unknown'}: ${error}`);
        }
      }
      
      // Commit the batch
      try {
        await batch.commit();
      } catch (error) {
        console.error(`Error committing batch starting at index ${i}:`, error);
        // If batch fails, count all companies in the batch as failed
        successful -= currentBatch.length;
        failed += currentBatch.length;
        errors.push(`Error committing batch starting at index ${i}: ${error}`);
      }
    }
    
    return { successful, failed, errors };
  } catch (error) {
    console.error('Error importing companies:', error);
    throw error;
  }
};

// User management functions
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: any;
  lastLogin: any;
  photoURL?: string;
}

export const getUsers = async (): Promise<UserData[]> => {
  try {
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserData));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const docSnap = await getDoc(doc(usersRef, uid));
    if (docSnap.exists()) {
      return {
        uid: docSnap.id,
        ...docSnap.data()
      } as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting user ${uid}:`, error);
    throw error;
  }
};

// Get all companies (no pagination)
export const getAllCompanies = async (): Promise<Company[]> => {
  try {
    const querySnapshot = await getDocs(companiesRef);
    return querySnapshot.docs.map(doc => doc.data() as Company);
  } catch (error) {
    console.error('Error getting all companies:', error);
    throw error;
  }
};
