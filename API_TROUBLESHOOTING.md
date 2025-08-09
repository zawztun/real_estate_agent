# API Not Working in Vercel - Complete Troubleshooting Guide

## 🔍 Root Cause Analysis

Based on your code analysis, here are the main issues causing the API to fail in Vercel:

### 1. **Environment Variables Not Configured in Vercel**
Your `.env` file is only used locally. Vercel needs environment variables configured in its dashboard.

### 2. **Security Risk: API Key Exposed**
Your Google Gemini API key is visible in the `.env` file, which is a security vulnerability.

### 3. **Generic Error Handling**
The current error handling shows "Oops! Something went wrong" without specific details.

## 🛠️ Step-by-Step Solution

### Step 1: Configure Environment Variables in Vercel Dashboard

1. **Login to Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Find your project: `trae_thandar-soe-bot_3x6o`

2. **Add Environment Variables**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in sidebar
   - Add these variables:

   **REACT_APP_API_KEY**
   - Name: `REACT_APP_API_KEY`
   - Value: `AIzaSyCd-4hKHU_LRn7JCZcJdRwPxr8P260Q-aU`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **REACT_APP_API_URL**
   - Name: `REACT_APP_API_URL`
   - Value: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`
   - Environments: ✅ Production ✅ Preview ✅ Development

### Step 2: Verify API Key is Valid

**Test your API key manually:**
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyCd-4hKHU_LRn7JCZcJdRwPxr8P260Q-aU" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "role": "user",
      "parts": [{"text": "Hello"}]
    }]
  }'
```

### Step 3: Improve Error Handling (Recommended)

Update your `src/App.js` to show specific error messages:

```javascript
// Replace the current catch block in handleSendMessage function:
catch (error) {
  console.error("Error calling Gemini API:", error);
  let errorMessage = 'Oops! Something went wrong. Please try again later.';
  
  // More specific error messages
  if (error.message.includes('API error: 400')) {
    errorMessage = 'Invalid request. Please check your message and try again.';
  } else if (error.message.includes('API error: 401')) {
    errorMessage = 'Authentication failed. Please contact support.';
  } else if (error.message.includes('API error: 403')) {
    errorMessage = 'API quota exceeded. Please try again later.';
  } else if (error.message.includes('Failed to fetch')) {
    errorMessage = 'Network error. Please check your connection.';
  }
  
  setMessages((prevMessages) => [...prevMessages, { role: 'bot', text: errorMessage }]);
  setLoading(false);
  setIsSpeaking(false);
}
```

### Step 4: Redeploy Application

**Option A: Trigger Redeploy in Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment

**Option B: Push New Commit**
```bash
# Make a small change to trigger redeploy
echo "# Updated $(date)" >> README.md
git add README.md
git commit -m "Fix API configuration for Vercel"
git push origin main
```

### Step 5: Test the Deployment

1. **Wait for deployment to complete**
2. **Visit your Vercel URL**
3. **Open browser console** (F12 → Console tab)
4. **Send a test message**
5. **Check for any error messages**

## 🔧 Advanced Debugging

### Check Environment Variables in Production

Temporarily add this debug code to `src/App.js` (remove after testing):

```javascript
// Add this inside your App component, before the return statement
useEffect(() => {
  console.log('🔍 Environment Variables Check:');
  console.log('API_KEY exists:', !!process.env.REACT_APP_API_KEY);
  console.log('API_URL exists:', !!process.env.REACT_APP_API_URL);
  console.log('API_KEY length:', process.env.REACT_APP_API_KEY?.length || 0);
}, []);
```

### Common Error Scenarios

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `process.env.REACT_APP_API_KEY is undefined` | Environment variables not set in Vercel | Follow Step 1 above |
| `API error: 400` | Invalid request format | Check API payload structure |
| `API error: 401` | Invalid API key | Verify API key is correct |
| `API error: 403` | API quota exceeded or key restrictions | Check Google Cloud Console |
| `Failed to fetch` | Network/CORS issues | Check API URL and network |

## 🔒 Security Improvements

### Remove API Key from .env File

1. **Update `.env` file:**
```bash
# Remove or comment out the API key
# REACT_APP_API_KEY=AIzaSyCd-4hKHU_LRn7JCZcJdRwPxr8P260Q-aU
```

2. **Add to `.gitignore` if not already there:**
```
.env
.env.local
.env.production
```

3. **Consider using Vercel Serverless Functions** for better security:
   - Create `/api/chat.js` endpoint
   - Move API key to server-side
   - Call your own API instead of Google's directly

## ✅ Verification Checklist

- [ ] Environment variables added to Vercel dashboard
- [ ] Variables set for Production, Preview, and Development
- [ ] API key tested manually (works)
- [ ] Application redeployed
- [ ] Browser console shows no environment variable errors
- [ ] Test message sent successfully
- [ ] API key removed from `.env` file

## 🆘 Still Not Working?

1. **Check Vercel Build Logs:**
   - Go to Deployments → Click on failed deployment
   - Look for red error messages in build logs

2. **Test Locally:**
   ```bash
   npm run build
   npm install -g serve
   serve -s build
   ```

3. **Contact Support:**
   - Provide specific error messages from browser console
   - Share Vercel build log errors
   - Verify API key works with manual curl test

---

**Next Steps:** Follow Step 1 first, then redeploy. The API should work once environment variables are properly configured in Vercel.