'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Loader2 } from 'lucide-react';
import { ChartFormData } from '@/types/astrologico';
import LocationAutocomplete from '@/components/location-autocomplete';

interface ChartFormProps {
  onSubmit: (data: ChartFormData) => void;
  loading: boolean;
}

export default function ChartForm({ onSubmit, loading }: ChartFormProps) {
  const [formData, setFormData] = useState<ChartFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    location: '',
    latitude: undefined,
    longitude: undefined
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (location: string, coordinates?: { latitude: number; longitude: number }) => {
    setFormData(prev => ({
      ...prev,
      location,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthDate || !formData.birthTime || !formData.location) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert('Por favor, selecione uma localização válida da lista de sugestões.');
      return;
    }

    onSubmit(formData);
  };

  return (
    // O Card já herda os estilos corretos de bg-card e text-card-foreground
    <Card className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border">
      <CardHeader className="text-center">
        {/* TÍTULO CORRIGIDO: Removemos o gradiente e aplicamos a cor primária (marrom) */}
        <CardTitle className="text-2xl font-bold text-primary">
          Gerador de Mapa Astral
        </CardTitle>
        <CardDescription>
          Preencha suas informações para gerar seu mapa astral personalizado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo"
              // Foco do input corrigido para usar a cor do anel definida no CSS
              className="transition-all duration-200 focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Nascimento *
            </Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="transition-all duration-200 focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Hora de Nascimento */}
          <div className="space-y-2">
            <Label htmlFor="birthTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hora de Nascimento *
            </Label>
            <Input
              id="birthTime"
              name="birthTime"
              type="time"
              value={formData.birthTime}
              onChange={handleInputChange}
              className="transition-all duration-200 focus:ring-2 focus:ring-ring"
              required
            />
            <p className="text-sm text-muted-foreground">
              A hora exata é importante para um mapa astral preciso
            </p>
          </div>

          {/* Local de Nascimento com Autocomplete */}
          <LocationAutocomplete
            label="Local de Nascimento"
            placeholder="Ex: São Paulo, SP, Brasil"
            value={formData.location}
            onChange={handleLocationChange}
            required
          />

          {/* Informações de Debug (removido para um visual mais limpo) */}
          {/* 
          {formData.latitude && formData.longitude && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Coordenadas:</strong> {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
            </div>
          )}
          */}

          {/* BOTÃO DE SUBMIT CORRIGIDO: Usando as cores primárias (marrom e dourado) */}
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando Mapa Astral...
              </div>
            ) : (
              'Gerar Mapa Astral'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
