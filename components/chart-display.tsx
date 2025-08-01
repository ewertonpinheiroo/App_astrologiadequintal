'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Sun, Moon, Globe, AlertCircle } from 'lucide-react';
import { ChartResponse } from '@/types/astrologico';
import { getAstrologicalSign, getPlanetNameInPortuguese, formatDateTime } from '@/lib/utils';

interface ChartDisplayProps {
  chartData: ChartResponse;
  userName: string;
}

export default function ChartDisplay({ chartData, userName }: ChartDisplayProps) {
  console.log('ChartDisplay received data:', chartData);

  if (!chartData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <p>Nenhum dado de mapa astral foi recebido.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData.data) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <p>Dados do mapa astral estão incompletos.</p>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500">
              Ver dados recebidos (debug)
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
              {JSON.stringify(chartData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    );
  }

  const { data } = chartData;
  const planets = data.planets || {};
  const houses = data.houses || {};

  console.log('Planets data:', planets);
  console.log('Houses data:', houses);

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

      {/* Debug Info */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-blue-800 dark:text-blue-200">
              Informações de Debug (clique para expandir)
            </summary>
            <div className="mt-2 space-y-2 text-xs text-blue-700 dark:text-blue-300">
              <p><strong>Planetas encontrados:</strong> {Object.keys(planets).length}</p>
              <p><strong>Casas encontradas:</strong> {Object.keys(houses).length}</p>
              <p><strong>Status da resposta:</strong> {chartData.status || 'N/A'}</p>
              <p><strong>Custo:</strong> {chartData.cost || 'N/A'} créditos</p>
              <pre className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded overflow-auto max-h-40">
                {JSON.stringify({ planets: Object.keys(planets), houses: Object.keys(houses) }, null, 2)}
              </pre>
            </div>
          </details>
        </CardContent>
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
          {Object.keys(planets).length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-600">Nenhum planeta foi encontrado nos dados recebidos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(planets).map(([planetKey, planetData]) => {
                console.log(`Processing planet ${planetKey}:`, planetData);
                
                if (!planetData) {
                  return (
                    <div key={planetKey} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                      <p className="text-red-600">Dados ausentes para {planetKey}</p>
                    </div>
                  );
                }
                
                if (typeof planetData.longitude !== 'number') {
                  return (
                    <div key={planetKey} className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950">
                      <p className="text-amber-600">
                        Longitude inválida para {planetKey}: {JSON.stringify(planetData.longitude)}
                      </p>
                    </div>
                  );
                }
                
                const signInfo = getAstrologicalSign(planetData.longitude);
                const planetName = getPlanetNameInPortuguese(planetKey);
                
                return (
                  <div key={planetKey} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getPlanetIcon(planetKey)}
                      <div>
                        <h3 className="font-semibold">{planetName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {signInfo.degree}°{signInfo.minute}&apos; em {signInfo.sign}
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
          )}
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
                if (!houseData || typeof houseData.longitude !== 'number') {
                  return (
                    <div key={houseKey} className="p-3 border rounded-lg text-center bg-amber-50 dark:bg-amber-950">
                      <h4 className="font-semibold">Casa {index + 1}</h4>
                      <p className="text-xs text-amber-600">Dados inválidos</p>
                    </div>
                  );
                }
                
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
            <p><strong>Custo da consulta:</strong> {chartData.cost || 'N/A'} créditos</p>
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