import { ChartFormData, LocationApiResponse, ChartResponse, ChartData } from '@/types/astrologico';

// URL do servidor proxy em produção
const PROXY_BASE_URL = process.env.NEXT_PUBLIC_PROXY_BASE_URL || 'https://y0h0i3cq0kdl.manus.space/api/astrologico';

class AstrologicoApiService {
  constructor( ) {
    // A chave da API agora fica no servidor, não no frontend
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${PROXY_BASE_URL}/${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Erro na API: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer requisição para o proxy:', error);
      throw error;
    }
  }

  async getLocationCoordinates(locationName: string): Promise<LocationApiResponse> {
    const params = new URLSearchParams({
      query: locationName
    });
    
    const result = await this.makeRequest<LocationApiResponse>(`location?${params.toString()}`);
    
    if (!result || !result.location) {
      throw new Error('Localização não encontrada ou formato de resposta inválido.');
    }
    
    return result;
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

    const requestData = {
      // Data no formato timestamp Unix
      date: Math.floor(date.getTime() / 1000),
      // Coordenadas geográficas
      lat: latitude,
      lng: longitude,
      // Planetas a serem incluídos no mapa
      planets: 'sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto',
      // Casas astrológicas
      houses: 'placidus',
      // Opções de exibição
      display: 'longitude|latitude|sign|house',
      // Idioma
      language: 'pt'
    };

    return await this.makeRequest<ChartResponse>('chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const result = await this.makeRequest<{ valid: boolean }>('validate-key');
      return result.valid;
    } catch (error) {
      console.error('Erro ao validar API key:', error);
      return false;
    }
  }
}

export default AstrologicoApiService;
