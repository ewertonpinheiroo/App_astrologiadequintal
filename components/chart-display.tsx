'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Sun, Moon, Globe } from 'lucide-react';
import { ChartResponse } from '@/types/astrologico';
import { getAstrologicalSign, getPlanetNameInPortuguese, formatDateTime } from '@/lib/utils';

interface ChartDisplayProps {
  chartData: ChartResponse;
  userName: string;
}

export default function ChartDisplay({ chartData, userName }: ChartDisplayProps) {
  if (!chartData || !chartData.data) {
    return null;
  }

  const { data } = chartData;
  const planets = data.planets || {};
  const houses = data.houses || {};

  // Função para obter o ícone do planeta
  const getPlanetIcon = (planetName: string) => {
    switch (planetName.toLowerCase()) {
      case 'sun':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'moon':
        return <Moon className="w-5 h-5 text-blue-300" />;
      default:
        return <Star className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mapa Astral de {userName}
          </CardTitle>
          <CardDescription className="text-lg">
            Seu mapa astral personalizado foi gerado com sucesso
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Informações dos Planetas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Posições Planetárias
          </CardTitle>
          <CardDescription>
            As posições dos planetas no momento do seu nascimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(planets).map(([planetKey, planetData]) => {
              if (!planetData || typeof planetData.longitude !== 'number') return null;
              
              const signInfo = getAstrologicalSign(planetData.longitude);
              const planetName = getPlanetNameInPortuguese(planetKey);
              
              return (
                <div key={planetKey} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getPlanetIcon(planetKey)}
                    <div>
                      <h3 className="font-semibold">{planetName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {signInfo.degree}°{signInfo.minute}' em {signInfo.sign}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {signInfo.sign}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informações das Casas (se disponível) */}
      {Object.keys(houses).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Casas Astrológicas</CardTitle>
            <CardDescription>
              As divisões do céu no momento do seu nascimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(houses).slice(0, 12).map(([houseKey, houseData], index) => {
                if (!houseData || typeof houseData.longitude !== 'number') return null;
                
                const signInfo = getAstrologicalSign(houseData.longitude);
                
                return (
                  <div key={houseKey} className="p-3 border rounded-lg text-center">
                    <h4 className="font-semibold">Casa {index + 1}</h4>
                    <p className="text-sm text-muted-foreground">
                      {signInfo.degree}° em {signInfo.sign}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {data.location && (
              <p><strong>Localização:</strong> {data.location.name || 'Não especificada'}</p>
            )}
            {data.date && (
              <p><strong>Data/Hora:</strong> {formatDateTime(data.date)}</p>
            )}
            {data.timezone && (
              <p><strong>Fuso Horário:</strong> {data.timezone}</p>
            )}
            <p><strong>Custo da consulta:</strong> {chartData.cost} créditos</p>
          </div>
        </CardContent>
      </Card>

      {/* Nota sobre interpretação */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Nota:</strong> Este mapa astral apresenta as posições planetárias básicas. 
            Para uma interpretação completa e personalizada, recomendamos consultar um astrólogo profissional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}