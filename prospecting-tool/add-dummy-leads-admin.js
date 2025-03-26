const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample company data
const companies = [
  {
    id: 'comp-1',
    name: 'TechNova Solutions',
    domain: 'technovasolutions.com',
    industry: 'Information Technology',
    size: '50-200',
    location: 'Stockholm, Sweden',
    logo: 'https://ui-avatars.com/api/?name=TechNova+Solutions&background=0D8ABC&color=fff'
  },
  {
    id: 'comp-2',
    name: 'Nordic Finance Group',
    domain: 'nordicfinancegroup.se',
    industry: 'Financial Services',
    size: '500-1000',
    location: 'Gothenburg, Sweden',
    logo: 'https://ui-avatars.com/api/?name=Nordic+Finance&background=2E8B57&color=fff'
  },
  {
    id: 'comp-3',
    name: 'EcoSmart Energy',
    domain: 'ecosmartenergy.com',
    industry: 'Renewable Energy',
    size: '100-500',
    location: 'Malmö, Sweden',
    logo: 'https://ui-avatars.com/api/?name=EcoSmart+Energy&background=228B22&color=fff'
  },
  {
    id: 'comp-4',
    name: 'Global Logistics AB',
    domain: 'globallogistics.se',
    industry: 'Transportation & Logistics',
    size: '1000-5000',
    location: 'Uppsala, Sweden',
    logo: 'https://ui-avatars.com/api/?name=Global+Logistics&background=4682B4&color=fff'
  },
  {
    id: 'comp-5',
    name: 'HealthTech Innovations',
    domain: 'healthtechinnovations.com',
    industry: 'Healthcare Technology',
    size: '20-50',
    location: 'Linköping, Sweden',
    logo: 'https://ui-avatars.com/api/?name=HealthTech&background=FF6347&color=fff'
  },
  {
    id: 'comp-6',
    name: 'Nordic Construction Partners',
    domain: 'nordicconstruction.se',
    industry: 'Construction',
    size: '200-500',
    location: 'Örebro, Sweden',
    logo: 'https://ui-avatars.com/api/?name=Nordic+Construction&background=DAA520&color=fff'
  },
  {
    id: 'comp-7',
    name: 'Digital Marketing Experts',
    domain: 'digitalmarketingexperts.com',
    industry: 'Marketing & Advertising',
    size: '10-50',
    location: 'Helsingborg, Sweden',
    logo: 'https://ui-avatars.com/api/?name=Digital+Marketing&background=9932CC&color=fff'
  },
  {
    id: 'comp-8',
    name: 'Swedish Food Innovations',
    domain: 'swedishfoodinnovations.se',
    industry: 'Food & Beverages',
    size: '100-200',
    location: 'Jönköping, Sweden',
    logo: 'https://ui-avatars.com/api/?name=Swedish+Food&background=8B4513&color=fff'
  },
  {
    id: 'comp-9',
    name: 'EduTech Solutions',
    domain: 'edutechsolutions.com',
    industry: 'Education Technology',
    size: '50-100',
    location: 'Umeå, Sweden',
    logo: 'https://ui-avatars.com/api/?name=EduTech&background=4169E1&color=fff'
  },
  {
    id: 'comp-10',
    name: 'Retail Innovations AB',
    domain: 'retailinnovations.se',
    industry: 'Retail',
    size: '500-1000',
    location: 'Västerås, Sweden',
    logo: 'https://ui-avatars.com/api/?name=Retail+Innovations&background=DC143C&color=fff'
  }
];

// Sample site data
const sites = [
  {
    id: 'site-1',
    name: 'Main Corporate Website',
    domain: 'adealo.com',
    userId: 'junior.hallberg@gmail.com'
  },
  {
    id: 'site-2',
    name: 'Product Landing Page',
    domain: 'getadealo.com',
    userId: 'junior.hallberg@gmail.com'
  }
];

// Generate random dates within the last 30 days
function getRandomDate(daysAgo = 30) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return pastDate;
}

// Generate random IP addresses
function getRandomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate random session IDs
function generateSessionId() {
  return 'session-' + Math.random().toString(36).substring(2, 15);
}

// Generate random client IDs
function generateClientId() {
  return 'client-' + Math.random().toString(36).substring(2, 15);
}

// Generate random visit IDs
function generateVisitId() {
  return 'visit-' + Math.random().toString(36).substring(2, 15);
}

// Sample referrers
const referrers = [
  'https://www.google.com',
  'https://www.linkedin.com',
  'https://www.facebook.com',
  'https://www.twitter.com',
  'https://www.bing.com',
  'https://www.instagram.com',
  '',  // Direct traffic
];

// Sample UTM parameters
const utmSources = ['google', 'linkedin', 'facebook', 'twitter', 'newsletter', 'direct', ''];
const utmMediums = ['cpc', 'social', 'email', 'organic', 'referral', ''];
const utmCampaigns = ['spring_sale', 'product_launch', 'brand_awareness', 'retargeting', ''];

// Sample paths
const paths = [
  '/',
  '/features',
  '/pricing',
  '/about',
  '/contact',
  '/blog',
  '/blog/how-to-increase-sales',
  '/blog/customer-success-stories',
  '/demo'
];

// Sample user agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
];

// Sample screen sizes
const screenSizes = [
  '1920x1080',
  '1366x768',
  '1440x900',
  '2560x1440',
  '375x812',
  '414x896',
  '768x1024'
];

// Sample languages
const languages = ['en-US', 'sv-SE', 'en-GB', 'de-DE', 'fr-FR', 'es-ES'];

// Sample event types
const eventTypes = ['pageview', 'engagement', 'conversion'];

// Add dummy data to Firestore
async function addDummyData() {
  try {
    console.log('Adding dummy data to Firestore...');

    // Add sites
    for (const site of sites) {
      await db.collection('sites').doc(site.id).set({
        ...site,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added site: ${site.name}`);

      // Add site stats
      await db.collection('siteStats').doc(site.id).set({
        siteId: site.id,
        visits: Math.floor(Math.random() * 1000) + 100,
        firstVisit: getRandomDate(60),
        lastVisit: getRandomDate(2)
      });
      console.log(`Added site stats for: ${site.name}`);
    }

    // For each company, create sessions and visits
    for (const company of companies) {
      // Create 1-3 sessions per company
      const sessionCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionId = generateSessionId();
        const clientId = generateClientId();
        const siteId = sites[Math.floor(Math.random() * sites.length)].id;
        const ip = getRandomIP();
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const referrer = referrers[Math.floor(Math.random() * referrers.length)];
        const utmSource = utmSources[Math.floor(Math.random() * utmSources.length)];
        const utmMedium = utmMediums[Math.floor(Math.random() * utmMediums.length)];
        const utmCampaign = utmCampaigns[Math.floor(Math.random() * utmCampaigns.length)];
        
        // Session start and end times
        const startTime = getRandomDate(7);
        const endTime = new Date(startTime.getTime() + Math.random() * 30 * 60 * 1000); // Up to 30 minutes later
        
        // Create session
        await db.collection('sessions').doc(sessionId).set({
          clientId,
          siteId,
          ip,
          userAgent,
          startTime,
          lastActivity: endTime,
          referrer,
          utmSource,
          utmMedium,
          utmCampaign,
          country: 'Sweden',
          region: company.location.split(', ')[0],
          city: company.location.split(', ')[0],
          companyId: company.id,
          companyName: company.name,
          pageviews: Math.floor(Math.random() * 10) + 1,
          events: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
            type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            timestamp: new Date(startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime())),
            path: paths[Math.floor(Math.random() * paths.length)]
          }))
        });
        console.log(`Added session for: ${company.name}`);
        
        // Create 2-5 visits per session
        const visitCount = Math.floor(Math.random() * 4) + 2;
        
        for (let j = 0; j < visitCount; j++) {
          const visitId = generateVisitId();
          const visitTime = new Date(startTime.getTime() + j * (endTime.getTime() - startTime.getTime()) / visitCount);
          const path = paths[Math.floor(Math.random() * paths.length)];
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const screenSize = screenSizes[Math.floor(Math.random() * screenSizes.length)];
          const language = languages[Math.floor(Math.random() * languages.length)];
          
          // Create visit
          await db.collection('visits').doc(visitId).set({
            ip,
            timestamp: visitTime,
            referrer,
            userAgent,
            url: `https://${sites[Math.floor(Math.random() * sites.length)].domain}${path}`,
            path,
            utmSource,
            utmMedium,
            utmCampaign,
            screenSize,
            language,
            country: 'Sweden',
            region: company.location.split(', ')[0],
            city: company.location.split(', ')[0],
            companyId: company.id,
            companyName: company.name,
            sessionId,
            clientId,
            siteId,
            eventType,
            ...(eventType === 'engagement' ? {
              engagementData: {
                scrollDepth: Math.floor(Math.random() * 100),
                timeOnPage: Math.floor(Math.random() * 300),
                clicks: Math.floor(Math.random() * 10),
                formInteractions: Math.floor(Math.random() * 3)
              }
            } : {}),
            ...(eventType === 'conversion' ? {
              conversionData: {
                type: Math.random() > 0.5 ? 'form_submission' : 'button_click',
                value: Math.floor(Math.random() * 100),
                formData: {
                  name: `Contact from ${company.name}`,
                  email: `contact@${company.domain}`,
                  message: 'I would like to learn more about your services.'
                }
              }
            } : {})
          });
          console.log(`Added visit for: ${company.name}`);
        }
      }
    }

    console.log('Successfully added all dummy data!');
  } catch (error) {
    console.error('Error adding dummy data:', error);
  }
}

// Run the function
console.log('Starting to add dummy data...');
addDummyData()
  .then(() => console.log('Dummy data added successfully!'))
  .catch(error => console.error('Error adding dummy data:', error));
