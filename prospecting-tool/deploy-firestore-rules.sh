#!/bin/bash

# Deploy the updated Firestore security rules

echo "Deploying updated Firestore security rules..."
firebase deploy --only firestore:rules

echo "Firestore rules deployed successfully!"
