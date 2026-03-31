import { useState, useCallback } from 'react';
import type { MapViewMode, OverlayType, MapState } from '../types/map';

const MAP_STYLES: Record<MapViewMode, string> = {
  default: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  '3d': 'mapbox://styles/mapbox/dark-v11',
};

export function useMapState() {
  const [mapState, setMapState] = useState<MapState>({
    viewMode: 'default',
    activeOverlays: new Set(),
    pitch: 0,
  });

  const setViewMode = useCallback((mode: MapViewMode) => {
    setMapState((prev) => ({
      ...prev,
      viewMode: mode,
      pitch: mode === '3d' ? 60 : 0,
    }));
  }, []);

  const toggleOverlay = useCallback((overlay: OverlayType) => {
    setMapState((prev) => {
      const next = new Set(prev.activeOverlays);
      if (next.has(overlay)) {
        next.delete(overlay);
      } else {
        next.add(overlay);
      }
      return { ...prev, activeOverlays: next };
    });
  }, []);

  const mapStyle = MAP_STYLES[mapState.viewMode];

  return { mapState, mapStyle, setViewMode, toggleOverlay };
}
