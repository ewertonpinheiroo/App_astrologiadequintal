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
    // Fundo principal com a cor dourada #f6d594
    <div className="min-h-screen bg-background text-foreground font-serif">
      {/* Header com fundo de card e borda marrom */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Ícone e texto com a cor marrom #462209 */}
              <Stars className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">
                Astrologia de Quintal
              </h1>
            </div>
            {showResults && (
              <Button 
                variant="outline" 
                onClick={handleBackToForm}
                className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Novo Mapa
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Seção Hero */}
        {!showResults && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-primary">
              Descubra Seu Mapa Astral
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore as posições planetárias no momento do seu nascimento e descubra 
              insights únicos sobre sua personalidade e destino.
            </p>
          </div>
        )}

        {/* Display de Erro */}
        {error && (
          <div className="mb-8">
            <ErrorDisplay 
              error={error} 
              onRetry={handleRetry}
              onClear={clearError}
            />
          </div>
        )}

        {/* Formulário ou Resultados */}
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

        {/* Seção de Features */}
        {!showResults && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Cards com fundo mais claro e borda marrom */}
            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stars className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Precisão Astronômica</h3>
              <p className="text-muted-foreground">
                Cálculos baseados em dados astronômicos precisos para resultados confiáveis.
              </p>
            </div>
            
            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stars className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Fácil de Usar</h3>
              <p className="text-muted-foreground">
                Interface intuitiva que torna a astrologia acessível para todos.
              </p>
            </div>
            
            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stars className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Resultados Instantâneos</h3>
              <p className="text-muted-foreground">
                Gere seu mapa astral completo em segundos com nossa tecnologia avançada.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            Powered by{' '}
            <a 
              href="https://agriculturaceleste.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              Astrologia de Quintal
            </a>
          </p>
        </div>
      </footer>
    </div>
   );
}
