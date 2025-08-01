// hooks/use-astrologico.ts - Versão com debug melhorado
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

      // Gera o mapa astral
      const result = await apiService.generateChart(chartRequestData);
      console.log('Chart generated successfully');
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