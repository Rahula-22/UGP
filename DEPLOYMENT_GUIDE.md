# 🚀 Deployment Guide - Mental Health AI Companion

This guide will help you deploy your Mental Health AI Companion online with a **single Vercel URL** that users can access.

## 📋 Deployment Architecture

```
User Browser
    ↓
Vercel Frontend (React) ← Single Public URL
    ↓
Railway Backend (FastAPI)
    ↓
FAISS Vector DB + Groq API
```

## 🔧 Prerequisites

- **Vercel Account** (free at https://vercel.com)
- **Railway Account** (free at https://railway.app)
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

## 🚀 Step 2: Deploy Backend on Railway

### Quick Setup (2 minutes)

1. Go to [railway.app](https://railway.app) and **Sign up with GitHub**
2. Click **"Create New Project"** → **"Deploy from GitHub"**
3. Select your GitHub repository containing the Ugp code
4. Railway auto-detects Python and creates the service
5. Go to your project → **Settings** → **Variables**:
   - Add `GROQ_API_KEY = your_groq_api_key_here`
   - Add `PYTHON_VERSION = 3.9`
6. ✅ **Wait 3-5 minutes** for the build to complete
7. Go to **Deployments** tab to see your live Railway URL
8. ✅ Test it: Open your Railway URL in browser

### After Deployment:
- ✅ Your Railway URL will look like: `https://your-project.railway.app`
- ✅ Test the API: `https://your-project.railway.app/docs`
- ✅ Keep this URL for the next step

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
   Value: https://your-project.railway.app/api
   ```
   (Replace the URL with your actual Railway backend URL from Step 2)
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

> The app is hosted on Vercel (Frontend) and Railway (Backend)
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

### Railway Dashboard:
- View API logs: Railway → Dashboard → Select your project
- Monitor usage and performance

### Vercel Dashboard:
- View deployment logs
- Check analytics and performance

---

## 💰 Cost Considerations

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ Yes | 100GB bandwidth/month |
| **Railway** | ✅ Yes ($5/month credit) | Always-on, no cold starts |

> **Note**: Railway free tier is great! You get $5/month credit which usually covers small apps. No cold start issues!

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
| **Deployment failed** | Check build logs in Railway/Vercel dashboard |
| **App loads but can't use features** | Verify `VITE_API_BASE_URL` environment variable matches Railway URL |
| **CORS errors** | Update `CORSMiddleware` in `api.py` with correct Vercel URL |
| **PDFs not loading** | Ensure `data/vectorstore/` exists in Railway filesystem |
| **Groq API errors** | Verify `GROQ_API_KEY` is set correctly in Railway environment |

---

## 📚 Useful Links

- **Groq Console**: https://console.groq.com
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **FastAPI CORS**: https://fastapi.tiangolo.com/tutorial/cors/

---

## ✨ You're Live!

Share your app URL with the world! Your single Vercel link will be accessible 24/7.

Questions? Check the logs in Vercel and Render dashboards for error details.
