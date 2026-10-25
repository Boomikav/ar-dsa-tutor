# Mobile AR Deployment Guide & Production Architecture

**Project:** A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning  
**Short Name:** AR-DSA Tutor  
**Version:** 1.0.0 (Phase 11)  

---

## 1. Architectural Overview

The application uses a secure, decoupled two-tier architecture:

```text
  [ Mobile Handheld Client (WebXR / Three.js) ]
                        │
                        ▼ (HTTPS Strict SSL/TLS)
       [ Production Node HTTP / API Server ]
            ├── Serves Static Assets (dist/)
            └── Routes /api/ai/* Requests
                        │
                        ▼ (Server-Side Only)
            [ Google Gemini LLM Provider ]
```

### Critical Security Boundaries
1. **Zero Client-Side Secrets:** `GEMINI_API_KEY` is loaded strictly on the Node.js server from process environment variables. It is **never** bundled, injected, or referenced in client-side JavaScript (`dist/assets/*.js`).
2. **Strict Camera Privacy:** The WebXR runtime accesses camera hardware locally on the mobile device for surface hit-testing and pose estimation. **No camera imagery, video frames, or audio streams are ever transmitted to the server or LLM provider.** The AI tutor receives only structured telemetry (current node, target value, user direction choice, and diagnosed misconception).

---

## 2. Prerequisites & Environment

* **Node.js:** v18.18.0 or later (LTS recommended)
* **npm:** v9.0.0 or later
* **Domain & SSL:** An HTTPS domain with a valid TLS certificate (mandatory for WebXR device access outside `localhost`).

### Environment Variables
Configure on the production server (or in a secure server-side `.env` file):

```env
PORT=3001
AI_PROVIDER=gemini
GEMINI_API_KEY=your_production_google_ai_key_here
```

---

## 3. Build & Execution Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Compile Production Bundle
```bash
npm run build
```
This produces two output targets:
- `dist/`: Static Single-Page Application (HTML, CSS, Three.js bundles, assets).
- `dist/server/`: Standalone server bundle (`dist/server/server.js`) capable of serving static assets and API routes simultaneously.

### Step 3: Start Production Server
```bash
node dist/server/server.js
```
The server binds to `process.env.PORT` (default `3001`).

---

## 4. HTTPS & Reverse Proxy Configuration

WebXR APIs (`navigator.xr.requestSession('immersive-ar', ...)`) require a **Secure Context** (`window.isSecureContext === true`). When accessing the server from a remote smartphone, you must terminate TLS via a reverse proxy (e.g., Nginx, Caddy, Cloudflare, or Render/Railway).

### Example Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name ardsa.yourinstitution.edu;

    ssl_certificate /etc/letsencrypt/live/ardsa.yourinstitution.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ardsa.yourinstitution.edu/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 5. Free / Institutional Hosting Options

### Option A: Render (Free Web Service)
1. Link repository to Render.
2. Set Build Command: `npm install && npm run build`
3. Set Start Command: `node dist/server/server.js`
4. Set Environment Variable: `GEMINI_API_KEY` (secret)
5. Render provides automatic HTTPS on `*.onrender.com`.

### Option B: Railway / Fly.io (Docker / Container)
Deploy using standard Node.js Docker container exposing port 3001 with automatic TLS edge routing.

---

## 6. Mobile Client Verification

1. On an ARCore-compatible Android device, open **Google Chrome**.
2. Navigate to your deployed HTTPS URL: `https://your-domain.com`.
3. Open **Profile** $\rightarrow$ **Settings** $\rightarrow$ **AR Diagnostics**.
4. Confirm:
   - `secureContext: true`
   - `navigatorXRAvailable: true`
   - `immersiveARSupported: true`
5. Navigate to **Binary Search Tree** $\rightarrow$ **Launch AR Session**.
6. Follow the standardized physical validation steps in `docs/physical-ar-validation-protocol.md`.

---

## 7. Troubleshooting & Fallback Behavior

| Symptom | Root Cause | System Remediation |
| :--- | :--- | :--- |
| **"Interactive 3D Mode (WebXR AR Unavailable)"** | Insecure HTTP connection or non-WebXR browser | App gracefully activates Three.js OrbitControls 3D mode. Zero crash. |
| **"Could not start WebXR AR session"** | Missing Google Play Services for AR (ARCore) | User alerted with clear instructions; 3D mode remains accessible. |
| **Reticle does not appear on table** | Low ambient lighting or non-textured surface | Ensure $\ge 300$ lux lighting and textured surface per validation protocol. |
| **AI responses say "Thinking offline..."** | Server backend unreachable | Secure local mock fallback provides instant grounded hint; AR does not freeze. |
