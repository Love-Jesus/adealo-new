# Adealo Support Chat Widget

This document provides information about the Adealo Support Chat Widget functionality, how to create and configure chat widgets, and how to test them.

## Overview

The Support Chat Widget is a new widget type that allows your customers to chat with your support team directly from your website. It integrates with the existing support system in the Adealo platform, allowing your team to respond to chat messages from the admin interface.

## Features

- **Real-time Chat**: Visitors can chat with your support team in real-time
- **Quick Response Options**: Configure predefined response options for common questions
- **Visitor Information**: Optionally collect visitor information for better support
- **Team Routing**: Route chats to specific support teams
- **Customizable Design**: Match the widget to your website's design
- **Behavior Controls**: Configure when and how the widget appears

## Creating a Support Chat Widget

1. Navigate to the Widgets page in the Adealo platform
2. Click "Create Widget"
3. Select "Support Chat" as the widget type
4. Configure the widget settings:
   - **Design**: Customize the appearance of the widget
   - **Behavior**: Configure when and how the widget appears
   - **Content**: Set up the chat messages and quick response options
   - **Integration**: Configure support team routing and visitor information collection

## Widget Configuration Options

### Design Tab

- **Theme**: Choose between light and dark theme
- **Position**: Select where the widget appears on the page
- **Colors**: Customize the primary and secondary colors
- **Border Radius**: Adjust the roundness of the widget corners
- **Font Family**: Select the font to use
- **Animation**: Choose how the widget animates when it appears

### Behavior Tab

- **Trigger**: Choose when the widget appears (time delay, scroll position, exit intent)
- **Delay**: Set how long to wait before showing the widget
- **Frequency**: Control how often the widget appears to the same visitor
- **Mobile Display**: Toggle whether the widget appears on mobile devices

### Content Tab

- **Title**: Set the widget title
- **Description**: Add a brief description
- **CTA Text**: Customize the call-to-action button text
- **Thank You Message**: Set the message shown after a visitor submits a message
- **Welcome Message**: Configure the initial message shown to visitors
- **Quick Responses**: Add predefined response options for common questions

### Integration Tab

- **Support Team ID**: Optionally route chats to a specific support team
- **Collect Visitor Info**: Toggle whether to collect visitor information

## Testing the Widget

You can test the Support Chat Widget locally using the provided test script:

```bash
./run-chat-widget-test.sh
```

This will start a local development server and open a test page with the widget embedded.

## Widget Embed Code

To add the widget to your website, add the following code before the closing `</body>` tag:

```html
<!-- Adealo Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;js.id=o;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','adealo','https://widget.adealo.com/loader.js'));
  
  adealo('init', 'YOUR_WIDGET_ID');
</script>
<!-- End Adealo Widget -->
```

Replace `YOUR_WIDGET_ID` with the ID of your widget.

## Local Development

For local development, you can use:

```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;js.id=o;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','adealo','http://localhost:5173/loader.js'));
  
  adealo('init', 'YOUR_WIDGET_ID');
</script>
```

## Admin Interface

Support chat messages are accessible through the Admin interface in the Adealo platform. Your team can:

1. View incoming chat messages
2. Respond to visitors in real-time
3. See visitor information (if collected)
4. Assign chats to specific team members
5. View chat history

## Technical Implementation

The Support Chat Widget is implemented using:

- **Frontend**: React components for the widget editor and preview
- **Backend**: Firebase Functions for the widget script generation and chat message handling
- **Database**: Firestore for storing widget configurations and chat messages

The widget script is generated dynamically based on the widget configuration and served to the website via a Firebase Function.
