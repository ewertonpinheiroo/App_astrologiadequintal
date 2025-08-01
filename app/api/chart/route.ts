// app/api/chart/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.astrologico.org/v1';
const API_KEY = process.env.ASTROLOGICO_API_KEY;

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      date,
      latitude,
      longitude,
      planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'],
      houses = ['placidus'],
      display = ['longitude', 'latitude', 'sign', 'house'],
      language = 'pt'
    } = body;

    // Validação dos parâmetros obrigatórios
    if (!date || !latitude || !longitude) {
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating chart:', error);
    return NextResponse.json(
      { error: 'Failed to generate chart' },
      { status: 500 }
    );
  }
}