// api/chart/route.ts - Com múltiplas opções de sistemas de casas

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

    // Sistemas de casas para tentar em ordem de preferência
    const houseSystems = [
      'placidus',     // Mais comum
      'koch',         // Alternativa popular
      'equal',        // Casas iguais (pode ser aceito)
      'whole-sign',   // Casas por signos completos
      'campanus',     // Sistema Campanus
      'regiomontanus' // Sistema Regiomontanus
    ];

    let lastError = null;
    
    // Tentar diferentes sistemas de casas
    for (const houseSystem of houseSystems) {
      try {
        console.log(`Tentando sistema de casas: ${houseSystem}`);
        
        // Construir URL com sistema de casas atual
        const params = new URLSearchParams({
          date: date.toString(),
          lat: latitude.toString(),
          lng: longitude.toString(),
          planets: 'SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN|URANUS|NEPTUNE|PLUTO',
          houses: houseSystem,
          display: 'longitude|latitude|sign|house',
          language: 'pt',
          key: apiKey
        });

        const url = `https://api.astrologico.org/v1/chart?${params.toString()}`;
        console.log('Calling Astrologico API:', url.replace(apiKey, 'HIDDEN'));

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mapa-Astral-App/1.0'
          }
        });

        console.log(`API Response status for ${houseSystem}:`, response.status);

        if (response.status === 400) {
          const errorText = await response.text();
          console.log(`Sistema ${houseSystem} não aceito:`, errorText);
          lastError = errorText;
          continue; // Tenta próximo sistema
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          return NextResponse.json(
            { error: `API returned ${response.status}: ${errorText}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        console.log(`Sucesso com sistema ${houseSystem}!`);
        console.log('API Response data keys:', Object.keys(data));

        // Verificar se a resposta tem a estrutura esperada
        if (!data.planets) {
          console.error('Invalid API response structure:', data);
          continue;
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
              metadata: data.metadata,
              houseSystem: houseSystem // Indica qual sistema foi usado
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
            metadata: data.metadata,
            houseSystem: houseSystem // Indica qual sistema funcionou
          },
          status: data.status || 'OK',
          cost: data.cost || 0
        };

        console.log(`Sistema de casas ${houseSystem} funcionou perfeitamente!`);
        return NextResponse.json(formattedResponse);

      } catch (error) {
        console.error(`Erro ao tentar sistema ${houseSystem}:`, error);
        lastError = error;
        continue;
      }
    }

    // Se chegou aqui, nenhum sistema funcionou
    console.error('Nenhum sistema de casas funcionou, tentando sem casas...');
    
    // Última tentativa: sem sistema de casas
    try {
      const params = new URLSearchParams({
        date: date.toString(),
        lat: latitude.toString(),
        lng: longitude.toString(),
        planets: 'SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN|URANUS|NEPTUNE|PLUTO',
        // Sem houses
        display: 'longitude|latitude|sign', // Sem house no display
        language: 'pt',
        key: apiKey
      });

      const url = `https://api.astrologico.org/v1/chart?${params.toString()}`;
      console.log('Tentativa final sem casas:', url.replace(apiKey, 'HIDDEN'));

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mapa-Astral-App/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sucesso sem sistema de casas!');
        
        return NextResponse.json({
          data: {
            planets: data.planets || {},
            houses: {}, // Vazio pois não foi solicitado
            date: date,
            location: {
              latitude: latitude,
              longitude: longitude
            },
            metadata: data.metadata,
            houseSystem: 'none' // Indica que não há sistema de casas
          },
          status: data.status || 'OK',
          cost: data.cost || 0,
          warning: 'Executado sem sistema de casas'
        });
      }
    } catch (finalError) {
      console.error('Erro final:', finalError);
    }

    // Se tudo falhou
    return NextResponse.json(
      { 
        error: 'All house systems failed',
        lastError: lastError,
        triedSystems: houseSystems
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}