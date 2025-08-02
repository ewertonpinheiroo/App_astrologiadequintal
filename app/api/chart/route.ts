// api/chart/route.ts - Versão corrigida baseada na análise dos logs

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

    // CORREÇÃO PRINCIPAL: Usar a URL correta da API
    // A API do Astrológico espera parâmetros específicos
    const params = new URLSearchParams({
      // Data no formato timestamp Unix (em segundos)
      date: date.toString(),
      // Coordenadas
      lat: latitude.toString(),
      lng: longitude.toString(),
      // Planetas separados por pipe (|) - formato correto
      planets: 'SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN|URANUS|NEPTUNE|PLUTO',
      // Sistema de casas
      houses: body.houses ? body.houses[0].toString() : '16',
      // Campos a serem retornados
      display: 'longitude|sign|house',
      // Idioma
      language: 'pt',
      // Chave da API
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
      signal: AbortSignal.timeout(15000) // Timeout aumentado
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      return NextResponse.json(
        { 
          error: `Erro na API do Astrológico: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));

    // Verificar se a resposta tem a estrutura esperada
    if (!data || typeof data !== 'object') {
      console.error('Invalid API response structure:', data);
      return NextResponse.json(
        { error: 'Resposta inválida da API do Astrológico' },
        { status: 500 }
      );
    }

    // Verificar se há planetas na resposta
    const planets = data.planets || {};
    console.log('Planets in response:', Object.keys(planets));

    // Contar planetas válidos
    const validPlanets = Object.entries(planets).filter(([planetName, planetData]) => {
      if (!planetData || typeof planetData !== 'object') return false;
      if ('error' in planetData) {
        console.log(`Planeta ${planetName} com erro:`, planetData.error);
        return false;
      }
      return true;
    });

    console.log(`Planetas válidos encontrados: ${validPlanets.length}/${Object.keys(planets).length}`);

    // Se não há planetas válidos, tentar uma requisição alternativa
    if (validPlanets.length === 0) {
      console.log('Tentando com parâmetros alternativos...');
      
      // Tentar com apenas planetas clássicos
      const alternativeParams = new URLSearchParams({
        date: date.toString(),
        lat: latitude.toString(),
        lng: longitude.toString(),
        planets: 'SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN', // Apenas planetas clássicos
        houses: body.houses ? body.houses[0].toString() : '16', // Sistema de casas mais comum
        display: 'longitude|sign|house',
        language: 'pt',
        key: apiKey
      });

      const alternativeUrl = `https://api.astrologico.org/v1/chart?${alternativeParams.toString()}`;
      console.log('Alternative API call:', alternativeUrl.replace(apiKey, 'HIDDEN'));

      const alternativeResponse = await fetch(alternativeUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mapa-Astral-App/1.0'
        },
        signal: AbortSignal.timeout(15000)
      });

      if (alternativeResponse.ok) {
        const alternativeData = await alternativeResponse.json();
        console.log('Alternative API response:', JSON.stringify(alternativeData, null, 2));
        
        const altPlanets = alternativeData.planets || {};
        const altValidPlanets = Object.entries(altPlanets).filter(([planetName, planetData]) => {
          if (!planetData || typeof planetData !== 'object') return false;
          if ('error' in planetData) return false;
          return true;
        });

        if (altValidPlanets.length > 0) {
          // Usar a resposta alternativa
          console.log('Using alternative response with', altValidPlanets.length, 'valid planets');
          const validPlanetsData: Record<string, any> = {};
          altValidPlanets.forEach(([planetName, planetData]) => {
            validPlanetsData[planetName] = planetData;
          });

          return NextResponse.json({
            data: {
              planets: validPlanetsData,
              houses: alternativeData.houses || {},
              date: date,
              location: {
                latitude: latitude,
                longitude: longitude
              },
              metadata: alternativeData.metadata || {},
              houseSystem: 'placidus'
            },
            status: alternativeData.status || 'OK',
            cost: alternativeData.cost || 0,
            warning: 'Usando apenas planetas clássicos devido a limitações da API'
          });
        }
      }
    }

    // Se temos planetas válidos na resposta original
    if (validPlanets.length > 0) {
      const validPlanetsData: Record<string, any> = {};
      validPlanets.forEach(([planetName, planetData]) => {
        validPlanetsData[planetName] = planetData;
      });

      const planetErrors = Object.entries(planets)
        .filter(([_, planetData]) => planetData && typeof planetData === 'object' && 'error' in planetData)
        .map(([planetName, _]) => planetName);

      return NextResponse.json({
        data: {
          planets: validPlanetsData,
          houses: data.houses || {},
          date: date,
          location: {
            latitude: latitude,
            longitude: longitude
          },
          metadata: data.metadata || {},
          houseSystem: 'equal'
        },
        status: data.status || 'OK',
        cost: data.cost || 0,
        warning: planetErrors.length > 0 ? 
          `Alguns planetas não disponíveis: ${planetErrors.join(', ')}` : 
          undefined
      });
    }

    // Se chegou até aqui, não conseguiu obter dados válidos
    return NextResponse.json(
      { 
        error: 'Não foi possível obter dados válidos do mapa astral',
        details: {
          apiResponse: data,
          suggestions: [
            'Verifique se a data está no formato correto (timestamp Unix)',
            'Confirme se as coordenadas estão corretas',
            'Verifique se a API key está válida e tem créditos suficientes',
            'Tente com uma data mais recente (alguns APIs têm limitações históricas)'
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