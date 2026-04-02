import { useRef, useState } from 'react';
import { X, GripHorizontal, Maximize2, Bed, Bath, Square, ShieldAlert, GraduationCap, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import type { Property } from '../types/property';
import { formatPrice, formatSqft } from '../utils/formatters';
import { calcTCO, TCO_DEFAULTS } from '../utils/tcoCalculator';
import { colors, glass } from '../design';

interface Props {
  propertyA: Property;
  propertyB: Property;
  x: number;
  y: number;
  onMove: (x: number, y: number) => void;
  onClose: () => void;
  onSeparate: () => void;
}

type WinDir = 'a' | 'b' | 'tie';

function winner(a: number, b: number, lowerIsBetter = false): WinDir {
  if (a === b) return 'tie';
  return lowerIsBetter ? (a < b ? 'a' : 'b') : (a > b ? 'a' : 'b');
}

const WIN_COLOR = '#4ade80';
const LOSE_COLOR = colors.whiteMuted;
const TIE_COLOR = '#e2e2f0';

function winStyle(dir: WinDir, side: 'a' | 'b'): React.CSSProperties {
  if (dir === 'tie') return { color: TIE_COLOR, fontWeight: 600 };
  return dir === side
    ? { color: WIN_COLOR, fontWeight: 700 }
    : { color: LOSE_COLOR, fontWeight: 500 };
}

function CrimeChip({ level }: { level: 'low' | 'medium' | 'high' }) {
  const colors_ = { low: '#4ade80', medium: '#fbbf24', high: '#f87171' };
  const c = colors_[level] ?? '#94a3b8';
  return <span style={{ color: c, fontWeight: 700, fontSize: 11 }}>{level.toUpperCase()}</span>;
}

interface RowProps {
  label: string;
  icon: React.ElementType;
  aNode: React.ReactNode;
  bNode: React.ReactNode;
  winDir: WinDir;
}

function CompareRow({ label, icon: Icon, aNode, bNode, winDir }: RowProps) {
  return (
    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
      <td style={{ padding: '7px 12px', color: colors.whiteMuted, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'left', verticalAlign: 'middle' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon size={11} style={{ opacity: 0.6 }} />{label}
        </span>
      </td>
      <td style={{ padding: '7px 10px', textAlign: 'center', verticalAlign: 'middle',
        background: winDir === 'a' ? `${WIN_COLOR}0c` : 'transparent' }}>
        {aNode}
      </td>
      <td style={{ padding: '7px 10px', textAlign: 'center', verticalAlign: 'middle',
        background: winDir === 'b' ? `${WIN_COLOR}0c` : 'transparent' }}>
        {bNode}
      </td>
    </tr>
  );
}

export function PropertyCompareView({ propertyA, propertyB, x, y, onMove, onClose, onSeparate }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  const tcoA = calcTCO(propertyA, TCO_DEFAULTS);
  const tcoB = calcTCO(propertyB, TCO_DEFAULTS);

  const topSchoolA = propertyA.schools.length > 0 ? Math.max(...propertyA.schools.map((s) => s.rating)) : 0;
  const topSchoolB = propertyB.schools.length > 0 ? Math.max(...propertyB.schools.map((s) => s.rating)) : 0;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOffset.current = { dx: e.clientX - x, dy: e.clientY - y };
    setIsDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    onMove(e.clientX - dragOffset.current.dx, e.clientY - dragOffset.current.dy);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    setIsDragging(false);
    onMove(e.clientX - dragOffset.current.dx, e.clientY - dragOffset.current.dy);
  }

  const rows: Omit<RowProps, 'winDir'>[] & { winDir: WinDir }[] = [
    {
      label: 'Price',
      icon: DollarSign,
      aNode: <span style={winStyle(winner(propertyA.price, propertyB.price, true), 'a')}>{formatPrice(propertyA.price)}</span>,
      bNode: <span style={winStyle(winner(propertyA.price, propertyB.price, true), 'b')}>{formatPrice(propertyB.price)}</span>,
      winDir: winner(propertyA.price, propertyB.price, true),
    },
    {
      label: 'Est. Monthly',
      icon: TrendingDown,
      aNode: <span style={winStyle(winner(tcoA.netMonthly, tcoB.netMonthly, true), 'a')}>${tcoA.netMonthly.toLocaleString()}/mo</span>,
      bNode: <span style={winStyle(winner(tcoA.netMonthly, tcoB.netMonthly, true), 'b')}>${tcoB.netMonthly.toLocaleString()}/mo</span>,
      winDir: winner(tcoA.netMonthly, tcoB.netMonthly, true),
    },
    {
      label: 'Beds / Baths',
      icon: Bed,
      aNode: <span style={{ color: '#e2e2f0', fontSize: 11 }}>{propertyA.beds}bd / {propertyA.baths}ba</span>,
      bNode: <span style={{ color: '#e2e2f0', fontSize: 11 }}>{propertyB.beds}bd / {propertyB.baths}ba</span>,
      winDir: winner(propertyA.beds + propertyA.baths, propertyB.beds + propertyB.baths),
    },
    {
      label: 'Sqft',
      icon: Square,
      aNode: <span style={winStyle(winner(propertyA.sqft, propertyB.sqft), 'a')}>{formatSqft(propertyA.sqft)}</span>,
      bNode: <span style={winStyle(winner(propertyA.sqft, propertyB.sqft), 'b')}>{formatSqft(propertyB.sqft)}</span>,
      winDir: winner(propertyA.sqft, propertyB.sqft),
    },
    {
      label: 'Year Built',
      icon: Calendar,
      aNode: <span style={winStyle(winner(propertyA.yearBuilt, propertyB.yearBuilt), 'a')}>{propertyA.yearBuilt || '—'}</span>,
      bNode: <span style={winStyle(winner(propertyA.yearBuilt, propertyB.yearBuilt), 'b')}>{propertyB.yearBuilt || '—'}</span>,
      winDir: winner(propertyA.yearBuilt, propertyB.yearBuilt),
    },
    {
      label: 'Crime Risk',
      icon: ShieldAlert,
      aNode: <CrimeChip level={propertyA.crimeRiskLevel} />,
      bNode: <CrimeChip level={propertyB.crimeRiskLevel} />,
      winDir: winner(
        propertyA.crimeRiskLevel === 'low' ? 2 : propertyA.crimeRiskLevel === 'medium' ? 1 : 0,
        propertyB.crimeRiskLevel === 'low' ? 2 : propertyB.crimeRiskLevel === 'medium' ? 1 : 0,
      ),
    },
    {
      label: 'Top School',
      icon: GraduationCap,
      aNode: <span style={winStyle(winner(topSchoolA, topSchoolB), 'a')}>{topSchoolA > 0 ? `${topSchoolA}/10` : '—'}</span>,
      bNode: <span style={winStyle(winner(topSchoolA, topSchoolB), 'b')}>{topSchoolB > 0 ? `${topSchoolB}/10` : '—'}</span>,
      winDir: winner(topSchoolA, topSchoolB),
    },
  ];

  const winsA = rows.filter((r) => r.winDir === 'a').length;
  const winsB = rows.filter((r) => r.winDir === 'b').length;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 480,
        zIndex: isDragging ? 40 : 30,
        pointerEvents: 'auto',
        userSelect: 'none',
        ...glass.panelDense,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 0 0 1.5px ${colors.cyan}50, 0 16px 48px rgba(0,0,0,0.7)`,
        border: `1.5px solid ${colors.cyan}60`,
      }}
    >
      {/* Header drag bar */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          background: `linear-gradient(135deg, ${colors.cyan}18 0%, rgba(99,102,241,0.15) 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GripHorizontal size={13} style={{ color: colors.whiteMuted }} />
          <span style={{ color: colors.cyan, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
            SIDE-BY-SIDE COMPARE
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onSeparate}
            title="Split back to separate cards"
            style={{ color: colors.whiteMuted, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 6px', borderRadius: 6, transition: 'color 0.15s' }}
          >
            <Maximize2 size={11} /> Separate
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
            style={{ color: colors.whiteMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Property photos + names header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${colors.border}` }}>
        {[propertyA, propertyB].map((p, i) => (
          <div key={p.id} style={{ position: 'relative', height: 90, borderRight: i === 0 ? `1px solid ${colors.border}` : 'none' }}>
            <img
              src={p.photos[0] ?? p.imageUrl}
              alt={p.streetAddress}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/240x90/1a1a2e/6366f1?text=No+Image'; }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(13,17,23,0.85))' }} />
            <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8 }}>
              <p style={{ color: '#e2e2f0', fontSize: 11, fontWeight: 700, margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.streetAddress}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Win tally */}
      <div style={{ display: 'grid', gridTemplateColumns: `auto 1fr 1fr`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ padding: '5px 12px', color: colors.whiteMuted, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center' }} />
        {[{ wins: winsA, label: 'A' }, { wins: winsB, label: 'B' }].map(({ wins, label }, i) => (
          <div key={label} style={{
            padding: '5px 10px', textAlign: 'center',
            borderLeft: i === 0 ? `1px solid ${colors.border}` : 'none',
            borderRight: i === 0 ? `1px solid ${colors.border}` : 'none',
            background: wins > (i === 0 ? winsB : winsA) ? `${WIN_COLOR}12` : 'transparent',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: wins > (i === 0 ? winsB : winsA) ? WIN_COLOR : colors.whiteMuted }}>
              {wins} wins {wins > (i === 0 ? winsB : winsA) ? '🏆' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '35%' }} />
        </colgroup>
        <tbody>
          {rows.map((row) => (
            <CompareRow key={row.label} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
