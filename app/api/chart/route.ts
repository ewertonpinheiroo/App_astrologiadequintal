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

    // CORREÇÃO: Tentar diferentes nomes de parâmetros para sistema de casas
    const houseSystemParams = [
      { param: 'houses', value: 'placidus' },
      { param: 'houses', value: 'koch' },
      { param: 'houses', value: 'equal' },
      { param: 'houses', value: 'whole_sign' },
      { param: 'houses', value: 'campanus' },
      { param: 'houses', value: 'regiomontanus' },
      // Tentar com parâmetro diferente
      { param: 'house_system', value: 'placidus' },
      { param: 'house_system', value: 'koch' },
      { param: 'house_system', value: 'equal' },
      { param: 'system', value: 'placidus' },
      { param: 'system', value: 'koch' },
      { param: 'system', value: 'equal' }
    ];

    let lastError = null;
    
    // Tentar diferentes sistemas de casas com diferentes parâmetros
    for (const { param, value } of houseSystemParams) {
      try {
        console.log(`Tentando ${param}=${value}`);
        
        // Construir parâmetros base
        const baseParams = new URLSearchParams({
          date: date.toString(),
          lat: latitude.toString(),
          lng: longitude.toString(),
          display: 'longitude,sign,house',
          language: 'pt',
          key: apiKey
        });

        // CORREÇÃO: Adicionar planetas individualmente ao invés de como string
        const planetList = ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'];
        planetList.forEach(planet => {
          baseParams.append('planets', planet);
        });

        // Adicionar parâmetro de sistema de casas
        baseParams.append(param, value);

        const url = `https://api.astrologico.org/v1/chart?${baseParams.toString()}`;
        console.log('Calling Astrologico API:', url.replace(apiKey, 'HIDDEN'));

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mapa-Astral-App/1.0'
          },
          signal: AbortSignal.timeout(10000)
        });

        console.log(`API Response status for ${param}=${value}:`, response.status);

        if (response.status === 400) {
          const errorText = await response.text();
          console.log(`Sistema ${param}=${value} não aceito:`, errorText);
          lastError = errorText;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          lastError = errorText;
          continue;
        }

        const data = await response.json();
        console.log(`Sucesso com ${param}=${value}!`);
        console.log('API Response data keys:', Object.keys(data));

        if (!data || typeof data !== 'object') {
          console.error('Invalid API response structure:', data);
          continue;
        }

        const planets: Record<string, any> = data.planets || {};
        const hasValidPlanets = Object.keys(planets).length > 0;

        if (!hasValidPlanets) {
          console.error('No planets data received:', data);
          continue;
        }

        // CORREÇÃO: Verificar planetas válidos ao invés de todos os planetas
        const planetErrors = Object.values(planets).filter(planet => 
          planet && typeof planet === 'object' && 'error' in planet
        );

        const validPlanets = Object.values(planets).filter(planet => 
          planet && typeof planet === 'object' && !('error' in planet)
        );

        // Aceitar se pelo menos 8 planetas (maioria) estão válidos
        const hasEnoughValidPlanets = validPlanets.length >= 8;

        if (!hasEnoughValidPlanets) {
          console.error('Not enough valid planets:', {
            total: Object.keys(planets).length,
            valid: validPlanets.length,
            errors: planetErrors.length,
            planetErrors: planetErrors
          });
          continue;
        }

        // Filtrar apenas planetas válidos para a resposta
        const validPlanetsData: Record<string, any> = {};
        Object.entries(planets).forEach(([planetName, planetData]) => {
          if (planetData && typeof planetData === 'object' && !('error' in planetData)) {
            validPlanetsData[planetName] = planetData;
          }
        });

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
            houseSystem: value,
            houseParam: param
          },
          status: data.status || 'OK',
          cost: data.cost || 0,
          warning: planetErrors.length > 0 ? `Alguns planetas não disponíveis: ${Object.keys(planets).filter(p => planets[p]?.error).join(', ')}` : undefined
        };

        console.log(`Sistema de casas ${param}=${value} funcionou perfeitamente!`);
        console.log(`Planetas válidos: ${Object.keys(validPlanetsData).length}/${Object.keys(planets).length}`);
        return NextResponse.json(formattedResponse);

      } catch (error) {
        console.error(`Erro ao tentar ${param}=${value}:`, error);
        lastError = error instanceof Error ? error.message : 'Erro desconhecido';
        continue;
      }
    }

    // Tentativa final sem casas
    console.error('Nenhum sistema de casas funcionou, tentando sem casas...');
    
    try {
      const params = new URLSearchParams({
        date: date.toString(),
        lat: latitude.toString(),
        lng: longitude.toString(),
        display: 'longitude,sign', // Remover 'house' do display quando não usar casas
        language: 'pt',
        key: apiKey
      });

      // CORREÇÃO: Adicionar planetas individualmente
      const planetList = ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'];
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
        const hasValidPlanets = Object.keys(planets).length > 0;
        
        if (!hasValidPlanets) {
          throw new Error('Nenhum dado de planeta recebido mesmo sem sistema de casas');
        }

        // Aplicar a mesma lógica de validação para o fallback
        const planetErrors = Object.values(planets).filter(planet => 
          planet && typeof planet === 'object' && 'error' in planet
        );

        const validPlanets = Object.values(planets).filter(planet => 
          planet && typeof planet === 'object' && !('error' in planet)
        );

        const hasEnoughValidPlanets = validPlanets.length >= 8;

        if (!hasEnoughValidPlanets) {
          throw new Error(`Não há planetas válidos suficientes: ${validPlanets.length}/10`);
        }

        // Filtrar apenas planetas válidos para a resposta
        const validPlanetsData: Record<string, any> = {};
        Object.entries(planets).forEach(([planetName, planetData]) => {
          if (planetData && typeof planetData === 'object' && !('error' in planetData)) {
            validPlanetsData[planetName] = planetData;
          }
        });

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
            `Executado sem sistema de casas. Alguns planetas não disponíveis: ${Object.keys(planets).filter(p => planets[p]?.error).join(', ')}` : 
            'Executado sem sistema de casas'
        });
      } else {
        const errorText = await response.text();
        throw new Error(`Final attempt failed: ${response.status} - ${errorText}`);
      }
    } catch (finalError) {
      console.error('Erro final:', finalError);
      lastError = finalError instanceof Error ? finalError.message : 'Erro final desconhecido';
    }

    return NextResponse.json(
      { 
        error: 'Falha ao gerar mapa astral com todos os sistemas tentados',
        details: {
          lastError: lastError,
          triedSystems: houseSystemParams.map(p => `${p.param}=${p.value}`),
          suggestions: [
            'Verifique se a API key está válida e ativa',
            'Confirme se as coordenadas estão corretas',
            'Verifique se a data está no formato UNIX timestamp correto',
            'Tente com uma data e localização diferentes para teste',
            'A API pode ter mudado os parâmetros aceitos para sistemas de casas'
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