// api/chart/route.ts - Versão final com requisição POST para a API externa

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('Chart API called');

  try {
    const body = await req.json();
    console.log('Request body from frontend:', body);

    const apiKey = process.env.ASTROLOGICO_API_KEY;
    if (!apiKey) {
      console.error('API key not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { date, latitude, longitude } = body;

    if (!date || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes ou inválidos: data, latitude ou longitude' },
        { status: 400 }
      );
    }

    // SOLUÇÃO: Montar o corpo da requisição (payload) para a API externa.
    // Este objeto JSON será enviado no corpo da requisição POST.
    const apiPayload = {
      key: apiKey,
      lang: 'pt',
      date: date,
      location: { // A API aceita um objeto 'location' com lat e lng
        lat: latitude,
        lng: longitude
      },
      planets: body.planets || ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'],
      houses: {
        type: 'placidus' // O tipo de casa é aninhado em um objeto 'houses'
      },
      display: 'longitude,sign,house'
    };

    const url = `https://api.astrologico.org/v1/chart`;
    console.log('Calling Astrologico API via POST with payload:', JSON.stringify(apiPayload, (key, value ) => key === 'key' ? 'HIDDEN' : value, 2));

    // SOLUÇÃO: Mudar o método da requisição para POST e enviar o payload no corpo.
    const response = await fetch(url, {
      method: 'POST', // MUDANÇA CRÍTICA: Usar POST
      headers: {
        'Content-Type': 'application/json', // Indicar que estamos enviando JSON
        'Accept': 'application/json',
        'User-Agent': 'Mapa-Astral-App/1.0'
      },
      body: JSON.stringify(apiPayload), // Enviar o payload como uma string JSON
      signal: AbortSignal.timeout(15000)
    });

    console.log('API Response status:', response.status);
    const responseText = await response.text();

    if (!response.ok) {
      console.error('API Error Response:', responseText);
      return NextResponse.json(
        { error: `Erro na API do Astrológico: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    console.log('API Response data:', JSON.stringify(data, null, 2));

    if (data.status === 'ERROR' || (data.planets && Object.values(data.planets).some((p: any) => p.error))) {
        const errorDetail = data.error || "Um ou mais planetas não puderam ser calculados.";
        console.error('API returned a logical error:', errorDetail);
        return NextResponse.json(
            { error: 'A API retornou um erro lógico', details: errorDetail },
            { status: 400 }
        );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Chart API internal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: errorMessage },
      { status: 500 }
    );
  }
}
