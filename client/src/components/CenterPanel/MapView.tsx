import { useRef, useState, useEffect, useCallback } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapViewMode, OverlayType } from '../../types/map';
import type { Property } from '../../types/property';
import { fetchOverlay } from '../../services/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

const SLC_CENTER = { longitude: -111.891, latitude: 40.7608, zoom: 12 };

const MAP_STYLES: Record<MapViewMode, string> = {
  default: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  '3d': 'mapbox://styles/mapbox/dark-v11',
};

const OVERLAY_COLORS: Record<OverlayType, string[]> = {
  crime: ['rgba(0,0,0,0)', '#1e40af', '#f59e0b', '#ef4444'],
  schools: ['rgba(0,0,0,0)', '#166534', '#16a34a', '#22c55e'],
  population: ['rgba(0,0,0,0)', '#92400e', '#d97706', '#f59e0b'],
  noise: ['rgba(0,0,0,0)', '#4c1d95', '#7c3aed', '#a855f7'],
  structures: ['rgba(0,0,0,0)', '#0ea5e9', '#0284c7', '#0369a1'],
};

function heatmapLayer(id: OverlayType): LayerProps {
  const colors = OVERLAY_COLORS[id];
  return {
    id: `heatmap-${id}`,
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['get', 'intensity'],
      'heatmap-radius': 40,
      'heatmap-opacity': 0.75,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, colors[0],
        0.2, colors[1],
        0.6, colors[2],
        1, colors[3],
      ],
    },
  };
}

interface Props {
  viewMode: MapViewMode;
  activeOverlays: Set<OverlayType>;
  properties: Property[];
  selectedId: string | null;
  onSelectProperty: (id: string) => void;
}

export function MapView({ viewMode, activeOverlays, properties, selectedId, onSelectProperty }: Props) {
  const mapRef = useRef(null);
  const [overlayData, setOverlayData] = useState<Record<string, GeoJSON.FeatureCollection>>({});
  const structuresTileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/properties/overlays/structures/tiles/{z}/{x}/{y}.pbf`
      : '/api/properties/overlays/structures/tiles/{z}/{x}/{y}.pbf';
  const [viewState, setViewState] = useState({
    ...SLC_CENTER,
    pitch: 0,
    bearing: 0,
  });

  // Update pitch when view mode changes
  useEffect(() => {
    setViewState((prev) => ({ ...prev, pitch: viewMode === '3d' ? 60 : 0 }));
  }, [viewMode]);

  // Fetch overlay GeoJSON on toggle
  useEffect(() => {
    activeOverlays.forEach((overlay) => {
      if (overlay === 'structures') return;
      if (!overlayData[overlay]) {
        fetchOverlay(overlay).then((data) => {
          setOverlayData((prev) => ({ ...prev, [overlay]: data }));
        });
      }
    });
  }, [activeOverlays, overlayData]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      onSelectProperty(id);
    },
    [onSelectProperty]
  );

  return (
    <div className="w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={MAP_STYLES[viewMode]}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Structures vector tiles: show building shapes only when zoomed in */}
        {activeOverlays.has('structures') && (
          <Source
            id="source-structures-vt"
            type="vector"
            tiles={[structuresTileUrl]}
            minzoom={10}
            maxzoom={16}
          >
            <Layer
              id="structures-fill"
              type="fill"
              source="source-structures-vt"
              source-layer="structures"
              minzoom={14}
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'OCC_CLS'],
                  'Government', '#3b82f6', // Blue
                  'Commercial', '#ef4444', // Red
                  'Education', '#facc15', // Yellow
                  'Industrial', '#6b7280', // Gray
                  '#4b5563', // Dark Gray
                ],
                'fill-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  14, 0.05,
                  16, 0.12,
                  18, 0.18,
                ],
              }}
            />
            <Layer
              id="structures-outline"
              type="line"
              source="source-structures-vt"
              source-layer="structures"
              minzoom={15}
              paint={{
                'line-color': [
                  'match',
                  ['get', 'OCC_CLS'],
                  'Government', '#1d4ed8',
                  'Commercial', '#b91c1c',
                  'Education', '#ca8a04',
                  'Industrial', '#374151',
                  '#1f2937',
                ],
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15, 0.35,
                  17, 0.65,
                  19, 0.9,
                ],
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15, 0.6,
                  17, 1.1,
                  19, 1.6,
                ],
              }}
            />
          </Source>
        )}

        {/* Heatmap overlays */}
        {Array.from(activeOverlays).map((overlay) =>
          overlay !== 'structures' && overlayData[overlay] ? (
            <Source key={overlay} id={`source-${overlay}`} type="geojson" data={overlayData[overlay]}>
              <Layer {...heatmapLayer(overlay)} />
            </Source>
          ) : null
        )}

        {/* Property markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.coordinates[0]}
            latitude={property.coordinates[1]}
            anchor="bottom"
            onClick={() => handleMarkerClick(property.id)}
          >
            <div
              className={`cursor-pointer transition-all ${
                selectedId === property.id ? 'scale-125' : 'hover:scale-110'
              }`}
              title={property.address}
            >
              <div
                className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg border ${
                  selectedId === property.id
                    ? 'bg-[#6366f1] border-[#818cf8] text-white'
                    : 'bg-[#1a1a2e] border-[#2d2d4a] text-[#e2e2f0]'
                }`}
              >
                ${Math.round(property.price / 1000)}k
              </div>
              <div
                className={`w-0 h-0 mx-auto border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                  selectedId === property.id ? 'border-t-[#6366f1]' : 'border-t-[#1a1a2e]'
                }`}
              />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
