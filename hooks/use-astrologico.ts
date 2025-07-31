import { useState, useCallback } from 'react';
import AstrologicoApiService from '@/lib/astrologico-api';
import { ChartFormData, ChartResponse, LocationResponse } from '@/types/astrologico';

export const useAstrologico = (apiKey?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);

  const apiService = new AstrologicoApiService(apiKey);

  const getLocationCoordinates = useCallback(async (locationName: string): Promise<LocationResponse | null> => {
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
      // Primeiro, busca as coordenadas da localização se necessário
      let coordinates = null;
      if (formData.location && (!formData.latitude || !formData.longitude)) {
        const locationResult = await apiService.getLocationCoordinates(formData.location);
        if (locationResult && locationResult.data && locationResult.data.length > 0) {
          coordinates = locationResult.data[0];
        } else {
          throw new Error('Localização não encontrada');
        }
      }

      // Prepara os dados para o mapa astral
      const chartRequestData: ChartFormData = {
        name: formData.name,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        location: formData.location,
        latitude: coordinates ? coordinates.lat : formData.latitude,
        longitude: coordinates ? coordinates.lng : formData.longitude
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