'use client';

import { useState } from 'react';
import { BirthData, ChartData, LocationData } from '@/types/astrology';
import { getLocationCoordinates, generateBirthChart, AstrologyApiError } from '@/lib/astrology-api';
import { PLANET_NAMES, formatDegreeMinute, getSignFromLongitude } from '@/lib/chart-utils';

export function useBirthChart() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const generateChart = async (birthData: BirthData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get location coordinates
      const locationQuery = `${birthData.city}, ${birthData.country}`;
      const locationData = await getLocationCoordinates(locationQuery);

      // Create birth date/time
      const birthDateTime = new Date(`${birthData.dateOfBirth}T${birthData.timeOfBirth}`);
      
      // Generate chart
      const chartResponse = await generateBirthChart(
        birthDateTime,
        locationData.lat,
        locationData.lng
      );

      // Process chart data
      const processedChartData: ChartData = {
        planets: {},
        houses: {},
        location: locationData,
        birthData,
        timestamp: birthDateTime.getTime(),
      };

      // Process planets
      if (chartResponse.planets) {
        Object.entries(chartResponse.planets).forEach(([planetKey, planetData]: [string, any]) => {
          const { degree, minute } = formatDegreeMinute(planetData.longitude);
          processedChartData.planets[planetKey] = {
            name: PLANET_NAMES[planetKey] || planetKey,
            longitude: planetData.longitude,
            latitude: planetData.latitude || 0,
            sign: getSignFromLongitude(planetData.longitude),
            house: planetData.house || 1,
            degree,
            minute,
          };
        });
      }

      // Process houses
      if (chartResponse.houses) {
        Object.entries(chartResponse.houses).forEach(([houseKey, houseData]: [string, any]) => {
          const { degree, minute } = formatDegreeMinute(houseData.longitude);
          processedChartData.houses[houseKey] = {
            house: parseInt(houseKey.replace('house', '')),
            longitude: houseData.longitude,
            sign: getSignFromLongitude(houseData.longitude),
            degree,
            minute,
          };
        });
      }

      setChartData(processedChartData);
    } catch (err) {
      if (err instanceof AstrologyApiError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetChart = () => {
    setChartData(null);
    setError(null);
  };

  return {
    isLoading,
    error,
    chartData,
    generateChart,
    resetChart,
  };
}