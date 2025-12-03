# Deployment Guide for Render

This guide explains how to deploy your React SPA to Render and fix SPA routing issues.

## Problem

When deploying a React Single Page Application (SPA) to Render, direct URL access or page refreshes result in 404 errors because the server doesn't know how to handle client-side routes.

## Solution

We've set up two solutions:

### Option 1: Node.js Web Service (Recommended)

This uses Express to serve the built files and handle SPA routing.

**Steps:**

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name:** smartspend-frontend (or your preferred name)
     - **Environment:** Node
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Root Directory:** `frontend` (if deploying from monorepo)
   - Add Environment Variables:
     - `NODE_ENV=production`
     - `PORT=10000` (Render will override this automatically)

4. **The server.js file will:**
   - Serve static files from the `dist` directory
   - Handle all routes by serving `index.html` (SPA fallback)
   - This ensures React Router handles all client-side routing

### Option 2: Static Site (Alternative)

If you prefer static hosting:

1. **Update render.yaml:**
   - Uncomment the static site configuration
   - Comment out the web service configuration

2. **Deploy:**
   - Use Render's Static Site service
   - The `_redirects` file in the `public` folder will handle routing
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

## File Structure

```
frontend/
├── server.js          # Express server for SPA routing
├── render.yaml        # Render configuration
├── public/
│   └── _redirects     # Fallback for static hosting
└── package.json       # Updated with start script and express
```

## Testing Locally

Before deploying, test the production build locally:

```bash
cd frontend
npm run build
npm start
```

Visit `http://localhost:3000` and test:
- Direct URL access (e.g., `/expenses`)
- Page refresh on any route
- Navigation between routes

## Troubleshooting

### 404 Errors on Refresh

- Ensure `server.js` is in the `frontend` directory
- Verify `npm start` command works locally
- Check that `dist/index.html` exists after build

### Build Fails

- Check Node.js version (Render supports Node 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Render dashboard

### Routes Not Working

- Verify `server.js` has the SPA fallback route (`app.get('*', ...)`)
- Check that `dist` folder contains built files
- Ensure Express is serving static files correctly

## Environment Variables

If your app needs environment variables:

1. In Render Dashboard → Your Service → Environment
2. Add variables like:
   - `VITE_API_URL=https://your-backend-url.onrender.com`
   - `VITE_APP_NAME=SmartSpend`

Note: Vite requires `VITE_` prefix for client-side variables.

## Additional Notes

- The server uses Express to serve static files
- All routes fallback to `index.html` for SPA routing
- The `_redirects` file is a backup for static hosting
- Render automatically sets the `PORT` environment variable

