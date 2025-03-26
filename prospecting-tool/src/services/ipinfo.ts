// src/services/ipinfo.ts

/**
 * IPinfo service for IP-to-company conversion
 * Uses IPinfo API to get company information from IP addresses
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

// IPinfo API access token - should be set in environment variables
const IPINFO_ACCESS_TOKEN = import.meta.env.VITE_IPINFO_ACCESS_TOKEN || '';
const IPINFO_API_URL = 'https://ipinfo.io';

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// IPinfo response interface
export interface IPInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  asn?: {
    asn: string;
    name: string;
    domain: string;
    route: string;
    type: string;
  };
  company?: {
    name: string;
    domain: string;
    type: string;
  };
  privacy?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
    hosting: boolean;
    service: string;
  };
  abuse?: {
    address: string;
    country: string;
    email: string;
    name: string;
    network: string;
    phone: string;
  };
  domains?: {
    ip: string;
    total: number;
    domains: string[];
  };
  cached?: boolean;
  cachedAt?: number;
}

/**
 * Get company information from an IP address
 * Uses caching to reduce API calls
 */
export async function getIPInfo(ip: string): Promise<IPInfoResponse> {
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
      throw new Error(`IPinfo API error: ${response.status} ${response.statusText}`);
    }
    
    const data: IPInfoResponse = await response.json();
    
    // Cache the result
    await cacheIPInfo(ip, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching IP info:', error);
    throw error;
  }
}

/**
 * Get company information from multiple IP addresses
 * Uses batching to optimize API calls
 */
export async function batchGetIPInfo(ips: string[]): Promise<Record<string, IPInfoResponse>> {
  const results: Record<string, IPInfoResponse> = {};
  const ipsToFetch: string[] = [];
  
  // Check cache first for all IPs
  for (const ip of ips) {
    const cachedData = await getIPInfoFromCache(ip);
    if (cachedData) {
      results[ip] = { ...cachedData, cached: true };
    } else {
      ipsToFetch.push(ip);
    }
  }
  
  // Fetch remaining IPs from API
  if (ipsToFetch.length > 0) {
    // IPinfo batch API has a limit, so we process in chunks
    const chunkSize = 100;
    for (let i = 0; i < ipsToFetch.length; i += chunkSize) {
      const chunk = ipsToFetch.slice(i, i + chunkSize);
      
      // Use the batch API endpoint
      const response = await fetch(`${IPINFO_API_URL}/batch?token=${IPINFO_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
      
      if (!response.ok) {
        throw new Error(`IPinfo batch API error: ${response.status} ${response.statusText}`);
      }
      
      const batchResults = await response.json();
      
      // Process and cache each result
      for (const ip of chunk) {
        if (batchResults[ip]) {
          results[ip] = batchResults[ip];
          await cacheIPInfo(ip, batchResults[ip]);
        }
      }
    }
  }
  
  return results;
}

/**
 * Get cached IP info from Firestore
 */
async function getIPInfoFromCache(ip: string): Promise<IPInfoResponse | null> {
  try {
    const docRef = doc(db, 'ipInfoCache', ip);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
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
    const docRef = doc(db, 'ipInfoCache', ip);
    await setDoc(docRef, {
      ...data,
      cachedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error caching IP info:', error);
  }
}

/**
 * Match IP info to a company in the database
 */
export async function matchIPInfoToCompany(ipInfo: IPInfoResponse): Promise<string | null> {
  try {
    if (!ipInfo.org && !ipInfo.company?.name) {
      return null;
    }
    
    const companyName = ipInfo.company?.name || extractCompanyName(ipInfo.org || '');
    
    if (!companyName) {
      return null;
    }
    
    // Search for company by name
    const companiesRef = collection(db, 'companies');
    const q = query(
      companiesRef,
      where('name', '==', companyName)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Return the first match
      return querySnapshot.docs[0].id;
    }
    
    // If no exact match, try fuzzy matching
    // This would be implemented with a more sophisticated algorithm
    // or using a service like Algolia for fuzzy search
    
    return null;
  } catch (error) {
    console.error('Error matching IP info to company:', error);
    return null;
  }
}

/**
 * Extract company name from organization string
 * Example: "AS15169 Google LLC" -> "Google LLC"
 */
function extractCompanyName(org: string): string | null {
  // Remove AS number if present
  const match = org.match(/AS\d+\s+(.*)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return org.trim() || null;
}
