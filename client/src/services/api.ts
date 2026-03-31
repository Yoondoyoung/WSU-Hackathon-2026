import axios from 'axios';
import type { Property } from '../types/property';
import type { MortgageRequestPayload, MortgageResponse } from '../types/mortgage';

const api = axios.create({ baseURL: '/api' });

export async function fetchProperties(): Promise<Property[]> {
  const { data } = await api.get<Property[]>('/properties');
  return data;
}

export async function fetchOverlay(type: string): Promise<GeoJSON.FeatureCollection> {
  const { data } = await api.get<GeoJSON.FeatureCollection>(`/properties/overlays/${type}`);
  return data;
}

export async function predictMortgage(payload: MortgageRequestPayload): Promise<MortgageResponse> {
  const { data } = await api.post<MortgageResponse>('/predict-mortgage', payload);
  return data;
}
