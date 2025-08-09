# Local API Setup Guide

## 🚨 API Not Working? Here's How to Fix It

### Problem
The API is not working locally because the environment variables are not configured for local development.

### Solution

#### Step 1: Get Your Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

#### Step 2: Configure Local Environment
1. Open the `.env.local` file (already created for you)
2. Replace `your-google-gemini-api-key-here` with your actual API key:

```env
REACT_APP_API_KEY=AIzaSyC_your_actual_api_key_here
```

#### Step 3: Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### Environment Files Explained

| File | Purpose | Git Status |
|------|---------|------------|
| `.env` | Production config (no secrets) | ✅ Committed |
| `.env.local` | Local development config | ❌ Not committed |
| `.env.example` | Template for reference | ✅ Committed |

### Testing the API

1. **Open the app**: http://localhost:3002
2. **Send a test message**: Type "Hello" and press send
3. **Check for errors**: Open browser console (F12) if issues persist

### Common Issues

#### "API key not found" Error
- Make sure `REACT_APP_API_KEY` is set in `.env.local`
- Restart the development server after changes

#### "Invalid API key" Error
- Verify your API key is correct
- Check if the API key has proper permissions

#### "Network Error"
- Check your internet connection
- Verify the API URL is correct

### Production vs Local

**Local Development (.env.local)**:
- Contains actual API credentials
- Used only on your machine
- Never committed to git

**Production (Vercel)**:
- API credentials set in Vercel Dashboard
- Environment variables configured per deployment
- Secure and separate from local config

### Security Notes

⚠️ **Never commit API keys to git**
✅ **Use .env.local for local development**
✅ **Use Vercel Dashboard for production**

---

**Need help?** Check the browser console for specific error messages.