import { MapView } from './MapView';
import type { MapViewMode, OverlayType } from '../../types/map';
import type { Property } from '../../types/property';

interface Props {
  viewMode: MapViewMode;
  activeOverlays: Set<OverlayType>;
  properties: Property[];
  selectedId: string | null;
  onSelectProperty: (id: string) => void;
}

export function CenterPanel(props: Props) {
  return (
    <div className="w-full h-full relative">
      <MapView {...props} />
    </div>
  );
}
