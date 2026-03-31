import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useMortgagePredictor } from '../../hooks/useMortgagePredictor';
import type { MortgageRequestPayload } from '../../types/mortgage';
import type { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatters';

interface Props {
  selectedProperty: Property | null;
}

const DEFAULTS: MortgageRequestPayload = {
  loan_amount: 300000,
  property_value: 400000,
  income: 85,
  debt_to_income_ratio: '30%-<36%',
  loan_type: 1,
  loan_purpose: 1,
  loan_term: 360,
  applicant_age: '35-44',
  applicant_sex: 1,
  occupancy_type: 1,
};

function CircularGauge({ value, approved }: { value: number; approved: boolean }) {
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);
  const color =
    approved ? (value >= 70 ? '#00e676' : '#f59e0b') : '#ef4444';
  const glowColor =
    approved ? (value >= 70 ? 'rgba(0,230,118,0.4)' : 'rgba(245,158,11,0.4)') : 'rgba(239,68,68,0.4)';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 120" className="w-28 h-28">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track ring */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Progress ring */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          filter="url(#glow)"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease',
          }}
        />
        {/* Center percentage */}
        <text
          x="60" y="56"
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          {value}%
        </text>
        <text
          x="60" y="72"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
          letterSpacing="1.5"
        >
          {approved ? 'APPROVED' : 'DENIED'}
        </text>
      </svg>
      <p
        className="text-xs font-semibold"
        style={{ color, textShadow: `0 0 12px ${glowColor}` }}
      >
        {approved ? 'Likely Approved' : 'Higher Risk'}
      </p>
    </div>
  );
}

function InputField({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="block text-white/30 text-[10px] uppercase tracking-widest mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min} max={max} step={step}
        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/80 text-xs focus:outline-none focus:border-[#00e5ff]/40 transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string | number; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-white/30 text-[10px] uppercase tracking-widest mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/80 text-xs focus:outline-none focus:border-[#00e5ff]/40 transition-colors"
        style={{ colorScheme: 'dark' }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function MortgagePredictor({ selectedProperty }: Props) {
  const [form, setForm] = useState<MortgageRequestPayload>(DEFAULTS);
  const { result, loading, error, predict } = useMortgagePredictor();

  useEffect(() => {
    if (selectedProperty) {
      setForm((prev) => ({
        ...prev,
        loan_amount: Math.round(selectedProperty.price * 0.8),
        property_value: selectedProperty.price,
      }));
    }
  }, [selectedProperty]);

  const setNum = (key: keyof MortgageRequestPayload, v: number) =>
    setForm((prev) => ({ ...prev, [key]: v }));
  const setStr = (key: keyof MortgageRequestPayload, v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    predict(form);
  };

  return (
    <div>
      {selectedProperty && (
        <div className="bg-white/4 border border-white/6 rounded-xl p-3 mb-4">
          <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Selected Property</p>
          <p className="text-white/70 text-xs font-medium truncate">{selectedProperty.address}</p>
          <p className="text-[#00e5ff] text-sm font-bold mt-0.5">{formatPrice(selectedProperty.price)}</p>
          <p className="text-white/30 text-[10px] mt-0.5">
            Auto-filled: 80% LTV · {formatPrice(Math.round(selectedProperty.price * 0.8))} loan
          </p>
        </div>
      )}

      {!selectedProperty && (
        <p className="text-white/30 text-[11px] mb-4 italic">
          Select a property on the map to auto-fill loan values.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <InputField label="Loan Amount ($)" value={form.loan_amount} onChange={(v) => setNum('loan_amount', v)} min={0} />
        <InputField label="Property Value ($)" value={form.property_value} onChange={(v) => setNum('property_value', v)} min={0} />
        <InputField label="Annual Income ($K)" value={form.income} onChange={(v) => setNum('income', v)} min={0} />

        <SelectField label="Debt-to-Income Ratio" value={form.debt_to_income_ratio}
          onChange={(v) => setStr('debt_to_income_ratio', v)}
          options={[
            { value: '20%-<30%', label: '20% – 30%' },
            { value: '30%-<36%', label: '30% – 36%' },
            { value: '36', label: '36%' },
            { value: '40', label: '40%' },
            { value: '43', label: '43%' },
            { value: '50%-60%', label: '50% – 60%' },
          ]}
        />
        <SelectField label="Loan Type" value={String(form.loan_type)}
          onChange={(v) => setNum('loan_type', parseInt(v))}
          options={[
            { value: '1', label: 'Conventional' },
            { value: '2', label: 'FHA' },
            { value: '3', label: 'VA' },
            { value: '4', label: 'RHS / FSA' },
          ]}
        />
        <SelectField label="Loan Purpose" value={String(form.loan_purpose)}
          onChange={(v) => setNum('loan_purpose', parseInt(v))}
          options={[
            { value: '1', label: 'Home Purchase' },
            { value: '2', label: 'Home Improvement' },
            { value: '31', label: 'Refinancing' },
            { value: '32', label: 'Cash-out Refinancing' },
          ]}
        />
        <SelectField label="Loan Term" value={String(form.loan_term)}
          onChange={(v) => setNum('loan_term', parseInt(v))}
          options={[
            { value: '360', label: '30 years' },
            { value: '240', label: '20 years' },
            { value: '180', label: '15 years' },
            { value: '120', label: '10 years' },
          ]}
        />
        <SelectField label="Applicant Age" value={form.applicant_age}
          onChange={(v) => setStr('applicant_age', v)}
          options={[
            { value: '<25', label: 'Under 25' },
            { value: '25-34', label: '25 – 34' },
            { value: '35-44', label: '35 – 44' },
            { value: '45-54', label: '45 – 54' },
            { value: '55-64', label: '55 – 64' },
            { value: '65-74', label: '65 – 74' },
            { value: '>74', label: '75+' },
          ]}
        />
        <SelectField label="Applicant Sex" value={String(form.applicant_sex)}
          onChange={(v) => setNum('applicant_sex', parseInt(v))}
          options={[
            { value: '1', label: 'Male' },
            { value: '2', label: 'Female' },
            { value: '3', label: 'Not Provided' },
          ]}
        />
        <SelectField label="Occupancy" value={String(form.occupancy_type)}
          onChange={(v) => setNum('occupancy_type', parseInt(v))}
          options={[
            { value: '1', label: 'Primary Residence' },
            { value: '2', label: 'Second Home' },
            { value: '3', label: 'Investment Property' },
          ]}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(41,121,255,0.15))',
            border: '1px solid rgba(0,229,255,0.25)',
            color: '#00e5ff',
            boxShadow: loading ? 'none' : '0 0 16px rgba(0,229,255,0.1)',
          }}
        >
          {loading ? 'Calculating...' : 'Predict Approval'}
        </button>
      </form>

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300/80 text-xs">{error}</p>
        </div>
      )}

      {result && !error && (
        <div className="mt-4 bg-white/4 border border-white/8 rounded-2xl p-4">
          <div className="flex justify-center mb-3">
            <CircularGauge value={result.confidence} approved={result.approved} />
          </div>
          <p className="text-white/40 text-[10px] text-center leading-relaxed mt-2">{result.message}</p>
        </div>
      )}
    </div>
  );
}
