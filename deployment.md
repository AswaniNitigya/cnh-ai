# CNH Deployment Guide

## Architecture
```
Frontend (Vite/React) → Vercel (free)
Backend (Express/Node) → Render (free)
Database → Supabase (already set up)
```

---

## 1. Deploy Backend on Render

### A. Push to GitHub
Make sure your project is pushed to GitHub. If not already:
```bash
cd /path/to/webscap2
git add .
git commit -m "ready for deployment"
git push origin main
```

### B. Create Render Web Service
1. Go to [render.com](https://render.com) → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `cnh-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

### C. Add Environment Variables
In Render dashboard → your service → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `JWT_SECRET` | A strong random string (change from dev!) |
| `SUPABASE_URL` | `https://oxqgxjaqpstfdakxnvlj.supabase.co` |
| `SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `FRONTEND_URL` | `https://your-app.vercel.app` (add after frontend deploy) |
| `NODE_VERSION` | `20` |

> [!CAUTION]
> Generate a new `JWT_SECRET` for production. Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### D. Deploy
Click **"Create Web Service"**. Render will build and deploy automatically.  
Note your backend URL (e.g. `https://cnh-backend.onrender.com`).

---

## 2. Deploy Frontend on Vercel

### A. Create Vercel Project
1. Go to [vercel.com](https://vercel.com) → Sign up / Log in
2. Click **"Add New Project"** → Import your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### B. Add Environment Variables
In Vercel → your project → **Settings** → **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://cnh-backend.onrender.com/api` |
| `VITE_SUPABASE_URL` | `https://oxqgxjaqpstfdakxnvlj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |

### C. Add Rewrites for SPA Routing
Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### D. Deploy
Click **"Deploy"**. Note your frontend URL (e.g. `https://cnh-app.vercel.app`).

---

## 3. Post-Deploy Configuration

### A. Update CORS
Go back to **Render** → Environment Variables → Set:
```
FRONTEND_URL=https://your-app.vercel.app
```

### B. Update Supabase URL Allowlist
In Supabase Dashboard → **Authentication** → **URL Configuration**:
- Add `https://your-app.vercel.app` to **Site URL** and **Redirect URLs**

### C. Update VAPID for Push Notifications
The `.vapid.json` file won't persist on Render's free tier (ephemeral filesystem).  
Move VAPID keys to env vars:

1. Copy values from your local `.vapid.json`
2. Add to Render environment:
   - `VAPID_PUBLIC_KEY` = your public key
   - `VAPID_PRIVATE_KEY` = your private key
   - `VAPID_SUBJECT` = `mailto:admin@cnh.com`

### D. Handle File Uploads
Render's free tier has an **ephemeral filesystem** — uploaded files are lost on redeploy.  
For OCR uploads to persist, use **Supabase Storage**:

1. Create a `uploads` bucket in Supabase Dashboard → **Storage**
2. Update your upload logic to save to Supabase Storage instead of local disk

> [!NOTE]
> This is optional if you don't need uploaded images to persist. The OCR text is already saved in the notice content.

---

## 4. Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Vercel → Project → **Settings** → **Domains**
2. Add your domain (e.g. `cnh.yourdomain.com`)
3. Update DNS records as instructed

### Render (Backend)
1. Go to Render → Service → **Settings** → **Custom Domains**
2. Add your API subdomain (e.g. `api.yourdomain.com`)
3. Update `VITE_API_URL` in Vercel to use the new domain

---

## Quick Checklist

- [ ] Backend pushed and deployed on Render
- [ ] All env variables set on Render
- [ ] Frontend pushed and deployed on Vercel
- [ ] All env variables set on Vercel
- [ ] `vercel.json` created for SPA routing
- [ ] `FRONTEND_URL` updated on Render with Vercel URL
- [ ] VAPID keys moved to env vars on Render
- [ ] JWT_SECRET changed to a production-safe value
- [ ] Test: Login, Post Notice, Scraper, Notifications, OCR Upload

---

## Free Tier Limitations

| Service | Limit | Impact |
|---------|-------|--------|
| **Render** | Spins down after 15min inactivity | First request after idle takes ~30s |
| **Vercel** | 100GB bandwidth/month | More than enough for a college app |
| **Supabase** | 500MB DB, 1GB storage | Plenty for notices |
| **Google Translate** | Unofficial, no SLA | Works reliably for moderate use |

> [!TIP]
> To avoid Render cold starts, use [UptimeRobot](https://uptimerobot.com) (free) to ping `https://cnh-backend.onrender.com/api/health` every 14 minutes.
