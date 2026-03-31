import { Building } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import type { Property } from '../../types/property';

interface Props {
  properties: Property[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

export function PropertyList({ properties, loading, selectedId, onSelect, onOpenDetail }: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-[#2d2d4a] bg-[#25253e] animate-pulse">
            <div className="h-32 bg-[#2d2d4a]" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-[#2d2d4a] rounded w-3/4" />
              <div className="h-3 bg-[#2d2d4a] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#8888a8]">
        <Building size={32} className="mb-3 opacity-40" />
        <p className="text-sm">No properties found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {properties.map((p) => (
        <PropertyCard
          key={p.id}
          property={p}
          selected={selectedId === p.id}
          onClick={() => (selectedId === p.id ? onOpenDetail(p.id) : onSelect(p.id))}
        />
      ))}
    </div>
  );
}
