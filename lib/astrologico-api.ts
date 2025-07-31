import { ChartFormData, LocationResponse, ChartResponse, ChartData } from '@/types/astrologico';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.astrologico.org/v1';
const API_KEY = process.env.NEXT_PUBLIC_ASTROLOGICO_API_KEY;

class AstrologicoApiService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY || '';
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const url = new URL(`${API_BASE_URL}/${endpoint}`);
      
      // Adiciona a API key aos parâmetros
      params.key = this.apiKey;
      
      // Adiciona os parâmetros à URL
      Object.keys(params).forEach(key => {
        if (Array.isArray(params[key])) {
          url.searchParams.append(key, params[key].join('|'));
        } else {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer requisição para a API:', error);
      throw error;
    }
  }

  async getLocationCoordinates(locationName: string): Promise<LocationResponse> {
    const params = {
      query: locationName
    };
    
      const result = await this.makeRequest<LocationResponse>("location", params);
      if (result && result.location) {
        return { data: [result.location], status: result.status };
      } else {
        throw new Error("Localização não encontrada ou formato de resposta inválido.");
      }
  }

  async generateChart(chartData: ChartFormData): Promise<ChartResponse> {
    const {
      name,
      birthDate,
      birthTime,
      location,
      latitude,
      longitude
    } = chartData;

    // Converte a data para o formato esperado pela API
    const date = new Date(birthDate);
    const [hours, minutes] = birthTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));

    const params = {
      // Data no formato timestamp Unix
      date: Math.floor(date.getTime() / 1000),
      // Coordenadas geográficas
      lat: latitude,
      lng: longitude,
      // Planetas a serem incluídos no mapa
      planets: [
        'sun', 'moon', 'mercury', 'venus', 'mars', 
        'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
      ],
      // Casas astrológicas
      houses: ['placidus'],
      // Opções de exibição
      display: ['longitude', 'latitude', 'sign', 'house'],
      // Idioma
      language: 'pt'
    };

    return await this.makeRequest<ChartResponse>('chart', params);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Faz uma requisição simples para testar a API key
      const params = {
        location: 'São Paulo'
      };
      
      await this.makeRequest('location', params);
      return true;
    } catch (error) {
      console.error('API key inválida:', error);
      return false;
    }
  }
}

export default AstrologicoApiService;