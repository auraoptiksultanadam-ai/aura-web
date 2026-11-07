/**
 * Netlify Function: Google Places rating for Aura Optikal Sultan Adam.
 * Required environment variables: GOOGLE_MAPS_API_KEY and GOOGLE_PLACE_ID.
 * No API credentials are exposed to the browser.
 */
exports.handler = async function () {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'Google Places credentials are not configured.' })
    };
  }

  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId),
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri'
        }
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Google Places API error:', response.status, detail);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'Unable to retrieve Google rating.' })
      };
    }

    const place = await response.json();
    if (typeof place.rating !== 'number' || typeof place.userRatingCount !== 'number') {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'Google rating is not available for this place.' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=300'
      },
      body: JSON.stringify({
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        googleMapsUri: place.googleMapsUri || null,
        source: 'Google Maps'
      })
    };
  } catch (error) {
    console.error('Google rating function failed:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'Google rating service error.' })
    };
  }
};
