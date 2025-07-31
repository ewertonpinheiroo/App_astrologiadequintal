'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Calendar, Clock, MapPin, Star } from 'lucide-react';
import { BirthData } from '@/types/astrologico';

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  isLoading: boolean;
  error?: string | null;
}

export function BirthDataForm({ onSubmit, isLoading, error }: BirthDataFormProps) {
  const [formData, setFormData] = useState<BirthData>({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    city: '',
    country: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<BirthData>>({});

  const handleInputChange = (field: keyof BirthData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<BirthData> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Data de nascimento é obrigatória';
    }

    if (!formData.timeOfBirth) {
      errors.timeOfBirth = 'Horário de nascimento é obrigatório';
    }

    if (!formData.city.trim()) {
      errors.city = 'Cidade é obrigatória';
    }

    if (!formData.country.trim()) {
      errors.country = 'País é obrigatório';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <Star className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Gerador de Mapa Astral
        </CardTitle>
        <CardDescription className="text-lg">
          Insira seus dados de nascimento para gerar seu mapa astral personalizado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome completo"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={validationErrors.fullName ? 'border-red-500' : ''}
            />
            {validationErrors.fullName && (
              <p className="text-sm text-red-500">{validationErrors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Nascimento
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={validationErrors.dateOfBirth ? 'border-red-500' : ''}
              />
              {validationErrors.dateOfBirth && (
                <p className="text-sm text-red-500">{validationErrors.dateOfBirth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeOfBirth" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário de Nascimento
              </Label>
              <Input
                id="timeOfBirth"
                type="time"
                value={formData.timeOfBirth}
                onChange={(e) => handleInputChange('timeOfBirth', e.target.value)}
                className={validationErrors.timeOfBirth ? 'border-red-500' : ''}
              />
              {validationErrors.timeOfBirth && (
                <p className="text-sm text-red-500">{validationErrors.timeOfBirth}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Cidade
              </Label>
              <Input
                id="city"
                type="text"
                placeholder="Cidade de nascimento"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={validationErrors.city ? 'border-red-500' : ''}
              />
              {validationErrors.city && (
                <p className="text-sm text-red-500">{validationErrors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                País
              </Label>
              <Input
                id="country"
                type="text"
                placeholder="País de nascimento"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={validationErrors.country ? 'border-red-500' : ''}
              />
              {validationErrors.country && (
                <p className="text-sm text-red-500">{validationErrors.country}</p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Mapa Astral...
              </>
            ) : (
              'Gerar Mapa Astral'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}