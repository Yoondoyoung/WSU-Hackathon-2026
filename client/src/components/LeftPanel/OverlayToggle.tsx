import { ShieldAlert, GraduationCap, Users, Volume2, Building2 } from 'lucide-react';
import type { OverlayType } from '../../types/map';

interface Props {
  activeOverlays: Set<OverlayType>;
  onToggle: (overlay: OverlayType) => void;
}

const OVERLAYS: {
  type: OverlayType;
  label: string;
  Icon: React.ElementType;
  color: string;
}[] = [
  { type: 'crime', label: 'Crime Rate', Icon: ShieldAlert, color: '#ef4444' },
  { type: 'schools', label: 'School Zones', Icon: GraduationCap, color: '#22c55e' },
  { type: 'population', label: 'Population Density', Icon: Users, color: '#f59e0b' },
  { type: 'noise', label: 'Noise Level', Icon: Volume2, color: '#a855f7' },
  { type: 'structures', label: 'Building Footprints', Icon: Building2, color: '#0ea5e9' },
];

export function OverlayToggle({ activeOverlays, onToggle }: Props) {
  return (
    <div className="space-y-2">
      {OVERLAYS.map(({ type, label, Icon, color }) => {
        const active = activeOverlays.has(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors border ${
              active
                ? 'bg-[#25253e] border-[#2d2d4a] text-[#e2e2f0]'
                : 'border-transparent text-[#8888a8] hover:bg-[#25253e] hover:text-[#e2e2f0]'
            }`}
          >
            <Icon size={16} style={{ color: active ? color : undefined }} />
            <span className="flex-1 text-left">{label}</span>
            {/* Toggle switch */}
            <div
              className={`w-8 h-4 rounded-full transition-colors relative ${
                active ? 'bg-[#6366f1]' : 'bg-[#2d2d4a]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  active ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
