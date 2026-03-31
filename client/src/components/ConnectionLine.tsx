import { useEffect, useRef, type MutableRefObject } from 'react';

export type ScreenPos = { x: number; y: number };

interface Props {
  markerPosRef: MutableRefObject<ScreenPos | null>;
  cardPosRef: MutableRefObject<ScreenPos | null>;
  visible: boolean;
}

/** Updates SVG via rAF + DOM — avoids React state so the map does not re-render every frame. */
export function ConnectionLine({ markerPosRef, cardPosRef, visible }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const mainRef = useRef<SVGPathElement>(null);
  const mDotRef = useRef<SVGCircleElement>(null);
  const mRingRef = useRef<SVGCircleElement>(null);
  const cDotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!visible) return;

    let rafId = 0;
    function tick() {
      const m = markerPosRef.current;
      const c = cardPosRef.current;
      const svg = svgRef.current;

      if (svg && m && c && glowRef.current && mainRef.current) {
        svg.style.opacity = '1';
        const mx = m.x;
        const my = m.y;
        const cx = c.x;
        const cy = c.y;
        const midX = (mx + cx) / 2;
        const d = `M ${mx} ${my} C ${midX} ${my}, ${midX} ${cy}, ${cx} ${cy}`;
        glowRef.current.setAttribute('d', d);
        mainRef.current.setAttribute('d', d);
        mDotRef.current?.setAttribute('cx', String(mx));
        mDotRef.current?.setAttribute('cy', String(my));
        mRingRef.current?.setAttribute('cx', String(mx));
        mRingRef.current?.setAttribute('cy', String(my));
        cDotRef.current?.setAttribute('cx', String(cx));
        cDotRef.current?.setAttribute('cy', String(cy));
      } else if (svg) {
        svg.style.opacity = '0';
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [visible, markerPosRef, cardPosRef]);

  if (!visible) return null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 z-[15] pointer-events-none"
      style={{ width: '100%', height: '100%', opacity: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,200,255,0.6)" />
          <stop offset="100%" stopColor="rgba(0,200,255,0.05)" />
        </linearGradient>
      </defs>

      <path
        ref={glowRef}
        d="M0 0"
        fill="none"
        stroke="rgba(0,200,255,0.12)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        ref={mainRef}
        d="M0 0"
        fill="none"
        stroke="url(#conn-grad)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="6 4"
      />
      <circle ref={mDotRef} cx={0} cy={0} r={4} fill="rgba(0,200,255,0.8)" />
      <circle ref={mRingRef} cx={0} cy={0} r={6} fill="none" stroke="rgba(0,200,255,0.25)" strokeWidth={2} />
      <circle ref={cDotRef} cx={0} cy={0} r={3} fill="rgba(0,200,255,0.5)" />
    </svg>
  );
}
