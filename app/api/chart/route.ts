// api/chart/route.ts - Versão corrigida com sistema de casas explícito

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('Chart API called');

  try {
    const body = await req.json();
    console.log('Request body:', body);

    const apiKey = process.env.ASTROLOGICO_API_KEY;
    if (!apiKey) {
      console.error('API key not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { date, latitude, longitude } = body;

    if (!date || typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error('Missing or invalid required data:', { date, latitude, longitude });
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes ou inválidos: data, latitude ou longitude' },
        { status: 400 }
      );
    }

    // SOLUÇÃO: Simplificar a requisição e usar um sistema de casas padrão e explícito.
    // O sistema "Placidus" é o mais comum na astrologia ocidental.
    // Também garantimos que os planetas sejam passados como uma string separada por pipes.
    const planetsString = Array.isArray(body.planets) ? body.planets.join('|') : 'SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN|URANUS|NEPTUNE|PLUTO';

    const params = new URLSearchParams({
      key: apiKey,
      lang: 'pt', // Usar 'lang' como especificado na documentação, em vez de 'language'
      date: date.toString(),
      lat: latitude.toString(),
      lng: longitude.toString(),
      planets: planetsString,
      houses_type: 'placidus', // SOLUÇÃO: Especificar um sistema de casas válido ('placidus', 'equal', etc.)
      display: 'longitude,sign,house' // Formato de string separada por vírgula, mais seguro
    });

    const url = `https://api.astrologico.org/v1/chart?${params.toString( )}`;
    console.log('Calling Astrologico API (Corrected):', url.replace(apiKey, 'HIDDEN'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mapa-Astral-App/1.0'
      },
      signal: AbortSignal.timeout(15000)
    });

    console.log('API Response status:', response.status);
    const responseText = await response.text(); // Ler o texto para debug em todos os casos

    if (!response.ok) {
      console.error('API Error Response:', responseText);
      return NextResponse.json(
        { 
          error: `Erro na API do Astrológico: ${response.status}`,
          details: responseText
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    console.log('API Response data:', JSON.stringify(data, null, 2));

    // Verificação de erro na resposta JSON
    if (data.status === 'ERROR') {
        console.error('API returned a logical error:', data.error);
        return NextResponse.json(
            { error: 'A API retornou um erro', details: data.error },
            { status: 400 }
        );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Chart API internal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
