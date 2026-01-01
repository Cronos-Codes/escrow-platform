/**
 * GlobeData.ts
 * 
 * City coordinates and arc connection data for the 3D globe visualization.
 * All coordinates are in decimal degrees (latitude, longitude).
 */

export interface City {
  name: string;
  lat: number;
  lon: number;
  id: string;
  region?: string;
  transactionCount?: number;
  totalValueUSD?: number;
}

export interface ArcConnection {
  startCityId: string;
  endCityId: string;
  id: string;
  color?: string;
  pulseSpeed?: number;
  startTime?: number; // Stagger start time for organic animation
}

export const cities: City[] = [
  { 
    name: 'Nairobi', 
    lat: -1.286389, 
    lon: 36.817223,
    id: 'nairobi',
    region: 'Africa',
    transactionCount: 342,
    totalValueUSD: 12500000,
  },
  { 
    name: 'Kampala', 
    lat: 0.313611, 
    lon: 32.581111,
    id: 'kampala',
    region: 'Africa',
    transactionCount: 189,
    totalValueUSD: 8500000,
  },
  { 
    name: 'Lagos', 
    lat: 6.524379, 
    lon: 3.379206,
    id: 'lagos',
    region: 'Africa',
    transactionCount: 267,
    totalValueUSD: 15200000,
  },
  { 
    name: 'Johannesburg', 
    lat: -26.2041, 
    lon: 28.0473,
    id: 'johannesburg',
    region: 'Africa',
    transactionCount: 203,
    totalValueUSD: 9200000,
  },
  { 
    name: 'Dubai', 
    lat: 25.2048, 
    lon: 55.2708,
    id: 'dubai',
    region: 'Middle East',
    transactionCount: 456,
    totalValueUSD: 18500000,
  },
  { 
    name: 'London', 
    lat: 51.5072, 
    lon: -0.1276,
    id: 'london',
    region: 'Europe',
    transactionCount: 389,
    totalValueUSD: 16800000,
  },
  { 
    name: 'New York', 
    lat: 40.7128, 
    lon: -74.006,
    id: 'newyork',
    region: 'North America',
    transactionCount: 512,
    totalValueUSD: 22500000,
  },
  {
    name: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    id: 'singapore',
    region: 'Asia',
    transactionCount: 298,
    totalValueUSD: 13200000,
  },
  {
    name: 'Tokyo',
    lat: 35.6762,
    lon: 139.6503,
    id: 'tokyo',
    region: 'Asia',
    transactionCount: 445,
    totalValueUSD: 19800000,
  },
  {
    name: 'Sydney',
    lat: -33.8688,
    lon: 151.2093,
    id: 'sydney',
    region: 'Oceania',
    transactionCount: 178,
    totalValueUSD: 7800000,
  },
];

/**
 * Arc connections between cities
 * Creates a network of connections showing transaction flows
 */
export const arcConnections: ArcConnection[] = [
  {
    startCityId: 'dubai',
    endCityId: 'london',
    id: 'arc-dubai-london',
    color: '#D4AF37',
    pulseSpeed: 1.0,
    startTime: 0,
  },
  {
    startCityId: 'dubai',
    endCityId: 'singapore',
    id: 'arc-dubai-singapore',
    color: '#D4AF37',
    pulseSpeed: 1.2,
    startTime: 0.3,
  },
  {
    startCityId: 'london',
    endCityId: 'newyork',
    id: 'arc-london-newyork',
    color: '#3B82F6',
    pulseSpeed: 0.9,
    startTime: 0.6,
  },
  {
    startCityId: 'singapore',
    endCityId: 'tokyo',
    id: 'arc-singapore-tokyo',
    color: '#10B981',
    pulseSpeed: 1.1,
    startTime: 0.2,
  },
  {
    startCityId: 'nairobi',
    endCityId: 'dubai',
    id: 'arc-nairobi-dubai',
    color: '#F59E0B',
    pulseSpeed: 1.3,
    startTime: 0.4,
  },
  {
    startCityId: 'lagos',
    endCityId: 'london',
    id: 'arc-lagos-london',
    color: '#EF4444',
    pulseSpeed: 0.8,
    startTime: 0.7,
  },
  {
    startCityId: 'johannesburg',
    endCityId: 'sydney',
    id: 'arc-johannesburg-sydney',
    color: '#8B5CF6',
    pulseSpeed: 1.0,
    startTime: 0.5,
  },
  {
    startCityId: 'tokyo',
    endCityId: 'newyork',
    id: 'arc-tokyo-newyork',
    color: '#EC4899',
    pulseSpeed: 0.95,
    startTime: 0.1,
  },
];

/**
 * Convert latitude/longitude to 3D coordinates on a sphere
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param radius Sphere radius
 * @returns THREE.Vector3 position on sphere
 */
export function latLonToVector3(lat: number, lon: number, radius: number = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return [x, y, z];
}

/**
 * Get city by ID
 */
export function getCityById(id: string): City | undefined {
  return cities.find(city => city.id === id);
}

/**
 * Get arc connection by ID
 */
export function getArcById(id: string): ArcConnection | undefined {
  return arcConnections.find(arc => arc.id === id);
}

