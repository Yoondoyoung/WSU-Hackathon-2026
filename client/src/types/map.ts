export type MapViewMode = 'default' | 'satellite' | '3d';

export type OverlayType = 'crime' | 'schools' | 'population' | 'noise';

export interface MapState {
  viewMode: MapViewMode;
  activeOverlays: Set<OverlayType>;
  pitch: number;
}
