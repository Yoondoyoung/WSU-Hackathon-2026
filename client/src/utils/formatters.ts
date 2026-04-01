export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

/** Compact price label for map markers: $450k, $1.2M, $2.5M etc. */
export function formatPriceCompact(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (price >= 1_000) {
    const k = price / 1_000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(0)}k`;
  }
  return `$${price}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** Safe for API data where sqft may be null/undefined. */
export function formatSqft(sqft: number | null | undefined): string {
  if (sqft == null || Number.isNaN(Number(sqft))) return '—';
  const n = Number(sqft);
  return n > 0 ? n.toLocaleString() : '—';
}
