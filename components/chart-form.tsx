'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Loader2 } from 'lucide-react';
import { ChartFormData } from '@/types/astrologico';

interface ChartFormProps {
  onSubmit: (data: ChartFormData) => void;
  loading: boolean;
}

export default function ChartForm({ onSubmit, loading }: ChartFormProps) {
  const [formData, setFormData] = useState<ChartFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    location: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.birthDate || !formData.birthTime || !formData.location) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
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
              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
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
              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-sm text-muted-foreground">
              A hora exata é importante para um mapa astral preciso
            </p>
          </div>

          {/* Local de Nascimento */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Local de Nascimento *
            </Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Ex: São Paulo, SP, Brasil"
              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-sm text-muted-foreground">
              Digite a cidade, estado e país onde você nasceu
            </p>
          </div>

          {/* Botão de Submit */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
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