# 🚀 Installation & Running Instructions

## Prerequisites
- Python 3.8+
- Node.js 16+ (Download from https://nodejs.org/)
- pip

---

## Step 1: Backend Setup

### 1.1 Install Python Dependencies
```bash
cd c:\Users\HP\OneDrive\Desktop\Ugp
pip install -r requirements.txt
```

### 1.2 Process Documents (if not already done)
```bash
python process_documents.py
```

### 1.3 Start Backend API
```bash
uvicorn app.api:app --host 0.0.0.0 --port 8000
```

Backend will run at: **http://localhost:8000**

---

## Step 2: Frontend Setup

### 2.1 Navigate to Frontend Directory
```bash
cd c:\Users\HP\OneDrive\Desktop\Ugp\frontend
```

### 2.2 Install Node Dependencies
```bash
npm install
```

### 2.3 Start Frontend Development Server
```bash
npm run dev
```

Frontend will run at: **http://localhost:3000**

---

## Step 3: Use the Application

1. **Open browser**: Go to http://localhost:3000
2. **Set API Key**: Click "API Settings" and enter your Groq API key
   - Get free key from: https://console.groq.com
3. **Upload PDFs**: Click "Upload PDFs" to add documents
4. **Process Documents**: Click "Process Documents" to index them
5. **Start Chatting**: Ask questions in the chat!

---

## Running Both Servers Together

### Option 1: Two Terminal Windows
Terminal 1 (Backend):
```bash
cd c:\Users\HP\OneDrive\Desktop\Ugp
uvicorn app.api:app --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd c:\Users\HP\OneDrive\Desktop\Ugp\frontend
npm run dev
```

### Option 2: Create Start Script

#### c:\Users\HP\OneDrive\Desktop\Ugp\start.bat
```batch
@echo off
echo Starting Mental Health AI Companion...
start cmd /k "cd /d %~dp0 && uvicorn app.api:app --host 0.0.0.0 --port 8000"
timeout /t 3
start cmd /k "cd /d %~dp0frontend && npm run dev"
echo Servers starting...
timeout /t 5
start http://localhost:3000
```

Then just double-click `start.bat` to launch everything!

---

## Production Build

### Build Frontend for Production
```bash
cd c:\Users\HP\OneDrive\Desktop\Ugp\frontend
npm run build
```

This creates optimized files in `frontend/dist/`

---

## Troubleshooting

### Backend Issues
- **Port 8000 in use**: Run backend on another port, e.g. `uvicorn app.api:app --host 0.0.0.0 --port 8001`
- **Import errors**: Run `pip install -r requirements.txt` again

### Frontend Issues
- **Port 3000 in use**: Change in `frontend/vite.config.js`
- **npm not found**: Install Node.js from https://nodejs.org/
- **Module errors**: Delete `node_modules` and `package-lock.json`, then `npm install`

### Connection Issues
- Make sure backend is running on port 8000
- Check browser console (F12) for errors
- Verify API calls in Network tab

---

## Features
✅ Modern, responsive UI
✅ Real-time chat interface
✅ Document upload & processing
✅ Source tracking
✅ Dark mode support (in messages)
✅ Mobile friendly
✅ Fast performance

Enjoy your beautiful AI Mental Health Companion! 🧠✨
