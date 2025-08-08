import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const sessionToken = searchParams.get('sessiontoken');

    if (!placeId) {
      return NextResponse.json(
        { error: 'place_id parameter is required' },
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

    // Build the Google Places Details API URL
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', placeId);
    detailsUrl.searchParams.set('key', apiKey);
    detailsUrl.searchParams.set('fields', 'place_id,formatted_address,geometry,name');
    detailsUrl.searchParams.set('language', 'es');

    if (sessionToken) {
      detailsUrl.searchParams.set('sessiontoken', sessionToken);
    }

    // Make the request to Google Places API
    const response = await fetch(detailsUrl.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error('Google Places Details API error:', data);
      return NextResponse.json(
        { error: 'Failed to fetch place details', details: data },
        { status: response.status }
      );
    }

    // Return the results
    return NextResponse.json(data);

  } catch (error) {
    console.error('Places details error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
