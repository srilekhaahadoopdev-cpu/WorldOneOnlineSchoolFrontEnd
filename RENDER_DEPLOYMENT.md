# Render Deployment Guide for WorldOne Online School

## Prerequisites
1. GitHub account with your repository
2. Render account (free tier available at https://render.com)
3. Supabase project credentials
4. Stripe API keys (if using payments)

## Step 1: Prepare Environment Variables

### Backend Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `FRONTEND_URL`: Will be set after frontend deployment

### Frontend Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_API_URL`: Will be auto-set from backend service URL

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)
1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create both services
5. Fill in the environment variables when prompted
6. Click "Apply"

### Option B: Manual Deployment

#### Deploy Backend First:
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `worldone-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: Add all backend env vars listed above
5. Click "Create Web Service"
6. **Copy the backend URL** (e.g., `https://worldone-backend.onrender.com`)

#### Deploy Frontend:
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `worldone-frontend`
   - **Runtime**: Node
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `NEXT_PUBLIC_API_URL`: `https://worldone-backend.onrender.com/api/v1` (use backend URL from step 6)
4. Click "Create Web Service"

#### Update Backend FRONTEND_URL:
1. Go back to your backend service settings
2. Add environment variable:
   - `FRONTEND_URL`: `https://worldone-frontend.onrender.com` (your frontend URL)
3. Save and redeploy

## Step 3: Configure CORS (if needed)

The backend is already configured to accept requests from the frontend URL via the `FRONTEND_URL` environment variable.

## Step 4: Test Your Deployment

1. Visit your frontend URL
2. Try logging in as admin
3. Create a new lesson
4. **It should work!** ✅

## Troubleshooting

### Issue: "Failed to create lesson"
- Check that `NEXT_PUBLIC_API_URL` is set correctly in frontend
- Check backend logs in Render dashboard
- Verify Supabase credentials are correct

### Issue: CORS errors
- Ensure `FRONTEND_URL` is set in backend environment variables
- Check that the URL matches exactly (no trailing slash)

### Issue: Build failures
- Check that all dependencies are in `requirements.txt` (backend) and `package.json` (frontend)
- Verify Python/Node versions are compatible

## Free Tier Limitations

Render free tier:
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month free (enough for one service running 24/7)

For production, consider upgrading to paid tier for:
- No spin-down
- Faster performance
- Custom domains
- More resources
