// src/services/storage.ts
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, uploadBytes } from "firebase/storage";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { splitFileIntoChunks, createUploadSessionId, createChunkFilename } from "@/utils/fileChunker";

// Interface for upload progress
export interface UploadProgress {
  progress: number;
  state: 'paused' | 'running' | 'error' | 'success' | 'canceled';
  downloadURL?: string;
  error?: Error;
  importId?: string;
}

// Interface for import status
export interface ImportStatus {
  status: 'processing' | 'completed' | 'failed';
  fileName: string;
  startTime: Date;
  endTime?: Date;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: string[];
}

// Interface for import record
export interface ImportRecord {
  id: string;
  importId: string;
  fileName: string;
  downloadURL: string;
  status: string;
  timestamp: any;
  fileSize: number;
  fileType: string;
  userId?: string;
}

/**
 * Validate file before upload
 * @param file The file to validate
 * @returns Object with validation result and error message if any
 */
export const validateImportFile = (file: File): { valid: boolean; error?: string } => {
  // Validate file type
  const validTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JSON or CSV files only.'
    };
  }
  
  // Validate file size (150MB max)
  if (file.size > 150 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 150MB.'
    };
  }
  
  return { valid: true };
};

/**
 * Upload a file to Firebase Storage in the imports folder
 * @param file The file to upload
 * @param onProgress Callback for upload progress
 * @returns Promise with the download URL
 */
export const uploadImportFile = (
  file: File,
  onProgress: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file
    const validation = validateImportFile(file);
    if (!validation.valid) {
      onProgress({
        progress: 0,
        state: 'error',
        error: new Error(validation.error)
      });
      reject(new Error(validation.error));
      return;
    }
    
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name}`;
    const importId = `import-${timestamp}`;
    const userId = auth.currentUser?.uid;
    
    // Create a storage reference
    const storageRef = ref(storage, `imports/${fileName}`);
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      onProgress({
        progress: 0,
        state: 'error',
        error: new Error('User not authenticated. Please log in and try again.')
      });
      reject(new Error('User not authenticated'));
      return;
    }
    
    // Prepare for upload
    const prepareUpload = async () => {
      try {
        // Wait for auth token to be fully processed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create metadata with content type
        const metadata: {
          contentType: string;
          customMetadata: Record<string, string>;
        } = {
          contentType: file.type,
          customMetadata: {
            'uploaded-by': auth.currentUser?.uid || 'anonymous',
            'original-filename': file.name,
            'timestamp': new Date().toISOString()
          }
        };
        
        // Create the upload task with metadata
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);
        
        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress({
              progress,
              state: snapshot.state,
              importId
            });
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error('Upload error:', error);
            console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            console.error('Firebase Storage reference:', storageRef.fullPath);
            
            onProgress({
              progress: 0,
              state: 'error',
              error
            });
            reject(error);
          },
          async () => {
            // Handle successful uploads on complete
            try {
              // Get the download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Create an import record in Firestore
              await addDoc(collection(db, 'imports-web'), {
                fileName,
                importId,
                downloadURL,
                status: 'uploaded',
                timestamp: serverTimestamp(),
                fileSize: file.size,
                fileType: file.type,
                userId: userId || 'anonymous'
              });
              
              onProgress({
                progress: 100,
                state: 'success',
                downloadURL,
                importId
              });
              
              resolve(downloadURL);
            } catch (error) {
              onProgress({
                progress: 100,
                state: 'error',
                error: error as Error
              });
              reject(error);
            }
          }
        );
      } catch (error) {
        onProgress({
          progress: 0,
          state: 'error',
          error: error as Error
        });
        reject(error);
      }
    };
    
    // Start the upload process
    prepareUpload();
  });
};

/**
 * Get the status of an import job
 * @param importId The ID of the import job
 * @returns Promise with the import status
 */
export const getImportStatus = async (importId: string): Promise<ImportStatus> => {
  try {
    const getImportStatusFn = httpsCallable<{importId: string}, ImportStatus>(
      functions,
      'getImportStatus'
    );
    
    const result = await getImportStatusFn({ importId });
    return result.data;
  } catch (error) {
    console.error('Error getting import status:', error);
    throw error;
  }
};

/**
 * List all imports for the current user
 * @returns Promise with array of import records
 */
export const listUserImports = async (): Promise<ImportRecord[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  
  try {
    const q = query(
      collection(db, 'imports-web'), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ImportRecord));
  } catch (error) {
    console.error('Error listing imports:', error);
    throw error;
  }
};

/**
 * Upload a large file in chunks
 * @param file The file to upload
 * @param onProgress Callback for upload progress
 * @param chunkSize Size of each chunk in bytes (default: 8MB)
 * @returns Promise with the import ID
 */
export const uploadLargeImportFile = (
  file: File,
  onProgress: (progress: UploadProgress) => void,
  chunkSize: number = 8 * 1024 * 1024
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file
    const validation = validateImportFile(file);
    if (!validation.valid) {
      onProgress({
        progress: 0,
        state: 'error',
        error: new Error(validation.error)
      });
      reject(new Error(validation.error));
      return;
    }
    
    const processUpload = async () => {
      try {
        // Create a unique session ID for this upload
        const sessionId = createUploadSessionId();
        const importId = `import-${sessionId}`;
        const userId = auth.currentUser?.uid;
        
        // Split the file into chunks
        const chunks = splitFileIntoChunks(file, chunkSize);
        const totalChunks = chunks.length;
        
        // Create an import record in Firestore
        await addDoc(collection(db, 'imports-web'), {
          fileName: file.name,
          importId,
          status: 'chunked-upload',
          timestamp: serverTimestamp(),
          fileSize: file.size,
          fileType: file.type,
          userId: userId || 'anonymous',
          totalChunks,
          uploadedChunks: 0,
          sessionId
        });
        
        // Upload each chunk
        let uploadedChunks = 0;
        const chunkUrls: string[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkFileName = createChunkFilename(file.name, sessionId, i, totalChunks);
          const chunkRef = ref(storage, `imports/chunks/${chunkFileName}`);
          
          try {
            // Check if user is authenticated
            if (!auth.currentUser) {
              throw new Error('User not authenticated. Please log in and try again.');
            }
            
            // Create metadata with auth info
            const metadata: {
              contentType: string;
              customMetadata: Record<string, string>;
            } = {
              contentType: file.type,
              customMetadata: {
                'uploaded-by': auth.currentUser.uid,
                'original-filename': file.name,
                'chunk-index': i.toString(),
                'total-chunks': totalChunks.toString(),
                'session-id': sessionId,
                'timestamp': new Date().toISOString()
              }
            };
            
            // Upload the chunk with metadata
            await uploadBytes(chunkRef, chunk, metadata);
            
            // Get the download URL
            const chunkUrl = await getDownloadURL(chunkRef);
            chunkUrls.push(chunkUrl);
            
            // Update progress
            uploadedChunks++;
            const progress = (uploadedChunks / totalChunks) * 100;
            
            // Update the import record
            const q = query(
              collection(db, 'imports-web'),
              where('importId', '==', importId)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const importDoc = querySnapshot.docs[0];
              await updateDoc(doc(db, 'imports-web', importDoc.id), {
                uploadedChunks,
                chunkUrls
              });
            }
            
            // Report progress
            onProgress({
              progress,
              state: 'running',
              importId
            });
          } catch (error) {
            console.error(`Error uploading chunk ${i}:`, error);
            onProgress({
              progress: (uploadedChunks / totalChunks) * 100,
              state: 'error',
              error: error as Error,
              importId
            });
            reject(error);
            return;
          }
        }
        
        // All chunks uploaded successfully
        // Update the import record status
        const q = query(
          collection(db, 'imports-web'),
          where('importId', '==', importId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const importDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'imports-web', importDoc.id), {
            status: 'uploaded',
            chunkUrls
          });
        }
        
        onProgress({
          progress: 100,
          state: 'success',
          importId
        });
        
        resolve(importId);
      } catch (error) {
        // Log detailed error information
        console.error('Error in chunked upload:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        onProgress({
          progress: 0,
          state: 'error',
          error: error as Error
        });
        reject(error);
      }
    };
    
    // Start the upload process
    processUpload();
  });
};

/**
 * Delete an import
 * @param importId The ID of the import to delete
 * @returns Promise that resolves when the import is deleted
 */
export const deleteImport = async (importId: string): Promise<void> => {
  try {
    // Get the import record
    const q = query(
      collection(db, 'imports-web'), 
      where('importId', '==', importId)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Import not found');
    }
    
    const importDoc = querySnapshot.docs[0];
    const importData = importDoc.data() as ImportRecord;
    
    // Check if user has permission to delete
    const userId = auth.currentUser?.uid;
    if (importData.userId && importData.userId !== userId) {
      throw new Error('You do not have permission to delete this import');
    }
    
    // Delete the file from storage if it exists
    if (importData.downloadURL) {
      try {
        const fileRef = ref(storage, importData.downloadURL);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        // Continue with deleting the record even if file deletion fails
      }
    }
    
    // Delete the import record
    await deleteDoc(doc(db, 'imports-web', importDoc.id));
  } catch (error) {
    console.error('Error deleting import:', error);
    throw error;
  }
};
