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

    // CORREÇÃO 1: Sistemas de casas válidos baseados na documentação
    const houseSystems = [
      'placidus',
      'koch', 
      'equal',
      'whole_sign',    // mudança: underline ao invés de hífen
      'campanus',
      'regiomontanus'
    ];

    let lastError = null;
    
    // Tentar diferentes sistemas de casas
    for (const houseSystem of houseSystems) {
      try {
        console.log(`Tentando sistema de casas: ${houseSystem}`);
        
        // CORREÇÃO 2: Parâmetros corrigidos baseados na análise
        const params = new URLSearchParams({
          date: date.toString(),
          lat: latitude.toString(),
          lng: longitude.toString(),
          // CORREÇÃO 3: Usar vírgulas ao invés de pipes (|)
          planets: 'SUN,MOON,MERCURY,VENUS,MARS,JUPITER,SATURN,URANUS,NEPTUNE,PLUTO',
          houses: houseSystem,
          // CORREÇÃO 4: Simplificar display - remover 'latitude' que pode estar causando problemas
          display: 'longitude,sign,house',
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
          },
          // CORREÇÃO 5: Adicionar timeout
          signal: AbortSignal.timeout(10000) // 10 segundos timeout
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
          lastError = errorText;
          continue; // Tenta próximo sistema ao invés de retornar erro
        }

        const data = await response.json();
        console.log(`Sucesso com sistema ${houseSystem}!`);
        console.log('API Response data keys:', Object.keys(data));

        // CORREÇÃO 6: Melhor validação da estrutura da resposta
        if (!data || typeof data !== 'object') {
          console.error('Invalid API response structure:', data);
          continue;
        }

        // Verificar se há dados de planetas
        const planets = data.planets || {};
        const hasValidPlanets = Object.keys(planets).length > 0;

        if (!hasValidPlanets) {
          console.error('No planets data received:', data);
          continue;
        }

        // Verificar se todos os planetas têm erro
        const planetErrors = Object.values(planets).filter(planet => 
          planet && typeof planet === 'object' && 'error' in planet
        );

        const allPlanetsHaveErrors = planetErrors.length === Object.keys(planets).length;

        if (allPlanetsHaveErrors) {
          console.error('All planets returned errors:', planets);
          // Continue tentando outros sistemas ao invés de retornar erro
          continue;
        }

        // CORREÇÃO 7: Resposta de sucesso formatada corretamente
        const formattedResponse = {
          data: {
            planets: planets,
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
          cost: data.cost || 0
        };

        console.log(`Sistema de casas ${houseSystem} funcionou perfeitamente!`);
        return NextResponse.json(formattedResponse);

      } catch (error) {
        console.error(`Erro ao tentar sistema ${houseSystem}:`, error);
        lastError = error instanceof Error ? error.message : 'Erro desconhecido';
        continue;
      }
    }

    // CORREÇÃO 8: Tentativa final sem casas com parâmetros corrigidos
    console.error('Nenhum sistema de casas funcionou, tentando sem casas...');
    
    try {
      const params = new URLSearchParams({
        date: date.toString(),
        lat: latitude.toString(),
        lng: longitude.toString(),
        planets: 'SUN,MOON,MERCURY,VENUS,MARS,JUPITER,SATURN,URANUS,NEPTUNE,PLUTO',
        display: 'longitude,sign,house', // Keep house in display for consistency
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
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sucesso sem sistema de casas!');
        
        // Verificar se temos dados de planetas válidos
        const planets = data.planets || {};
        const hasValidPlanets = Object.keys(planets).length > 0;
        
        if (!hasValidPlanets) {
          throw new Error('Nenhum dado de planeta recebido mesmo sem sistema de casas');
        }

        return NextResponse.json({
          data: {
            planets: planets,
            houses: {}, // Vazio pois não foi solicitado
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
          warning: 'Executado sem sistema de casas'
        });
      } else {
        const errorText = await response.text();
        throw new Error(`Final attempt failed: ${response.status} - ${errorText}`);
      }
    } catch (finalError) {
      console.error('Erro final:', finalError);
      lastError = finalError instanceof Error ? finalError.message : 'Erro final desconhecido';
    }

    // CORREÇÃO 10: Resposta de erro mais informativa
    return NextResponse.json(
      { 
        error: 'Falha ao gerar mapa astral com todos os sistemas tentados',
        details: {
          lastError: lastError,
          triedSystems: houseSystems,
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