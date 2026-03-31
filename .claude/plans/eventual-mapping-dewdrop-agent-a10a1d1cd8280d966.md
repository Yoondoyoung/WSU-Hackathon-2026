# Utah Smart-Path: Always-Visible Right Panel with Accordion List and Connection Line

## Overview

Transform the right panel from a slide-in detail drawer (420px, shown only on selection) into a permanently visible scrollable property list panel. Selected properties expand in-place with an accordion animation, a connection SVG line links the map marker to the expanded card, and unselected cards dim to 35% opacity.

---

## Architecture Summary

### Data Flow for Connection Line

```
MapView ──(onMarkerScreenPosition callback)──> App (state) ──(prop)──> ConnectionLine
RightPanel ──(onCardRect callback)──────────> App (state) ──(prop)──> ConnectionLine
```

- **App.tsx** owns two pieces of state: `markerScreenPos: {x,y} | null` and `cardAnchorPos: {x,y} | null`.
- **MapView** reports the selected marker's projected screen coords via a callback.
- **RightPanel** reports the expanded card's left-center DOM position via a callback.
- **ConnectionLine** reads both and renders an SVG path.

---

## Step-by-Step Implementation

### Step 1: Modify App.tsx — Layout and State

**File:** `/Users/doyoungyoon/Desktop/WSU-2026/client/src/App.tsx`

**Changes:**

1. **Add new state variables:**
   ```ts
   const [markerScreenPos, setMarkerScreenPos] = useState<{x:number;y:number} | null>(null);
   const [cardAnchorPos, setCardAnchorPos] = useState<{x:number;y:number} | null>(null);
   ```

2. **Replace the right panel wrapper** (currently lines 108-115). Remove the slide-in/translate-x logic entirely. The right panel should always be visible:
   ```tsx
   {/* Right panel — always visible */}
   <div className="absolute right-0 top-0 bottom-0 z-20 w-[360px]">
     <RightPanel
       properties={filteredProperties}
       selectedId={selectedId}
       onSelectProperty={handleSelectProperty}
       loading={loading}
       onCardAnchorChange={setCardAnchorPos}
     />
   </div>
   ```
   - Width reduced from 420px to 360px since it is always visible and must share screen space with the map.

3. **Pass a new callback prop to CenterPanel/MapView:**
   ```tsx
   <CenterPanel
     ...existing props...
     onMarkerScreenPosition={setMarkerScreenPos}
   />
   ```

4. **Add the ConnectionLine component** between the map and the right panel in the JSX tree (after the map div, before the right panel div):
   ```tsx
   <ConnectionLine
     markerPos={markerScreenPos}
     cardPos={cardAnchorPos}
     visible={selectedId !== null}
   />
   ```

5. **Clear connection line state when deselecting:**
   In `handleCloseDetail` and when `handleSelectProperty` toggles off:
   ```ts
   const handleSelectProperty = (id: string) => {
     setSelectedId((prev) => {
       const next = prev === id ? null : id;
       if (next === null) {
         setMarkerScreenPos(null);
         setCardAnchorPos(null);
       }
       return next;
     });
   };
   ```

---

### Step 2: Modify MapView.tsx — Report Marker Screen Position

**File:** `/Users/doyoungyoon/Desktop/WSU-2026/client/src/components/CenterPanel/MapView.tsx`

**Changes:**

1. **Add prop to the interface:**
   ```ts
   interface Props {
     // ...existing...
     onMarkerScreenPosition?: (pos: {x:number;y:number} | null) => void;
   }
   ```

2. **Add a `useEffect` + `requestAnimationFrame` loop** that continuously projects the selected marker's lng/lat to screen coords while a property is selected. This handles flyTo animations and map pan/zoom:
   ```ts
   useEffect(() => {
     if (!selectedId || !mapRef.current) {
       onMarkerScreenPosition?.(null);
       return;
     }
     const property = properties.find(p => p.id === selectedId);
     if (!property) { onMarkerScreenPosition?.(null); return; }

     let rafId: number;
     const update = () => {
       if (mapRef.current) {
         const projected = mapRef.current.project(property.coordinates);
         onMarkerScreenPosition?.({ x: projected.x, y: projected.y });
       }
       rafId = requestAnimationFrame(update);
     };
     rafId = requestAnimationFrame(update);
     return () => cancelAnimationFrame(rafId);
   }, [selectedId, properties, onMarkerScreenPosition]);
   ```

   **Important:** `mapRef.current.project([lng, lat])` returns `{x, y}` in pixels relative to the map container. Since the map is full-viewport (`absolute inset-0`), these coords are already in viewport space.

3. **Thread through CenterPanel.tsx** — add `onMarkerScreenPosition` to CenterPanel's Props and pass it to MapView.

4. **Adjust flyTo offset** (line 193): Change from `offset: [-200, 0]` to `offset: [-180, 0]` since the right panel is narrower (360px). The offset shifts the center left so the marker doesn't hide behind the panel.

---

### Step 3: Rewrite RightPanel.tsx — Accordion Property List

**File:** `/Users/doyoungyoon/Desktop/WSU-2026/client/src/components/RightPanel/RightPanel.tsx`

This is a **full rewrite**. The new component renders a scrollable list of all properties with an accordion-expanded detail view for the selected one.

**New Props interface:**
```ts
interface Props {
  properties: Property[];
  selectedId: string | null;
  onSelectProperty: (id: string) => void;
  loading: boolean;
  onCardAnchorChange: (pos: {x:number;y:number} | null) => void;
}
```

**Component structure:**

```tsx
export function RightPanel({ properties, selectedId, onSelectProperty, loading, onCardAnchorChange }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected card
  useEffect(() => {
    if (selectedId && selectedCardRef.current && scrollContainerRef.current) {
      selectedCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  // Report card anchor position for connection line
  useEffect(() => {
    if (!selectedId || !selectedCardRef.current) {
      onCardAnchorChange(null);
      return;
    }
    let rafId: number;
    const update = () => {
      if (selectedCardRef.current) {
        const rect = selectedCardRef.current.getBoundingClientRect();
        // Anchor point: left-center of the card
        onCardAnchorChange({ x: rect.left, y: rect.top + rect.height / 2 });
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [selectedId, onCardAnchorChange]);

  return (
    <div className="h-full flex flex-col" style={{
      ...glass.panelDense,
      borderRadius: 0,
      borderLeft: `1px solid ${colors.border}`,
      borderTop: 'none', borderRight: 'none', borderBottom: 'none',
      boxShadow: '-8px 0 48px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: colors.whiteMuted }}>
          Properties
        </h2>
        <p className="text-xs mt-1" style={{ color: colors.whiteSubtle }}>
          {properties.length} listings
        </p>
      </div>

      {/* Scrollable list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {properties.map((property) => {
          const isSelected = property.id === selectedId;
          return (
            <CompactCard
              key={property.id}
              ref={isSelected ? selectedCardRef : undefined}
              property={property}
              isSelected={isSelected}
              dimmed={selectedId !== null && !isSelected}
              onClick={() => onSelectProperty(property.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
```

**CompactCard sub-component (within RightPanel.tsx):**

Each card is ~64px tall in collapsed state. Uses `display: grid; grid-template-rows: 0fr` for the accordion.

```tsx
const CompactCard = forwardRef<HTMLDivElement, {
  property: Property;
  isSelected: boolean;
  dimmed: boolean;
  onClick: () => void;
}>(({ property, isSelected, dimmed, onClick }, ref) => {
  // Determine the marker color dot — use cyan for all (matching GlowMarker)
  return (
    <div
      ref={ref}
      onClick={onClick}
      className="cursor-pointer transition-opacity duration-300"
      style={{
        opacity: dimmed ? 0.35 : 1,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {/* Collapsed row — always visible, ~64px */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Colored dot */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: colors.cyan,
          boxShadow: isSelected ? `0 0 8px ${colors.cyan}` : 'none',
          flexShrink: 0,
        }} />
        {/* Price + address */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: colors.white }}>
            {formatPrice(property.price)}
          </p>
          <p className="text-xs truncate" style={{ color: colors.whiteMuted }}>
            {property.streetAddress}
          </p>
        </div>
        {/* Status badge */}
        {property.statusText && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md flex-shrink-0"
            style={{
              background: 'rgba(0,200,255,0.12)',
              color: colors.cyan,
              border: `1px solid rgba(0,200,255,0.25)`,
            }}>
            {property.statusText}
          </span>
        )}
      </div>

      {/* Expandable detail — CSS grid accordion */}
      <div style={{
        display: 'grid',
        gridTemplateRows: isSelected ? '1fr' : '0fr',
        transition: 'grid-template-rows 400ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <ExpandedDetail property={property} />
        </div>
      </div>
    </div>
  );
});
```

**ExpandedDetail sub-component:**

This holds the hero image/gallery, property info, badges, and collapsible mortgage predictor. Reuse the existing internal components from the current RightPanel (CircularGauge, MoneyInput, NumberInput, PropertyBadge) by extracting them or keeping them inline.

```tsx
function ExpandedDetail({ property }: { property: Property }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [mortgageOpen, setMortgageOpen] = useState(false);
  // ... mortgage predictor hook, fields state, etc. (same as current RightPanel)

  useEffect(() => { setPhotoIdx(0); }, [property.id]);

  const photos = property.photos.length > 0 ? property.photos : [property.imageUrl];

  return (
    <div className="pb-3">
      {/* Hero image — 180px height */}
      <div className="relative mx-3 rounded-xl overflow-hidden" style={{ height: 180 }}>
        <img src={photos[photoIdx]} ... />
        {/* Photo nav arrows, dot indicators — same as current */}
      </div>

      {/* Property info */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-lg font-black" style={{ color: colors.white }}>
          {formatPrice(property.price)}
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: colors.cyan }}>
          {property.address}
        </p>
        {/* beds/baths/sqft row */}
        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: colors.whiteMuted }}>
          <span><Bed size={12}/> {property.beds} beds</span>
          <span><Bath size={12}/> {property.baths} baths</span>
          <span><Square size={12}/> {property.sqft.toLocaleString()} sqft</span>
        </div>
        {/* Tag badges */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {/* Same badge logic as current RightPanel */}
        </div>
      </div>

      {/* Mortgage predictor — collapsible section */}
      <div className="px-4 mt-1">
        <button onClick={() => setMortgageOpen(v => !v)}
          className="flex items-center justify-between w-full py-2 text-xs font-bold uppercase"
          style={{ color: colors.whiteMuted, letterSpacing: '0.1em' }}>
          AI Mortgage Predictor
          <ChevronDown size={14} style={{
            transform: mortgageOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 300ms',
          }} />
        </button>
        <div style={{
          display: 'grid',
          gridTemplateRows: mortgageOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 300ms ease',
        }}>
          <div style={{ overflow: 'hidden' }}>
            {/* Form + gauge — same as current RightPanel but narrower layout */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Key decisions:**
- The mortgage predictor starts **collapsed** inside the expanded card to save vertical space. The user clicks a toggle to open it.
- The hero image is 180px tall (not 220px) since the panel is 360px wide instead of 420px.
- All existing helper components (CircularGauge, MoneyInput, NumberInput, PropertyBadge) stay in RightPanel.tsx since they are tightly coupled.

---

### Step 4: Create ConnectionLine.tsx

**File:** `/Users/doyoungyoon/Desktop/WSU-2026/client/src/components/ConnectionLine.tsx` (new file)

This is a full-viewport SVG overlay that draws a curved line from the map marker to the expanded card.

```tsx
interface Props {
  markerPos: {x:number; y:number} | null;
  cardPos: {x:number; y:number} | null;
  visible: boolean;
}

export function ConnectionLine({ markerPos, cardPos, visible }: Props) {
  if (!visible || !markerPos || !cardPos) return null;

  // Build a cubic bezier path from marker to card anchor
  const mx = markerPos.x;
  const my = markerPos.y;
  const cx = cardPos.x;
  const cy = cardPos.y;

  // Control points: horizontal ease from marker toward the panel
  const midX = (mx + cx) / 2;
  const d = `M ${mx} ${my} C ${midX} ${my}, ${midX} ${cy}, ${cx} ${cy}`;

  return (
    <svg
      className="absolute inset-0 z-15 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,200,255,0.6)" />
          <stop offset="100%" stopColor="rgba(0,200,255,0.15)" />
        </linearGradient>
      </defs>
      {/* Glow layer */}
      <path d={d} fill="none" stroke="rgba(0,200,255,0.15)" strokeWidth={6} />
      {/* Main line */}
      <path d={d} fill="none" stroke="url(#line-grad)" strokeWidth={2} strokeDasharray="6 4" />
      {/* Marker endpoint dot */}
      <circle cx={mx} cy={my} r={4} fill={colors.cyan} opacity={0.7} />
      {/* Card endpoint dot */}
      <circle cx={cx} cy={cy} r={3} fill={colors.cyan} opacity={0.5} />
    </svg>
  );
}
```

**Z-index placement:** The SVG sits at `z-15` (between the map at z-0 and the panels at z-10/z-20). Since Tailwind v4 supports arbitrary z-index values, use `z-[15]` or inline `style={{ zIndex: 15 }}`.

**Performance note:** Both `markerPos` and `cardPos` are updated via `requestAnimationFrame` loops, so the SVG re-renders at 60fps during map animations. This is acceptable because the ConnectionLine component is extremely lightweight (a single SVG with two paths and two circles). If profiling shows issues, wrap the SVG in `React.memo` and memoize the `d` path string.

---

### Step 5: Update CenterPanel.tsx — Thread the New Prop

**File:** `/Users/doyoungyoon/Desktop/WSU-2026/client/src/components/CenterPanel/CenterPanel.tsx`

Add `onMarkerScreenPosition` to the Props interface and pass it through to MapView:

```ts
interface Props {
  // ...existing...
  onMarkerScreenPosition?: (pos: {x:number; y:number} | null) => void;
}

export function CenterPanel(props: Props) {
  return (
    <div className="w-full h-full relative">
      <MapView {...props} />
    </div>
  );
}
```

No other changes needed since CenterPanel is a thin wrapper.

---

## Answers to Specific Questions

### Q1: How to get marker screen position from MapView to App for the SVG line?

Use `mapRef.current.project([lng, lat])` inside a `requestAnimationFrame` loop in a `useEffect` within MapView. The loop runs continuously while a property is selected, calling a callback prop `onMarkerScreenPosition({x, y})`. The rAF loop ensures the position updates during flyTo animations, user pan/zoom, and window resize. Since the map is full-viewport, the projected coordinates are already in viewport space and need no offset adjustment.

### Q2: How to get expanded card DOM position from RightPanel to App?

Attach a `ref` to the selected card's wrapper `<div>`. In a `useEffect` with a `requestAnimationFrame` loop, call `getBoundingClientRect()` on that ref and invoke the `onCardAnchorChange` callback with `{x: rect.left, y: rect.top + rect.height/2}`. The rAF loop handles scroll-induced position changes. The loop is cleaned up (via `cancelAnimationFrame`) when the selection changes or component unmounts.

### Q3: How to handle the line during map animations (flyTo)?

The `requestAnimationFrame` loop in MapView continuously re-projects the selected marker's coordinates. During a flyTo animation, mapbox-gl internally animates the camera, so `project()` returns different screen coordinates on each frame. The rAF loop captures these changing values and propagates them to App state, which re-renders ConnectionLine. The result is a smoothly animated connection line that follows the marker during flyTo.

### Q4: How to structure the expanded card content?

Inline everything within RightPanel.tsx. The existing helper components (CircularGauge, MoneyInput, NumberInput, PropertyBadge) are small and only used here, so keep them as local function components in the same file. The expanded content is split into:
- `ExpandedDetail` — hero image, property info, badges
- Collapsible mortgage section within `ExpandedDetail` — uses the same `useMortgagePredictor` hook

Do NOT extract to separate files — the coupling is tight and the file remains manageable (~400-500 lines).

### Q5: What width for the right panel when always visible?

**360px.** Rationale:
- The current slide-in is 420px, but it overlays the map temporarily. A permanent panel at 420px consumes too much horizontal space.
- 360px provides enough room for compact cards (~64px height) and the expanded detail view, while leaving ample map area (on a 1440px screen, the map gets ~1080px minus the left panel).
- The left panel is 272px (or 58px collapsed), so in the worst case (both panels visible), the map area is `1440 - 272 - 360 = 808px` — still functional.
- If targeting smaller screens (1280px), the map gets `1280 - 272 - 360 = 648px` — acceptable. If the left panel is collapsed: `1280 - 58 - 360 = 862px`.

---

## Implementation Order

1. **ConnectionLine.tsx** (new file) — pure presentational, no dependencies, can be built and tested in isolation with hardcoded positions.
2. **CenterPanel.tsx** — trivial prop threading change.
3. **MapView.tsx** — add the rAF projection loop and new prop. Test by logging positions.
4. **RightPanel.tsx** — full rewrite. Build the compact card list first, then add the accordion expansion, then port the expanded detail content from the old version.
5. **App.tsx** — wire everything together: new state, new props, remove slide-in logic, add ConnectionLine to JSX.

---

## Potential Pitfalls

1. **rAF loop performance**: Two rAF loops running simultaneously (MapView + RightPanel) each calling setState on every frame. This triggers re-renders of ConnectionLine at 60fps. Mitigation: use `React.memo` on ConnectionLine, and consider debouncing to every 2nd or 3rd frame if profiling shows issues. Alternatively, use refs + direct DOM mutation for the SVG path `d` attribute instead of React state, which avoids React re-renders entirely.

2. **Scroll vs. getBoundingClientRect**: The card's `getBoundingClientRect()` returns viewport-relative positions, which change as the user scrolls the list. The rAF loop handles this, but the auto-scroll (`scrollIntoView`) may cause a brief mismatch. This is cosmetically acceptable since it resolves within one frame.

3. **Marker behind the right panel**: If the user pans the map so the selected marker is behind the right panel, the connection line would originate from behind the panel. The `flyTo` offset partially prevents this, but not entirely. Consider clamping `markerPos.x` to be no greater than `window.innerWidth - 360` (the panel's left edge).

4. **Grid accordion in older browsers**: `grid-template-rows: 0fr/1fr` transition is supported in Chrome 107+, Firefox 66+, Safari 16.4+. Given the tech stack (React 19, Tailwind v4), this target audience is reasonable.

5. **Existing PropertyCard.tsx and PropertyList.tsx**: These files use a completely different color scheme (indigo-based, `#25253e`, `#6366f1`) that does not match the design system in `design.ts`. They should NOT be reused. The new CompactCard in RightPanel.tsx replaces their functionality using the correct `colors` and `glass` tokens.
