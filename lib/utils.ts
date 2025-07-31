import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AstrologicalSign } from '@/types/astrologico';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para converter graus em signo astrológico
export function getAstrologicalSign(longitude: number): AstrologicalSign {
  const signs = [
    'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
    'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
  ];
  const signIndex = Math.floor(longitude / 30);
  const degree = longitude % 30;
  return {
    sign: signs[signIndex] || 'Desconhecido',
    degree: Math.floor(degree),
    minute: Math.floor((degree % 1) * 60)
  };
}

// Função para obter o nome em português do planeta
export function getPlanetNameInPortuguese(planetName: string): string {
  const planetNames: Record<string, string> = {
    'sun': 'Sol',
    'moon': 'Lua',
    'mercury': 'Mercúrio',
    'venus': 'Vênus',
    'mars': 'Marte',
    'jupiter': 'Júpiter',
    'saturn': 'Saturno',
    'uranus': 'Urano',
    'neptune': 'Netuno',
    'pluto': 'Plutão'
  };
  return planetNames[planetName.toLowerCase()] || planetName;
}

// Função para formatar data e hora
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}