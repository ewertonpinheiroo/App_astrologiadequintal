// api/chart/route.ts - Versão completa com houses=placidus

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('Chart API called');

  try {
    const body = await req.json();
    console.log('Request body:', body);

    const apiKey = process.env.ASTROLOGICO_API_KEY;
    console.log('API_KEY exists:', !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Extrair dados do body
    const { date, latitude, longitude } = body;

    // Validar dados obrigatórios
    if (!date || !latitude || !longitude) {
      console.log('Missing required data:', { date, latitude, longitude });
      return NextResponse.json(
        { error: 'Missing required data: date, latitude, or longitude' },
        { status: 400 }
      );
    }

    // Construir URL com houses=placidus
    const params = new URLSearchParams({
      date: date.toString(),
      lat: latitude.toString(),
      lng: longitude.toString(),
      planets: 'SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN|URANUS|NEPTUNE|PLUTO',
      houses: 'placidus',
      display: 'longitude|latitude|sign|house',
      language: 'pt',
      key: apiKey
    });

    const url = `https://api.astrologico.org/v1/chart?${params.toString()}`;
    console.log('Calling Astrologico API:', url.replace(apiKey, 'HIDDEN'));

    // Fazer a requisição GET
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mapa-Astral-App/1.0'
      }
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return NextResponse.json(
        { error: `API returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API Response data keys:', Object.keys(data));
    console.log('API Response full data:', JSON.stringify(data, null, 2));

    // Verificar se a resposta tem a estrutura esperada
    if (!data.planets) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json(
        { error: 'Invalid API response structure' },
        { status: 500 }
      );
    }

    // Verificar se todos os planetas têm erro
    const planets = data.planets;
    const hasErrors = Object.values(planets).every(planet => 
      planet && typeof planet === 'object' && 'error' in planet
    );

    if (hasErrors) {
      console.error('All planets returned errors:', planets);
      // Ainda retorna os dados para debug, mas com aviso
      return NextResponse.json({
        data: {
          planets: planets,
          houses: data.houses || {},
          date: date,
          location: {
            latitude: latitude,
            longitude: longitude
          },
          metadata: data.metadata
        },
        status: 'ERROR_ALL_PLANETS',
        cost: 0,
        error: 'All planets returned errors - check API parameters'
      });
    }

    // Formatar resposta de sucesso
    const formattedResponse = {
      data: {
        planets: data.planets,
        houses: data.houses || {},
        date: date,
        location: {
          latitude: latitude,
          longitude: longitude
        },
        metadata: data.metadata
      },
      status: data.status || 'OK',
      cost: data.cost || 0
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}