import { Globe, Satellite, Box } from 'lucide-react';
import type { MapViewMode } from '../../types/map';

interface Props {
  current: MapViewMode;
  onChange: (mode: MapViewMode) => void;
}

const MODES: { mode: MapViewMode; label: string; Icon: React.ElementType }[] = [
  { mode: 'default', label: 'Default', Icon: Globe },
  { mode: 'satellite', label: 'Satellite', Icon: Satellite },
  { mode: '3d', label: '3D View', Icon: Box },
];

export function ViewToggle({ current, onChange }: Props) {
  return (
    <div className="space-y-1">
      {MODES.map(({ mode, label, Icon }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            current === mode
              ? 'bg-[#6366f1] text-white'
              : 'text-[#8888a8] hover:bg-[#25253e] hover:text-[#e2e2f0]'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
