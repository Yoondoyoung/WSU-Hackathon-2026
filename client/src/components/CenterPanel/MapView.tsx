import { useRef, useState, useEffect, useCallback } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl/mapbox';
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

interface CrimePopupData {
  longitude: number;
  latitude: number;
  crimeType?: string;
  crime?: string;
  division?: string;
  date?: string;
}

export function MapView({ viewMode, activeOverlays, properties, selectedId, onSelectProperty }: Props) {
  const mapRef = useRef(null);
  const [overlayData, setOverlayData] = useState<Record<string, GeoJSON.FeatureCollection>>({});
  const [crimePopup, setCrimePopup] = useState<CrimePopupData | null>(null);
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

  const handleMapClick = useCallback((evt: any) => {
    const feature = evt.features?.find((f: any) => f.layer?.id === 'crime-points');
    if (!feature) return;

    const coords = feature.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return;

    const properties = feature.properties ?? {};
    setCrimePopup({
      longitude: coords[0],
      latitude: coords[1],
      crimeType: properties.crime_type,
      crime: properties.crime,
      division: properties.division,
      date: properties.date,
    });
  }, []);

  return (
    <div className="w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        interactiveLayerIds={activeOverlays.has('crime') ? ['crime-points'] : []}
        mapStyle={MAP_STYLES[viewMode]}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {activeOverlays.has('crime') && overlayData.crime && (
          <Source id="source-crime" type="geojson" data={overlayData.crime}>
            <Layer {...heatmapLayer('crime')} />
            <Layer
              id="crime-points"
              type="circle"
              minzoom={12}
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  12, 2,
                  15, 3,
                  18, 4,
                ],
                'circle-color': [
                  'match',
                  ['get', 'crime_type'],
                  'Violent', '#ef4444',
                  '#f59e0b',
                ],
                'circle-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  12, 0.25,
                  14, 0.45,
                  18, 0.8,
                ],
                'circle-stroke-color': '#111827',
                'circle-stroke-width': 0.5,
              }}
            />
          </Source>
        )}

        {/* Structures vector tiles: show building shapes only when zoomed in */}
        {activeOverlays.has('structures') && (
          <>
            {overlayData.structures && (
              <Source id="source-structures-overview" type="geojson" data={overlayData.structures}>
                <Layer
                  id="structures-overview-circles"
                  type="circle"
                  maxzoom={14}
                  paint={{
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      10, 1.2,
                      12, 1.8,
                      14, 2.4,
                    ],
                    'circle-color': '#22d3ee',
                    'circle-opacity': 0.35,
                  }}
                />
              </Source>
            )}
            <Source
              id="source-structures-vt"
              type="vector"
              tiles={[structuresTileUrl]}
              minzoom={10}
              maxzoom={18}
            >
              <Layer
                id="structures-fill"
                type="fill"
                source="source-structures-vt"
                source-layer="structures"
                minzoom={13}
                paint={{
                  'fill-color': [
                    'match',
                    ['get', 'OCC_CLS'],
                    'Residential', '#22c55e', // Green
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
                    13, 0.04,
                    15, 0.1,
                    18, 0.18,
                  ],
                }}
              />
              <Layer
                id="structures-outline"
                type="line"
                source="source-structures-vt"
                source-layer="structures"
                minzoom={14}
                paint={{
                  'line-color': [
                    'match',
                    ['get', 'OCC_CLS'],
                    'Residential', '#15803d', // Green
                    'Government', '#1d4ed8', // Blue
                    'Commercial', '#b91c1c', // Red
                    'Education', '#ca8a04', // Yellow
                    'Industrial', '#374151', // Gray
                    '#1f2937', // Dark Gray
                  ],
                  'line-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14, 0.25,
                    16, 0.6,
                    19, 0.9,
                  ],
                  'line-width': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14, 0.4,
                    16, 0.9,
                    19, 1.6,
                  ],
                }}
              />
            </Source>
          </>
        )}

        {/* Heatmap overlays */}
        {Array.from(activeOverlays).map((overlay) =>
          overlay !== 'structures' && overlay !== 'crime' && overlayData[overlay] ? (
            <Source key={overlay} id={`source-${overlay}`} type="geojson" data={overlayData[overlay]}>
              <Layer {...heatmapLayer(overlay)} />
            </Source>
          ) : null
        )}

        {crimePopup && (
          <Popup
            longitude={crimePopup.longitude}
            latitude={crimePopup.latitude}
            anchor="top"
            onClose={() => setCrimePopup(null)}
            closeOnClick={false}
          >
            <div className="text-xs leading-relaxed min-w-44 text-black">
              <p><strong>Type:</strong> {crimePopup.crimeType || 'Unknown'}</p>
              <p><strong>Crime:</strong> {crimePopup.crime || 'Unknown'}</p>
              <p><strong>Division:</strong> {crimePopup.division || 'Unknown'}</p>
              <p><strong>Date:</strong> {crimePopup.date || 'Unknown'}</p>
            </div>
          </Popup>
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
