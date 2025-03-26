/**
 * Simple test script for IPinfo API
 */

// IPinfo API access token
const IPINFO_ACCESS_TOKEN = '6d2c4eec5172aa';
const IPINFO_API_URL = 'https://ipinfo.io';

// Get IP from command line arguments or use default
const testIP = process.argv[2] || '8.8.8.8';

// Main function
async function main() {
  // Import fetch dynamically
  const { default: fetch } = await import('node-fetch');
  console.log(`Testing IPinfo API for IP: ${testIP}`);
  
  try {
    // Fetch from API with Basic Auth
    const url = `${IPINFO_API_URL}/${testIP}/json`;
    console.log(`Fetching from ${url}`);
    
    // Create Basic Auth header (token as username, empty password)
    const auth = Buffer.from(`${IPINFO_ACCESS_TOKEN}:`).toString('base64');
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Adealo-IPinfo-Test/1.0',
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('IPinfo result:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
