import { Router } from 'express';

export const mortgageRouter = Router();

interface MortgagePayload {
  person_age: number;
  person_gender: string;
  person_education: string;
  person_income: number;
  person_home_ownership: string;
  loan_intent: string;
  loan_amnt: number;
  loan_int_rate: number;
  loan_percent_income: number;
  cb_person_default_on_file: string;
  cb_person_cred_hist_length: number;
  previous_loan_defaults_on_file: string;
}

mortgageRouter.post('/predict-mortgage', (req, res) => {
  const payload: MortgagePayload = req.body;

  let score = 50;

  // Income-to-loan ratio
  if (payload.loan_percent_income < 0.2) score += 20;
  else if (payload.loan_percent_income < 0.4) score += 10;
  else score -= 15;

  // Credit history length
  if (payload.cb_person_cred_hist_length > 10) score += 15;
  else if (payload.cb_person_cred_hist_length > 5) score += 10;
  else if (payload.cb_person_cred_hist_length > 3) score += 5;
  else score -= 10;

  // Default history
  if (payload.cb_person_default_on_file === 'N') score += 15;
  else score -= 25;

  if (payload.previous_loan_defaults_on_file === 'No') score += 5;
  else score -= 15;

  // Interest rate
  if (payload.loan_int_rate < 8) score += 5;
  else if (payload.loan_int_rate > 15) score -= 10;

  // Home ownership
  if (payload.person_home_ownership === 'OWN') score += 5;
  else if (payload.person_home_ownership === 'MORTGAGE') score += 3;

  // Education bonus
  if (['Master', 'Doctorate'].includes(payload.person_education)) score += 5;

  // Clamp between 5 and 98
  const confidence = Math.min(98, Math.max(5, score));
  const approved = confidence >= 55;

  res.json({
    approved,
    confidence,
    message: approved
      ? `Based on your financial profile, you have a strong chance of mortgage approval.`
      : `Your current profile suggests some risk factors. Consider improving your credit history or reducing the loan-to-income ratio.`,
  });
});
