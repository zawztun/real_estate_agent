# Vercel Deployment Guide for Thandar Soe Real Estate Bot

## The Issue
Your Vercel deployment is showing "Oops! Something went wrong. Please try again later." because the environment variables (API keys) are not configured in Vercel.

## Solution Steps

### Step 1: Configure Environment Variables in Vercel Dashboard

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Navigate to your project: `trae_thandar-soe-bot_3x6o`

2. **Add Environment Variables**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables" in the sidebar
   - Add the following variables:

   **Variable 1:**
   - Name: `REACT_APP_API_KEY`
   - Value: `AIzaSyCd-4hKHU_LRn7JCZcJdRwPxr8P260Q-aU`
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `REACT_APP_API_URL`
   - Value: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`
   - Environment: Production, Preview, Development (select all)

### Step 2: Redeploy Your Application

After adding the environment variables:

1. **Trigger a new deployment**
   - Go to "Deployments" tab in your Vercel project
   - Click "Redeploy" on the latest deployment
   - OR push a new commit to your GitHub repository

### Step 3: Verify the Deployment

1. **Check the build logs**
   - In Vercel dashboard, click on the latest deployment
   - Check "Build Logs" for any errors
   - Look for successful environment variable loading

2. **Test your application**
   - Visit your deployed URL
   - Try sending a message to ensure the API is working

## Alternative: Using Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add REACT_APP_API_KEY
# Enter your API key when prompted

vercel env add REACT_APP_API_URL
# Enter your API URL when prompted

# Redeploy
vercel --prod
```

## Common Issues and Solutions

### Issue 1: Build Fails
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Issue 2: Environment Variables Not Loading
- **Solution**: Make sure variable names start with `REACT_APP_`
- Verify they're set for the correct environment (Production)

### Issue 3: API Calls Still Failing
- **Solution**: Check if your Google Gemini API key is valid
- Verify the API URL is correct
- Check browser console for specific error messages

## Security Note

⚠️ **Important**: Your API key is currently visible in this guide. For production applications:

1. Consider implementing a backend API to hide your API key
2. Use Vercel's serverless functions for API calls
3. Implement proper API key rotation

## Files Added/Modified

- ✅ `vercel.json` - Vercel configuration file
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - This deployment guide

## Next Steps

1. Follow the steps above to configure environment variables
2. Redeploy your application
3. Test the deployed application
4. If issues persist, check Vercel build logs for specific errors

---

**Need Help?**
If you continue experiencing issues, check:
- Vercel build logs for specific error messages
- Browser console for client-side errors
- Network tab to see if API calls are being made correctly