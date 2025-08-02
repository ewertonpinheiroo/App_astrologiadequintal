// hooks/use-astrologico.ts - Versão melhorada com tentativas alternativas
import { useState, useCallback } from 'react';
import AstrologicoApiService from '@/lib/astrologico-api';
import { ChartFormData, ChartResponse, LocationApiResponse } from '@/types/astrologico';

export const useAstrologico = (apiKey?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);

  const apiService = new AstrologicoApiService();

  const getLocationCoordinates = useCallback(async (locationName: string): Promise<LocationApiResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getLocationCoordinates(locationName);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Location error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const generateChart = useCallback(async (formData: ChartFormData): Promise<ChartResponse | null> => {
    console.log('generateChart called with:', formData);
    
    setLoading(true);
    setError(null);
    setChartData(null);

    try {
      let finalLatitude = formData.latitude;
      let finalLongitude = formData.longitude;

      console.log('Initial coordinates:', { finalLatitude, finalLongitude });

      // Se as coordenadas não foram fornecidas (fallback para o método antigo)
      if (formData.location && (finalLatitude === undefined || finalLongitude === undefined)) {
        console.log('Fetching coordinates for location:', formData.location);
        const locationResult = await apiService.getLocationCoordinates(formData.location);
        if (locationResult && locationResult.location) {
          finalLatitude = locationResult.location.lat;
          finalLongitude = locationResult.location.lng;
          console.log('Got coordinates from location API:', { finalLatitude, finalLongitude });
        } else {
          throw new Error('Localização não encontrada. Por favor, selecione uma localização válida da lista de sugestões.');
        }
      }

      // Verifica se as coordenadas finais são válidas
      if (finalLatitude === undefined || finalLongitude === undefined) {
        console.error('Missing coordinates:', { finalLatitude, finalLongitude });
        throw new Error('Coordenadas de latitude e longitude são necessárias. Por favor, selecione uma localização da lista de sugestões.');
      }

      // Prepara os dados para o mapa astral
      const chartRequestData: ChartFormData = {
        name: formData.name,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        location: formData.location,
        latitude: finalLatitude,
        longitude: finalLongitude
      };

      console.log('Sending chart request with:', chartRequestData);

      // MELHORIA: Primeiro tentar o método padrão
      let result: ChartResponse | null = null;
      
      try {
        result = await apiService.generateChart(chartRequestData);
        
        // Verificar se o resultado tem planetas válidos
        if (result && result.data && result.data.planets) {
          const validPlanets = Object.keys(result.data.planets).filter(
            key => result!.data.planets[key] && !('error' in result!.data.planets[key])
          );
          
          if (validPlanets.length === 0) {
            console.log('No valid planets in standard response, trying alternatives...');
            // Se não há planetas válidos, tentar métodos alternativos
            result = await apiService.generateChartWithAlternatives(chartRequestData);
          }
        }
      } catch (standardError) {
        console.log('Standard method failed, trying alternatives:', standardError);
        // Se o método padrão falhar, tentar alternativas
        result = await apiService.generateChartWithAlternatives(chartRequestData);
      }

      if (!result) {
        throw new Error('Não foi possível gerar o mapa astral com nenhum dos métodos disponíveis.');
      }

      // Verificação final
      if (!result.data || !result.data.planets) {
        throw new Error('Resposta da API não contém dados de planetas válidos.');
      }

      const validPlanets = Object.keys(result.data.planets).filter(
        key => result.data.planets[key] && !('error' in result.data.planets[key])
      );

      if (validPlanets.length === 0) {
        throw new Error('Nenhum planeta válido foi retornado pela API. Verifique os dados fornecidos.');
      }

      console.log('Chart generated successfully with', validPlanets.length, 'valid planets');
      setChartData(result);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Chart generation error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const validateApiKey = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const isValid = await apiService.validateApiKey();
      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  return {
    loading,
    error,
    chartData,
    getLocationCoordinates,
    generateChart,
    validateApiKey,
    clearError: () => setError(null),
    clearChartData: () => setChartData(null)
  };
};