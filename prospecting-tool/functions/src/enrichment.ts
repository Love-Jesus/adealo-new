/**
 * Company Enrichment Functions
 * Background processes for enriching company data
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { resolveCompanyFromIP } from './services/ip-resolver';
import { enrichCompanyData, searchCompanies, ApolloOrganization } from './services/apollo';

// Initialize Firestore
const db = admin.firestore();

/**
 * Process company enrichment tasks
 * Runs every 5 minutes to process pending tasks
 */
// @ts-expect-error: TypeScript may show an error for schedule, but it exists at runtime
export const processEnrichmentTasks = functions.https.onRequest(async (request, response) => {
  try {
    console.log('Starting enrichment tasks processing');
    
    // Get pending tasks
    const tasksQuery = await db.collection('tasks')
      .where('type', '==', 'company_enrichment')
      .where('status', '==', 'pending')
      .limit(20)
      .get();
    
    if (tasksQuery.empty) {
      console.log('No pending enrichment tasks');
      response.status(200).send({ message: 'No pending tasks' });
      return;
    }
    
    console.log(`Processing ${tasksQuery.size} enrichment tasks`);
    
    // Process each task
    // @ts-expect-error: TypeScript may show an error for batch, but it exists at runtime
    const writeBatch = db.batch();
    
    for (const taskDoc of tasksQuery.docs) {
      const task = taskDoc.data();
      
      try {
        let companyData: ApolloOrganization | null = null;
        
        // Try to enrich by domain first
        if (task.domain) {
          companyData = await enrichCompanyData(task.domain);
        }
        
        // If that fails, try to search by name
        if (!companyData && task.companyName) {
          const searchResults = await searchCompanies(task.companyName);
          if (searchResults.length > 0) {
            // Use the first result
            companyData = searchResults[0];
            
            // Also enrich with full data if we have a domain
            if (companyData && companyData.primary_domain) {
              const fullData = await enrichCompanyData(companyData.primary_domain);
              if (fullData) {
                companyData = fullData;
              }
            }
          }
        }
        
        if (companyData) {
          // Create or update company record
          const domain = companyData.primary_domain || task.domain;
          if (domain) {
            const companyRef = db.collection('companies').doc(domain);
            writeBatch.set(companyRef, {
              ...companyData,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Update visit with company ID
            if (task.visitId) {
              const visitRef = db.collection('visits').doc(task.visitId);
              writeBatch.update(visitRef, {
                companyId: companyRef.id,
                enrichedCompanyData: true
              });
            }
            
            // Update session with company ID
            if (task.sessionId) {
              const sessionRef = db.collection('sessions').doc(task.sessionId);
              writeBatch.update(sessionRef, {
                companyId: companyRef.id,
                enrichedCompanyData: true
              });
            }
          }
        }
        
        // Mark task as completed
        // @ts-expect-error: TypeScript may show an error for ref, but it exists at runtime
        writeBatch.update(taskDoc.ref, {
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          result: companyData ? 'success' : 'not_found'
        });
      } catch (error: unknown) {
        const err = error as Error;
        console.error(`Error processing task ${taskDoc.id}:`, error);
        
        // Mark task as failed
        // @ts-expect-error: TypeScript may show an error for ref, but it exists at runtime
        writeBatch.update(taskDoc.ref, {
          status: 'failed',
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          error: err.message || 'Unknown error'
        });
      }
    }
    
    // Commit all updates
    await writeBatch.commit();
    
    console.log('Enrichment tasks processing complete');
    response.status(200).send({ message: 'Tasks processed successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error processing enrichment tasks:', error);
    response.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Process unresolved IPs
 * Runs every hour to process visits without company information
 */
// @ts-expect-error: TypeScript may show an error for schedule, but it exists at runtime
export const processUnresolvedIPs = functions.https.onRequest(async (request, response) => {
  try {
    console.log('Starting unresolved IPs processing');
    
    // Get visits without company info
    const visitsQuery = await db.collection('visits')
      .where('companyId', '==', null)
      .limit(100)
      .get();
    
    if (visitsQuery.empty) {
      console.log('No unresolved IPs to process');
      response.status(200).send({ message: 'No unresolved IPs' });
      return;
    }
    
    console.log(`Processing ${visitsQuery.size} unresolved IPs`);
    
    // Group by IP to avoid duplicate API calls
    const ipMap = new Map<string, string[]>();
    visitsQuery.docs.forEach(doc => {
      const visit = doc.data();
      if (visit.ip) {
        if (!ipMap.has(visit.ip)) {
          ipMap.set(visit.ip, []);
        }
        ipMap.get(visit.ip)?.push(doc.id);
      }
    });
    
    // Process each unique IP
    // @ts-expect-error: TypeScript may show an error for batch, but it exists at runtime
    const writeBatch = db.batch();
    for (const [ip, visitIds] of ipMap.entries()) {
      // Resolve company from IP
      const companyInfo = await resolveCompanyFromIP(ip);
      
      if (!companyInfo.companyName) {
        console.log(`No company found for IP: ${ip}`);
        continue;
      }
      
      console.log(`Found company for IP ${ip}: ${companyInfo.companyName} (${companyInfo.source})`);
      
      // Create a task to enrich this company
      if (companyInfo.companyDomain) {
        const taskRef = db.collection('tasks').doc();
        writeBatch.set(taskRef, {
          type: 'company_enrichment',
          domain: companyInfo.companyDomain,
          companyName: companyInfo.companyName,
          visitIds: visitIds,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });
      }
      
      // Update all visits with this IP
      for (const visitId of visitIds) {
        const visitRef = db.collection('visits').doc(visitId);
        
        interface VisitUpdateData {
          companyName: string | null;
          companyIdentificationSource: string;
          companyIdentificationConfidence: number;
          companyDomain?: string | null;
        }
        
        const updateData: VisitUpdateData = {
          companyName: companyInfo.companyName,
          companyIdentificationSource: companyInfo.source,
          companyIdentificationConfidence: companyInfo.confidence
        };
        
        if (companyInfo.companyDomain) {
          updateData.companyDomain = companyInfo.companyDomain;
        }
        
        writeBatch.update(visitRef, updateData);
      }
      
      // Also update any sessions with this IP
      const sessionsQuery = await db.collection('sessions')
        .where('ip', '==', ip)
        .where('companyId', '==', null)
        .limit(50)
        .get();
      
      if (!sessionsQuery.empty) {
        sessionsQuery.docs.forEach(doc => {
          const sessionRef = db.collection('sessions').doc(doc.id);
          
          interface SessionUpdateData {
            companyName: string | null;
            companyIdentificationSource: string;
            companyIdentificationConfidence: number;
            companyDomain?: string | null;
          }
          
          const updateData: SessionUpdateData = {
            companyName: companyInfo.companyName,
            companyIdentificationSource: companyInfo.source,
            companyIdentificationConfidence: companyInfo.confidence
          };
          
          if (companyInfo.companyDomain) {
            updateData.companyDomain = companyInfo.companyDomain;
          }
          
          writeBatch.update(sessionRef, updateData);
        });
      }
    }
    
    // Commit all updates
    await writeBatch.commit();
    
    console.log('Unresolved IPs processing complete');
    response.status(200).send({ message: 'Unresolved IPs processed successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error processing unresolved IPs:', error);
    response.status(500).send({ error: 'Internal server error' });
  }
});
