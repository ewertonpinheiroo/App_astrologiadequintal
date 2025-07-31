'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, MapPin, Calendar, Clock, Info, Star } from 'lucide-react';
import { ChartData } from '@/types/astrologico';
import { SIGN_NAMES, SIGN_SYMBOLS, formatDateTime } from '@/lib/chart-utils';

interface BirthChartDisplayProps {
  chartData: ChartData;
  onBack: () => void;
}

export function BirthChartDisplay({ chartData, onBack }: BirthChartDisplayProps) {
  const birthDate = new Date(chartData.timestamp);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      {/* Header Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mapa Astral de {chartData.birthData.fullName}
          </CardTitle>
          <CardDescription className="text-lg">
            Posições planetárias e informações astrológicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Data e Hora</span>
              </div>
              <p className="font-semibold">{formatDateTime(birthDate)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Local</span>
              </div>
              <p className="font-semibold">
                {chartData.location.city}, {chartData.location.country}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Fuso Horário</span>
              </div>
              <p className="font-semibold">{chartData.location.timezone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Planets Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              Posições Planetárias
            </CardTitle>
            <CardDescription>
              Localização dos planetas no momento do nascimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(chartData.planets).map(([planetKey, planet]) => (
                <div
                  key={planetKey}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {planet.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{planet.name}</p>
                      <p className="text-sm text-muted-foreground">Casa {planet.house}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {planet.degree}°{planet.minute.toString().padStart(2, '0')}'
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <span>{SIGN_SYMBOLS[planet.sign] || '♈'}</span>
                        <span>{SIGN_NAMES[planet.sign] || 'Áries'}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Houses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Casas Astrológicas
            </CardTitle>
            <CardDescription>
              Cúspides das casas astrológicas (Sistema Placidus)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(chartData.houses)
                .sort(([, a], [, b]) => a.house - b.house)
                .map(([houseKey, house]) => (
                  <div
                    key={houseKey}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {house.house}
                      </div>
                      <div>
                        <p className="font-semibold">Casa {house.house}</p>
                        <p className="text-sm text-muted-foreground">Cúspide</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {house.degree}°{house.minute.toString().padStart(2, '0')}'
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <span>{SIGN_SYMBOLS[house.sign] || '♈'}</span>
                          <span>{SIGN_NAMES[house.sign] || 'Áries'}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Aviso:</strong> Este mapa astral apresenta apenas as posições básicas dos planetas e casas astrológicas. 
          Para uma interpretação completa e personalizada, consulte um astrólogo profissional qualificado.
        </AlertDescription>
      </Alert>
    </div>
  );
}