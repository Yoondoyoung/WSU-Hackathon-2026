export interface MortgageRequestPayload {
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

export interface MortgageResponse {
  approved: boolean;
  confidence: number;
  message: string;
}
