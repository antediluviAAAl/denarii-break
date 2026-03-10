import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { coin_id, country, km, nominal, year } = body;

    // 1. Validate incoming data
    if (!coin_id || !country || !km || !nominal || !year) {
      return NextResponse.json({ error: 'Missing required coin parameters' }, { status: 400 });
    }

    // 2. Construct the Render URL
    // Note: Make sure to add RENDER_API_URL to your Vercel Environment Variables
    const baseUrl = process.env.RENDER_API_URL || 'https://denarii-district-price.onrender.com';
    const renderUrl = new URL(`${baseUrl}/api/scan`);
    
    renderUrl.searchParams.append('coin_id', coin_id);
    renderUrl.searchParams.append('country', country);
    renderUrl.searchParams.append('km', km);
    renderUrl.searchParams.append('nominal', nominal);
    renderUrl.searchParams.append('year', year);

    // 3. Ping the Python backend (Fire and Forget)
    const renderResponse = await fetch(renderUrl.toString(), {
      method: 'GET',
    });

    if (!renderResponse.ok) {
      throw new Error(`Render API responded with status: ${renderResponse.status}`);
    }

    const data = await renderResponse.json();

    // 4. Return the HTTP 202 Accepted status directly to React
    return NextResponse.json(data, { status: 202 });

  } catch (error) {
    console.error('Market Analysis Trigger Error:', error);
    return NextResponse.json({ error: 'Failed to trigger market analysis' }, { status: 500 });
  }
}