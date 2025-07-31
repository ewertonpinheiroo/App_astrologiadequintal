import { useState, useCallback } from 'react';
import AstrologicoApiService from '@/lib/astrologico-api';
import { ChartFormData, ChartResponse, LocationApiResponse } from '@/types/astrologico';

export const useAstrologico = (apiKey?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);

  const apiService = new AstrologicoApiService(apiKey);

  const getLocationCoordinates = useCallback(async (locationName: string): Promise<LocationApiResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getLocationCoordinates(locationName);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const generateChart = useCallback(async (formData: ChartFormData): Promise<ChartResponse | null> => {
    setLoading(true);
    setError(null);
    setChartData(null);

    try {
      let finalLatitude = formData.latitude;
      let finalLongitude = formData.longitude;

      // Se a localização foi fornecida e as coordenadas não, tenta buscar
      if (formData.location && (finalLatitude === undefined || finalLongitude === undefined)) {
        const locationResult = await apiService.getLocationCoordinates(formData.location);
        if (locationResult && locationResult.location) {
          finalLatitude = locationResult.location.lat;
          finalLongitude = locationResult.location.lng;
        } else {
          throw new Error('Localização não encontrada ou formato de resposta inválido.');
        }
      }

      // Verifica se as coordenadas finais são válidas
      if (finalLatitude === undefined || finalLongitude === undefined) {
        throw new Error('Coordenadas de latitude e longitude são necessárias.');
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

      // Gera o mapa astral
      const result = await apiService.generateChart(chartRequestData);
      setChartData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
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