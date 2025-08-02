'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Globe } from 'lucide-react';

interface DiagnosticProps {
  onTestComplete?: (results: any) => void;
}

export default function Diagnostic({ onTestComplete }: DiagnosticProps) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setTesting(true);
    setResults(null);

    const diagnosticResults = {
      apiKey: false,
      locationApi: false,
      chartApi: false,
      directApiCall: false,
      errors: [] as string[]
    };

    try {
      // Teste 1: Verificar se a API key está configurada
      console.log('Testing API key configuration...');
      const apiKeyResponse = await fetch('/api/location?query=test');
      if (apiKeyResponse.ok || apiKeyResponse.status === 400) {
        diagnosticResults.apiKey = true;
      } else {
        diagnosticResults.errors.push('API key não configurada ou inválida');
      }

      // Teste 2: Testar API de localização
      console.log('Testing location API...');
      const locationResponse = await fetch('/api/location?query=São Paulo');
      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        if (locationData.location) {
          diagnosticResults.locationApi = true;
        } else {
          diagnosticResults.errors.push('API de localização não retornou dados válidos');
        }
      } else {
        diagnosticResults.errors.push('Falha na API de localização');
      }

      // Teste 3: Testar API de mapa astral com dados de teste
      console.log('Testing chart API...');
      const testChartData = {
        date: 799162200, // 29/04/1995 13:30:00 UTC
        latitude: -23.5505,
        longitude: -46.6333,
        planets: ['SUN', 'MOON', 'MERCURY'],
        houses: ['equal'],
        display: ['longitude', 'sign', 'house'],
        language: 'pt'
      };

      const chartResponse = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testChartData)
      });

      if (chartResponse.ok) {
        const chartData = await chartResponse.json();
        if (chartData.data && chartData.data.planets) {
          const validPlanets = Object.keys(chartData.data.planets).filter(
            key => chartData.data.planets[key] && !('error' in chartData.data.planets[key])
          );
          if (validPlanets.length > 0) {
            diagnosticResults.chartApi = true;
          } else {
            diagnosticResults.errors.push('API de mapa astral não retornou planetas válidos');
          }
        } else {
          diagnosticResults.errors.push('API de mapa astral não retornou estrutura válida');
        }
      } else {
        const errorData = await chartResponse.json().catch(() => ({}));
        diagnosticResults.errors.push(`Falha na API de mapa astral: ${errorData.error || chartResponse.statusText}`);
      }

      // Teste 4: Testar chamada direta à API do Astrológico (se possível)
      console.log('Testing direct API call...');
      try {
        // Este teste só funcionará se CORS permitir
        const directUrl = `https://api.astrologico.org/v1/chart?date=799162200&lat=-23.5505&lng=-46.6333&planets=SUN&display=longitude&language=pt&key=test`;
        const directResponse = await fetch(directUrl);
        // Se chegou até aqui sem erro CORS, a API está acessível
        diagnosticResults.directApiCall = true;
      } catch (corsError) {
        diagnosticResults.errors.push('CORS impede chamada direta à API (normal em produção)');
      }

    } catch (error) {
      diagnosticResults.errors.push(`Erro geral no diagnóstico: ${error}`);
    }

    setResults(diagnosticResults);
    setTesting(false);
    
    if (onTestComplete) {
      onTestComplete(diagnosticResults);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "OK" : "FALHA"}
      </Badge>
    );
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Diagnóstico da API
        </CardTitle>
        <CardDescription>
          Execute testes para identificar problemas na configuração da API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runDiagnostic} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              Executando Diagnóstico...
            </div>
          ) : (
            'Executar Diagnóstico'
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.apiKey)}
                  <span>Configuração da API Key</span>
                </div>
                {getStatusBadge(results.apiKey)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.locationApi)}
                  <span>API de Localização</span>
                </div>
                {getStatusBadge(results.locationApi)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.chartApi)}
                  <span>API de Mapa Astral</span>
                </div>
                {getStatusBadge(results.chartApi)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.directApiCall)}
                  <span>Acesso Direto à API</span>
                </div>
                {getStatusBadge(results.directApiCall)}
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Erros Encontrados:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {results.errors.map((error: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Sugestões para Correção:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                {!results.apiKey && (
                  <li>• Verifique se a variável ASTROLOGICO_API_KEY está configurada no arquivo .env.local</li>
                )}
                {!results.locationApi && (
                  <li>• Confirme se a API key tem permissões para acessar a API de localização</li>
                )}
                {!results.chartApi && (
                  <li>• Verifique se a API key tem créditos suficientes para gerar mapas astrais</li>
                )}
                <li>• Consulte a documentação em https://br.astrologico.org para mais detalhes</li>
                <li>• Entre em contato com o suporte da API se os problemas persistirem</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
              <details>
                <summary className="cursor-pointer font-medium text-sm">
                  Ver dados completos do diagnóstico
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-40 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}