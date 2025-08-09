# How to Add Your Personal Avatar

Your avatar has been successfully set up! Here's how to replace it with your own photo:

## Method 1: Replace the SVG file (Recommended)

1. **Prepare your photo:**
   - Use any image format: `.jpg`, `.png`, `.gif`, or `.svg`
   - Recommended size: 100x100 pixels (square)
   - For best results, crop your photo to be square

2. **Replace the avatar file:**
   - Navigate to the `public` folder in your project
   - Replace `avatar.svg` with your photo
   - **Important:** Keep the same filename `avatar.svg` OR update the filename in the code

3. **If using a different filename:**
   - Open `src/App.js`
   - Find the line: `const AVATAR_URL = "/avatar.svg";`
   - Change it to: `const AVATAR_URL = "/your-photo-name.jpg";` (use your actual filename)

## Method 2: Use an online image URL

1. Upload your photo to an image hosting service (like Imgur, Cloudinary, etc.)
2. Copy the direct image URL
3. Open `src/App.js`
4. Replace the AVATAR_URL with your image URL:
   ```javascript
   const AVATAR_URL = "https://your-image-url.com/your-photo.jpg";
   ```

## Current Setup

- Your avatar appears in the chat header
- It also appears next to each bot message
- The avatar is currently using a custom SVG placeholder
- The application is running at: http://localhost:3006

## Tips

- Square images work best for circular avatars
- Keep file sizes reasonable (under 1MB) for faster loading
- The avatar will automatically be styled with rounded corners and shadows
- After making changes, the page should automatically refresh

Enjoy your personalized Thandar Soe Real Estate Bot! 🏠✨