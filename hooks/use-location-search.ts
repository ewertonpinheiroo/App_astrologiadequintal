import { useState, useEffect, useCallback, useRef } from 'react';

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  type: string;
  class: string;
}

export const useLocationSearch = () => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache para evitar requisições desnecessárias
  const cacheRef = useRef<Map<string, LocationSuggestion[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchLocations = useCallback(async (query: string): Promise<void> => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Verifica se já temos o resultado no cache
    const cached = cacheRef.current.get(query.toLowerCase());
    if (cached) {
      setSuggestions(cached);
      return;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cria novo AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        'accept-language': 'pt-BR,pt,en',
        // Filtrar apenas lugares habitados
        featureType: 'settlement'
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'User-Agent': 'AstrologiaDeQuintal/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status}`);
      }

      const data: LocationSuggestion[] = await response.json();
      
      // Filtra e formata os resultados
      const filteredResults = data
        .filter(item => {
          // Filtra apenas cidades, vilas, etc.
          return ['city', 'town', 'village', 'municipality'].includes(item.type) ||
                 ['place', 'boundary'].includes(item.class);
        })
        .slice(0, 5); // Limita a 5 resultados

      // Salva no cache
      cacheRef.current.set(query.toLowerCase(), filteredResults);
      
      // Limita o tamanho do cache
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setSuggestions(filteredResults);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Requisição foi cancelada, não é um erro
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na busca';
      setError(errorMessage);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para formatar o nome da localização
  const formatLocationName = useCallback((suggestion: LocationSuggestion): string => {
    const address = suggestion.address;
    if (!address) return suggestion.display_name;

    const city = address.city || address.town || address.village;
    const state = address.state;
    const country = address.country;

    const parts = [city, state, country].filter(Boolean);
    return parts.join(', ');
  }, []);

  // Função para obter coordenadas
  const getCoordinates = useCallback((suggestion: LocationSuggestion) => {
    return {
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    };
  }, []);

  // Limpa as sugestões
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchLocations,
    formatLocationName,
    getCoordinates,
    clearSuggestions
  };
};