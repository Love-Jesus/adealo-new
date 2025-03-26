/**
 * IP Resolver service
 * Uses multiple methods to identify the company behind an IP address
 */
import * as dns from 'dns';
import { promisify } from 'util';
import fetch from 'node-fetch';
import * as admin from 'firebase-admin';
import { getIPInfoFromAPI, extractCompanyName, IPInfoResponse } from './ipinfo';

// Promisify DNS functions
const reverseLookup = promisify(dns.reverse);

// Result interface
export interface CompanyResolutionResult {
  companyName: string | null;
  companyDomain: string | null;
  source: string;
  confidence: number;
  rawData: any;
}

/**
 * Resolve company information from an IP address using multiple methods
 */
export async function resolveCompanyFromIP(ip: string): Promise<CompanyResolutionResult> {
  // Result object with confidence score
  const result: CompanyResolutionResult = {
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
    } catch (error: any) {
      console.log(`DNS lookup failed for ${ip}: ${error.message || 'Unknown error'}`);
    }

    // Layer 3: IP Range Database
    // Check if this IP belongs to a known corporate IP range
    const companyFromRange = await checkIPRange(ip);
    if (companyFromRange && (!result.companyName || result.confidence < 0.9)) {
      result.companyName = companyFromRange.name;
      result.companyDomain = companyFromRange.domain;
      result.source = 'ip_range';
      result.confidence = 0.9; // Very high confidence
    }

    return result;
  } catch (error) {
    console.error('Error resolving company from IP:', error);
    return result;
  }
}

/**
 * Extract domain from hostname
 * Example: "edge-star-mini-shv-01-amt2.facebook.com" → "facebook.com"
 */
function extractDomainFromHostname(hostname: string): string | null {
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
function domainToCompanyName(domain: string): string {
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

/**
 * Check if IP belongs to a known corporate IP range
 */
async function checkIPRange(ip: string): Promise<{ name: string; domain: string } | null> {
  try {
    const db = admin.firestore();
    
    // Convert IP to number for range comparison
    const ipNum = ipToNumber(ip);
    
    // Query IP ranges collection
    const rangesRef = db.collection('ipRanges');
    const snapshot = await rangesRef.get();
    
    for (const doc of snapshot.docs) {
      const range = doc.data();
      
      // Check if IP is in range
      if (ipNum >= range.startIp && ipNum <= range.endIp) {
        return {
          name: range.companyName,
          domain: range.companyDomain
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking IP range:', error);
    return null;
  }
}

/**
 * Convert IP address to number for range comparison
 */
function ipToNumber(ip: string): number {
  try {
    const parts = ip.split('.');
    return ((parseInt(parts[0], 10) << 24) |
            (parseInt(parts[1], 10) << 16) |
            (parseInt(parts[2], 10) << 8) |
            parseInt(parts[3], 10)) >>> 0;
  } catch (error) {
    console.error('Error converting IP to number:', error);
    return 0;
  }
}
