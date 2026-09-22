# AI SkillPath — End-to-End Production Deployment Guide & Report

**Project Name:** AI SkillPath (ByteX)  
**Target Environment:** Production (Cloud / Containerized / Serverless)  
**Report Version:** 1.0  
**Status:** Approved for Production Deployment  

---

## 1. Production Architecture Overview

The **AI SkillPath** platform consists of a decoupled Full-Stack architecture:
- **Frontend Layer:** React 19 + Vite 8 SPA built into static assets (`dist/`), deployed to global CDNs (Vercel, Netlify, Cloudflare Pages, AWS S3/CloudFront).
- **Backend API Layer:** Node.js + Express REST API executing on a persistent container or Node.js runtime (Render, Railway, AWS EC2/ECS, DigitalOcean).
- **Database Layer:** Managed MongoDB (MongoDB Atlas) with indexed schemas and connection pooling.
- **AI Integration:** Server-side Google Gemini AI API integration with deterministic local fallback engines.

```mermaid
flowchart LR
    Client["User Browser (Client)"]
    CDN["Global CDN (Vercel / Netlify / S3)"]
    API["Backend API (Express Node.js)"]
    DB[(MongoDB Atlas Database)]
    Gemini["Google Gemini AI API"]

    Client -->|1. Load Static Assets| CDN
    Client -->|2. REST API Calls (HTTPS + Bearer JWT)| API
    API -->|3. Query Indexed Collections| DB
    API -->|4. AI Prompt Inference (Server Secrets)| Gemini
```

---

## 2. Master Environment Variables Specification

### 2.1 Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Default / Format Example | Purpose |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port number for Express HTTP listener |
| `NODE_ENV` | **Required** | `production` | Enables production optimizations, logging, and CORS policies |
| `MONGO_URI` | **Required** | `mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-skillpath` | MongoDB Atlas production connection string |
| `CORS_ORIGIN` | **Required** | `https://your-app-domain.vercel.app` | Allowed CORS origins (comma-separated for multiple domains) |
| `JWT_SECRET` | **Required** | `min_32_char_random_cryptographic_key_here` | Secret key for signing and verifying JWT tokens |
| `JWT_EXPIRES_IN` | Optional | `7d` | Lifespan of signed JWT tokens |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Server-side API key for Google Gemini LLM queries |

> [!IMPORTANT]
> Never commit `.env` or plain-text secrets to version control. Set environment variables directly in your cloud hosting provider's dashboard.

---

### 2.2 Frontend Environment Variables (`.env` / `.env.production`)

| Variable Name | Required | Default / Format Example | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Required** | `https://your-backend-api.onrender.com/api` | Full URL path pointing to live backend API |
| `VITE_APP_NAME` | Optional | `AI SkillPath` | Application title |
| `VITE_ENABLE_MOCK_FALLBACK` | Optional | `false` (Production) | Controls whether local mock fallback is active |

> [!NOTE]
> In Vite, all environment variables accessible to the browser **must** begin with `VITE_`. They are embedded into the static JS bundle at build time.

---

## 3. Database Deployment & Data Seeding

### 3.1 MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster (M0 Free Tier or M10+ Dedicated).
2. Create a database user with `readWrite` permissions on the `ai-skillpath` database.
3. Configure **Network Access / IP Access List**:
   - For Render/Vercel dynamic IPs, add `0.0.0.0/0` (Allow Access from Anywhere) with strong password authentication.

### 3.2 Seeding Initial Data
Run the master database seed script once after setting `MONGO_URI`:

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Execute Master Seed (Populates Careers, Skills, Question Banks, Resources, Projects)
npm run seed
```

---

## 4. Backend Deployment Guide

### 4.1 Option A: Render.com (Recommended for Node.js API)
1. Push project repository to GitHub / GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> **Web Service**.
3. Connect your repository.
4. Configure service settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `<your_mongodb_atlas_uri>`
   - `JWT_SECRET` = `<your_secure_jwt_secret>`
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app`
   - `GEMINI_API_KEY` = `<your_gemini_key>`
6. Click **Create Web Service**.

---

### 4.2 Option B: Railway.app
1. Create a New Project on [Railway](https://railway.app/).
2. Deploy from GitHub repo -> Select `backend` path.
3. Set **Build Command:** `npm run build`.
4. Set **Start Command:** `npm start`.
5. Add variables in **Variables** tab.

---

### 4.3 Option C: Docker Container Deployment

Create a `Dockerfile` inside `backend/`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/server.js"]
```

Build and run container:
```bash
docker build -t ai-skillpath-backend ./backend
docker run -d -p 5000:5000 --env-file ./backend/.env ai-skillpath-backend
```

---

## 5. Frontend Deployment Guide

### 5.1 Option A: Vercel (Recommended for React + Vite)
1. Log into [Vercel Dashboard](https://vercel.com/) -> Click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-backend-api.onrender.com/api`
   - `VITE_ENABLE_MOCK_FALLBACK` = `false`
5. Click **Deploy**.

---

### 5.2 Single Page Application (SPA) Routing Configuration
To prevent 404 errors when refreshing routes like `/dashboard` or `/skills`, add a rewrite rule.

For **Vercel**, create `vercel.json` in the root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

For **Netlify**, create `public/_redirects`:
```text
/*    /index.html   200
```

---

## 6. Pre-Launch Verification Checklist

```text
===================================================================
  AI SKILLPATH — PRODUCTION DEPLOYMENT CHECKLIST
===================================================================
  [ ] 1. MongoDB Atlas cluster created & MONGO_URI set
  [ ] 2. Database master seed executed (`npm run seed`)
  [ ] 3. JWT_SECRET set to secure >=32 character string
  [ ] 4. Backend API deployed & health endpoint (`GET /health`) returns 200 OK
  [ ] 5. CORS_ORIGIN on backend updated to match live frontend domain
  [ ] 6. Frontend VITE_API_BASE_URL points to live HTTPS backend URL
  [ ] 7. SPA rewrite rules applied (`vercel.json` or `_redirects`)
  [ ] 8. User registration & login verified on production build
  [ ] 9. SSL/TLS certificates active (HTTPS enforced everywhere)
  [ ] 10. `npm run typecheck`, `npm run lint`, and `npm test` passing cleanly
===================================================================
```

---

## 7. Operational Health Check Endpoints

Once deployed, verify backend service health:

- **Health Endpoint:** `GET https://your-backend-api.onrender.com/health`
- **Expected Response:**
```json
{
  "status": "UP",
  "environment": "production",
  "timestamp": "2026-09-22T08:52:00.000Z"
}
```
