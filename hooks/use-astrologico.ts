// hooks/use-astrologico.ts - Versão com validação robusta de coordenadas

import { useState, useCallback } from 'react';
import AstrologicoApiService from '@/lib/astrologico-api';
import { ChartFormData, ChartResponse, LocationApiResponse } from '@/types/astrologico';

export const useAstrologico = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);

  // O serviço da API continua o mesmo, pois a lógica é no hook.
  const apiService = new AstrologicoApiService();

  const generateChart = useCallback(async (formData: ChartFormData): Promise<ChartResponse | null> => {
    console.log('generateChart chamado com os dados do formulário:', formData);
    
    setLoading(true);
    setError(null);
    setChartData(null);

    try {
      let finalLatitude = formData.latitude;
      let finalLongitude = formData.longitude;

      console.log('Coordenadas iniciais do formulário:', { finalLatitude, finalLongitude });

      // SOLUÇÃO: Lógica de validação e fallback para busca de coordenadas.
      // Se as coordenadas não vieram do formulário, mas um nome de local foi digitado,
      // tentamos buscar as coordenadas agora.
      if ((finalLatitude === undefined || finalLongitude === undefined) && formData.location) {
        console.warn('Coordenadas ausentes. Tentando buscar pela localização:', formData.location);
        
        // Usaremos a API interna de localização para buscar as coordenadas.
        // Isso mantém a lógica de API centralizada.
        const locationResult = await apiService.getLocationCoordinates(formData.location);
        
        if (locationResult && locationResult.location) {
          finalLatitude = locationResult.location.lat;
          finalLongitude = locationResult.location.lng;
          console.log('Coordenadas obtidas com sucesso via API de localização:', { finalLatitude, finalLongitude });
        } else {
          // Se mesmo assim não encontrarmos, o erro é inevitável.
          throw new Error('Não foi possível encontrar a localização. Por favor, digite novamente e selecione uma opção da lista de sugestões para garantir a precisão.');
        }
      }

      // SOLUÇÃO: Verificação final e definitiva das coordenadas.
      // Se após todas as tentativas, as coordenadas ainda são inválidas, paramos a execução.
      if (typeof finalLatitude !== 'number' || typeof finalLongitude !== 'number') {
        console.error('Coordenadas finais inválidas:', { finalLatitude, finalLongitude });
        throw new Error('Uma localização geográfica válida é necessária. Por favor, selecione um local da lista de sugestões.');
      }

      // Prepara os dados para a requisição do mapa astral com coordenadas garantidas.
      const chartRequestData: ChartFormData = {
        ...formData,
        latitude: finalLatitude,
        longitude: finalLongitude
      };

      console.log('Enviando requisição para gerar o mapa com dados validados:', chartRequestData);

      // A lógica de tentativa e erro da API (padrão e alternativas) é mantida.
      let result: ChartResponse | null = null;
      try {
        result = await apiService.generateChart(chartRequestData);
        
        if (result && result.data && result.data.planets) {
          const validPlanets = Object.values(result.data.planets).filter(p => p && !('error' in p));
          if (validPlanets.length === 0) {
            console.log('Resposta padrão sem planetas válidos, tentando alternativas...');
            result = await apiService.generateChartWithAlternatives(chartRequestData);
          }
        }
      } catch (standardError) {
        console.error('Método padrão falhou, tentando alternativas:', standardError);
        result = await apiService.generateChartWithAlternatives(chartRequestData);
      }

      if (!result) {
        throw new Error('Não foi possível gerar o mapa astral com os métodos disponíveis.');
      }

      if (!result.data || !result.data.planets || Object.keys(result.data.planets).length === 0) {
        throw new Error('A resposta da API não contém dados de planetas válidos. Verifique os dados de nascimento e tente novamente.');
      }

      console.log('Mapa astral gerado com sucesso.');
      setChartData(result);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      console.error('Erro final na geração do mapa:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService]); // Adicionado apiService ao array de dependências do useCallback

  // As outras funções do hook (getLocationCoordinates, validateApiKey, etc.) permanecem inalteradas.
  // ...

  return {
    loading,
    error,
    chartData,
    generateChart,
    clearError: () => setError(null),
    clearChartData: () => setChartData(null)
  };
};
