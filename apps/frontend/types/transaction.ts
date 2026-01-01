/**
 * Transaction data structure for Gold Escrow Globe visualization
 */

export type TransactionStatus = 'active' | 'completed' | 'disputed';

export interface TransactionData {
  id: string;
  startCity: string;
  endCity: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  valueUSD: number;
  status: TransactionStatus;
  timestamp: number;
}

/**
 * City data for generating realistic transaction pairs
 */
export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
  type?: 'commodity' | 'property' | 'service';
}

/**
 * Major trading hubs for realistic transaction generation
 */
export const MAJOR_CITIES: CityLocation[] = [
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, type: 'commodity' },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, type: 'property' },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, type: 'commodity' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, type: 'service' },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, type: 'commodity' },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, type: 'service' },
  { name: 'Zurich, Switzerland', lat: 47.3769, lng: 8.5417, type: 'commodity' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, type: 'property' },
  { name: 'Shanghai, China', lat: 31.2304, lng: 121.4737, type: 'commodity' },
  { name: 'Frankfurt, Germany', lat: 50.1109, lng: 8.6821, type: 'property' },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, type: 'service' },
  { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, type: 'property' },
];

/**
 * Generate a realistic mock transaction
 */
export function generateMockTransaction(
  id: string,
  startCity: CityLocation,
  endCity: CityLocation,
  valueUSD?: number,
  status?: TransactionStatus
): TransactionData {
  const now = Date.now();
  const randomDelay = Math.random() * 60000; // Random delay up to 1 minute
  
  return {
    id,
    startCity: startCity.name,
    endCity: endCity.name,
    startLat: startCity.lat,
    startLng: startCity.lng,
    endLat: endCity.lat,
    endLng: endCity.lng,
    valueUSD: valueUSD || Math.random() * 500000 + 10000, // $10k - $510k
    status: status || (Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'completed' : 'disputed'),
    timestamp: now - randomDelay,
  };
}

/**
 * Generate multiple mock transactions
 */
export function generateMockTransactions(count: number): TransactionData[] {
  const transactions: TransactionData[] = [];
  const cityCount = MAJOR_CITIES.length;
  
  // Create hub connections for realistic flow
  const hubConnections = [
    ['Dubai, UAE', 'London, UK'],
    ['Dubai, UAE', 'Singapore'],
    ['London, UK', 'New York, USA'],
    ['London, UK', 'Zurich, Switzerland'],
    ['New York, USA', 'Tokyo, Japan'],
    ['New York, USA', 'Hong Kong'],
    ['Singapore', 'Hong Kong'],
    ['Singapore', 'Mumbai, India'],
    ['Tokyo, Japan', 'Hong Kong'],
    ['Zurich, Switzerland', 'London, UK'],
    ['Shanghai, China', 'Singapore'],
    ['Frankfurt, Germany', 'Zurich, Switzerland'],
    ['Sydney, Australia', 'Singapore'],
    ['Toronto, Canada', 'New York, USA'],
  ];
  
  const usedPairs = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let startCity: CityLocation;
    let endCity: CityLocation;
    let pairKey: string;
    
    // Prefer hub connections for realism, but allow some random pairs
    if (i < hubConnections.length && Math.random() > 0.3) {
      const [startName, endName] = hubConnections[i % hubConnections.length];
      startCity = MAJOR_CITIES.find(c => c.name === startName) || MAJOR_CITIES[0];
      endCity = MAJOR_CITIES.find(c => c.name === endName) || MAJOR_CITIES[1];
      pairKey = `${startCity.name}-${endCity.name}`;
    } else {
      // Random pair
      const startIdx = Math.floor(Math.random() * cityCount);
      const endIdx = Math.floor(Math.random() * cityCount);
      
      if (startIdx === endIdx) {
        continue; // Skip same city pairs
      }
      
      startCity = MAJOR_CITIES[startIdx];
      endCity = MAJOR_CITIES[endIdx];
      pairKey = [startCity.name, endCity.name].sort().join('-');
    }
    
    // Avoid duplicate pairs
    if (usedPairs.has(pairKey)) {
      continue;
    }
    usedPairs.add(pairKey);
    
    transactions.push(
      generateMockTransaction(
        `TXN-${Date.now()}-${i}`,
        startCity,
        endCity
      )
    );
  }
  
  return transactions;
}

