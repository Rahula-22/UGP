# ⚡ Quick Start Deployment Checklist

## Before You Deploy

- [ ] All code committed to GitHub
- [ ] Have your **Groq API Key** ready (from https://console.groq.com)
- [ ] Vercel and Render accounts created and logged in

---

## Backend Deployment (Render) - 5 minutes

1. [ ] Go to https://render.com/dashboard
2. [ ] Click **"New +"** → **"Web Service"**
3. [ ] Select your GitHub repository
4. [ ] Enter name: `mental-health-ai-api`
5. [ ] **Build Command**: `pip install -r requirements.txt`
6. [ ] **Start Command**: `uvicorn api:app --host 0.0.0.0 --port 8000`
7. [ ] **Add Environment Variable**: `GROQ_API_KEY = [your-key]`
8. [ ] Click **"Create Web Service"**
9. [ ] ✅ **Wait 5-10 minutes** for deployment to complete
10. [ ] Note your Render URL: `https://mental-health-ai-api.onrender.com`

---

## Frontend Deployment (Vercel) - 3 minutes

1. [ ] Go to https://vercel.com
2. [ ] Click **"Add New"** → **"Project"**
3. [ ] Select your GitHub repository
4. [ ] **Framework**: Vite
5. [ ] **Root Directory**: `./frontend`
6. [ ] **Add Environment Variable**:
   ```
   VITE_API_BASE_URL = https://your-render-url.onrender.com/api
   ```
   (Replace with your actual Render URL from Step 10 above)
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

Deployed on [Vercel](https://vercel.com) (Frontend) + [Render](https://render.com) (Backend)
```

---

## 🆘 If Something Goes Wrong

1. **Check Render logs**: Render Dashboard → Select service → View logs
2. **Check Vercel logs**: Vercel Dashboard → Select project → Deployments → View logs
3. **See detailed guide**: Read `DEPLOYMENT_GUIDE.md` in the root directory

---

## 💡 Pro Tips

- Render free tier may be slow (cold start) after 15 minutes of inactivity
- To keep Render warm, you can:
  - Upgrade to paid plan (~$7/month)
  - Set a cron job to ping your API every 10 minutes
- Test locally first before deploying:
  ```bash
  uvicorn api:app --reload  # Terminal 1
  cd frontend && npm run dev  # Terminal 2
  ```

---

**Questions?** See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting!
