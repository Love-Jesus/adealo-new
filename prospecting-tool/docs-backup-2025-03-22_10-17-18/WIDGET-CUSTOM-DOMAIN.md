# Setting Up a Custom Domain for Your Adealo Widget

This guide will walk you through the process of setting up a custom domain (like `widget.adealo.com`) for your Adealo Widget. Using a custom domain provides a more professional appearance and better branding for your widget.

## Prerequisites

- You have already deployed your widget to Firebase hosting using the `deploy-widget.sh` script
- You own the domain you want to use (e.g., `adealo.com`)
- You have access to manage DNS settings for your domain

## Step 1: Add Your Custom Domain to Firebase Hosting

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`adealo-ce238`)
3. In the left sidebar, click on "Hosting"
4. Click on "Add custom domain"
5. Enter your domain (e.g., `widget.adealo.com`)
6. Follow the verification process

## Step 2: Configure DNS Settings

Firebase will provide you with specific DNS records to add to your domain. Typically, this will be either:

### Option 1: A Records

```
A  widget  151.101.1.195
A  widget  151.101.65.195
```

### Option 2: CNAME Record

```
CNAME  widget  adealo-ce238.web.app
```

Add these records to your domain's DNS settings through your domain registrar or DNS provider.

## Step 3: Wait for DNS Propagation

DNS changes can take up to 48 hours to propagate globally, although they often take effect much sooner. You can check the status in the Firebase Console under Hosting.

## Step 4: Update Your Widget Embed Code

Once your custom domain is verified and active, update your widget embed code to use the new domain:

```html
<!-- Adealo Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','adealo','https://widget.adealo.com/loader.js');
  adealo('init', 'YOUR_WIDGET_ID');
</script>
<!-- End Adealo Widget -->
```

Replace `YOUR_WIDGET_ID` with your actual widget ID.

## Step 5: SSL Certificate

Firebase Hosting automatically provisions and renews SSL certificates for your custom domain, ensuring secure HTTPS connections.

## Troubleshooting

### Domain Verification Issues

If you're having trouble verifying your domain:

1. Double-check that you've added the correct DNS records
2. Ensure you've waited long enough for DNS propagation
3. Use a tool like [DNS Checker](https://dnschecker.org/) to verify your DNS records are visible globally

### SSL Certificate Issues

If your site shows SSL certificate warnings:

1. Ensure that the DNS records are correctly set up
2. Wait a bit longer - SSL provisioning can take some time after DNS propagation
3. Check the Firebase Console for any specific error messages

## Additional Resources

- [Firebase Custom Domain Documentation](https://firebase.google.com/docs/hosting/custom-domain)
- [Managing SSL Certificates in Firebase](https://firebase.google.com/docs/hosting/custom-domain#ssl)
- [DNS Configuration Best Practices](https://support.google.com/domains/answer/3290309)

## Next Steps

After setting up your custom domain, consider:

1. Updating any documentation or references to your widget URL
2. Testing the widget thoroughly with the new domain
3. Setting up monitoring for your domain to ensure it remains accessible
