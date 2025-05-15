#!/bin/bash

# Build the frontend
cd frontend
npm install
npm run build

# Install Firebase tools if not already installed
# npm install -g firebase-tools

# Deploy to Firebase
# firebase login
# firebase deploy --only hosting

echo "Frontend build complete. Now run 'firebase deploy --only hosting' to deploy to Firebase." 