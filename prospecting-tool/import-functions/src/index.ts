import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import csv from 'csv-parser';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Company interface matching the Firestore schema
interface Company {
  companyId: string;
  organisationNumber: string;
  name: string;
  displayName: string;
  businessUnitId?: string;
  visitorAddress: {
    addressLine: string;
    zipCode: string;
    postPlace: string;
  };
  postalAddress: {
    addressLine: string;
    zipCode: string;
    postPlace: string;
  };
  contact: {
    email: string;
    telephoneNumber: string;
    mobilePhone?: string;
    faxNumber?: string;
    homePage?: string;
  };
  location: {
    countryPart?: string;
    county?: string;
    municipality?: string;
    coordinates?: string;
  };
  financials: {
    revenue?: number;
    profit?: number;
    currency?: string;
    companyAccountsLastUpdatedDate?: string;
  };
  info: {
    foundationYear?: string;
    foundationDate?: string;
    numberOfEmployees?: string;
    status?: {
      status: string;
      description?: string;
      statusDate?: string;
    };
    naceCategories?: string;
    proffIndustries?: string;
  };
  roles: {
    companyRoles?: string;
    personRoles?: string;
  };
  marketingProtection?: boolean;
  mainOffice?: string;
  secretData?: string;
  stakeholders?: any[];
}

// Import status interface
interface ImportStatus {
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

// Batch size for Firestore operations
const BATCH_SIZE = 500;

// Function to transform JSON data to match the Company interface
function transformCompanyData(rawData: any): Company {
  // Check if the data is already in the expected format with nested objects
  const hasNestedFormat = rawData.visitorAddress && 
                         typeof rawData.visitorAddress === 'object' &&
                         rawData.postalAddress && 
                         typeof rawData.postalAddress === 'object';

  if (hasNestedFormat) {
    // Data is already in the correct format, just ensure all required fields are present
    return {
      companyId: rawData.companyId || `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organisationNumber: rawData.organisationNumber || '',
      name: rawData.name || '',
      displayName: rawData.displayName || rawData.name || '',
      businessUnitId: rawData.businessUnitId,
      visitorAddress: {
        addressLine: rawData.visitorAddress.addressLine || '',
        zipCode: rawData.visitorAddress.zipCode || '',
        postPlace: rawData.visitorAddress.postPlace || '',
      },
      postalAddress: {
        addressLine: rawData.postalAddress.addressLine || '',
        zipCode: rawData.postalAddress.zipCode || '',
        postPlace: rawData.postalAddress.postPlace || '',
      },
      contact: {
        email: rawData.contact?.email || "",
        telephoneNumber: rawData.contact?.telephoneNumber || "",
        mobilePhone: rawData.contact?.mobilePhone || "",
        faxNumber: rawData.contact?.faxNumber || "",
        homePage: rawData.contact?.homePage || "",
      },
      location: {
        countryPart: rawData.location?.countryPart || "",
        county: rawData.location?.county || "",
        municipality: rawData.location?.municipality || "",
        coordinates: rawData.location?.coordinates || "",
      },
      financials: {
        revenue: typeof rawData.financials?.revenue === 'string' 
          ? parseFloat(rawData.financials.revenue) || undefined
          : rawData.financials?.revenue,
        profit: typeof rawData.financials?.profit === 'string' 
          ? parseFloat(rawData.financials.profit) || undefined
          : rawData.financials?.profit,
        currency: rawData.financials?.currency || "",
        companyAccountsLastUpdatedDate: rawData.financials?.companyAccountsLastUpdatedDate || "",
      },
      info: {
        foundationYear: rawData.info?.foundationYear || "",
        foundationDate: rawData.info?.foundationDate || "",
        numberOfEmployees: rawData.info?.numberOfEmployees || "",
        status: rawData.info?.status ? {
          status: rawData.info.status.status || "ACTIVE",
          description: rawData.info.status.description || "",
          statusDate: rawData.info.status.statusDate || "",
        } : { status: "ACTIVE", description: "", statusDate: "" },
        naceCategories: rawData.info?.naceCategories || "",
        proffIndustries: rawData.info?.proffIndustries || "",
      },
      roles: {
        companyRoles: rawData.roles?.companyRoles || "",
        personRoles: rawData.roles?.personRoles || "",
      },
      marketingProtection: typeof rawData.marketingProtection === 'string' 
        ? rawData.marketingProtection.toLowerCase() === "true" 
        : !!rawData.marketingProtection,
      mainOffice: rawData.mainOffice || "",
      secretData: rawData.secretData || "",
      stakeholders: rawData.stakeholders || [],
    };
  } else {
    // Handle the flattened format (original implementation)
    return {
      companyId: rawData.companyId || `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organisationNumber: rawData.organisationNumber || '',
      name: rawData.name || '',
      displayName: rawData.displayName || rawData.name || '',
      businessUnitId: rawData.businessUnitId || '',
      visitorAddress: {
        addressLine: rawData.visitorAddress_addressLine || '',
        zipCode: rawData.visitorAddress_zipCode || '',
        postPlace: rawData.visitorAddress_postPlace || '',
      },
      postalAddress: {
        addressLine: rawData.postalAddress_addressLine || '',
        zipCode: rawData.postalAddress_zipCode || '',
        postPlace: rawData.postalAddress_postPlace || '',
      },
      contact: {
        email: rawData.email || '',
        telephoneNumber: rawData.telephoneNumber || '',
        mobilePhone: rawData.mobilePhone || '',
        faxNumber: rawData.faxNumber || '',
        homePage: rawData.homePage || '',
      },
      location: {
        countryPart: rawData.location_countryPart || '',
        county: rawData.location_county || '',
        municipality: rawData.location_municipality || '',
        coordinates: rawData.location_coordinates || '',
      },
      financials: {
        revenue: parseFloat(String(rawData.revenue || '0').replace(/,/g, '.')) || undefined,
        profit: parseFloat(String(rawData.profit || '0').replace(/,/g, '.')) || undefined,
        currency: rawData.currency || 'SEK',
        companyAccountsLastUpdatedDate: rawData.companyAccountsLastUpdatedDate || '',
      },
      info: {
        foundationYear: rawData.foundationYear || '',
        foundationDate: rawData.foundationDate || '',
        numberOfEmployees: rawData.numberOfEmployees || '',
        status: {
          status: rawData.status_status || 'ACTIVE',
          description: rawData.status_description || '',
          statusDate: rawData.status_statusDate || '',
        },
        naceCategories: rawData.naceCategories || '',
        proffIndustries: rawData.proffIndustries || '',
      },
      roles: {
        companyRoles: rawData.companyRoles || '',
        personRoles: rawData.personRoles || '',
      },
      marketingProtection: String(rawData.marketingProtection || '').toLowerCase() === "true" || 
                           String(rawData.marketingProtection || '').toLowerCase() === "false" ? 
                           String(rawData.marketingProtection || '').toLowerCase() === "true" : false,
      mainOffice: rawData.mainOffice || '',
      secretData: rawData.secretData || '',
      stakeholders: [],
    };
  }
}

// Function to transform CSV data to match the Company interface
function transformCSVToCompany(csvData: any): Company {
  // Create nested objects from flattened CSV data
  return {
    companyId: csvData.companyId || `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    organisationNumber: csvData.organisationNumber || '',
    name: csvData.name || '',
    displayName: csvData.displayName || csvData.name || '',
    businessUnitId: csvData.businessUnitId || '',
    visitorAddress: {
      addressLine: csvData.visitorAddress_addressLine || csvData.visitor_address || '',
      zipCode: csvData.visitorAddress_zipCode || csvData.visitor_zipCode || '',
      postPlace: csvData.visitorAddress_postPlace || csvData.visitor_postPlace || '',
    },
    postalAddress: {
      addressLine: csvData.postalAddress_addressLine || csvData.postal_address || '',
      zipCode: csvData.postalAddress_zipCode || csvData.postal_zipCode || '',
      postPlace: csvData.postalAddress_postPlace || csvData.postal_postPlace || '',
    },
    contact: {
      email: csvData.email || csvData.contact_email || '',
      telephoneNumber: String(csvData.telephoneNumber || csvData.contact_phone || '').replace(/\.0$/, ''),
      mobilePhone: csvData.mobilePhone || csvData.contact_mobile || '',
      faxNumber: csvData.faxNumber || csvData.contact_fax || '',
      homePage: csvData.homePage || csvData.contact_website || '',
    },
    location: {
      countryPart: csvData.location_countryPart || csvData.countryPart || '',
      county: csvData.location_county || csvData.county || '',
      municipality: csvData.location_municipality || csvData.municipality || '',
      coordinates: csvData.location_coordinates || csvData.coordinates || '',
    },
    financials: {
      revenue: csvData.revenue ? parseFloat(String(csvData.revenue).replace(/,/g, '.')) : undefined,
      profit: csvData.profit ? parseFloat(String(csvData.profit).replace(/,/g, '.')) : undefined,
      currency: csvData.currency || 'SEK',
      companyAccountsLastUpdatedDate: csvData.companyAccountsLastUpdatedDate || '',
    },
    info: {
      foundationYear: csvData.foundationYear || '',
      foundationDate: csvData.foundationDate || '',
      numberOfEmployees: csvData.numberOfEmployees || '',
      status: {
        status: csvData.status_status || csvData.status || 'ACTIVE',
        description: csvData.status_description || csvData.statusDescription || '',
        statusDate: csvData.status_statusDate || csvData.statusDate || '',
      },
      naceCategories: csvData.naceCategories || '',
      proffIndustries: csvData.proffIndustries || '',
    },
    roles: {
      companyRoles: csvData.companyRoles || '',
      personRoles: csvData.personRoles || '',
    },
    marketingProtection: String(csvData.marketingProtection || '').toLowerCase() === "true" || 
                         String(csvData.marketingProtection || '').toLowerCase() === "false" ? 
                         String(csvData.marketingProtection || '').toLowerCase() === "true" : false,
    mainOffice: csvData.mainOffice || '',
    secretData: csvData.secretData || '',
    stakeholders: [],
  };
}

// Process a batch of companies
async function processBatch(companies: Company[], batchIndex: number): Promise<{
  successful: number;
  failed: number;
  errors: string[];
}> {
  const batch = db.batch();
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (let i = 0; i < companies.length; i++) {
    try {
      const company = companies[i];
      
      // Add metadata
      const enhancedCompany = {
        ...company,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        importedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Add to batch
      const docRef = db.collection('companies').doc(company.companyId);
      batch.set(docRef, enhancedCompany);
      successful++;
    } catch (error: any) {
      console.error(`Error in batch ${batchIndex}, item ${i}:`, error);
      failed++;
      errors.push(`Batch ${batchIndex}, item ${i}: ${error}`);
    }
  }
  
  try {
    await batch.commit();
    return { successful, failed, errors };
  } catch (error: any) {
    console.error(`Error committing batch ${batchIndex}:`, error);
    // If batch fails, count all companies as failed
    return { 
      successful: 0, 
      failed: companies.length, 
      errors: [`Batch commit error ${batchIndex}: ${error}`] 
    };
  }
}

// Cloud Function to import companies from a file in Storage
export const importCompaniesFromStorage = functions.storage.object().onFinalize(async (object: any) => {
  const filePath = object.name;
  if (!filePath) {
    console.error('File path is undefined');
    return;
  }

  // Check if this is an import file
  if (!filePath.startsWith('imports/')) {
    console.log('Not an import file, skipping');
    return;
  }

  console.log(`Processing import file: ${filePath}`);

  // Create a reference to the file in storage
  const bucket = storage.bucket(object.bucket);
  const file = bucket.file(filePath);

  // Create a temporary file path
  const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

  // Create an import job record in Firestore to track progress
  const importId = path.basename(filePath).split('.')[0];
  const importRef = db.collection('imports').doc(importId);
  
  await importRef.set({
    status: 'processing',
    fileName: path.basename(filePath),
    startTime: admin.firestore.FieldValue.serverTimestamp(),
    totalRecords: 0,
    processedRecords: 0,
    successfulRecords: 0,
    failedRecords: 0,
    errors: [],
  });

  try {
    // Download the file to the temporary location
    await file.download({ destination: tempFilePath });
    console.log(`Downloaded file to ${tempFilePath}`);

    // Determine file type based on extension
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.json') {
      // Process JSON file
      const fileContent = fs.readFileSync(tempFilePath, 'utf8');
      let jsonData;
      
      try {
        jsonData = JSON.parse(fileContent);
        console.log(`Successfully parsed JSON data with ${Array.isArray(jsonData) ? jsonData.length : 1} records`);
      } catch (error: any) {
        console.error('Error parsing JSON:', error);
        await importRef.update({
          status: 'failed',
          endTime: admin.firestore.FieldValue.serverTimestamp(),
          errors: [`Failed to parse JSON: ${error}`],
        });
        return;
      }
      
      // Update total records count
      const totalRecords = Array.isArray(jsonData) ? jsonData.length : 1;
      await importRef.update({
        totalRecords,
      });
      
      // Process the data
      if (Array.isArray(jsonData)) {
        let totalSuccessful = 0;
        let totalFailed = 0;
        const allErrors: string[] = [];
        
        // Process in batches for better performance
        for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
          const currentBatch = jsonData.slice(i, Math.min(i + BATCH_SIZE, jsonData.length));
          const transformedBatch = currentBatch.map(item => transformCompanyData(item));
          
          const batchIndex = Math.floor(i / BATCH_SIZE);
          const { successful, failed, errors } = await processBatch(transformedBatch, batchIndex);
          
          totalSuccessful += successful;
          totalFailed += failed;
          allErrors.push(...errors);
          
          // Update progress
          await importRef.update({
            processedRecords: Math.min(i + BATCH_SIZE, jsonData.length),
            successfulRecords: totalSuccessful,
            failedRecords: totalFailed,
            errors: allErrors.slice(-20) // Keep only the last 20 errors to avoid document size limits
          });
        }
        
        // Update final status
        await importRef.update({
          status: 'completed',
          endTime: admin.firestore.FieldValue.serverTimestamp(),
          processedRecords: jsonData.length,
          successfulRecords: totalSuccessful,
          failedRecords: totalFailed,
        });
      } else {
        // Single company object
        try {
          const company = transformCompanyData(jsonData);
          
          // Add metadata
          const enhancedCompany = {
            ...company,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            importedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          await db.collection('companies').doc(company.companyId).set(enhancedCompany);
          
          await importRef.update({
            status: 'completed',
            endTime: admin.firestore.FieldValue.serverTimestamp(),
            processedRecords: 1,
            successfulRecords: 1,
            failedRecords: 0,
          });
        } catch (error: any) {
          console.error('Error processing single record:', error);
          
          await importRef.update({
            status: 'failed',
            endTime: admin.firestore.FieldValue.serverTimestamp(),
            processedRecords: 1,
            successfulRecords: 0,
            failedRecords: 1,
            errors: [String(error)],
          });
        }
      }
    } else if (fileExtension === '.csv') {
      // Process CSV file using csv-parser
      const results: any[] = [];
      
      // First pass to count records
      let recordCount = 0;
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(tempFilePath)
          .pipe(csv())
          .on('data', () => {
            recordCount++;
          })
          .on('end', () => {
            console.log(`Found ${recordCount} records in CSV file`);
            resolve();
          })
          .on('error', (error: any) => {
            console.error('Error counting CSV records:', error);
            reject(error);
          });
      });
      
      // Update total records count
      await importRef.update({
        totalRecords: recordCount,
      });
      
      if (recordCount === 0) {
        await importRef.update({
          status: 'completed',
          endTime: admin.firestore.FieldValue.serverTimestamp(),
          processedRecords: 0,
          successfulRecords: 0,
          failedRecords: 0,
        });
        return;
      }
      
      // Read all records
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(tempFilePath)
          .pipe(csv())
          .on('data', (data) => {
            results.push(data);
          })
          .on('end', () => {
            console.log(`Read ${results.length} records from CSV file`);
            resolve();
          })
          .on('error', (error: any) => {
            console.error('Error reading CSV file:', error);
            reject(error);
          });
      });
      
      // Process in batches
      let totalSuccessful = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];
      
      for (let i = 0; i < results.length; i += BATCH_SIZE) {
        const currentBatch = results.slice(i, Math.min(i + BATCH_SIZE, results.length));
        const transformedBatch = currentBatch.map(item => transformCSVToCompany(item));
        
        const batchIndex = Math.floor(i / BATCH_SIZE);
        const { successful, failed, errors } = await processBatch(transformedBatch, batchIndex);
        
        totalSuccessful += successful;
        totalFailed += failed;
        allErrors.push(...errors);
        
        // Update progress
        await importRef.update({
          processedRecords: Math.min(i + BATCH_SIZE, results.length),
          successfulRecords: totalSuccessful,
          failedRecords: totalFailed,
          errors: allErrors.slice(-20) // Keep only the last 20 errors
        });
      }
      
      // Update final status
      await importRef.update({
        status: 'completed',
        endTime: admin.firestore.FieldValue.serverTimestamp(),
        processedRecords: results.length,
        successfulRecords: totalSuccessful,
        failedRecords: totalFailed,
      });
    } else {
      // Unsupported file type
      await importRef.update({
        status: 'failed',
        endTime: admin.firestore.FieldValue.serverTimestamp(),
        errors: [`Unsupported file type: ${fileExtension}`],
      });
      
      console.error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error: any) {
    console.error('Error processing file:', error);
    
    // Update import status to failed
    await importRef.update({
      status: 'failed',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      errors: [String(error)],
    });
  } finally {
    // Clean up the temporary file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (error: any) {
      console.error('Error removing temporary file:', error);
    }
  }
});

// Cloud Function to get import status
export const getImportStatus = functions.https.onCall(async (data: any, context: any) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  const importId = data.importId;
  if (!importId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with an importId.'
    );
  }
  
  try {
    // First check imports-web collection (for web uploads)
    const webImportQuery = await db.collection('imports-web')
      .where('importId', '==', importId)
      .limit(1)
      .get();
    
    if (!webImportQuery.empty) {
      const webImportDoc = webImportQuery.docs[0];
      const webImportData = webImportDoc.data();
      
      // If the status is 'uploaded', check the imports collection for processing status
      if (webImportData.status === 'uploaded') {
        const importDoc = await db.collection('imports').doc(importId).get();
        
        if (importDoc.exists) {
          return importDoc.data() as ImportStatus;
        } else {
          // If not found in imports collection, it's still queued
          return {
            status: 'processing',
            fileName: webImportData.fileName,
            startTime: webImportData.timestamp.toDate(),
            totalRecords: 0,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
            errors: []
          } as ImportStatus;
        }
      } else {
        // Return the web import status
        return {
          status: webImportData.status,
          fileName: webImportData.fileName,
          startTime: webImportData.timestamp.toDate(),
          totalRecords: 0,
          processedRecords: 0,
          successfulRecords: 0,
          failedRecords: 0,
          errors: []
        } as ImportStatus;
      }
    }
    
    // If not found in imports-web, check imports collection directly
    const importDoc = await db.collection('imports').doc(importId).get();
    
    if (!importDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Import job not found.'
      );
    }
    
    return importDoc.data() as ImportStatus;
  } catch (error: any) {
    console.error('Error getting import status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error retrieving import status.'
    );
  }
});

// Cloud Function to list user imports
export const listUserImports = functions.https.onCall(async (data: any, context: any) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  const userId = context.auth.uid;
  
  try {
    const importsQuery = await db.collection('imports-web')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    return importsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error listing user imports:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error listing imports.'
    );
  }
});

// Cloud Function to delete an import
export const deleteImport = functions.https.onCall(async (data: any, context: any) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  const userId = context.auth.uid;
  const importId = data.importId;
  
  if (!importId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with an importId.'
    );
  }
  
  try {
    // Get the import record
    const importsQuery = await db.collection('imports-web')
      .where('importId', '==', importId)
      .limit(1)
      .get();
    
    if (importsQuery.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Import not found.'
      );
    }
    
    const importDoc = importsQuery.docs[0];
    const importData = importDoc.data();
    
    // Check if user has permission to delete
    if (importData.userId && importData.userId !== userId) {
      // Check if user is admin
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to delete this import.'
        );
      }
    }
    
    // Delete the file from storage if it exists
    if (importData.downloadURL) {
      try {
        const fileRef = storage.bucket().file(importData.downloadURL.replace(/^.*\/o\//, '').split('?')[0]);
        await fileRef.delete();
      } catch (error: any) {
        console.error('Error deleting file from storage:', error);
        // Continue with deleting the record even if file deletion fails
      }
    }
    
    // Delete the import record
    await importDoc.ref.delete();
    
    // Delete the import status record if it exists
    try {
      await db.collection('imports').doc(importId).delete();
    } catch (error: any) {
      console.error('Error deleting import status record:', error);
      // Continue even if this fails
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting import:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error deleting import.'
    );
  }
});
