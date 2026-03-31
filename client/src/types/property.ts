export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  imageUrl: string;
  coordinates: [number, number]; // [lng, lat]
  propertyType: 'house' | 'condo' | 'townhouse';
}
