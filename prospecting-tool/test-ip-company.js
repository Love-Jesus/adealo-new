/**
 * Test script for IP-to-company conversion
 * 
 * This script tests the IP-to-company conversion service by:
 * 1. Resolving company information from an IP address using IPinfo
 * 2. Enriching the company data using Apollo API
 * 
 * Usage: node test-ip-company.js [IP_ADDRESS]
 * Example: node test-ip-company.js 8.8.8.8
 */

const fetch = require('node-fetch');
const dns = require('dns');
const { promisify } = require('util');

// IPinfo API access token
const IPINFO_ACCESS_TOKEN = '6d2c4eec5172aa';
const IPINFO_API_URL = 'https://ipinfo.io';

// Apollo API configuration
const APOLLO_API_KEY = 'I2ZOR0Rvlmaf2F7VrTW0OA';
const APOLLO_API_URL = 'https://api.apollo.io/api/v1';

// Promisify DNS functions
const reverseLookup = promisify(dns.reverse);

// Get IP from command line arguments or use default
const testIP = process.argv[2] || '8.8.8.8';

/**
 * Main function
 */
async function main() {
  console.log(`Testing IP-to-company conversion for IP: ${testIP}`);
  
  try {
    // Step 1: Get IP info from IPinfo API
    console.log('\n--- Step 1: Get IP info from IPinfo API ---');
    const ipInfo = await getIPInfoFromAPI(testIP);
    console.log('IPinfo result:', JSON.stringify(ipInfo, null, 2));
    
    // Step 2: Resolve company from IP using multiple methods
    console.log('\n--- Step 2: Resolve company from IP using multiple methods ---');
    const companyInfo = await resolveCompanyFromIP(testIP);
    console.log('Company resolution result:', JSON.stringify(companyInfo, null, 2));
    
    // Step 3: Enrich company data using Apollo API (if domain is available)
    if (companyInfo.companyDomain) {
      console.log(`\n--- Step 3: Enrich company data for domain: ${companyInfo.companyDomain} ---`);
      const enrichedData = await enrichCompanyData(companyInfo.companyDomain);
      console.log('Apollo enrichment result:', JSON.stringify(enrichedData, null, 2));
    } else if (companyInfo.companyName) {
      console.log(`\n--- Step 3: Search for company by name: ${companyInfo.companyName} ---`);
      const searchResults = await searchCompanies(companyInfo.companyName);
      console.log('Apollo search results:', JSON.stringify(searchResults, null, 2));
    } else {
      console.log('\n--- Step 3: No company domain or name available for enrichment ---');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Get IP info from IPinfo API
 */
async function getIPInfoFromAPI(ip) {
  try {
    const response = await fetch(`${IPINFO_API_URL}/${ip}?token=${IPINFO_ACCESS_TOKEN}`);
    
    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching IP info:', error);
    return null;
  }
}

/**
 * Resolve company from IP using multiple methods
 */
async function resolveCompanyFromIP(ip) {
  // Result object with confidence score
  const result = {
    companyName: null,
    companyDomain: null,
    source: '',
    confidence: 0,
    rawData: {}
  };

  try {
    // Layer 1: IPinfo
    const ipInfo = await getIPInfoFromAPI(ip);
    if (ipInfo) {
      result.rawData.ipinfo = ipInfo;
      
      // Extract company name from ASN data
      if (ipInfo.as_name) {
        result.companyName = ipInfo.as_name;
        result.source = 'ipinfo_asn';
        result.confidence = 0.6; // Medium confidence
      } else if (ipInfo.org) {
        result.companyName = extractCompanyName(ipInfo.org);
        result.source = 'ipinfo_org';
        result.confidence = 0.5; // Medium confidence
      }
      
      // Extract domain from ASN data
      if (ipInfo.as_domain) {
        result.companyDomain = ipInfo.as_domain;
      }
    }

    // Layer 2: Reverse DNS
    try {
      const hostnames = await reverseLookup(ip);
      if (hostnames && hostnames.length > 0) {
        result.rawData.dns = hostnames;
        
        const domain = extractDomainFromHostname(hostnames[0]);
        if (domain && (!result.companyDomain || result.confidence < 0.8)) {
          result.companyDomain = domain;
          result.companyName = domainToCompanyName(domain);
          result.source = 'reverse_dns';
          result.confidence = 0.8; // High confidence
        }
      }
    } catch (error) {
      console.log(`DNS lookup failed for ${ip}: ${error.message || 'Unknown error'}`);
    }

    return result;
  } catch (error) {
    console.error('Error resolving company from IP:', error);
    return result;
  }
}

/**
 * Enrich company data using Apollo API
 */
async function enrichCompanyData(domain) {
  try {
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
    
    return data.organization;
  } catch (error) {
    console.error('Error enriching company data:', error);
    return null;
  }
}

/**
 * Search for companies using Apollo API
 */
async function searchCompanies(name) {
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
    
    return data.organizations;
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
}

/**
 * Extract company name from organization string
 * Example: "AS15169 Google LLC" -> "Google LLC"
 */
function extractCompanyName(org) {
  // Remove AS number if present
  const match = org.match(/AS\d+\s+(.*)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return org.trim() || null;
}

/**
 * Extract domain from hostname
 * Example: "edge-star-mini-shv-01-amt2.facebook.com" → "facebook.com"
 */
function extractDomainFromHostname(hostname) {
  try {
    // Extract domain from hostname
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Get the last two parts (e.g., "facebook.com")
      return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    }
  } catch (error) {
    console.error('Error extracting domain from hostname:', error);
  }
  return null;
}

/**
 * Convert domain to company name
 * Example: "google.com" → "Google"
 */
function domainToCompanyName(domain) {
  try {
    // Extract the company name from the domain
    const company = domain.split('.')[0];
    // Capitalize the first letter
    return company.charAt(0).toUpperCase() + company.slice(1);
  } catch (error) {
    console.error('Error converting domain to company name:', error);
    return domain;
  }
}

// Run the main function
main().catch(console.error);
