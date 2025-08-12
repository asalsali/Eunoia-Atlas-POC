# 🚀 Eunoia Atlas Deployment Guide

This guide will help you deploy your Eunoia Atlas application to production.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - For frontend deployment (free)
3. **Railway Account** - For backend deployment (free tier available)

## 🎯 Deployment Steps

### Step 1: Backend Deployment (Railway)

1. **Go to [Railway.app](https://railway.app)** and sign up/login
2. **Create a new project** → "Deploy from GitHub repo"
3. **Select your repository** and choose the `backend` folder
4. **Set environment variables**:
   ```
   POSTGRES_URL=your_postgres_connection_string
   XAMAN_API_KEY=your_xaman_api_key
   XAMAN_API_SECRET=your_xaman_api_secret
   ```
5. **Deploy** - Railway will automatically build and deploy your FastAPI app
6. **Copy the deployment URL** (e.g., `https://your-app.railway.app`)

### Step 2: Frontend Deployment (Vercel)

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Create a new project** → "Import Git Repository"
3. **Select your repository** and configure:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. **Set environment variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
5. **Deploy** - Vercel will build and deploy your React app
6. **Your live URL** will be: `https://your-app.vercel.app`

### Step 3: Update CORS Settings

After deployment, update the backend CORS settings in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔧 Alternative Deployment Options

### Option 2: Netlify (Frontend) + Railway (Backend)
- Follow the same steps but use Netlify instead of Vercel for frontend

### Option 3: Railway (Full Stack)
- Deploy both frontend and backend to Railway
- Use Railway's static site hosting for the React app

## 🌐 Custom Domain (Optional)

1. **Vercel**: Go to your project settings → Domains → Add your domain
2. **Railway**: Go to your project settings → Domains → Add your domain
3. **Update CORS** settings with your custom domain

## 📊 Monitoring

- **Vercel**: Built-in analytics and performance monitoring
- **Railway**: Built-in logs and metrics
- **Health Check**: Visit `https://your-backend-url.railway.app/health`

## 🔒 Environment Variables

Make sure to set these in your deployment platforms:

### Backend (Railway)
```
POSTGRES_URL=your_postgres_connection_string
XAMAN_API_KEY=your_xaman_api_key
XAMAN_API_SECRET=your_xaman_api_secret
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## 🚨 Troubleshooting

1. **CORS Errors**: Check that your backend CORS settings include your frontend URL
2. **Build Failures**: Check the build logs in your deployment platform
3. **API Errors**: Check the Railway logs for backend issues
4. **Environment Variables**: Ensure all required env vars are set

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://reactjs.org/docs
