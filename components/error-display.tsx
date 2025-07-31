'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onClear?: () => void;
}

export default function ErrorDisplay({ error, onRetry, onClear }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro ao gerar mapa astral</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{error}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
          {onClear && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
            >
              Fechar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}