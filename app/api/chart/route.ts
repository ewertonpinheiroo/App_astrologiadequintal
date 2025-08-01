// app/api/chart/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.astrologico.org/v1';
const API_KEY = process.env.ASTROLOGICO_API_KEY;

export async function POST(request: NextRequest) {
  console.log('Chart API called');
  console.log('API_KEY exists:', !!API_KEY);
  
  if (!API_KEY) {
    console.error('API key not configured');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      date,
      latitude,
      longitude,
      planets = ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'],
      houses = ['equal'],
      display = ['longitude', 'latitude', 'sign', 'house'],
      language = 'pt'
    } = body;

    // Validação dos parâmetros obrigatórios
    if (!date || latitude === undefined || longitude === undefined) {
      console.error('Missing required parameters:', { date, latitude, longitude });
      return NextResponse.json(
        { error: 'Date, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const url = new URL(`${API_BASE_URL}/chart`);
    
    // Adiciona os parâmetros à URL - primeiro teste com timestamp Unix
    url.searchParams.append('date', date.toString());
    url.searchParams.append('lat', latitude.toString());
    url.searchParams.append('lng', longitude.toString());
    url.searchParams.append('planets', planets.join('|'));
    // Removemos houses inicialmente já que sabemos que dá erro
    // url.searchParams.append('houses', houses.join('|'));
    url.searchParams.append('display', display.join('|'));
    url.searchParams.append('language', language);
    url.searchParams.append('key', API_KEY);

    console.log('Calling Astrologico API:', url.toString().replace(API_KEY, 'HIDDEN'));

    let response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);

    // Se der erro, tenta com formato de data diferente
    if (!response.ok) {
      const errorText = await response.text();
      console.error('First attempt failed:', errorText);
      
      // Tenta converter timestamp para formato ISO
      const isoDate = new Date(date * 1000).toISOString();
      console.log('Trying with ISO date:', isoDate);
      
      url.searchParams.set('date', isoDate);
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Tenta com formato YYYY-MM-DD HH:MM:SS
        const dateObj = new Date(date * 1000);
        const formattedDate = dateObj.getUTCFullYear() + '-' + 
                            String(dateObj.getUTCMonth() + 1).padStart(2, '0') + '-' + 
                            String(dateObj.getUTCDate()).padStart(2, '0') + ' ' +
                            String(dateObj.getUTCHours()).padStart(2, '0') + ':' +
                            String(dateObj.getUTCMinutes()).padStart(2, '0') + ':' +
                            String(dateObj.getUTCSeconds()).padStart(2, '0');
        
        console.log('Trying with formatted date:', formattedDate);
        url.searchParams.set('date', formattedDate);
        
        response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data keys:', Object.keys(data));
    console.log('API Response full data:', JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating chart:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate chart: ${errorMessage}` },
      { status: 500 }
    );
  }
}