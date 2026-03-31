import { useState, useEffect } from 'react';
import { fetchProperties } from '../services/api';
import type { Property } from '../types/property';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch(() => setError('Failed to load properties'))
      .finally(() => setLoading(false));
  }, []);

  return { properties, loading, error };
}
