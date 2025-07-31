'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Stars } from 'lucide-react';
import ChartForm from '@/components/chart-form';
import ChartDisplay from '@/components/chart-display';
import ErrorDisplay from '@/components/error-display';
import { useAstrologico } from '@/hooks/use-astrologico';
import { ChartFormData } from '@/types/astrologico';

export default function Home() {
  const [currentUser, setCurrentUser] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { 
    loading, 
    error, 
    chartData, 
    generateChart, 
    clearError, 
    clearChartData 
  } = useAstrologico();

  const handleFormSubmit = async (formData: ChartFormData) => {
    setCurrentUser(formData.name);
    const result = await generateChart(formData);
    if (result) {
      setShowResults(true);
    }
  };

  const handleBackToForm = () => {
    setShowResults(false);
    clearChartData();
    clearError();
  };

  const handleRetry = () => {
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-purple-100 dark:border-purple-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stars className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mapa Astral
              </h1>
            </div>
            {showResults && (
              <Button 
                variant="outline" 
                onClick={handleBackToForm}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Novo Mapa
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {!showResults && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Descubra Seu Mapa Astral
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore as posições planetárias no momento do seu nascimento e descubra 
              insights únicos sobre sua personalidade e destino.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8">
            <ErrorDisplay 
              error={error} 
              onRetry={handleRetry}
              onClear={clearError}
            />
          </div>
        )}

        {/* Form or Results */}
        {!showResults ? (
          <ChartForm 
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        ) : chartData && (
          <ChartDisplay 
            chartData={chartData}
            userName={currentUser}
          />
        )}

        {/* Features Section (only show when not displaying results) */}
        {!showResults && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stars className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Precisão Astronômica</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Cálculos baseados em dados astronômicos precisos para resultados confiáveis.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stars className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fácil de Usar</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Interface intuitiva que torna a astrologia acessível para todos.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stars className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Resultados Instantâneos</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gere seu mapa astral completo em segundos com nossa tecnologia avançada.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-purple-100 dark:border-purple-800 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Powered by{' '}
            <a 
              href="https://br.astrologico.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Astrológico API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}