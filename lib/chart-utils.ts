import { PlanetPosition, HousePosition } from '@/types/astrology';

export const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol',
  moon: 'Lua',
  mercury: 'Mercúrio',
  venus: 'Vênus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Netuno',
  pluto: 'Plutão',
};

export const SIGN_NAMES: Record<string, string> = {
  aries: 'Áries',
  taurus: 'Touro',
  gemini: 'Gêmeos',
  cancer: 'Câncer',
  leo: 'Leão',
  virgo: 'Virgem',
  libra: 'Libra',
  scorpio: 'Escorpião',
  sagittarius: 'Sagitário',
  capricorn: 'Capricórnio',
  aquarius: 'Aquário',
  pisces: 'Peixes',
};

export const SIGN_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

export function formatDegreeMinute(longitude: number): { degree: number; minute: number } {
  const degree = Math.floor(longitude % 30);
  const minute = Math.floor((longitude % 1) * 60);
  return { degree, minute };
}

export function getSignFromLongitude(longitude: number): string {
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex] || 'aries';
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}