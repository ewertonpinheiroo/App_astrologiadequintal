// types/astrologico.ts
// Tipos para a API do Astrológico

export interface ChartFormData {
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  country: string;
  timezone: string;
  queryResult: string; // Adicionado para corresponder à resposta da API
}

// Interface corrigida para a resposta da API de localização
export interface LocationApiResponse {
  status: string;
  location: LocationData; // A API retorna um único objeto 'location'
}

export interface PlanetData {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign?: string;
  house?: number;
}

export interface HouseData {
  longitude: number;
  latitude: number;
}

// New Metadata interface
export interface Metadata {
  location?: { latitude: number; longitude: number };
  date?: { ISO: string; UNIX: number };
  [key: string]: any; // Allow additional properties
}

export interface ChartData {
  planets: Record<string, PlanetData>;
  houses: Record<string, HouseData>;
  date: number;
  location: LocationData;
  timezone: string;
  metadata?: Metadata; // Updated to use the new Metadata interface
}

export interface ChartResponse {
  data: ChartData;
  status: string;
  cost: number;
}

export interface AstrologicalSign {
  sign: string;
  degree: number;
  minute: number;
}

// Interface for ChartDisplay props
export interface ChartDisplayProps {
  chartData: ChartResponse;
  userName: string;
}