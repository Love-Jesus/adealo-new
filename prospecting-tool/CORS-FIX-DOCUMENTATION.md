# CORS Fix Documentation

This document explains the changes made to fix the CORS (Cross-Origin Resource Sharing) issues with the Adealo widget system.

## Problem

The widget was experiencing CORS errors when embedded on websites with different domains, including:

- Firebase hosting domain (`https://adealo-ce238.web.app`)
- Local development servers (`http://localhost:5173`)
- Other customer domains

The error message was:

```
Access to fetch at 'https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetScript' from origin 'https://adealo-ce238.web.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

We implemented the following changes to fix the CORS issues:

1. **Updated CORS Configuration**: Modified the CORS configuration in `functions/src/widget-embed.ts` to allow all origins:

```typescript
// Configure CORS
const corsHandler = cors({
  origin: true, // Allow all origins for now to debug the issue
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400 // 24 hours
});
```

2. **Deployed Updated Functions**: Used the `deploy-widget-functions-cors.sh` script to deploy the updated functions with the new CORS configuration:

```bash
./prospecting-tool/deploy-widget-functions-cors.sh
```

3. **Created Test Pages**: Created test pages to verify the CORS configuration:
   - `public/cors-test-widget.html`: A test page that loads the widget directly from the Firebase Functions endpoint
   - `public/localhost-widget-test.html`: A test page for local development

4. **Deployed Test Pages**: Deployed the test pages to Firebase hosting:

```bash
./prospecting-tool/deploy-cors-test.sh
```

## Testing

You can test the CORS configuration with the following URLs:

- Production test page: [https://adealo-ce238.web.app/cors-test-widget.html](https://adealo-ce238.web.app/cors-test-widget.html)
- Local test page: [http://localhost:8000/localhost-widget-test.html](http://localhost:8000/localhost-widget-test.html) (when running the local server)

## Future Improvements

For production use, you may want to restrict the CORS configuration to specific domains rather than allowing all origins. You can do this by updating the CORS configuration in `functions/src/widget-embed.ts`:

```typescript
// Configure CORS
const corsHandler = cors({
  origin: [
    'https://adealo-ce238.web.app',
    'https://adealo.com',
    'https://widget.adealo.com',
    'http://localhost:5173',
    // Add other customer domains as needed
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
});
```

## Scripts

The following scripts were created to help with the CORS fix:

- `deploy-widget-functions-cors.sh`: Deploys only the widget functions with CORS support
- `deploy-cors-test.sh`: Deploys the CORS test pages to Firebase hosting
- `run-widget-local-test.sh`: Runs a local server to test the widget with the local Firebase Functions emulator

## Conclusion

The CORS issues have been fixed by updating the CORS configuration and deploying the updated functions. The widget should now work correctly when embedded on any website, including the Firebase hosting domain and local development servers.
