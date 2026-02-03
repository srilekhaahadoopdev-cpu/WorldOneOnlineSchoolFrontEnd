# URGENT: Debugging Steps for "Failed to create lesson" Error

## Step 1: Check Browser Console
1. Open your Vercel deployment in Chrome/Edge
2. Press F12 to open Developer Tools
3. Click the "Console" tab
4. Try to create a lesson
5. Look for RED error messages
6. Copy the ENTIRE error message and send it

## Step 2: Check Network Request
1. In Developer Tools, click the "Network" tab
2. Try to create a lesson again
3. Look for a RED/failed request (probably to `/api/v1/lessons`)
4. Click on that request
5. Look at:
   - **Request URL**: What URL is it calling?
   - **Status Code**: What's the HTTP status? (404? 500? 502?)
   - **Response**: What does the error say?
6. Take a screenshot or copy all this info

## Step 3: Check Vercel Deployment
1. Go to https://vercel.com/dashboard
2. Find your project
3. Click "Deployments"
4. What is the LATEST deployment commit message?
   - Should be: "Trigger Vercel deployment" or "Fix: Update Vercel rewrite to preserve full API path"
5. Click on that deployment
6. Go to "Logs" tab
7. Look for any errors when you try to create a lesson
8. Copy any error messages

## Most Likely Issues:

### Issue 1: Backend Not Deployed
- Vercel might not be deploying your Python backend
- Check if `/api/index.py` exists in the deployment

### Issue 2: Supabase Credentials Missing
- Your backend needs SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check Vercel Environment Variables

### Issue 3: CORS Error
- If you see "CORS" in the error, the backend is rejecting the request
- Need to check backend CORS settings

### Issue 4: 404 Not Found
- The route doesn't exist
- Backend might not be receiving the request at all

## Quick Test:
Try visiting this URL in your browser:
```
https://world-one-online-school-front-[YOUR-ID].vercel.app/api/v1/health
```

If you get a JSON response like `{"status": "ok"}`, the backend is working.
If you get 404 or error, the backend is not deployed correctly.
