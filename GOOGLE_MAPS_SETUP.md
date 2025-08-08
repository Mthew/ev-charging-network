# Google Maps API Setup Guide

This application uses Google Maps API for interactive maps and address autocomplete functionality.

## Features Implemented

### 🗺️ Interactive Maps
- **Form Page**: Shows markers for desired charging station locations
- **Dashboard**: Displays heatmap of all submissions across Medellín
- **Dark Theme**: Custom styled maps matching the application design

### 📍 Address Autocomplete
- **Smart Address Input**: Google Places autocomplete for address fields
- **Location Coordinates**: Automatically captures lat/lng coordinates
- **Colombia Focus**: Restricted to Colombian addresses for better relevance

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key for security:
   - Add your domain to HTTP referrers
   - Restrict to specific APIs listed above

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 3. Restart Development Server

```bash
bun run dev
```

## Demo Mode

The application works without an API key in demo mode:
- Shows placeholder maps with location counts
- Address inputs work as regular text fields
- All functionality remains accessible

## Features by Component

### GoogleMaps Component
- **Dark theme styling**
- **Multiple marker types** (desired, charging, submission)
- **Heatmap visualization** for dashboard
- **Custom marker icons** with SVG
- **Info windows** with location details
- **Auto-bounds fitting** for optimal view

### GooglePlacesAutocomplete Component
- **Real-time address suggestions**
- **Coordinate extraction**
- **Colombia-focused results**
- **Integration with React Hook Form**
- **Loading states and error handling**

## Map Locations

### Form Page
- Shows markers for each desired charging station location
- Real-time updates as users add locations
- Automatic map bounds adjustment

### Dashboard
- Demo data showing ~100+ locations across Medellín areas:
  - El Poblado (15 locations)
  - Laureles (12 locations)
  - Centro (20 locations)
  - Envigado (8 locations)
  - Sabaneta (6 locations)
  - Itagüí (10 locations)
  - Bello (14 locations)
  - Norte (9 locations)

## API Usage Notes

- The application is optimized to minimize API calls
- Maps load once and reuse instances
- Autocomplete is throttled for efficiency
- Coordinates are cached to avoid repeat geocoding

## Troubleshooting

### Maps Not Loading
1. Check API key is correctly set in `.env.local`
2. Verify APIs are enabled in Google Cloud Console
3. Check browser console for specific error messages

### Autocomplete Not Working
1. Ensure Places API is enabled
2. Check domain restrictions on API key
3. Verify network connectivity

### Styling Issues
1. Maps use custom dark theme
2. Markers use SVG icons for crisp display
3. All styling matches application design system
