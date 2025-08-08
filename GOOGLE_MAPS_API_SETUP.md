# Google Maps API Setup Guide

This application uses Google Maps API for interactive maps and address autocomplete functionality.

## 🚀 Quick Setup Steps

### 1. Create Google Cloud Project & Get API Key

#### A. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

#### B. Create or Select Project
1. Click on the project dropdown at the top
2. Click "New Project" or select an existing project
3. Give your project a name (e.g., "EV Charging Network")
4. Click "Create"

#### C. Enable Required APIs
1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search and enable these 3 APIs (click "Enable" for each):
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

#### D. Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **"+ Create Credentials"** > **"API Key"**
3. Copy the API key that appears
4. Click **"Restrict Key"** for security

#### E. Configure API Key Restrictions (IMPORTANT for security)
1. **API restrictions**: Select "Restrict key"
2. Check these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. **Application restrictions**:
   - For development: Select "HTTP referrers"
   - Add: `localhost:3000/*` and `127.0.0.1:3000/*`
   - **For Same.new environment**: Add `*.same-app.com/*` and `*.preview.same-app.com/*`
   - For production: Add your domain: `yourdomain.com/*`
4. Click **"Save"**

### 2. Add API Key to Your Project

#### A. Update .env.local file
Replace the placeholder in your `.env.local` file:

```env
# Before (placeholder):
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# After (your actual key):
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### B. Restart Development Server
```bash
bun run dev
```

### 3. Test the Integration

Visit these URLs to test:
- **Main Form**: http://localhost:3000
- **Test Page**: http://localhost:3000/test-maps
- **Dashboard**: http://localhost:3000/dashboard

## ✅ What You'll See After Setup

### 🗺️ Interactive Maps
- Real Google Maps with dark theme styling
- Custom markers for different location types
- Heatmap visualization on dashboard
- Click-to-add location functionality

### 📍 Address Autocomplete
- Real-time address suggestions as you type
- Automatic coordinate extraction (lat/lng)
- Colombia-focused results for better relevance
- Integration with form validation

### 🎯 Location Features
- **Form Page**: Markers appear when you add desired charging locations
- **Dashboard**: Heatmap shows concentration of all submissions
- **Test Page**: Interactive testing environment

## 🛠️ Troubleshooting

### CORS/COEP Errors in Same.new Environment

If you see errors like:
```
net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep
```

**This is already fixed!** The application now uses:
- **Server-side API proxy** (`/api/places/autocomplete` and `/api/places/details`)
- **No client-side JSONP requests** that cause CORS issues
- **Same.new compatible architecture**

### API Key Domain Configuration
For **Same.new environment**, make sure your Google API key includes these domains:
- `*.same-app.com/*`
- `*.preview.same-app.com/*`
- `localhost:3000/*` (for local development)

### Maps Not Loading
1. Check API key is correctly set in `.env.local`
2. Verify APIs are enabled in Google Cloud Console
3. Check browser console for specific error messages
4. Ensure domains are whitelisted in API restrictions

### Autocomplete Not Working
1. Verify Places API is enabled
2. Check network tab for API calls to `/api/places/autocomplete`
3. Ensure domain is whitelisted in API restrictions
4. Check server logs for API errors

### Quota/Billing Issues
1. Google Maps requires billing enabled for production use
2. Development usage is usually within free tier
3. Monitor usage in Google Cloud Console

## 💰 Pricing Information

- **Free Tier**: $200/month credit covers most development needs
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests

For this application's typical usage, you'll likely stay within the free tier.

## 🔒 Security Best Practices

1. **Always restrict your API keys** - never use unrestricted keys
2. **Use HTTP referrer restrictions** for web applications
3. **Include Same.new domains** for development: `*.same-app.com/*`
4. **Monitor usage** in Google Cloud Console
5. **Rotate keys periodically** for production applications
6. **Keep API keys in environment variables**, never commit to code

## 🏗️ Architecture Changes (CORS Fix)

To solve CORS issues in Same.new environment, the application now uses:

### Server-Side API Proxy
- **`/api/places/autocomplete`** - Proxies Google Places Autocomplete API
- **`/api/places/details`** - Proxies Google Places Details API
- **No client-side JSONP** - Eliminates CORS/COEP issues

### Client-Side Components
- **GooglePlacesAutocomplete** - Uses fetch() to server endpoints
- **Session tokens** - Optimizes billing for Google Places API
- **Debounced search** - Reduces API calls and improves performance
- **Dropdown UI** - Custom autocomplete interface

### Benefits
- ✅ **CORS/COEP compliant** - Works in Same.new environment
- ✅ **Better security** - API key hidden from client
- ✅ **Optimized billing** - Session tokens reduce costs
- ✅ **Custom UI** - Full control over autocomplete interface

## Features by Component

### GoogleMaps Component
- **Dark theme styling** matching app design
- **Multiple marker types** (desired, charging, submission)
- **Heatmap visualization** for dashboard analytics
- **Custom SVG marker icons** for crisp display
- **Info windows** with location details
- **Auto-bounds fitting** for optimal map view

### GooglePlacesAutocomplete Component
- **Server-side API calls** (CORS-safe)
- **Real-time address suggestions** with debouncing
- **Coordinate extraction** and validation
- **Colombia-focused results** with bounds restriction
- **Form integration** with React Hook Form
- **Loading states** and error handling
- **Fallback demo mode** when API unavailable
