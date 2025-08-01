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
      planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'],
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
    
    // Adiciona os parâmetros à URL
    url.searchParams.append('date', date.toString());
    url.searchParams.append('lat', latitude.toString());
    url.searchParams.append('lng', longitude.toString());
    url.searchParams.append('planets', planets.join('|'));
    url.searchParams.append('houses', houses.join('|'));
    url.searchParams.append('display', display.join('|'));
    url.searchParams.append('language', language);
    url.searchParams.append('key', API_KEY);

    console.log('Calling Astrologico API:', url.toString().replace(API_KEY, 'HIDDEN'));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      // Se o erro for de sistema de casas inválido, tenta com 'whole'
      if (errorText.includes('invalid house system') && houses[0] !== 'whole') {
        console.log('Trying with whole house system...');
        url.searchParams.set('houses', 'whole');
        
        const retryResponse = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          console.log('Success with whole house system');
          return NextResponse.json(retryData);
        }
        
        // Se ainda falhar, tenta sem o parâmetro houses
        console.log('Trying without houses parameter...');
        url.searchParams.delete('houses');
        
        const finalResponse = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (finalResponse.ok) {
          const finalData = await finalResponse.json();
          console.log('Success without houses parameter');
          return NextResponse.json(finalData);
        }
      }
      
      throw new Error(`API Error: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data keys:', Object.keys(data));
    
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