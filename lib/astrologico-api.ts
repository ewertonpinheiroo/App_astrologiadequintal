// lib/astrologico-api.ts - Versão corrigida com formatação de data adequada
import { ChartFormData, LocationApiResponse, ChartResponse } from '@/types/astrologico';

class AstrologicoApiService {
  private baseUrl: string;

  constructor() {
    // Usa as rotas internas da aplicação ao invés da API externa diretamente
    this.baseUrl = '/api';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na API: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer requisição para a API:', error);
      throw error;
    }
  }

  async getLocationCoordinates(locationName: string): Promise<LocationApiResponse> {
    const params = new URLSearchParams({
      query: locationName
    });
    
    const result = await this.makeRequest<LocationApiResponse>(`/location?${params.toString()}`);
    
    if (!result || !result.location) {
      throw new Error('Localização não encontrada ou formato de resposta inválido.');
    }
    
    return result;
  }

  async generateChart(chartData: ChartFormData): Promise<ChartResponse> {
    const {
      birthDate,
      birthTime,
      latitude,
      longitude
    } = chartData;

    // CORREÇÃO: Melhor tratamento da data e horário
    // Criar a data no formato local primeiro
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = birthTime.split(':').map(Number);
    
    // Criar data no UTC para evitar problemas de timezone
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    console.log('Date processing:', {
      input: { birthDate, birthTime },
      parsed: { year, month: month - 1, day, hours, minutes },
      utcDate: date.toISOString(),
      timestamp: Math.floor(date.getTime() / 1000)
    });

    const requestBody = {
      // Data no formato timestamp Unix (em segundos)
      date: Math.floor(date.getTime() / 1000),
      // Coordenadas geográficas
      latitude: latitude,
      longitude: longitude,
      // Planetas a serem incluídos no mapa - usando formato pipe separado
      planets: [
        'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 
        'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'
      ],
      // Casas astrológicas
      houses: [16],
      // Opções de exibição
      display: ['longitude', 'latitude', 'sign', 'house'],
      // Idioma
      language: 'pt'
    };

    console.log('Sending chart request:', requestBody);

    return await this.makeRequest<ChartResponse>('/chart', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
  }

  // Método para testar diferentes formatos de data
  async generateChartWithAlternatives(chartData: ChartFormData): Promise<ChartResponse> {
    const {
      birthDate,
      birthTime,
      latitude,
      longitude
    } = chartData;

    // Tentar diferentes formatos de data
    const dateFormats = this.generateDateFormats(birthDate, birthTime);
    
    for (const dateFormat of dateFormats) {
      try {
        console.log(`Tentando formato de data: ${dateFormat.description}`);
        
        const requestBody = {
          date: dateFormat.timestamp,
          latitude: latitude,
          longitude: longitude,
          planets: ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN'],
          houses: [16],
          display: ['longitude', 'sign', 'house'],
          language: 'pt'
        };

        const result = await this.makeRequest<ChartResponse>('/chart', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        // Se funcionou, retornar o resultado
        if (result && result.data && result.data.planets) {
          const validPlanets = Object.keys(result.data.planets).filter(
            key => result.data.planets[key] && !('error' in result.data.planets[key])
          );
          
          if (validPlanets.length > 0) {
            console.log(`Sucesso com formato: ${dateFormat.description}`);
            return result;
          }
        }
      } catch (error) {
        console.log(`Falhou com formato ${dateFormat.description}:`, error);
        continue;
      }
    }

    // Se nenhum formato funcionou, usar o padrão
    return this.generateChart(chartData);
  }

  private generateDateFormats(birthDate: string, birthTime: string) {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = birthTime.split(':').map(Number);

    return [
      // Formato 1: UTC
      {
        description: 'UTC format',
        timestamp: Math.floor(new Date(Date.UTC(year, month - 1, day, hours, minutes)).getTime() / 1000)
      },
      // Formato 2: Local timezone
      {
        description: 'Local timezone',
        timestamp: Math.floor(new Date(year, month - 1, day, hours, minutes).getTime() / 1000)
      },
      // Formato 3: Timezone do Brasil (GMT-3)
      {
        description: 'Brazil timezone (GMT-3)',
        timestamp: Math.floor(new Date(Date.UTC(year, month - 1, day, hours + 3, minutes)).getTime() / 1000)
      },
      // Formato 4: Sem horário (meio-dia UTC)
      {
        description: 'Noon UTC',
        timestamp: Math.floor(new Date(Date.UTC(year, month - 1, day, 12, 0)).getTime() / 1000)
      }
    ];
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Faz uma requisição simples para testar a conectividade
      const params = new URLSearchParams({
        query: 'São Paulo'
      });
      
      await this.makeRequest(`/location?${params.toString()}`);
      return true;
    } catch (error) {
      console.error('Erro na validação:', error);
      return false;
    }
  }
}

export default AstrologicoApiService;