# 🚀 WE-CONNECT Production Deployment Guide

## Architecture
```
[Vercel] → Frontend (React)
    ↓ API calls
[Railway] → Backend (Spring Boot)
    ↓ SQL queries
[Neon] → PostgreSQL Database
```

---

## Step 1: Create a Neon PostgreSQL Database (FREE)

1. Go to **[neon.tech](https://neon.tech)** → Sign up (free)
2. Create a new project → Name it `we-connect`
3. Copy these connection details from the dashboard:
   - **Host**: e.g. `ep-xxx-xxx-123456.us-east-2.aws.neon.tech`
   - **Database**: `neondb` (default)
   - **User**: your Neon username
   - **Password**: your Neon password
4. Your connection URL will look like:
   ```
   jdbc:postgresql://ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Deploy Backend to Railway (FREE)

1. Go to **[railway.app](https://railway.app)** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select the `ALUMINI` repo
4. Railway will auto-detect the Dockerfile. Set the **root directory** to `backend`
5. Go to **Variables** tab and add these environment variables:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DATABASE_URL` | `jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require` |
| `DATABASE_USERNAME` | Your Neon username |
| `DATABASE_PASSWORD` | Your Neon password |
| `JWT_SECRET` | Generate a random 64-char hex string |
| `RESEND_API_KEY` | Your Resend API key from [resend.com](https://resend.com) |
| `MAIL_FROM` | `WE-CONNECT <onboarding@resend.dev>` |
| `GOOGLE_CLIENT_ID` | `215142261502-9a1g4ar4m8bdr68ru0v8u4ks6bagbp2e.apps.googleusercontent.com` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `PORT` | `8080` |

6. Click **Deploy** → Wait for build to complete
7. Railway will give you a public URL like: `https://we-connect-backend-production.up.railway.app`

---

## Step 3: Deploy Frontend to Vercel (FREE)

1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub
2. Click **"Add New Project"** → Import your `ALUMINI` repo
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to `Create React App`
5. Add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api` |
| `REACT_APP_GOOGLE_CLIENT_ID` | `215142261502-9a1g4ar4m8bdr68ru0v8u4ks6bagbp2e.apps.googleusercontent.com` |

6. Click **Deploy**
7. Vercel will give you a URL like: `https://we-connect-xyz.vercel.app`

---

## Step 4: Update CORS & Google OAuth

### Update Railway CORS
Go back to Railway → Variables → Update:
```
CORS_ORIGINS=https://your-app.vercel.app
```

### Update Google OAuth
Go to [Google Cloud Console](https://console.cloud.google.com) → APIs → Credentials:
1. Edit your OAuth 2.0 Client
2. Add to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
3. Add to **Authorized redirect URIs**:
   - `https://your-app.vercel.app`

---

## Step 5: Push Code to GitHub

Before deploying, push your code to GitHub:

```bash
cd c:\Users\HAMEED\OneDrive\Desktop\ALUMINI
git init
git add .
git commit -m "WE-CONNECT production ready"
git remote add origin https://github.com/YOUR_USERNAME/WE-CONNECT.git
git push -u origin main
```

> **Important**: Add a `.gitignore` to exclude `node_modules/`, `target/`, `data/`, and `.env` files.

---

## Quick Checklist

- [ ] Neon PostgreSQL database created
- [ ] Backend deployed to Railway with env vars
- [ ] Frontend deployed to Vercel with env vars
- [ ] CORS updated on Railway with Vercel URL
- [ ] Google OAuth updated with Vercel URL
- [ ] (Optional) Verify a domain on Resend for real email delivery

---

## Cost: $0/month (Free Tiers)
- **Neon**: 0.5 GB storage, 191 compute hours/month
- **Railway**: $5 free credit/month (plenty for this app)
- **Vercel**: Unlimited static deploys, 100GB bandwidth
