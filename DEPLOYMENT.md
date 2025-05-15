# Deployment Instructions

This document provides instructions for deploying the Todo application with the frontend on Firebase Hosting and the backend on another platform like Render, Heroku, or Railway.

## Prerequisites

- Node.js and npm installed
- Firebase account created
- Account on your chosen backend platform (Render, Heroku, Railway, etc.)
- Firebase CLI installed (`npm install -g firebase-tools`)

## Frontend Deployment (Firebase)

1. **Update Firebase configuration**

   Update the `.firebaserc` file in the `frontend` directory with your Firebase project ID:

   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

2. **Update environment variables**

   Edit the `.env.production` file in the `frontend` directory to point to your backend URL:

   ```
   VITE_API_URL=https://your-backend-production-url.com
   ```

3. **Build and deploy**

   Run the deployment script:

   ```bash
   ./deploy-frontend.sh
   ```

   Or manually:

   ```bash
   cd frontend
   npm install
   npm run build
   firebase login
   firebase deploy --only hosting
   ```

4. **Verify deployment**

   Open your Firebase Hosting URL to verify the deployment.

## Backend Deployment (Render, Heroku, Railway, etc.)

1. **Choose a platform**

   - **Render**: Create a Web Service using the Node.js runtime
   - **Heroku**: Create a new application in your Heroku dashboard
   - **Railway**: Create a new project and connect your repository

2. **Configure environment variables**

   Set the following environment variables on your chosen platform:
   - `PORT`: The port your server will run on (often set automatically)
   - `JWT_SECRET`: Secret key for JWT authentication
   - Any other environment-specific variables

3. **Update CORS settings**

   Edit `backend/src/index.ts` to include your Firebase domain in the CORS origin list:

   ```javascript
   origin: [
     'http://localhost:5173',
     'https://your-firebase-app-id.web.app',
     'https://your-firebase-app-id.firebaseapp.com',
   ]
   ```

4. **Deploy**

   Deployment steps depend on your chosen platform:

   - **Render**: Connect your repository and set up automatic deployments
   - **Heroku**: `git push heroku main`
   - **Railway**: Connect your repository or use the Railway CLI

5. **Verify deployment**

   Test your backend endpoint by visiting the health check URL:
   `https://your-backend-url.com/health`

## Connecting Frontend and Backend

After both deployments are complete:

1. Ensure the frontend's `.env.production` file points to the correct backend URL
2. Verify the backend's CORS settings include your Firebase domain
3. Test the complete application flow

## Troubleshooting

- If you encounter CORS issues, double-check the CORS configuration in `backend/src/index.ts`
- If the frontend can't connect to the backend, verify the environment variables
- Check the browser console and server logs for error messages 