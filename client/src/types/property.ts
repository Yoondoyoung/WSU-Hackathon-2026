export interface Property {
  id: string;
  address: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  coordinates: [number, number]; // [lng, lat]
  homeType: string;
  imageUrl: string;
  photos: string[];
  detailUrl: string;
  // Detail fields
  description: string;
  lotSize: number | null;
  pricePerSqft: number | null;
  daysOnZillow: number;
  pageViews: number;
  favorites: number;
  heating: string[];
  cooling: string[];
  parking: string[];
  appliances: string[];
  basement: string | null;
  constructionMaterials: string[];
  brokerName: string;
  agentName: string;
  agentPhone: string;
  hoaFee: number | null;
  zestimate: number | null;
  rentZestimate: number | null;
  schools: SchoolInfo[];
  priceHistory: PriceHistoryItem[];
  statusText: string;
  flexText: string;
}

export interface SchoolInfo {
  name: string;
  rating: number;
  distance: number;
  level: string;
  type: string;
  link: string;
}

export interface PriceHistoryItem {
  date: string;
  event: string;
  price: number;
  source: string;
}
