# 🚀 Deployment Guide - Mental Health AI Companion

This guide will help you deploy your Mental Health AI Companion online with a **single Vercel URL** that users can access.

## 📋 Deployment Architecture

```
User Browser
    ↓
Vercel Frontend (React) ← Single Public URL
    ↓
Render Backend (FastAPI)
    ↓
FAISS Vector DB + Groq API
```

## 🔧 Prerequisites

- **Vercel Account** (free at https://vercel.com)
- **Render Account** (free at https://render.com)
- **GitHub Account** (to connect your repository)
- **Groq API Key** (from https://console.groq.com)

---

## 📝 Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Mental Health AI Companion"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Create `.env` file in root** (copy from `config.example.py`):
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Create `frontend/.env.local`** for local development:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

---

## 🚀 Step 2: Deploy Backend on Render

### Option A: Using Git (Recommended)

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `mental-health-ai-api`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port 8000`
5. **Environment Variables** (click "Advanced"):
   - `GROQ_API_KEY` = your_groq_api_key_here
6. Click **"Create Web Service"**

### Option B: Using render.yaml (Skip if using Option A)

The `render.yaml` file is already configured. Just connect your repo to Render and it will auto-deploy.

### After Deployment:
- ✅ Wait 5-10 minutes for deployment to complete
- ✅ Note your Render URL: `https://mental-health-ai-api.onrender.com`
- ✅ Test it: `https://mental-health-ai-api.onrender.com/docs`

---

## 🎨 Step 3: Deploy Frontend on Vercel

### 1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New"** → **"Project"**
3. **Import your GitHub repository**
4. **Project Configuration**:
   - Framework: `Vite`
   - Root Directory: `./frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables** (click "Add" next to Environment Variables):
   ```
   Variable Name: VITE_API_BASE_URL
   Value: https://mental-health-ai-api.onrender.com/api
   ```
   (Replace the URL with your actual Render backend URL)
6. Click **"Deploy"**

### After Deployment:
- ✅ Vercel will provide your live URL: `https://your-project.vercel.app`
- ✅ This is your **single public URL** to share! 🎉

---

## 🔗 Step 4: Update GitHub README

Update your `README.md` with the live URL:

```markdown
## 🌐 Live Demo

**Access the app here**: [https://your-project.vercel.app](https://your-project.vercel.app)

> The app is hosted on Vercel (Frontend) and Render (Backend)
```

---

## ✅ Testing Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Try the features:
   - Login/Sign up
   - Access the chat and wellness features
   - Check if everything loads correctly

### If you see errors:

**"Backend not responding"?**
- Check that Render backend is fully deployed (wait 5+ minutes)
- Verify `VITE_API_BASE_URL` in Vercel matches your Render URL
- Check Render logs for errors

**"CORS error"?**
- Add CORS headers to your FastAPI app in `api.py`:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://your-vercel-url.vercel.app"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

---

## 📊 Monitoring & Scaling

### Render Dashboard:
- View API logs: Render → Dashboard → Select your service
- Monitor usage and performance

### Vercel Dashboard:
- View deployment logs
- Check analytics and performance

---

## 💰 Cost Considerations

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ Yes | 100GB bandwidth/month |
| **Render** | ✅ Yes (0.5 CPU, 512MB RAM) | Spins down after 15 min inactivity |

> **Note**: Render's free tier may have cold starts (5-10 sec). Upgrade to paid for always-on servers.

---

## 🔄 CI/CD Updates

After initial deployment, any push to your `main` branch will **auto-deploy**:

1. Update code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: feature description"
   git push origin main
   ```
3. Vercel and Render automatically rebuild and deploy! ✨

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Deployment failed** | Check build logs in Vercel/Render dashboard |
| **App loads but can't use features** | Verify `VITE_API_BASE_URL` environment variable |
| **CORS errors** | Update `CORSMiddleware` in `api.py` with correct Vercel URL |
| **PDFs not loading** | Ensure `data/vectorstore/` exists in Render filesystem |
| **Groq API errors** | Verify `GROQ_API_KEY` is set correctly in Render environment |

---

## 📚 Useful Links

- **Groq Console**: https://console.groq.com
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **FastAPI CORS**: https://fastapi.tiangolo.com/tutorial/cors/

---

## ✨ You're Live!

Share your app URL with the world! Your single Vercel link will be accessible 24/7.

Questions? Check the logs in Vercel and Render dashboards for error details.
