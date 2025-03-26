# Chat Widget Updates and Fixes

This document outlines the issues identified with the chat widget and provides solutions to fix them.

## Issues Identified

### 1. Admin Message Error

When sending messages from the admin view, the following error occurs:

```
Function addDoc() called with invalid data. Unsupported field value: undefined (found in field senderAvatar in document chatConversations/S9dDEuZpgZ6AsypQmywD/messages/UKga7ADDF9fZPw3K4LiG)
```

This error happens because the `senderAvatar` field is being referenced but is undefined when sending messages from the admin interface.

### 2. File Upload Error

When clicking "Upload file" in the chat widget, the following error occurs:

```
Firebase Storage: An unknown error occurred, please check the error payload for server response. (storage/unknown)
```

This error occurs because the file upload functionality is not properly implemented in the chat widget.

## Solutions

### 1. Fix Admin Message Error

The issue is that the `senderAvatar` field is being referenced but not properly initialized when sending messages from the admin interface. Here's how to fix it:

1. **Update the message data structure** when sending messages from the admin interface:

```javascript
// When sending a message from admin
const messageData = {
  conversationId,
  text,
  sender: 'agent',
  senderId: firebase.auth().currentUser.uid,
  senderName: 'Support Agent', // Add a default name
  senderAvatar: null, // Add a default value (null) for senderAvatar
  timestamp: now,
  isRead: false,
  isInternal: false
};
```

2. **Add validation** in the message sending function to ensure `senderAvatar` is always defined:

```javascript
// Add this to the sendMessage function
if (!messageData.senderAvatar) {
  messageData.senderAvatar = null; // Ensure senderAvatar is never undefined
}
```

3. **Update the UI rendering** to handle null avatar values:

```javascript
// In the addAgentMessageToUI function
const avatarUrl = message.senderAvatar || 'default-avatar-url.png';
```

### 2. Implement File Upload Functionality

To fix the file upload error, we need to implement proper file upload functionality in the chat widget:

1. **Add file input to the chat interface**:

```javascript
// Add this to the chat input area
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.id = 'adealo-file-upload';
fileInput.style.display = 'none';
inputArea.appendChild(fileInput);

// Add file upload button
const fileButton = document.createElement('button');
fileButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
`;
fileButton.style.backgroundColor = '#f3f4f6';
fileButton.style.color = '#4b5563';
fileButton.style.border = 'none';
fileButton.style.borderRadius = '8px';
fileButton.style.width = '40px';
fileButton.style.height = '40px';
fileButton.style.display = 'flex';
fileButton.style.alignItems = 'center';
fileButton.style.justifyContent = 'center';
fileButton.style.cursor = 'pointer';
fileButton.style.marginRight = '10px';
fileButton.style.transition = 'background-color 0.2s ease';
fileButton.title = 'Upload file';
inputArea.insertBefore(fileButton, sendButton);

// File button click handler
fileButton.addEventListener('click', function() {
    fileInput.click();
});
```

2. **Implement file upload functionality**:

```javascript
// Add this function to handle file uploads
async function uploadFile(file, conversationId) {
    try {
        // Create a storage reference
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`chat-attachments/${conversationId}/${Date.now()}_${file.name}`);
        
        // Upload the file
        const snapshot = await fileRef.put(file);
        
        // Get the download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Create a message with the file attachment
        const db = firebase.firestore();
        const now = firebase.firestore.FieldValue.serverTimestamp();
        
        // Create message document with file attachment
        const messageData = {
            conversationId,
            text: `Sent a file: ${file.name}`,
            fileUrl: downloadURL,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            sender: 'user',
            senderId: firebase.auth().currentUser.uid,
            timestamp: now,
            isRead: false,
            isInternal: false
        };
        
        // Add message to conversation
        await db.collection(`chatConversations/${conversationId}/messages`).add(messageData);
        
        // Update conversation with last message info
        await db.collection('chatConversations').doc(conversationId).update({
            lastMessage: `Sent a file: ${file.name}`,
            lastMessageSender: 'user',
            lastMessageAt: now,
            updatedAt: now
        });
        
        log(`File uploaded: ${file.name}`, 'success');
        return downloadURL;
    } catch (error) {
        log(`Error uploading file: ${error.message}`, 'error');
        throw error;
    }
}

// Add file input change handler
fileInput.addEventListener('change', async function() {
    if (this.files && this.files[0] && currentConversationId) {
        const file = this.files[0];
        
        // Create a loading message
        const userMessageContainer = document.createElement('div');
        userMessageContainer.style.display = 'flex';
        userMessageContainer.style.justifyContent = 'flex-end';
        userMessageContainer.style.marginBottom = '15px';
        
        const userMessage = document.createElement('div');
        userMessage.className = 'adealo-user-message';
        userMessage.style.backgroundColor = '#4F46E5';
        userMessage.style.color = 'white';
        userMessage.style.borderRadius = '12px';
        userMessage.style.padding = '12px 16px';
        userMessage.style.maxWidth = '80%';
        userMessage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        userMessage.innerHTML = `
            <p style="margin: 0;">Uploading file: ${file.name}</p>
            <div style="width: 100%; height: 4px; background-color: rgba(255,255,255,0.3); margin-top: 8px; border-radius: 2px;">
                <div style="width: 0%; height: 100%; background-color: white; border-radius: 2px;" class="upload-progress"></div>
            </div>
        `;
        
        userMessageContainer.appendChild(userMessage);
        messagesContainer.appendChild(userMessageContainer);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        try {
            // Upload the file
            await uploadFile(file, currentConversationId);
            
            // Update the message to show success
            userMessage.innerHTML = `
                <p style="margin: 0;">File uploaded: ${file.name}</p>
                <p style="margin: 4px 0 0 0; font-size: 0.8em; opacity: 0.8;">Click to download</p>
            `;
            
            // Clear the file input
            fileInput.value = '';
        } catch (error) {
            // Update the message to show error
            userMessage.innerHTML = `
                <p style="margin: 0;">Failed to upload: ${file.name}</p>
                <p style="margin: 4px 0 0 0; font-size: 0.8em; opacity: 0.8;">${error.message}</p>
            `;
        }
    }
});
```

3. **Update the UI to display file attachments**:

```javascript
// Add this to the message listener to handle file attachments
if (message.fileUrl) {
    // Create a file attachment element
    const fileAttachment = document.createElement('div');
    fileAttachment.style.backgroundColor = '#f3f4f6';
    fileAttachment.style.borderRadius = '8px';
    fileAttachment.style.padding = '10px';
    fileAttachment.style.marginTop = '8px';
    fileAttachment.style.cursor = 'pointer';
    
    // Determine file icon based on file type
    let fileIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    `;
    
    if (message.fileType && message.fileType.startsWith('image/')) {
        fileIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
        `;
    }
    
    // Format file size
    const fileSize = message.fileSize ? formatFileSize(message.fileSize) : '';
    
    fileAttachment.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div style="margin-right: 8px; color: #4b5563;">${fileIcon}</div>
            <div>
                <div style="font-weight: 500; color: #4b5563;">${message.fileName || 'File'}</div>
                <div style="font-size: 0.8em; color: #9ca3af;">${fileSize}</div>
            </div>
        </div>
    `;
    
    // Add click handler to download the file
    fileAttachment.addEventListener('click', function() {
        window.open(message.fileUrl, '_blank');
    });
    
    // Add the file attachment to the message
    responseMessage.appendChild(fileAttachment);
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

## Implementation Steps

To implement these fixes:

1. **For the Admin Message Error**:
   - Update the message sending function in the admin interface to include a default value for `senderAvatar`
   - Add validation to ensure `senderAvatar` is never undefined
   - Update the UI rendering to handle null avatar values

2. **For the File Upload Functionality**:
   - Add file input and upload button to the chat interface
   - Implement the file upload function using Firebase Storage
   - Update the UI to display file attachments
   - Add error handling for file uploads

## Testing

After implementing these fixes, you should test:

1. **Admin Message Error Fix**:
   - Send messages from the admin interface
   - Verify that no errors occur related to `senderAvatar`
   - Check that messages appear correctly in the chat widget

2. **File Upload Functionality**:
   - Upload files of different types and sizes
   - Verify that files are uploaded successfully
   - Check that file attachments appear correctly in the chat
   - Test downloading uploaded files
   - Verify error handling for failed uploads

## Deployment

After testing, deploy the updated code to production:

1. Deploy the updated Firebase Storage rules if needed
2. Deploy the updated chat widget code
3. Deploy any changes to the admin interface

## Conclusion

These fixes address the two main issues with the chat widget:
1. The admin message error caused by undefined `senderAvatar`
2. The file upload error caused by missing file upload functionality

By implementing these solutions, the chat widget will be more robust and feature-complete, allowing for seamless communication between users and administrators, including the ability to share files.
