import { useState, useEffect } from 'react';
import type { Property } from '../types/property';

export interface NearbyStore {
  id: number | string;
  name: string;
  address: string;
  type: string;
  distanceMiles: number;
  coordinates: [number, number]; // [lng, lat]
}

export function useNearbyGrocery(property: Property | null, radiusMiles = 1.0) {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!property) { setStores([]); return; }
    const [lng, lat] = property.coordinates;
    setLoading(true);
    setStores([]);
    fetch(`/api/properties/nearby-grocery?lat=${lat}&lng=${lng}&miles=${radiusMiles}`)
      .then((r) => r.json())
      .then((data) => {
        const features = data.features ?? [];
        setStores(
          features.map((f: {
            id?: number | string;
            geometry: { coordinates: [number, number] };
            properties: Record<string, unknown>;
          }) => ({
            id: f.id ?? Math.random(),
            name: (f.properties.NAME ?? f.properties.name ?? 'Unknown') as string,
            address: (f.properties.STREETADDR ?? f.properties.address ?? '') as string,
            type: (f.properties.TYPE ?? f.properties.type ?? '') as string,
            distanceMiles: (f.properties.distanceMiles ?? 0) as number,
            coordinates: f.geometry.coordinates,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [property?.id, radiusMiles]);

  return { stores, loading };
}
