// components/chart-display.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Sun, Moon, Globe, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { ChartResponse, ChartDisplayProps } from '@/types/astrologico';
import { getAstrologicalSign, getPlanetNameInPortuguese, formatDateTime } from '@/lib/utils';

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
  const metadata = data.metadata || {};

  console.log('Planets data:', planets);
  console.log('Houses data:', houses);
  console.log('Metadata:', metadata);

  // Função para obter o ícone do planeta
  const getPlanetIcon = (planetName: string) => {
    const lowerName = planetName.toLowerCase();
    switch (lowerName) {
      case 'sun':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'moon':
        return <Moon className="w-5 h-5 text-blue-300" />;
      case 'mercury':
        return <Globe className="w-5 h-5 text-gray-500" />;
      case 'venus':
        return <Star className="w-5 h-5 text-pink-500" />;
      case 'mars':
        return <Star className="w-5 h-5 text-red-500" />;
      case 'jupiter':
        return <Star className="w-5 h-5 text-orange-500" />;
      case 'saturn':
        return <Star className="w-5 h-5 text-yellow-700" />;
      case 'uranus':
        return <Star className="w-5 h-5 text-cyan-500" />;
      case 'neptune':
        return <Star className="w-5 h-5 text-blue-600" />;
      case 'pluto':
        return <Star className="w-5 h-5 text-purple-600" />;
      default:
        return <Star className="w-5 h-5 text-purple-500" />;
    }
  };

  // Refined error checking: Only flag errors if planets have explicit 'error' fields
  const hasErrors = Object.values(planets).some(planet =>
    planet && typeof planet === 'object' && 'error' in planet && typeof (planet as any).error === 'string'
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mapa Astral de {userName}
          </CardTitle>
          <CardDescription className="text-lg">
            {hasErrors ? 'Erro ao gerar o mapa astral' : 'Seu mapa astral personalizado foi gerado com sucesso'}
            {!houses || Object.keys(houses).length === 0 ? ' (sem dados de casas astrológicas)' : ''}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerta de erro principal */}
      {hasErrors && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-4">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Problema na geração do mapa astral</h3>
            </div>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
              <p>A API retornou erros para alguns planetas. Possíveis causas:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Data incorreta:</strong> Verifique se o timestamp está correto</li>
                <li><strong>Localização inválida:</strong> Coordenadas podem estar incorretas</li>
                <li><strong>Parâmetros da API:</strong> Podem estar faltando parâmetros obrigatórios</li>
                <li><strong>Formato da requisição:</strong> A API pode estar esperando um formato diferente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Debug Expandido */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-blue-800 dark:text-blue-200">
              Informações de Debug (clique para expandir)
            </summary>
            <div className="mt-4 space-y-4 text-xs text-blue-700 dark:text-blue-300">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                <h4 className="font-semibold mb-2">Status da API:</h4>
                <p><strong>Status:</strong> {chartData.status || 'N/A'}</p>
                <p><strong>Custo:</strong> {chartData.cost || 'N/A'} créditos</p>
              </div>
              {metadata && Object.keys(metadata).length > 0 && (
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                  <h4 className="font-semibold mb-2">Metadados:</h4>
                  {metadata.location && (
                    <p><strong>Localização API:</strong> Lat: {metadata.location.latitude}, Lng: {metadata.location.longitude}</p>
                  )}
                  {metadata.date && (
                    <div>
                      <p><strong>Data processada:</strong> {metadata.date.ISO}</p>
                      <p><strong>Timestamp UNIX:</strong> {metadata.date.UNIX}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                <h4 className="font-semibold mb-2">Dados recebidos:</h4>
                <p><strong>Planetas encontrados:</strong> {Object.keys(planets).length}</p>
                <p><strong>Casas encontradas:</strong> {Object.keys(houses).length}</p>
                <p><strong>Planetas com erro:</strong> {Object.values(planets).filter(p => p && typeof p === 'object' && 'error' in p).length}</p>
              </div>
              <details className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                <summary className="cursor-pointer font-semibold">Ver dados completos da API</summary>
                <pre className="mt-2 p-2 bg-blue-200 dark:bg-blue-800 rounded overflow-auto max-h-60 text-xs">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
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
                
                if ('error' in planetData && typeof (planetData as any).error === 'string') {
                  return (
                    <div key={planetKey} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                      <div className="flex items-center gap-3 mb-2">
                        {getPlanetIcon(planetKey)}
                        <h3 className="font-semibold text-red-800">{getPlanetNameInPortuguese(planetKey.toLowerCase())}</h3>
                      </div>
                      <p className="text-red-600 text-sm">
                        <strong>Erro:</strong> {(planetData as any).error}
                      </p>
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
                const planetName = getPlanetNameInPortuguese(planetKey.toLowerCase());
                
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

      {/* Sugestões para correção */}
      {hasErrors && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-5 h-5" />
              Sugestões para correção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-3">
              <div>
                <h4 className="font-semibold">1. Verificar parâmetros da API:</h4>
                <p>Adicione o parâmetro <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">houses=equal</code> na requisição</p>
              </div>
              <div>
                <h4 className="font-semibold">2. Formato da data:</h4>
                <p>Verifique se o timestamp está no formato correto (UNIX timestamp em segundos)</p>
              </div>
              <div>
                <h4 className="font-semibold">3. Coordenadas:</h4>
                <p>Confirme se latitude e longitude estão corretas para Manaus</p>
              </div>
              <div>
                <h4 className="font-semibold">4. Exemplo de URL correta:</h4>
                <code className="block bg-yellow-200 dark:bg-yellow-800 p-2 rounded text-xs mt-1">
                  https://api.astrologico.org/v1/chart?date=799162200&lat=-3.1316333&lng=-59.9825041&planets=SUN|MOON|MERCURY&houses=equal&display=longitude|sign|house&language=pt&key=YOUR_KEY
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {data.location && (
              <p><strong>Localização:</strong> {data.location.name || 'Não especificada'}</p>
            )}
            {metadata.location && (
              <p><strong>Coordenadas processadas:</strong> {metadata.location.latitude}°, {metadata.location.longitude}°</p>
            )}
            {data.date && (
              <p><strong>Data/Hora:</strong> {formatDateTime(data.date)}</p>
            )}
            {metadata.date && (
              <p><strong>Data processada pela API:</strong> {metadata.date.ISO}</p>
            )}
            {data.timezone && (
              <p><strong>Fuso Horário:</strong> {data.timezone}</p>
            )}
            <p><strong>Custo da consulta:</strong> {chartData.cost || 'N/A'} créditos</p>
          </div>
        </CardContent>
      </Card>

      {/* Nota sobre interpretação */}
      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
        <CardContent className="pt-6">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>Nota:</strong> Este mapa astral apresenta as posições planetárias básicas. 
            Para uma interpretação completa e personalizada, recomendamos consultar um astrólogo profissional.
            {hasErrors && ' Corrija os erros acima para visualizar os dados do seu mapa astral.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}