// api/chart/route.ts - Versão corrigida com base nos problemas identificados

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

    // Debug da data
    const actualDate = new Date(date * 1000);
    console.log('Date debug:', {
      original: date,
      asDate: actualDate.toISOString(),
      asDateString: actualDate.toString(),
      year: actualDate.getFullYear(),
      month: actualDate.getMonth() + 1,
      day: actualDate.getDate(),
      hour: actualDate.getHours(),
      minute: actualDate.getMinutes()
    });

    // CORREÇÃO: Usar apenas o parâmetro que funciona (house_system)
    const houseSystems = ['placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus'];

    // CORREÇÃO: Tentar diferentes listas de planetas
    const planetLists = [
      ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE'], // Sem PLUTO
      ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN'], // Apenas planetas tradicionais
      ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'] // Todos
    ];

    for (const planetList of planetLists) {
      for (const houseSystem of houseSystems) {
        try {
          console.log(`Tentando house_system=${houseSystem} com planetas: ${planetList.join(',')}`);
          
          // Construir parâmetros base
          const params = new URLSearchParams({
            lat: latitude.toString(),
            lng: longitude.toString(),
            display: 'longitude,sign,house',
            language: 'pt',
            key: apiKey,
            house_system: houseSystem
          });

          // CORREÇÃO: Usar formato de data por componentes (que parece funcionar melhor)
          params.set('year', actualDate.getFullYear().toString());
          params.set('month', (actualDate.getMonth() + 1).toString());
          params.set('day', actualDate.getDate().toString());
          params.set('hour', actualDate.getHours().toString());
          params.set('minute', actualDate.getMinutes().toString());

          // CORREÇÃO: Usar planetas individuais
          planetList.forEach(planet => {
            params.append('planets', planet);
          });

          const url = `https://api.astrologico.org/v1/chart?${params.toString()}`;
          console.log('Calling Astrologico API:', url.replace(apiKey, 'HIDDEN'));

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mapa-Astral-App/1.0'
            },
            signal: AbortSignal.timeout(10000)
          });

          console.log(`API Response status for house_system=${houseSystem}:`, response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`Sistema house_system=${houseSystem} não aceito:`, errorText);
            continue;
          }

          const data = await response.json();
          console.log(`Sucesso com house_system=${houseSystem}!`);
          console.log('API Response data keys:', Object.keys(data));

          if (!data || typeof data !== 'object') {
            console.error('Invalid API response structure:', data);
            continue;
          }

          const planets: Record<string, any> = data.planets || {};
          console.log('Planets object structure:', JSON.stringify(planets, null, 2));

          // Verificar se há planetas válidos
          const validPlanets = Object.entries(planets).filter(([planetName, planetData]) => {
            if (!planetData || typeof planetData !== 'object') return false;
            if ('error' in planetData) {
              console.log(`Planeta ${planetName} com erro:`, planetData.error);
              return false;
            }
            return true;
          });

          console.log(`Planetas válidos encontrados: ${validPlanets.length}/${Object.keys(planets).length}`);

          // Aceitar se pelo menos 5 planetas estão válidos (maioria dos principais)
          if (validPlanets.length >= 5) {
            const validPlanetsData: Record<string, any> = {};
            validPlanets.forEach(([planetName, planetData]) => {
              validPlanetsData[planetName] = planetData;
            });

            const planetErrors = Object.entries(planets)
              .filter(([_, planetData]) => planetData && typeof planetData === 'object' && 'error' in planetData)
              .map(([planetName, planetData]) => planetName);

            const formattedResponse = {
              data: {
                planets: validPlanetsData,
                houses: data.houses || {},
                date: date,
                location: {
                  latitude: latitude,
                  longitude: longitude
                },
                metadata: data.metadata || {},
                houseSystem: houseSystem
              },
              status: data.status || 'OK',
              cost: data.cost || 0,
              warning: planetErrors.length > 0 ? 
                `Alguns planetas não disponíveis: ${planetErrors.join(', ')}` : 
                undefined
            };

            console.log(`Sistema de casas house_system=${houseSystem} funcionou!`);
            console.log(`Planetas válidos: ${Object.keys(validPlanetsData).length}/${Object.keys(planets).length}`);
            return NextResponse.json(formattedResponse);
          } else {
            console.log(`Não há planetas suficientes válidos para house_system=${houseSystem}: ${validPlanets.length}/${planetList.length}`);
            continue;
          }

        } catch (error) {
          console.error(`Erro ao tentar house_system=${houseSystem}:`, error);
          continue;
        }
      }
    }

    // Tentativa final sem sistema de casas
    console.log('Tentando sem sistema de casas...');
    
    for (const planetList of planetLists) {
      try {
        const params = new URLSearchParams({
          lat: latitude.toString(),
          lng: longitude.toString(),
          display: 'longitude,sign', // Remover 'house' do display
          language: 'pt',
          key: apiKey
        });

        // Usar formato de data por componentes
        params.set('year', actualDate.getFullYear().toString());
        params.set('month', (actualDate.getMonth() + 1).toString());
        params.set('day', actualDate.getDate().toString());
        params.set('hour', actualDate.getHours().toString());
        params.set('minute', actualDate.getMinutes().toString());

        // Usar planetas individuais
        planetList.forEach(planet => {
          params.append('planets', planet);
        });

        const url = `https://api.astrologico.org/v1/chart?${params.toString()}`;
        console.log('Tentativa final sem casas:', url.replace(apiKey, 'HIDDEN'));

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mapa-Astral-App/1.0'
          },
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Sucesso sem sistema de casas!');
          
          const planets: Record<string, any> = data.planets || {};
          console.log('Planets object structure (no houses):', JSON.stringify(planets, null, 2));

          const validPlanets = Object.entries(planets).filter(([planetName, planetData]) => {
            if (!planetData || typeof planetData !== 'object') return false;
            if ('error' in planetData) {
              console.log(`Planeta ${planetName} com erro:`, planetData.error);
              return false;
            }
            return true;
          });

          if (validPlanets.length >= 5) {
            const validPlanetsData: Record<string, any> = {};
            validPlanets.forEach(([planetName, planetData]) => {
              validPlanetsData[planetName] = planetData;
            });

            const planetErrors = Object.entries(planets)
              .filter(([_, planetData]) => planetData && typeof planetData === 'object' && 'error' in planetData)
              .map(([planetName, planetData]) => planetName);

            return NextResponse.json({
              data: {
                planets: validPlanetsData,
                houses: {},
                date: date,
                location: {
                  latitude: latitude,
                  longitude: longitude
                },
                metadata: data.metadata || {},
                houseSystem: 'none'
              },
              status: data.status || 'OK',
              cost: data.cost || 0,
              warning: planetErrors.length > 0 ? 
                `Executado sem sistema de casas. Alguns planetas não disponíveis: ${planetErrors.join(', ')}` : 
                'Executado sem sistema de casas'
            });
          } else {
            console.log(`Não há planetas suficientes válidos sem casas: ${validPlanets.length}/${planetList.length}`);
          }
        } else {
          const errorText = await response.text();
          console.error(`Fallback attempt failed: ${response.status} - ${errorText}`);
        }
      } catch (finalError) {
        console.error('Erro final sem casas:', finalError);
      }
    }

    return NextResponse.json(
      { 
        error: 'Falha ao gerar mapa astral',
        details: {
          suggestions: [
            'Verifique se a API key está válida e ativa',
            'Confirme se as coordenadas estão corretas',
            'Verifique se a data está no formato UNIX timestamp correto',
            'Tente com uma data e localização diferentes para teste'
          ]
        }
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}