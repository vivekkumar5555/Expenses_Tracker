# ⚡ Quick Start - Render Deployment Checklist

Use this as a quick reference while deploying.

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] GitHub repository connected to Render

---

## 🗄️ Database Setup

- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Note database credentials

**Database URL Format:**

```
postgresql://user:password@host:port/database
```

---

## 🔧 Backend Deployment

### Service Configuration:

- [ ] **Name:** `smartspend-backend`
- [ ] **Root Directory:** `backend`
- [ ] **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
- [ ] **Start Command:** `npm start`
- [ ] **Health Check:** `/api/health`

### Environment Variables:

- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `DATABASE_URL=<from PostgreSQL>`
- [ ] `JWT_SECRET=<random string>`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `FRONTEND_URL=<will update after frontend deploy>`
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] `EMAIL_USER=<your email>`
- [ ] `EMAIL_PASS=<app password>`
- [ ] `EMAIL_FROM=noreply@smartspend.com`

### After Backend Deploys:

- [ ] Copy backend URL
- [ ] Test: `https://your-backend.onrender.com/api/health`

---

## 🎨 Frontend Deployment

### Service Configuration:

- [ ] **Name:** `smartspend-frontend`
- [ ] **Root Directory:** `frontend`
- [ ] **Build Command:** `npm install && npm run build`
- [ ] **Start Command:** `npm start`
- [ ] **Health Check:** `/` (or empty)

### Environment Variables:

- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `VITE_API_URL=https://your-backend.onrender.com`

### After Frontend Deploys:

- [ ] Copy frontend URL
- [ ] Update backend `FRONTEND_URL` environment variable
- [ ] Redeploy backend (auto or manual)

---

## 🔄 Final Steps

- [ ] Test frontend: Visit frontend URL
- [ ] Test registration: Create new account
- [ ] Test login: Log in with new account
- [ ] Test navigation: Check all routes work
- [ ] Test API: Verify API calls work

---

## 🐛 Common Issues

| Issue                     | Solution                                    |
| ------------------------- | ------------------------------------------- |
| Database connection error | Check DATABASE_URL (use Internal URL)       |
| CORS error                | Update FRONTEND_URL in backend              |
| 404 on refresh            | Verify server.js exists and npm start works |
| API calls fail            | Check VITE_API_URL is set correctly         |
| Build fails               | Check Node version and dependencies         |

---

## 📞 Quick Links

- **Render Dashboard:** [dashboard.render.com](https://dashboard.render.com)
- **Backend Service:** `https://dashboard.render.com/web/[your-backend-service]`
- **Frontend Service:** `https://dashboard.render.com/web/[your-frontend-service]`
- **Database Service:** `https://dashboard.render.com/databases/[your-db-service]`

---

## 🎯 Your URLs (Fill in after deployment)

- **Frontend:** `https://__________________.onrender.com`
- **Backend:** `https://__________________.onrender.com`
- **Database:** Managed by Render

---

**Need detailed instructions?** See `RENDER_DEPLOYMENT_GUIDE.md`
