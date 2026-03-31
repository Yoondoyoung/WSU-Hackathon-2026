import { List } from 'lucide-react';
import { PropertyList } from './PropertyList';
import { MortgagePredictor } from './MortgagePredictor';
import type { Property } from '../../types/property';

interface Props {
  properties: Property[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RightPanel({ properties, loading, selectedId, onSelect }: Props) {
  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Properties Section */}
      <div className="flex-shrink-0 border-b border-[#2d2d4a]">
        <div className="px-4 py-3 flex items-center gap-2">
          <List size={16} className="text-[#6366f1]" />
          <h2 className="text-[#e2e2f0] font-semibold text-sm">
            Properties
            {!loading && (
              <span className="ml-2 text-[#8888a8] font-normal text-xs">({properties.length})</span>
            )}
          </h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <PropertyList
          properties={properties}
          loading={loading}
          selectedId={selectedId}
          onSelect={onSelect}
        />

        {/* Divider before predictor */}
        <div className="border-t border-[#2d2d4a] mx-4" />

        <MortgagePredictor selectedProperty={selectedProperty} />
      </div>
    </div>
  );
}
