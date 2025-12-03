# 🚀 Complete Render Deployment Guide - Step by Step

This guide will walk you through deploying both the **Backend** and **Frontend** of SmartSpend+ to Render.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ Your code pushed to a GitHub repository
- ✅ A Render account (sign up at [render.com](https://render.com) - it's free!)

---

## 🗄️ STEP 1: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** button (top right)
   - Select **"PostgreSQL"**

2. **Configure Database**
   - **Name:** `smartspend-db` (or your preferred name)
   - **Database:** `smartspend` (or your preferred name)
   - **User:** Leave default or choose your own
   - **Region:** Choose closest to you (e.g., `Oregon (US West)`)
   - **PostgreSQL Version:** `15` (or latest)
   - **Plan:** 
     - **Free** for testing (limited to 90 days)
     - **Starter** ($7/month) for production

3. **Create Database**
   - Click **"Create Database"**
   - ⚠️ **IMPORTANT:** Copy the **Internal Database URL** - you'll need it later!
   - It looks like: `postgresql://user:password@dpg-xxxxx-a/smartspend`

4. **Save Database Credentials**
   - Note down:
     - Database URL (Internal)
     - Database URL (External) - for local connections if needed
     - Host, Port, Database name, User, Password

---

## 🔧 STEP 2: Prepare Your Repository

1. **Push Code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify Repository Structure**
   Your repo should have:
   ```
   smart/
   ├── backend/
   │   ├── server.js
   │   ├── package.json
   │   ├── prisma/
   │   └── ...
   └── frontend/
       ├── server.js
       ├── package.json
       ├── render.yaml
       └── ...
   ```

---

## 🖥️ STEP 3: Deploy Backend API

### 3.1 Create Web Service

1. **In Render Dashboard:**
   - Click **"New +"** → **"Web Service"**
   - **Connect your GitHub repository**
   - Select your repository
   - Click **"Connect"**

2. **Configure Backend Service:**

   **Basic Settings:**
   - **Name:** `smartspend-backend` (or your preferred name)
   - **Region:** Same as database (e.g., `Oregon (US West)`)
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`

   **Advanced Settings:**
   - **Auto-Deploy:** `Yes` (deploys on every push)
   - **Health Check Path:** `/api/health`

### 3.2 Add Environment Variables

Click **"Environment"** tab and add these variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<Your Internal Database URL from Step 1>
JWT_SECRET=<Generate a strong random string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<Will add after frontend is deployed>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<Your Gmail>
EMAIL_PASS=<Your Gmail App Password>
EMAIL_FROM=noreply@smartspend.com
```

**How to get values:**
- **DATABASE_URL:** Copy from PostgreSQL service → "Internal Database URL"
- **JWT_SECRET:** Generate using: `openssl rand -base64 32` or use [randomkeygen.com](https://randomkeygen.com)
- **EMAIL_PASS:** Gmail App Password (see below)

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use that password in `EMAIL_PASS`

### 3.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Once deployed, copy the **Service URL** (e.g., `https://smartspend-backend.onrender.com`)
4. Test the health endpoint: `https://smartspend-backend.onrender.com/api/health`

---

## 🎨 STEP 4: Deploy Frontend

### 4.1 Create Web Service

1. **In Render Dashboard:**
   - Click **"New +"** → **"Web Service"**
   - **Connect the same GitHub repository**
   - Select your repository
   - Click **"Connect"**

2. **Configure Frontend Service:**

   **Basic Settings:**
   - **Name:** `smartspend-frontend` (or your preferred name)
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

   **Advanced Settings:**
   - **Auto-Deploy:** `Yes`
   - **Health Check Path:** `/` (or leave empty)

### 4.2 Add Environment Variables

Click **"Environment"** tab and add:

```
NODE_ENV=production
PORT=10000
VITE_API_URL=<Your Backend URL from Step 3>
```

**Example:**
```
VITE_API_URL=https://smartspend-backend.onrender.com
```

### 4.3 Update Backend CORS

1. Go back to your **Backend Service**
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` to your frontend URL:
   ```
   FRONTEND_URL=https://smartspend-frontend.onrender.com
   ```
4. Click **"Save Changes"** - this will trigger a redeploy

### 4.4 Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Once deployed, your frontend will be live!

---

## 🔄 STEP 5: Update Frontend API Configuration

1. **Check Frontend API Config:**
   - Open `frontend/src/utils/axios.js`
   - It should use `import.meta.env.VITE_API_URL` or similar

2. **Verify Environment Variable:**
   - In Render Dashboard → Frontend Service → Environment
   - Ensure `VITE_API_URL` is set correctly
   - **Note:** Vite requires `VITE_` prefix for client-side variables

3. **Rebuild if needed:**
   - If you changed environment variables, trigger a manual deploy

---

## ✅ STEP 6: Verify Deployment

### Test Backend:
1. Visit: `https://your-backend.onrender.com/api/health`
2. Should return: `{"status":"ok","message":"SmartSpend+ API is running"}`

### Test Frontend:
1. Visit: `https://your-frontend.onrender.com`
2. Should load the login page
3. Try registering a new account
4. Test navigation between pages

### Test Database Connection:
1. Try logging in/registering
2. If errors, check backend logs in Render Dashboard

---

## 🐛 Troubleshooting

### Backend Issues:

**Problem: Database connection error**
- ✅ Check `DATABASE_URL` is correct (use Internal URL)
- ✅ Verify database is running
- ✅ Check database credentials

**Problem: Prisma migration fails**
- ✅ Ensure `prisma migrate deploy` is in build command
- ✅ Check Prisma schema is correct
- ✅ Verify database is accessible

**Problem: CORS errors**
- ✅ Update `FRONTEND_URL` in backend environment variables
- ✅ Check backend `server.js` CORS configuration
- ✅ Ensure frontend URL includes `https://`

### Frontend Issues:

**Problem: 404 on page refresh**
- ✅ Verify `server.js` exists in frontend folder
- ✅ Check `npm start` command works
- ✅ Ensure Express is installed

**Problem: API calls fail**
- ✅ Check `VITE_API_URL` is set correctly
- ✅ Verify backend is running
- ✅ Check browser console for CORS errors
- ✅ Ensure backend CORS allows frontend URL

**Problem: Build fails**
- ✅ Check Node.js version (Render uses Node 18+)
- ✅ Verify all dependencies in `package.json`
- ✅ Check build logs in Render Dashboard

### General Issues:

**Problem: Services keep restarting**
- ✅ Check health check path is correct
- ✅ Review logs for errors
- ✅ Verify environment variables are set

**Problem: Slow first load**
- ✅ Normal on free tier (services spin down after inactivity)
- ✅ First request takes 30-60 seconds
- ✅ Consider upgrading to paid plan for always-on

---

## 📝 Quick Reference

### Backend Service:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command:** `npm start`
- **Health Check:** `/api/health`

### Frontend Service:
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check:** `/` (or empty)

### Required Environment Variables:

**Backend:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<generate random string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<frontend service URL>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your email>
EMAIL_PASS=<app password>
EMAIL_FROM=noreply@smartspend.com
```

**Frontend:**
```
NODE_ENV=production
PORT=10000
VITE_API_URL=<backend service URL>
```

---

## 🎉 You're Done!

Your application should now be live on Render! 

- **Frontend:** `https://your-frontend.onrender.com`
- **Backend:** `https://your-backend.onrender.com`
- **Database:** Managed by Render

### Next Steps:
1. ✅ Test all features
2. ✅ Set up custom domain (optional)
3. ✅ Configure email service (if needed)
4. ✅ Set up monitoring (optional)
5. ✅ Consider upgrading from free tier for production

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Database limited to 90 days on free tier

2. **Upgrade to Paid:**
   - Always-on services ($7/month per service)
   - Better performance
   - No spin-down delays

3. **Custom Domains:**
   - Add custom domain in service settings
   - Update CORS and environment variables

4. **Monitoring:**
   - Check logs regularly
   - Set up alerts for errors
   - Monitor database usage

---

## 📞 Need Help?

- Render Docs: [render.com/docs](https://render.com/docs)
- Render Support: [render.com/support](https://render.com/support)
- Check service logs in Render Dashboard

Good luck with your deployment! 🚀

