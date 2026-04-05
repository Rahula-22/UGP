# ⚡ Quick Start Deployment Checklist

## Before You Deploy

- [ ] All code committed to GitHub
- [ ] Have your **Groq API Key** ready (from https://console.groq.com)
- [ ] Vercel and Render accounts created and logged in

---

## Backend Deployment (Railway) - 5 minutes

1. [ ] Go to https://railway.app and sign up with GitHub
2. [ ] Click **"Create New Project"** → **"Deploy from GitHub"**
3. [ ] Select your repository with the Ugp code
4. [ ] Railway auto-detects Python - click **"Deploy Now"**
5. [ ] Go to **Settings** → **Variables**:
   - Add: `GROQ_API_KEY = [your-key]`
   - Add: `PYTHON_VERSION = 3.9`
6. [ ] ✅ **Wait 3-5 minutes** for deployment to complete
7. [ ] Go to **Deployments** tab to find your Railway URL
8. [ ] Note your Railway URL: `https://your-project.railway.app`

---

## Frontend Deployment (Vercel) - 3 minutes

1. [ ] Go to https://vercel.com
2. [ ] Click **"Add New"** → **"Project"**
3. [ ] Select your GitHub repository
4. [ ] **Framework**: Vite
5. [ ] **Root Directory**: `./frontend`
6. [ ] **Add Environment Variable**:
   ```
   VITE_API_BASE_URL = https://your-project.railway.app/api
   ```
   (Replace with your actual Railway URL from step 8 above)
7. [ ] Click **"Deploy"**
8. [ ] ✅ **Your Vercel URL is ready!** (usually like `https://project-name.vercel.app`)

---

## Test Your Deployment

- [ ] Open your Vercel URL in a browser
- [ ] Try logging in
- [ ] Test the chat/wellness features
- [ ] Share with GitHub README

---

## Share Your App!

Update your `README.md`:

```markdown
## 🌐 Live Demo

👉 **[Open App Here](https://your-project.vercel.app)** 👈

Deployed on [Vercel](https://vercel.com) (Frontend) + [Railway](https://railway.app) (Backend)
```

---

## 🆘 If Something Goes Wrong

1. **Check Railway logs**: Railway Dashboard → Select project → Deployments → View logs
2. **Check Vercel logs**: Vercel Dashboard → Select project → Deployments → View logs
3. **See detailed guide**: Read `DEPLOYMENT_GUIDE.md` in the root directory

---

## 💡 Pro Tips

- Railway free tier is generous and stays always-on ✅
- No cold start issues unlike some platforms
- Test locally first before deploying:
  ```bash
  uvicorn api:app --reload  # Terminal 1
  cd frontend && npm run dev  # Terminal 2
  ```

---

**Questions?** See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting!
