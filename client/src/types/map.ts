export type MapViewMode = 'default' | 'satellite' | '3d';

export type OverlayType = 'crime' | 'schools' | 'grocery' | 'population' | 'noise' | 'structures';

export interface MapState {
  viewMode: MapViewMode;
  activeOverlays: Set<OverlayType>;
  pitch: number;
}
