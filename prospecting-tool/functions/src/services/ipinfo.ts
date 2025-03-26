/**
 * IPinfo service for IP-to-company conversion
 * Uses IPinfo API to get company information from IP addresses
 */
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// IPinfo API access token - should be set in environment variables
const IPINFO_ACCESS_TOKEN = process.env.IPINFO_ACCESS_TOKEN || '';
const IPINFO_API_URL = 'https://ipinfo.io';

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// IPinfo response interface for free tier
export interface IPInfoResponse {
  ip: string;
  asn?: string;
  as_name?: string;
  as_domain?: string;
  country_code?: string;
  country?: string;
  continent_code?: string;
  continent?: string;
  city?: string;
  region?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  // Fields for future business tier
  company?: {
    name: string;
    domain: string;
    type: string;
  };
  cached?: boolean;
  cachedAt?: number;
}

/**
 * Get company information from an IP address
 * Uses caching to reduce API calls
 */
export async function getIPInfoFromAPI(ip: string): Promise<IPInfoResponse | null> {
  try {
    // Check cache first
    const cachedData = await getIPInfoFromCache(ip);
    if (cachedData) {
      console.log('Using cached IP info for', ip);
      return { ...cachedData, cached: true };
    }

    // If not in cache, fetch from API
    console.log('Fetching IP info for', ip);
    const response = await fetch(`${IPINFO_API_URL}/${ip}?token=${IPINFO_ACCESS_TOKEN}`);
    
    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.status}`);
    }
    
    const data: IPInfoResponse = await response.json();
    
    // Cache the result
    await cacheIPInfo(ip, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching IP info:', error);
    return null;
  }
}

/**
 * Get company information from multiple IP addresses
 * Uses batching to optimize API calls
 */
export async function batchGetIPInfo(ips: string[]): Promise<Record<string, IPInfoResponse>> {
  const results: Record<string, IPInfoResponse> = {};
  
  // Process in smaller batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < ips.length; i += batchSize) {
    const batch = ips.slice(i, i + batchSize);
    
    // Process each IP in the batch
    await Promise.all(batch.map(async (ip) => {
      const info = await getIPInfoFromAPI(ip);
      if (info) {
        results[ip] = info;
      }
    }));
    
    // Add a small delay between batches to avoid rate limits
    if (i + batchSize < ips.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Get cached IP info from Firestore
 */
async function getIPInfoFromCache(ip: string): Promise<IPInfoResponse | null> {
  try {
    const db = admin.firestore();
    const docRef = db.collection('ipInfoCache').doc(ip);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data() as IPInfoResponse & { cachedAt: number };
      
      // Check if cache is expired
      if (Date.now() - data.cachedAt < CACHE_EXPIRATION) {
        return data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached IP info:', error);
    return null;
  }
}

/**
 * Cache IP info in Firestore
 */
async function cacheIPInfo(ip: string, data: IPInfoResponse): Promise<void> {
  try {
    const db = admin.firestore();
    const docRef = db.collection('ipInfoCache').doc(ip);
    await docRef.set({
      ...data,
      cachedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error caching IP info:', error);
  }
}

/**
 * Extract company name from organization string
 * Example: "AS15169 Google LLC" -> "Google LLC"
 */
export function extractCompanyName(org: string): string | null {
  // Remove AS number if present
  const match = org.match(/AS\d+\s+(.*)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return org.trim() || null;
}
