/**
 * City data structure for Gold Escrow Globe visualization
 */

export interface CityData {
  id: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  transactionCount: number;
  totalValueUSD: number;
  active: boolean;
  lastTransactionTime: number;
  type?: 'commodity' | 'property' | 'service';
}

/**
 * Regional statistics aggregation
 */
export interface RegionalStats {
  region: string;
  totalCities: number;
  totalTransactions: number;
  totalValueUSD: number;
  activeCities: number;
  averageTransactionValue: number;
  transactionVelocity: number; // transactions per hour
}

/**
 * Generate mock city data with realistic statistics
 */
export function generateMockCityData(): CityData[] {
  const cities: CityData[] = [
    {
      id: 'dubai',
      city: 'Dubai',
      region: 'Middle East',
      lat: 25.2048,
      lng: 55.2708,
      transactionCount: 342,
      totalValueUSD: 12500000,
      active: true,
      lastTransactionTime: Date.now() - 30000,
      type: 'commodity',
    },
    {
      id: 'london',
      city: 'London',
      region: 'Europe',
      lat: 51.5074,
      lng: -0.1278,
      transactionCount: 189,
      totalValueUSD: 8500000,
      active: true,
      lastTransactionTime: Date.now() - 45000,
      type: 'property',
    },
    {
      id: 'newyork',
      city: 'New York',
      region: 'North America',
      lat: 40.7128,
      lng: -74.0060,
      transactionCount: 267,
      totalValueUSD: 15200000,
      active: true,
      lastTransactionTime: Date.now() - 20000,
      type: 'commodity',
    },
    {
      id: 'singapore',
      city: 'Singapore',
      region: 'Asia Pacific',
      lat: 1.3521,
      lng: 103.8198,
      transactionCount: 156,
      totalValueUSD: 6800000,
      active: true,
      lastTransactionTime: Date.now() - 60000,
      type: 'service',
    },
    {
      id: 'tokyo',
      city: 'Tokyo',
      region: 'Asia Pacific',
      lat: 35.6762,
      lng: 139.6503,
      transactionCount: 203,
      totalValueUSD: 9200000,
      active: true,
      lastTransactionTime: Date.now() - 35000,
      type: 'commodity',
    },
    {
      id: 'mumbai',
      city: 'Mumbai',
      region: 'Asia Pacific',
      lat: 19.0760,
      lng: 72.8777,
      transactionCount: 124,
      totalValueUSD: 5400000,
      active: true,
      lastTransactionTime: Date.now() - 55000,
      type: 'service',
    },
    {
      id: 'zurich',
      city: 'Zurich',
      region: 'Europe',
      lat: 47.3769,
      lng: 8.5417,
      transactionCount: 98,
      totalValueUSD: 11200000,
      active: true,
      lastTransactionTime: Date.now() - 40000,
      type: 'commodity',
    },
    {
      id: 'hongkong',
      city: 'Hong Kong',
      region: 'Asia Pacific',
      lat: 22.3193,
      lng: 114.1694,
      transactionCount: 178,
      totalValueUSD: 7500000,
      active: true,
      lastTransactionTime: Date.now() - 25000,
      type: 'property',
    },
  ];

  return cities;
}

/**
 * Calculate regional statistics from city data
 */
export function calculateRegionalStats(cities: CityData[]): RegionalStats[] {
  const regionMap = new Map<string, CityData[]>();

  cities.forEach((city) => {
    if (!regionMap.has(city.region)) {
      regionMap.set(city.region, []);
    }
    regionMap.get(city.region)!.push(city);
  });

  const stats: RegionalStats[] = [];

  regionMap.forEach((regionCities, region) => {
    const totalTransactions = regionCities.reduce((sum, city) => sum + city.transactionCount, 0);
    const totalValue = regionCities.reduce((sum, city) => sum + city.totalValueUSD, 0);
    const activeCities = regionCities.filter((city) => city.active).length;
    const averageValue = totalValue / totalTransactions || 0;

    // Calculate transaction velocity (transactions per hour based on recent activity)
    const now = Date.now();
    const recentTransactions = regionCities.filter(
      (city) => now - city.lastTransactionTime < 3600000
    ).length;
    const transactionVelocity = recentTransactions;

    stats.push({
      region,
      totalCities: regionCities.length,
      totalTransactions,
      totalValueUSD: totalValue,
      activeCities,
      averageTransactionValue: averageValue,
      transactionVelocity,
    });
  });

  return stats.sort((a, b) => b.totalValueUSD - a.totalValueUSD);
}

