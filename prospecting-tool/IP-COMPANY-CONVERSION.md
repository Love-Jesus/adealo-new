# IP-to-Company Conversion Service

This document describes the IP-to-company conversion service implemented for the Adealo B2B sales platform. The service identifies companies visiting your website based on their IP addresses and enriches the data using Apollo's API.

## Overview

The IP-to-company conversion service uses a multi-layered approach to identify companies:

1. **IPinfo API Layer**: Uses IPinfo's free tier to get basic information about the IP address, including ASN data.
2. **Reverse DNS Layer**: Performs a reverse DNS lookup to extract domain information from the IP address.
3. **IP Range Database Layer**: Checks if the IP belongs to a known corporate IP range (future enhancement).
4. **Apollo Enrichment Layer**: Enriches the company data using Apollo's API to get detailed company information.

## Implementation Details

### Server-Side Components

The service consists of several server-side components implemented as Firebase Cloud Functions:

1. **IP Resolution Service** (`ip-resolver.ts`): Resolves company information from an IP address using multiple methods.
2. **IPinfo Service** (`ipinfo.ts`): Interacts with the IPinfo API to get information about IP addresses.
3. **Apollo Service** (`apollo.ts`): Interacts with the Apollo API to enrich company data.
4. **Enrichment Functions** (`enrichment.ts`): Background processes for enriching company data.
5. **Tracking Integration** (`tracking.ts`): Integration with the tracking script to identify companies in real-time.

### Data Flow

1. When a visitor lands on a customer's website with the Adealo tracking script installed:
   - The script collects the visitor's IP address and sends it to the `trackVisit` function.
   - The function resolves company information from the IP address using the IP Resolution Service.
   - The function creates an enrichment task to get detailed company information from Apollo.

2. Background processes run periodically to:
   - Process pending enrichment tasks to get detailed company information.
   - Process unresolved IPs to identify companies that weren't identified in real-time.

3. The Lead Dashboard displays the enriched company information to the user.

## Testing

### Test Script

A test script is provided to verify that the IP-to-company conversion service works correctly:

```bash
# Install dependencies
npm install node-fetch dns

# Run the test script with a specific IP address
node test-ip-company.js 8.8.8.8
```

The test script will:
1. Get information about the IP address from IPinfo.
2. Resolve company information from the IP address using multiple methods.
3. Enrich the company data using Apollo's API.

### Expected Output

The test script will output the results of each step:

```
Testing IP-to-company conversion for IP: 8.8.8.8

--- Step 1: Get IP info from IPinfo API ---
IPinfo result: {
  "ip": "8.8.8.8",
  "hostname": "dns.google",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "loc": "37.4056,-122.0775",
  "org": "AS15169 Google LLC",
  "postal": "94043",
  "timezone": "America/Los_Angeles"
}

--- Step 2: Resolve company from IP using multiple methods ---
Company resolution result: {
  "companyName": "Google LLC",
  "companyDomain": "google.com",
  "source": "ipinfo_org",
  "confidence": 0.5,
  "rawData": {
    "ipinfo": {
      "ip": "8.8.8.8",
      "hostname": "dns.google",
      "city": "Mountain View",
      "region": "California",
      "country": "US",
      "loc": "37.4056,-122.0775",
      "org": "AS15169 Google LLC",
      "postal": "94043",
      "timezone": "America/Los_Angeles"
    },
    "dns": [
      "dns.google"
    ]
  }
}

--- Step 3: Enrich company data for domain: google.com ---
Apollo enrichment result: {
  "id": "5567c8e77369642e0a050000",
  "name": "Google",
  "website_url": "http://www.google.com",
  "blog_url": "http://blog.google",
  "angellist_url": "http://angel.co/google",
  "linkedin_url": "http://www.linkedin.com/company/google",
  "twitter_url": "https://twitter.com/Google",
  "facebook_url": "https://facebook.com/Google",
  "primary_phone": {
    "number": "+1 650-253-0000",
    "source": "Scraped",
    "sanitized_number": "+16502530000"
  },
  "languages": [
    "English",
    "Chinese",
    "Japanese",
    "Korean",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Arabic",
    "Hindi"
  ],
  "alexa_ranking": 1,
  "phone": "+1 650-253-0000",
  "linkedin_uid": "1441",
  "founded_year": 1998,
  "publicly_traded_symbol": "GOOGL",
  "publicly_traded_exchange": "nasdaq",
  "logo_url": "https://zenprospect-production.s3.amazonaws.com/uploads/pictures/5567c8e77369642e0a050000/picture",
  "crunchbase_url": "http://www.crunchbase.com/organization/google",
  "primary_domain": "google.com",
  "industry": "internet",
  "keywords": [
    "search engine",
    "advertising",
    "cloud computing",
    "mobile operating system",
    "artificial intelligence",
    "machine learning",
    "quantum computing",
    "self-driving cars",
    "virtual reality",
    "augmented reality",
    "internet of things",
    "smart home",
    "video sharing",
    "email",
    "web browser",
    "maps",
    "translation",
    "productivity tools",
    "cloud storage",
    "mobile payments",
    "smartphone",
    "wearable technology",
    "fiber internet",
    "venture capital",
    "health technology",
    "life sciences",
    "robotics",
    "renewable energy",
    "space exploration",
    "internet access"
  ],
  "estimated_num_employees": 156500,
  "industries": [
    "internet"
  ],
  "secondary_industries": [],
  "snippets_loaded": true,
  "industry_tag_id": "5567cd4773696439b10b0000",
  "industry_tag_hash": {
    "internet": "5567cd4773696439b10b0000"
  },
  "retail_location_count": 0,
  "raw_address": "1600 Amphitheatre Parkway, Mountain View, California 94043, US",
  "street_address": "1600 Amphitheatre Parkway",
  "city": "Mountain View",
  "state": "California",
  "postal_code": "94043",
  "country": "United States",
  "owned_by_organization_id": null,
  "seo_description": "Organize the world's information and make it universally accessible and useful.",
  "short_description": "Google is a multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, a search engine, cloud computing, software, and hardware.",
  "annual_revenue_printed": "282.8B",
  "annual_revenue": 282800000000,
  "total_funding": 36100000,
  "total_funding_printed": "36.1M",
  "latest_funding_round_date": "2004-08-18T00:00:00.000+00:00",
  "latest_funding_stage": "IPO",
  "technology_names": [
    "AI",
    "AWS",
    "Adobe Analytics",
    "Adobe Creative Cloud",
    "Adobe Experience Cloud",
    "Adobe Marketing Cloud",
    "Adobe Target",
    "Akamai",
    "Amazon CloudFront",
    "Amazon S3",
    "Angular",
    "Apache",
    "Azure",
    "Babel",
    "Bootstrap",
    "Braintree",
    "Chartbeat",
    "Cloudflare",
    "Confluence",
    "Contentful",
    "Datadog",
    "Docker",
    "Drift",
    "Drupal",
    "Elasticsearch",
    "Envoy",
    "Fastly",
    "Firebase",
    "Gatsby",
    "GitHub",
    "Go",
    "Google Analytics",
    "Google Cloud",
    "Google Tag Manager",
    "Grafana",
    "GraphQL",
    "Hadoop",
    "Hotjar",
    "Hubspot",
    "Java",
    "JavaScript",
    "Jenkins",
    "Jira",
    "Kubernetes",
    "LaunchDarkly",
    "Looker",
    "Marketo",
    "MongoDB",
    "MySQL",
    "New Relic",
    "Next.js",
    "Node.js",
    "Okta",
    "PHP",
    "PostgreSQL",
    "Prometheus",
    "Python",
    "React",
    "Redis",
    "Ruby",
    "Ruby on Rails",
    "Rust",
    "Salesforce",
    "Segment",
    "Sentry",
    "Slack",
    "Snowflake",
    "Splunk",
    "Stripe",
    "Swift",
    "Terraform",
    "TypeScript",
    "Vue.js",
    "WordPress",
    "Zendesk"
  ]
}
```

## Deployment

To deploy the IP-to-company conversion service:

1. Install the required dependencies:
   ```bash
   cd prospecting-tool/functions
   npm install node-fetch @types/node-fetch
   ```

2. Build the functions:
   ```bash
   npm run build
   ```

3. Deploy the functions to Firebase:
   ```bash
   firebase deploy --only functions
   ```

## Configuration

The service uses the following API keys:

- **IPinfo API Key**: `6d2c4eec5172aa`
- **Apollo API Key**: `I2ZOR0Rvlmaf2F7VrTW0OA`

These keys are stored in the respective service files and can be updated as needed.

## Future Enhancements

1. **IP Range Database**: Build a database of known corporate IP ranges for more accurate company identification.
2. **WHOIS Integration**: Add WHOIS lookup as another layer for company identification.
3. **Machine Learning**: Use machine learning to improve company matching based on historical data.
4. **Batch Processing**: Implement batch processing for more efficient API usage.
5. **Webhook Integration**: Add webhook support to update existing records when new company information is found.
