#!/bin/bash

# Build the backend
cd backend
npm install
npm run build

# Here you would add commands to deploy to your preferred backend platform
# For example, with Heroku:
# heroku login
# git add .
# git commit -m "Deploy backend"
# git push heroku main

# For Render, Railway, or other platforms, follow their CLI deployment instructions
echo "Backend build complete. Deploy manually to your preferred platform." 