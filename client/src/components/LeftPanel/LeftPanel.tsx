import { Map } from 'lucide-react';
import { ViewToggle } from './ViewToggle';
import { OverlayToggle } from './OverlayToggle';
import type { MapViewMode, OverlayType } from '../../types/map';

interface Props {
  viewMode: MapViewMode;
  activeOverlays: Set<OverlayType>;
  onViewChange: (mode: MapViewMode) => void;
  onOverlayToggle: (overlay: OverlayType) => void;
}

export function LeftPanel({ viewMode, activeOverlays, onViewChange, onOverlayToggle }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b border-[#2d2d4a]">
        <div className="flex items-center gap-2 mb-1">
          <Map size={18} className="text-[#6366f1]" />
          <h1 className="text-[#e2e2f0] font-semibold text-sm tracking-wide uppercase">Utah Smart-Path</h1>
        </div>
        <p className="text-[#8888a8] text-xs">Salt Lake City Real Estate</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-6">
        {/* Map View Toggle */}
        <section>
          <h2 className="text-[#8888a8] text-xs font-semibold uppercase tracking-widest mb-3">Map View</h2>
          <ViewToggle current={viewMode} onChange={onViewChange} />
        </section>

        {/* Divider */}
        <div className="border-t border-[#2d2d4a]" />

        {/* Data Overlays */}
        <section>
          <h2 className="text-[#8888a8] text-xs font-semibold uppercase tracking-widest mb-3">Data Overlays</h2>
          <OverlayToggle activeOverlays={activeOverlays} onToggle={onOverlayToggle} />
        </section>

        {/* Divider */}
        <div className="border-t border-[#2d2d4a]" />

        {/* Legend */}
        <section>
          <h2 className="text-[#8888a8] text-xs font-semibold uppercase tracking-widest mb-3">Legend</h2>
          <div className="space-y-2">
            {[
              { color: '#ef4444', label: 'High Risk' },
              { color: '#f59e0b', label: 'Moderate' },
              { color: '#22c55e', label: 'Low Risk / Good' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-[#8888a8]">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#2d2d4a]">
        <p className="text-[#8888a8] text-xs">WSU Hackathon 2026</p>
      </div>
    </div>
  );
}
