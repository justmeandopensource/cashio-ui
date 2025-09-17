// AMC Types
export interface Amc {
  amc_id: number;
  name: string;
  description?: string;
  ledger_id: number;
  created_at: string;
}

export interface AmcCreate {
  name: string;
  description?: string;
}

export interface AmcUpdate {
  name?: string;
  description?: string;
}

// Mutual Fund Types
export interface MutualFund {
  mutual_fund_id: number;
  name: string;
  amc_id: number;
  ledger_id: number;
  total_units: number;
  average_cost_per_unit: number;
  latest_nav: number;
  last_nav_update?: string;
  current_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  total_realized_gain: number;
  total_invested_cash: number;
  amc?: Amc;
}

export interface MutualFundCreate {
  name: string;
  amc_id: number;
  notes?: string;
}

export interface MutualFundUpdate {
  name?: string;
  amc_id?: number;
  notes?: string;
}

export interface MutualFundNavUpdate {
  latest_nav: number;
}

// MF Transaction Types
export interface MfTransaction {
  mf_transaction_id: number;
  mutual_fund_id: number;
  transaction_type: 'buy' | 'sell' | 'switch_out' | 'switch_in';
  units: number;
  nav_per_unit: number;
  total_amount: number;
  account_id?: number;
  target_fund_id?: number;
  transaction_date: string;
  notes?: string;
  ledger_id: number;
  created_at: string;
  linked_transaction_id?: number;
  realized_gain?: number;
  cost_basis_of_units_sold?: number;
  mutual_fund?: MutualFund;
  account_name?: string;
  target_fund_name?: string;
}

export interface MfTransactionCreate {
  mutual_fund_id: number;
  transaction_type: 'buy' | 'sell' | 'switch_out' | 'switch_in';
  units: number;
  nav_per_unit: number;
  account_id?: number;
  target_fund_id?: number;
  transaction_date: string;
  notes?: string;
  to_nav?: number;
  linked_transaction_id?: number;
  realized_gain?: number;
  cost_basis_of_units_sold?: number;
}

export interface MfTransactionUpdate {
  notes?: string;
}

// Switch Types
export interface MfSwitchCreate {
  source_mutual_fund_id: number;
  target_mutual_fund_id: number;
  units_to_switch: number;
  source_nav_at_switch: number;
  target_nav_at_switch: number;
  transaction_date: Date;
  notes?: string;
}

// Summary and Analytics Types
export interface MutualFundSummary {
  mutual_fund_id: number;
  name: string;
  amc_name: string;
  total_units: number;
  average_cost_per_unit: number;
  latest_nav: number;
  current_value: number;
  total_invested: number;
  total_realized_gain: number; // New field
  unrealized_pnl: number;
  unrealized_pnl_percentage: number;
}

export interface AmcSummary {
  amc_id: number;
  name: string;
  total_funds: number;
  total_units: number;
  average_cost_per_unit: number;
  latest_nav: number;
  current_value: number;
  total_invested: number;
  total_realized_gain: number; // New field
  unrealized_pnl: number;
  unrealized_pnl_percentage: number;
}

// Form Types
export interface BuySellFormData {
  mutual_fund_id: number;
  units: number;
  nav_per_unit: number;
  account_id: number;
  transaction_date: string;
  notes?: string;
}