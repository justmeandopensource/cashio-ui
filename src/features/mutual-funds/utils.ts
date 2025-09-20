import { MutualFund, MfTransaction, AmcSummary, MutualFundSummary } from "./types";
import { formatNumberAsCurrency } from "@components/shared/utils";

// Format NAV to 2 decimal places
export const formatNav = (nav: number): string => {
  return nav.toFixed(2);
};

// Format units to 3 decimal places
export const formatUnits = (units: number): string => {
  return units.toFixed(3);
};

// Format amounts to 2 decimal places
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

// Calculate P&L for a fund
export const calculateFundPnL = (fund: MutualFund): { pnl: number; pnlPercentage: number; unrealizedPnl: number; realizedPnl: number } => {
  const totalInvested = fund.total_invested_cash || (fund.total_units * fund.average_cost_per_unit);
  const currentValue = fund.current_value;
  const realizedPnl = fund.total_realized_gain || 0;
  const unrealizedPnl = currentValue - totalInvested;
  const pnl = unrealizedPnl + realizedPnl;
  const pnlPercentage = totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0;

  return { pnl, pnlPercentage, unrealizedPnl, realizedPnl };
};

// Calculate summary for AMC
export const calculateAmcSummary = (amcFunds: MutualFund[]): AmcSummary => {
  const totalFunds = amcFunds.length;
  const totalUnits = amcFunds.reduce((sum, fund) => sum + fund.total_units, 0);
  const totalInvested = amcFunds.reduce((sum, fund) => sum + (fund.total_invested_cash || (fund.total_units * fund.average_cost_per_unit)), 0);
  const currentValue = amcFunds.reduce((sum, fund) => sum + fund.current_value, 0);
  const totalRealizedGain = amcFunds.reduce((sum, fund) => sum + (fund.total_realized_gain || 0), 0);
  const costBasis = amcFunds.reduce((sum, fund) => sum + (fund.total_invested_cash || (fund.total_units * fund.average_cost_per_unit)), 0);
  const unrealizedPnl = currentValue - costBasis;
  const unrealizedPnlPercentage = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  return {
    amc_id: amcFunds[0]?.amc_id || 0,
    name: amcFunds[0]?.amc?.name || '',
    total_funds: totalFunds,
    total_units: totalUnits,
    average_cost_per_unit: totalUnits > 0 ? costBasis / totalUnits : 0,
    latest_nav: 0, // Would need weighted average calculation
    current_value: currentValue,
    total_invested: totalInvested,
    total_realized_gain: totalRealizedGain,
    unrealized_pnl: unrealizedPnl,
    unrealized_pnl_percentage: unrealizedPnlPercentage,
  };
};

// Calculate summary for individual fund
export const calculateFundSummary = (fund: MutualFund): MutualFundSummary => {
  const costBasis = fund.total_invested_cash || (fund.total_units * fund.average_cost_per_unit);
  const totalInvested = fund.total_invested_cash || (fund.total_units * fund.average_cost_per_unit);
  const unrealizedPnl = fund.current_value - costBasis;
  const unrealizedPnlPercentage = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  return {
    mutual_fund_id: fund.mutual_fund_id,
    name: fund.name,
    amc_name: fund.amc?.name || '',
    total_units: fund.total_units,
    average_cost_per_unit: fund.average_cost_per_unit,
    latest_nav: fund.latest_nav,
    current_value: fund.current_value,
    total_invested: totalInvested,
    total_realized_gain: fund.total_realized_gain || 0,
    unrealized_pnl: unrealizedPnl,
    unrealized_pnl_percentage: unrealizedPnlPercentage,
  };
};

// Validate buy/sell form data
export const validateBuySellForm = (data: {
  units: number;
  nav_per_unit: number;
  account_id: number;
}): string[] => {
  const errors: string[] = [];

  if (data.units <= 0) {
    errors.push("Units must be greater than 0");
  }

  if (data.nav_per_unit <= 0) {
    errors.push("NAV per unit must be greater than 0");
  }

  if (!data.account_id) {
    errors.push("Account is required");
  }

  return errors;
};



// Get transaction type display text
export const getTransactionTypeText = (type: MfTransaction['transaction_type']): string => {
  switch (type) {
    case 'buy':
      return 'Buy';
    case 'sell':
      return 'Sell';
    case 'switch_out':
      return 'Switch Out';
    case 'switch_in':
      return 'Switch In';
    default:
      return type;
  }
};

// Format P&L with color indication
export const formatPnL = (pnl: number): { text: string; isPositive: boolean } => {
  const formatted = formatAmount(Math.abs(pnl));
  const isPositive = pnl >= 0;
  return {
    text: `${formatted}`,
    isPositive,
  };
};

// Format percentage with color indication
export const formatPercentage = (percentage: number): { text: string; isPositive: boolean } => {
  const formatted = Math.abs(percentage).toFixed(2);
  const isPositive = percentage >= 0;
  return {
    text: `${formatted}%`,
    isPositive,
  };
};

/**
 * Split currency value into main amount and decimal places for styling
 */
export const splitCurrencyForDisplay = (value: number, currencySymbol: string): { main: string; decimals: string } => {
  const formatted = formatNumberAsCurrency(value, currencySymbol);
  const parts = formatted.split('.');

  if (parts.length === 2) {
    return {
      main: `${parts[0]}.`,
      decimals: parts[1]
    };
  }

  // If no decimal places, return the whole amount as main
  return {
    main: formatted,
    decimals: ''
  };
};

/**
 * Split percentage value into main amount and decimal places for styling
 */
export const splitPercentageForDisplay = (value: number): { main: string; decimals: string } => {
  const formatted = Math.abs(value).toFixed(2);
  const parts = formatted.split('.');

  if (parts.length === 2) {
    return {
      main: `${parts[0]}.`,
      decimals: parts[1]
    };
  }

  // If no decimal places, return the whole amount as main
  return {
    main: formatted,
    decimals: ''
  };
};

/**
 * Calculate highest purchase cost from buy and switch_in transactions
 */
export const calculateHighestPurchaseCost = (transactions: { transaction_type: string; nav_per_unit: number }[]): number | null => {
  const purchaseTransactions = transactions.filter(t => t.transaction_type === "buy" || t.transaction_type === "switch_in");
  if (purchaseTransactions.length === 0) return null;

  return Math.max(...purchaseTransactions.map(t => t.nav_per_unit));
};

/**
 * Calculate lowest purchase cost from buy and switch_in transactions
 */
export const calculateLowestPurchaseCost = (transactions: { transaction_type: string; nav_per_unit: number }[]): number | null => {
  const purchaseTransactions = transactions.filter(t => t.transaction_type === "buy" || t.transaction_type === "switch_in");
  if (purchaseTransactions.length === 0) return null;

  return Math.min(...purchaseTransactions.map(t => t.nav_per_unit));
};