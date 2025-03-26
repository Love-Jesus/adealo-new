// src/services/directImport.ts
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Papa from 'papaparse';

// Interface for import progress
export interface ImportProgress {
  progress: number;
  state: 'processing' | 'error' | 'success' | 'canceled';
  error?: Error;
  importId?: string;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
}

/**
 * Parse a CSV file and import directly to Firestore
 * @param file The CSV file to import
 * @param onProgress Callback for import progress
 * @returns Promise with the import ID
 */
export const importCsvDirectly = (
  file: File,
  onProgress: (progress: ImportProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if user is authenticated
    if (!auth.currentUser) {
      onProgress({
        progress: 0,
        state: 'error',
        error: new Error('User not authenticated. Please log in and try again.'),
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0
      });
      reject(new Error('User not authenticated'));
      return;
    }

    // Create a unique import ID
    const timestamp = new Date().getTime();
    const importId = `direct-import-${timestamp}`;
    const userId = auth.currentUser.uid;

    // Create an import record in Firestore
    addDoc(collection(db, 'imports-web'), {
      fileName: file.name,
      importId,
      status: 'processing',
      timestamp: serverTimestamp(),
      fileSize: file.size,
      fileType: file.type,
      userId: userId || 'anonymous',
      method: 'direct-import'
    }).then(() => {
      // Parse the CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as Record<string, any>[];
          const totalRecords = data.length;
          let processedRecords = 0;
          let successfulRecords = 0;
          let failedRecords = 0;
          const errors: string[] = [];

          // Process in batches of 500 records
          const batchSize = 500;
          const batches = Math.ceil(totalRecords / batchSize);

          try {
            for (let i = 0; i < batches; i++) {
              const batch = writeBatch(db);
              const start = i * batchSize;
              const end = Math.min(start + batchSize, totalRecords);
              
              for (let j = start; j < end; j++) {
                const record = data[j];
                
                // Skip records without a companyId
                if (!record.companyId && !record.id) {
                  failedRecords++;
                  errors.push(`Record at index ${j} has no companyId or id`);
                  continue;
                }
                
                // Use companyId or id as the document ID
                const companyId = record.companyId || record.id;
                const companyRef = doc(collection(db, 'companies'), companyId);
                
                // Add import metadata
                record.importId = importId;
                record.importedAt = new Date().toISOString();
                record.importedBy = userId;
                
                // Add to batch
                batch.set(companyRef, record);
                successfulRecords++;
              }
              
              // Commit the batch
              await batch.commit();
              
              // Update progress
              processedRecords = end;
              const progress = (processedRecords / totalRecords) * 100;
              
              onProgress({
                progress,
                state: 'processing',
                importId,
                totalRecords,
                processedRecords,
                successfulRecords,
                failedRecords
              });
            }
            
            // Update the import record
            const importRef = doc(collection(db, 'imports-web'), importId);
            await addDoc(collection(db, 'import-results'), {
              importId,
              status: 'completed',
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords,
              errors,
              completedAt: serverTimestamp()
            });
            
            // Final progress update
            onProgress({
              progress: 100,
              state: 'success',
              importId,
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords
            });
            
            resolve(importId);
          } catch (error) {
            console.error('Error importing data:', error);
            
            // Update the import record with error status
            const importRef = doc(collection(db, 'imports-web'), importId);
            await addDoc(collection(db, 'import-results'), {
              importId,
              status: 'failed',
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords,
              errors: [...errors, (error as Error).message],
              completedAt: serverTimestamp()
            });
            
            onProgress({
              progress: (processedRecords / totalRecords) * 100,
              state: 'error',
              error: error as Error,
              importId,
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords
            });
            
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          
          onProgress({
            progress: 0,
            state: 'error',
            error: new Error(`Error parsing CSV: ${error.message}`),
            totalRecords: 0,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0
          });
          
          reject(error);
        }
      });
    }).catch((error) => {
      console.error('Error creating import record:', error);
      
      onProgress({
        progress: 0,
        state: 'error',
        error: error as Error,
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0
      });
      
      reject(error);
    });
  });
};

/**
 * Parse a JSON file and import directly to Firestore
 * @param file The JSON file to import
 * @param onProgress Callback for import progress
 * @returns Promise with the import ID
 */
export const importJsonDirectly = (
  file: File,
  onProgress: (progress: ImportProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if user is authenticated
    if (!auth.currentUser) {
      onProgress({
        progress: 0,
        state: 'error',
        error: new Error('User not authenticated. Please log in and try again.'),
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0
      });
      reject(new Error('User not authenticated'));
      return;
    }

    // Create a unique import ID
    const timestamp = new Date().getTime();
    const importId = `direct-import-${timestamp}`;
    const userId = auth.currentUser.uid;

    // Create an import record in Firestore
    addDoc(collection(db, 'imports-web'), {
      fileName: file.name,
      importId,
      status: 'processing',
      timestamp: serverTimestamp(),
      fileSize: file.size,
      fileType: file.type,
      userId: userId || 'anonymous',
      method: 'direct-import'
    }).then(() => {
      // Read the JSON file
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          const data = Array.isArray(jsonData) ? jsonData : [jsonData];
          const totalRecords = data.length;
          let processedRecords = 0;
          let successfulRecords = 0;
          let failedRecords = 0;
          const errors: string[] = [];

          // Process in batches of 500 records
          const batchSize = 500;
          const batches = Math.ceil(totalRecords / batchSize);

          try {
            for (let i = 0; i < batches; i++) {
              const batch = writeBatch(db);
              const start = i * batchSize;
              const end = Math.min(start + batchSize, totalRecords);
              
              for (let j = start; j < end; j++) {
                const record = data[j];
                
                // Skip records without a companyId
                if (!record.companyId && !record.id) {
                  failedRecords++;
                  errors.push(`Record at index ${j} has no companyId or id`);
                  continue;
                }
                
                // Use companyId or id as the document ID
                const companyId = record.companyId || record.id;
                const companyRef = doc(collection(db, 'companies'), companyId);
                
                // Add import metadata
                record.importId = importId;
                record.importedAt = new Date().toISOString();
                record.importedBy = userId;
                
                // Add to batch
                batch.set(companyRef, record);
                successfulRecords++;
              }
              
              // Commit the batch
              await batch.commit();
              
              // Update progress
              processedRecords = end;
              const progress = (processedRecords / totalRecords) * 100;
              
              onProgress({
                progress,
                state: 'processing',
                importId,
                totalRecords,
                processedRecords,
                successfulRecords,
                failedRecords
              });
            }
            
            // Update the import record
            await addDoc(collection(db, 'import-results'), {
              importId,
              status: 'completed',
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords,
              errors,
              completedAt: serverTimestamp()
            });
            
            // Final progress update
            onProgress({
              progress: 100,
              state: 'success',
              importId,
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords
            });
            
            resolve(importId);
          } catch (error) {
            console.error('Error importing data:', error);
            
            // Update the import record with error status
            await addDoc(collection(db, 'import-results'), {
              importId,
              status: 'failed',
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords,
              errors: [...errors, (error as Error).message],
              completedAt: serverTimestamp()
            });
            
            onProgress({
              progress: (processedRecords / totalRecords) * 100,
              state: 'error',
              error: error as Error,
              importId,
              totalRecords,
              processedRecords,
              successfulRecords,
              failedRecords
            });
            
            reject(error);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          
          onProgress({
            progress: 0,
            state: 'error',
            error: new Error(`Error parsing JSON: ${(error as Error).message}`),
            totalRecords: 0,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0
          });
          
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        
        onProgress({
          progress: 0,
          state: 'error',
          error: new Error('Error reading file'),
          totalRecords: 0,
          processedRecords: 0,
          successfulRecords: 0,
          failedRecords: 0
        });
        
        reject(new Error('Error reading file'));
      };
      
      // Start reading the file
      reader.readAsText(file);
    }).catch((error) => {
      console.error('Error creating import record:', error);
      
      onProgress({
        progress: 0,
        state: 'error',
        error: error as Error,
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0
      });
      
      reject(error);
    });
  });
};

/**
 * Import a file directly to Firestore based on file type
 * @param file The file to import
 * @param onProgress Callback for import progress
 * @returns Promise with the import ID
 */
export const importFileDirectly = (
  file: File,
  onProgress: (progress: ImportProgress) => void
): Promise<string> => {
  // Determine file type and use appropriate import function
  if (file.type === 'application/json' || file.name.endsWith('.json')) {
    return importJsonDirectly(file, onProgress);
  } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
    return importCsvDirectly(file, onProgress);
  } else {
    onProgress({
      progress: 0,
      state: 'error',
      error: new Error('Unsupported file type. Please upload JSON or CSV files only.'),
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0
    });
    return Promise.reject(new Error('Unsupported file type'));
  }
};
