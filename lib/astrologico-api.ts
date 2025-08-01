// lib/astrologico-api.ts - Versão atualizada para usar rotas internas
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

    // Converte a data para o formato esperado pela API
    const date = new Date(birthDate);
    const [hours, minutes] = birthTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));

    const requestBody = {
      // Data no formato timestamp Unix
      date: Math.floor(date.getTime() / 1000),
      // Coordenadas geográficas
      latitude: latitude,
      longitude: longitude,
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

    return await this.makeRequest<ChartResponse>('/chart', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
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