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
}

export interface LocationResponse {
  data: LocationData[];
  status: string;
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

export interface ChartData {
  planets: Record<string, PlanetData>;
  houses: Record<string, HouseData>;
  date: number;
  location: LocationData;
  timezone: string;
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