import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    const sessionToken = searchParams.get('sessiontoken');

    if (!input) {
      return NextResponse.json(
        { error: 'Input parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Build the Google Places API URL
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    placesUrl.searchParams.set('input', input);
    placesUrl.searchParams.set('key', apiKey);
    placesUrl.searchParams.set('components', 'country:co'); // Restrict to Colombia
    // Remove types parameter to allow all location types
    placesUrl.searchParams.set('language', 'es');

    if (sessionToken) {
      placesUrl.searchParams.set('sessiontoken', sessionToken);
    }

    console.log('Requesting Google Places API:', placesUrl.toString().replace(apiKey, 'API_KEY_HIDDEN'));

    // Make the request to Google Places API
    const response = await fetch(placesUrl.toString());
    const data = await response.json();

    console.log('Google Places API response:', { status: response.status, dataStatus: data.status, predictions: data.predictions?.length || 0 });

    if (!response.ok) {
      console.error('Google Places API HTTP error:', { status: response.status, data });
      return NextResponse.json(
        { error: 'Failed to fetch places data', details: data },
        { status: response.status }
      );
    }

    if (data.status !== 'OK') {
      console.error('Google Places API status error:', data);
      return NextResponse.json(
        { error: 'Google Places API error', details: data },
        { status: 400 }
      );
    }

    // Return the results
    return NextResponse.json(data);

  } catch (error) {
    console.error('Places autocomplete error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
