import { Bed, Bath, Square, Home, Building2, Layers } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatters';

const TYPE_ICON: Record<Property['propertyType'], React.ElementType> = {
  house: Home,
  condo: Building2,
  townhouse: Layers,
};

interface Props {
  property: Property;
  selected: boolean;
  onClick: () => void;
}

export function PropertyCard({ property, selected, onClick }: Props) {
  const TypeIcon = TYPE_ICON[property.propertyType];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl overflow-hidden border transition-all ${
        selected
          ? 'border-[#6366f1] bg-[#25253e] shadow-lg shadow-indigo-900/30'
          : 'border-[#2d2d4a] bg-[#25253e] hover:border-[#6366f1]/50'
      }`}
    >
      {/* Property Image */}
      <div className="relative h-32 bg-[#2d2d4a] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.address}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x300/25253e/6366f1?text=Property';
          }}
        />
        <div className="absolute top-2 left-2">
          <span className="bg-[#0f0f1a]/80 text-[#e2e2f0] text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm flex items-center gap-1">
            <TypeIcon size={10} />
            {property.propertyType}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-[#6366f1] text-white text-xs px-2 py-1 rounded-md font-bold">
            {formatPrice(property.price)}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-3">
        <p className="text-[#e2e2f0] text-sm font-medium truncate">{property.address}</p>
        <p className="text-[#8888a8] text-xs mb-2">
          {property.city}, {property.state} {property.zip}
        </p>

        <div className="flex items-center gap-3 text-xs text-[#8888a8]">
          <span className="flex items-center gap-1">
            <Bed size={12} />
            {property.beds} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} />
            {property.baths} ba
          </span>
          <span className="flex items-center gap-1">
            <Square size={12} />
            {property.sqft.toLocaleString()} sqft
          </span>
          <span className="ml-auto text-[#8888a8]">Built {property.yearBuilt}</span>
        </div>
      </div>

      {selected && (
        <div className="px-3 pb-3">
          <div className="h-px bg-[#2d2d4a] mb-2" />
          <p className="text-[#6366f1] text-xs font-medium">✓ Selected for mortgage analysis</p>
        </div>
      )}
    </div>
  );
}
