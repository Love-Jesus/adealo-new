import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Initialize Firebase Admin if not already initialized
try {
  admin.initializeApp();
} catch (error) {
  // App already initialized
}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Initiates an export process for companies based on filters and field selection
 * Returns an exportId that can be used to check the status of the export
 */
export const initiateExport = functions.https.onCall(async (data, context) => {
    // Authenticate user
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }
    
    const { filters, format, fields } = data;
    
    // Validate input
    if (!format || !['csv', 'json'].includes(format)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Format must be one of: csv, json'
      );
    }
    
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Fields must be a non-empty array'
      );
    }
    
    // Create export record
    const exportRef = await db.collection('exports').add({
      userId: context.auth.uid,
      status: 'processing',
      filters,
      format,
      fields,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      progress: 0,
      totalRecords: 0,
      downloadUrl: null
    });
    
    // Start the export process in the background
    processExport(exportRef.id, filters, format, fields, context.auth.uid)
      .catch(error => {
        console.error('Export processing error:', error);
        // Update export record with error
        exportRef.update({
          status: 'failed',
          error: error.message
        }).catch(updateError => {
          console.error('Error updating export status:', updateError);
        });
      });
    
    return { exportId: exportRef.id };
  });

/**
 * Process the export in the background
 * This function is not directly exposed as a Cloud Function
 */
async function processExport(exportId: string, filters: any, format: string, fields: string[], userId: string) {
  const exportRef = db.collection('exports').doc(exportId);
  const tempFilePath = path.join(os.tmpdir(), `export-${exportId}.${format}`);
  
  try {
    // Count total records (for progress tracking)
    const countQuery = buildFilteredQuery(filters);
    // Use a limit of 0 to get just the count
    const countSnapshot = await countQuery.get();
    const totalRecords = countSnapshot.size;
    
    await exportRef.update({
      totalRecords,
      status: 'processing'
    });
    
    // If no records match, return early
    if (totalRecords === 0) {
      await exportRef.update({
        status: 'completed',
        progress: 100,
        message: 'No records match the filter criteria'
      });
      return;
    }
    
    // Initialize file based on format
    let fileStream;
    
    if (format === 'csv') {
      fileStream = fs.createWriteStream(tempFilePath);
      // Write CSV header
      const header = fields.map(field => {
        // For nested fields, use the last part as the header
        if (field.includes('.')) {
          return field.split('.').pop();
        }
        return field;
      }).join(',') + '\n';
      fileStream.write(header);
    }
    
    // Process in batches of 500 records
    const batchSize = 500;
    let processedCount = 0;
    let lastDocSnapshot: admin.firestore.DocumentSnapshot | null = null;
    
    while (processedCount < totalRecords) {
      // Build query with pagination
      let query = buildFilteredQuery(filters);
      // Add ordering
      if (lastDocSnapshot) {
        query = query.startAfter(lastDocSnapshot);
      }
      
      query = query.limit(batchSize);
      const snapshot = await query.get();
      
      if (snapshot.empty) break;
      
      // Process batch
      const companies = snapshot.docs.map(doc => {
        const data = doc.data();
        // Extract only the requested fields
        const filteredData: Record<string, any> = {};
        fields.forEach(field => {
          // Handle nested fields (e.g., 'financials.revenue')
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            if (data[parent] && data[parent][child] !== undefined) {
              if (!filteredData[parent]) filteredData[parent] = {};
              filteredData[parent][child] = data[parent][child];
            }
          } else {
            if (data[field] !== undefined) {
              filteredData[field] = data[field];
            }
          }
        });
        return filteredData;
      });
      
      // Write batch to file
      if (format === 'csv') {
        const csvRows = companies.map(company => {
          // Flatten nested objects for CSV
          const flatCompany: Record<string, any> = {};
          fields.forEach(field => {
            if (field.includes('.')) {
              const [parent, child] = field.split('.');
              flatCompany[field] = company[parent] ? company[parent][child] : '';
            } else {
              flatCompany[field] = company[field] || '';
            }
          });
          
          // Convert to CSV row
          return fields.map(field => {
            const value = field.includes('.') 
              ? (flatCompany[field] !== undefined ? flatCompany[field] : '')
              : (flatCompany[field] !== undefined ? flatCompany[field] : '');
            
            // Escape values for CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',') + '\n';
        }).join('');
        
        fileStream.write(csvRows);
      } else if (format === 'json') {
        // For JSON, we'll collect all data and write at the end
        if (!fs.existsSync(tempFilePath)) {
          fs.writeFileSync(tempFilePath, JSON.stringify(companies, null, 2));
        } else {
          // Read existing data
          const existingData = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));
          // Append new data
          fs.writeFileSync(tempFilePath, JSON.stringify([...existingData, ...companies], null, 2));
        }
      }
      
      // Update progress
      processedCount += snapshot.docs.length;
      lastDocSnapshot = snapshot.docs[snapshot.docs.length - 1];
      
      const progress = Math.round((processedCount / totalRecords) * 100);
      await exportRef.update({ progress });
    }
    
    // Finalize file
    if (format === 'csv') {
      fileStream.end();
    }
    
    // Upload to Firebase Storage
    const bucket = storage.bucket();
    await bucket.upload(tempFilePath, {
      destination: `exports/${userId}/${path.basename(tempFilePath)}`,
      metadata: {
        contentType: format === 'csv' ? 'text/csv' : 'application/json'
      }
    });
    
    // Generate signed URL for download (valid for 7 days)
    const [url] = await bucket.file(`exports/${userId}/${path.basename(tempFilePath)}`).getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Update export record with download URL
    await exportRef.update({
      status: 'completed',
      progress: 100,
      downloadUrl: url,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
  } catch (error: any) {
    console.error('Export error:', error);
    
    // Update export record with error
    await exportRef.update({
      status: 'failed',
      error: error.message || 'Unknown error'
    });
    
    // Clean up temp file if it exists
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    throw error;
  }
}

/**
 * Helper function to build filtered query
 */
function buildFilteredQuery(filters: any) {
  // Start with the companies collection
  let query = admin.firestore().collection('companies');
  
  // Apply filters
  if (filters.name) {
    // Case-insensitive prefix search
    const nameLower = filters.name.toLowerCase();
    const nameUpper = nameLower + '\uf8ff';
    query = query.where('nameLowerCase', '>=', nameLower).where('nameLowerCase', '<=', nameUpper);
  }
  
  if (filters.industries && filters.industries.length > 0) {
    // For array-contains queries, we can only query for one value at a time
    // For multiple values, we need to use array-contains-any
    if (filters.industries.length === 1) {
      query = query.where('info.proffIndustries', 'array-contains', filters.industries[0]);
    } else {
      query = query.where('info.proffIndustries', 'array-contains-any', filters.industries);
    }
  }
  
  if (filters.locations && filters.locations.length > 0) {
    if (filters.locations.length === 1) {
      query = query.where('location.municipality', '==', filters.locations[0]);
    } else {
      query = query.where('location.municipality', 'in', filters.locations);
    }
  }
  
  // Apply revenue range filter
  if (filters.minRevenue) {
    query = query.where('financials.revenue', '>=', Number(filters.minRevenue));
  }
  
  if (filters.maxRevenue) {
    query = query.where('financials.revenue', '<=', Number(filters.maxRevenue));
  }
  
  // Apply employee count filter
  if (filters.minEmployees) {
    query = query.where('info.numberOfEmployees', '>=', String(filters.minEmployees));
  }
  
  if (filters.maxEmployees) {
    query = query.where('info.numberOfEmployees', '<=', String(filters.maxEmployees));
  }
  
  // Add default ordering by name
  query = query.orderBy('name');
  
  return query;
}

/**
 * Function to check export status
 */
export const getExportStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  const { exportId } = data;
  
  if (!exportId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'exportId is required'
    );
  }
  
  const exportDoc = await db.collection('exports').doc(exportId).get();
  
  if (!exportDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Export not found'
    );
  }
  
  const exportData = exportDoc.data();
  
  // Check if user has permission to access this export
  if (exportData.userId !== context.auth.uid) {
    // Check if user is admin or has team access
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to access this export'
      );
    }
    
    const userData = userDoc.data();
    
    if (userData.role !== 'admin' && userData.teamId !== exportData.teamId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to access this export'
      );
    }
  }
  
  return exportData;
});

/**
 * Function to get export preview (count of records that match filters)
 */
export const getExportPreview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  const { filters } = data;
  
  // Build query with filters
  const query = buildFilteredQuery(filters);
  
  // Get count
  const countSnapshot = await query.get();
  
  return {
    count: countSnapshot.size
  };
});
