/**
 * Apollo API service
 * Uses Apollo API to enrich company data
 */
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// Apollo API configuration
const APOLLO_API_KEY = 'I2ZOR0Rvlmaf2F7VrTW0OA';
const APOLLO_API_URL = 'https://api.apollo.io/api/v1';

// Cache expiration time (7 days in milliseconds)
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// Apollo Organization interface
export interface ApolloOrganization {
  id: string;
  name: string;
  website_url?: string;
  blog_url?: string;
  angellist_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  primary_phone?: any;
  languages?: string[];
  alexa_ranking?: number;
  phone?: string;
  linkedin_uid?: string;
  founded_year?: number;
  publicly_traded_symbol?: string;
  publicly_traded_exchange?: string;
  logo_url?: string;
  crunchbase_url?: string;
  primary_domain?: string;
  industry?: string;
  keywords?: string[];
  estimated_num_employees?: number;
  industries?: string[];
  secondary_industries?: string[];
  snippets_loaded?: boolean;
  industry_tag_id?: string;
  industry_tag_hash?: any;
  retail_location_count?: number;
  raw_address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  owned_by_organization_id?: string;
  seo_description?: string;
  short_description?: string;
  annual_revenue_printed?: string;
  annual_revenue?: number;
  total_funding?: number;
  total_funding_printed?: string;
  latest_funding_round_date?: string;
  latest_funding_stage?: string;
  funding_events?: any[];
  technology_names?: string[];
  current_technologies?: any[];
  departmental_head_count?: any;
  cached?: boolean;
  cachedAt?: number;
}

/**
 * Enrich company data using Apollo API
 */
export async function enrichCompanyData(domain: string): Promise<ApolloOrganization | null> {
  try {
    // Check cache first
    const cachedData = await getCompanyFromCache(domain);
    if (cachedData && cachedData.cachedAt && Date.now() - cachedData.cachedAt < CACHE_EXPIRATION) {
      console.log('Using cached Apollo data for', domain);
      return { ...cachedData, cached: true };
    }

    // If not in cache, fetch from API
    console.log('Fetching Apollo data for', domain);
    const response = await fetch(`${APOLLO_API_URL}/organizations/enrich?domain=${domain}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-API-Key': APOLLO_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Apollo API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.organization) {
      console.log('No organization data found for', domain);
      return null;
    }
    
    // Cache the result
    await cacheCompanyData(domain, data.organization);
    
    return data.organization;
  } catch (error) {
    console.error('Error enriching company data:', error);
    return null;
  }
}

/**
 * Search for companies using Apollo API
 */
export async function searchCompanies(name: string): Promise<ApolloOrganization[]> {
  try {
    console.log('Searching Apollo for companies with name:', name);
    const response = await fetch(`${APOLLO_API_URL}/mixed_companies/search`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-API-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        q_organization_name: name,
        page: 1,
        per_page: 5
      })
    });
    
    if (!response.ok) {
      throw new Error(`Apollo API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.organizations || data.organizations.length === 0) {
      console.log('No companies found for name:', name);
      return [];
    }
    
    // Cache the results
    for (const org of data.organizations) {
      if (org.primary_domain) {
        await cacheCompanyData(org.primary_domain, org);
      }
    }
    
    return data.organizations;
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
}

/**
 * Get cached company data from Firestore
 */
async function getCompanyFromCache(domain: string): Promise<ApolloOrganization | null> {
  try {
    const db = admin.firestore();
    const docRef = db.collection('companies').doc(domain);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return docSnap.data() as ApolloOrganization;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached company data:', error);
    return null;
  }
}

/**
 * Cache company data in Firestore
 */
async function cacheCompanyData(domain: string, data: ApolloOrganization): Promise<void> {
  try {
    const db = admin.firestore();
    const docRef = db.collection('companies').doc(domain);
    
    await docRef.set({
      ...data,
      cachedAt: Date.now(),
      domain: domain
    });
  } catch (error) {
    console.error('Error caching company data:', error);
  }
}
