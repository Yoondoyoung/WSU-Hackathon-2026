import { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useMortgagePredictor } from '../../hooks/useMortgagePredictor';
import type { MortgageRequestPayload } from '../../types/mortgage';
import type { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatters';

interface Props {
  selectedProperty: Property | null;
}

const DEFAULTS: MortgageRequestPayload = {
  person_age: 30,
  person_gender: 'male',
  person_education: 'Bachelor',
  person_income: 80000,
  person_home_ownership: 'RENT',
  loan_intent: 'HOMEIMPROVEMENT',
  loan_amnt: 300000,
  loan_int_rate: 7.5,
  loan_percent_income: 0.25,
  cb_person_default_on_file: 'N',
  cb_person_cred_hist_length: 5,
  previous_loan_defaults_on_file: 'No',
};

function InputField({
  label,
  type = 'number',
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-[#8888a8] text-xs mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full bg-[#0f0f1a] border border-[#2d2d4a] rounded-lg px-3 py-2 text-[#e2e2f0] text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[#8888a8] text-xs mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f0f1a] border border-[#2d2d4a] rounded-lg px-3 py-2 text-[#e2e2f0] text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MortgagePredictor({ selectedProperty }: Props) {
  const [form, setForm] = useState<MortgageRequestPayload>(() => ({
    ...DEFAULTS,
    loan_amnt: selectedProperty?.price ?? DEFAULTS.loan_amnt,
  }));
  const { result, loading, error, predict } = useMortgagePredictor();

  const set = (key: keyof MortgageRequestPayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: ['person_age', 'person_income', 'loan_amnt', 'loan_int_rate', 'loan_percent_income', 'cb_person_cred_hist_length'].includes(key)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    predict(form);
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={16} className="text-[#6366f1]" />
        <h3 className="text-[#e2e2f0] font-semibold text-sm">Mortgage Approval Predictor</h3>
      </div>

      {selectedProperty && (
        <div className="bg-[#0f0f1a] border border-[#2d2d4a] rounded-lg p-3 mb-4">
          <p className="text-[#8888a8] text-xs mb-1">Selected Property</p>
          <p className="text-[#e2e2f0] text-sm font-medium truncate">{selectedProperty.address}</p>
          <p className="text-[#6366f1] text-sm font-bold">{formatPrice(selectedProperty.price)}</p>
        </div>
      )}

      {!selectedProperty && (
        <p className="text-[#8888a8] text-xs mb-4 italic">
          Select a property from the list above to auto-fill the loan amount.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <InputField label="Age" value={form.person_age} onChange={(v) => set('person_age', v)} min={18} max={100} />

        <SelectField
          label="Gender"
          value={form.person_gender}
          onChange={(v) => set('person_gender', v)}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
        />

        <SelectField
          label="Education"
          value={form.person_education}
          onChange={(v) => set('person_education', v)}
          options={[
            { value: 'High School', label: 'High School' },
            { value: 'Associate', label: 'Associate' },
            { value: 'Bachelor', label: "Bachelor's" },
            { value: 'Master', label: "Master's" },
            { value: 'Doctorate', label: 'Doctorate' },
          ]}
        />

        <InputField label="Annual Income ($)" value={form.person_income} onChange={(v) => set('person_income', v)} min={0} />

        <SelectField
          label="Current Home Ownership"
          value={form.person_home_ownership}
          onChange={(v) => set('person_home_ownership', v)}
          options={[
            { value: 'RENT', label: 'Renting' },
            { value: 'OWN', label: 'Own' },
            { value: 'MORTGAGE', label: 'Mortgage' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />

        <SelectField
          label="Loan Intent"
          value={form.loan_intent}
          onChange={(v) => set('loan_intent', v)}
          options={[
            { value: 'HOMEIMPROVEMENT', label: 'Home Purchase' },
            { value: 'PERSONAL', label: 'Personal' },
            { value: 'EDUCATION', label: 'Education' },
            { value: 'MEDICAL', label: 'Medical' },
            { value: 'VENTURE', label: 'Business Venture' },
            { value: 'DEBTCONSOLIDATION', label: 'Debt Consolidation' },
          ]}
        />

        <InputField label="Loan Amount ($)" value={form.loan_amnt} onChange={(v) => set('loan_amnt', v)} min={0} />

        <InputField label="Interest Rate (%)" value={form.loan_int_rate} onChange={(v) => set('loan_int_rate', v)} min={0} max={50} step={0.1} />

        <InputField label="Loan-to-Income Ratio (0–1)" value={form.loan_percent_income} onChange={(v) => set('loan_percent_income', v)} min={0} max={1} step={0.01} />

        <SelectField
          label="Default on File"
          value={form.cb_person_default_on_file}
          onChange={(v) => set('cb_person_default_on_file', v)}
          options={[
            { value: 'N', label: 'No' },
            { value: 'Y', label: 'Yes' },
          ]}
        />

        <InputField label="Credit History Length (years)" value={form.cb_person_cred_hist_length} onChange={(v) => set('cb_person_cred_hist_length', v)} min={0} />

        <SelectField
          label="Previous Loan Defaults"
          value={form.previous_loan_defaults_on_file}
          onChange={(v) => set('previous_loan_defaults_on_file', v)}
          options={[
            { value: 'No', label: 'No' },
            { value: 'Yes', label: 'Yes' },
          ]}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6366f1] hover:bg-[#818cf8] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
        >
          {loading ? 'Calculating...' : 'Calculate Approval Probability'}
        </button>
      </form>

      {/* Result */}
      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-900/20 border border-red-800/50 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {result && !error && (
        <div
          className={`mt-4 rounded-xl border p-4 ${
            result.approved
              ? 'bg-green-900/20 border-green-700/50'
              : 'bg-red-900/20 border-red-700/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.approved ? (
              <TrendingUp size={20} className="text-green-400" />
            ) : (
              <TrendingDown size={20} className="text-red-400" />
            )}
            <div>
              <p className={`font-bold text-sm ${result.approved ? 'text-green-300' : 'text-red-300'}`}>
                {result.approved ? 'Likely Approved' : 'Higher Risk'}
              </p>
              <p className="text-[#8888a8] text-xs">Confidence Score</p>
            </div>
            <div className="ml-auto text-right">
              <p className={`text-2xl font-black ${result.approved ? 'text-green-400' : 'text-red-400'}`}>
                {result.confidence}%
              </p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="w-full bg-[#2d2d4a] rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${result.approved ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>

          <p className="text-[#8888a8] text-xs leading-relaxed">{result.message}</p>
        </div>
      )}
    </div>
  );
}
