import api from "@/lib/api";
import {
  Amc,
  AmcCreate,
  AmcUpdate,
  MutualFund,
  MutualFundCreate,
  MutualFundUpdate,
  MutualFundNavUpdate,
  MfTransaction,
  MfTransactionCreate,
  MfTransactionUpdate,
  MfSwitchCreate,
  MutualFundSummary,
  AmcSummary,
} from "./types";

// AMC API functions
export const getAmcs = async (ledgerId: number): Promise<Amc[]> => {
  const response = await api.get(`/ledger/${ledgerId}/amcs`);
  return response.data;
};

export const createAmc = async (ledgerId: number, amc: AmcCreate): Promise<Amc> => {
  const response = await api.post(`/ledger/${ledgerId}/amc/create`, amc);
  return response.data;
};

export const updateAmc = async (ledgerId: number, amcId: number, amc: AmcUpdate): Promise<Amc> => {
  const response = await api.put(`/ledger/${ledgerId}/amc/${amcId}`, amc);
  return response.data;
};

export const deleteAmc = async (ledgerId: number, amcId: number): Promise<void> => {
  await api.delete(`/ledger/${ledgerId}/amc/${amcId}`);
};

// Mutual Fund API functions
export const getMutualFunds = async (ledgerId: number): Promise<MutualFund[]> => {
  const response = await api.get(`/ledger/${ledgerId}/mutual-funds`);
  return response.data;
};

export const getMutualFund = async (ledgerId: number, fundId: number): Promise<MutualFund> => {
  const response = await api.get(`/ledger/${ledgerId}/mutual-fund/${fundId}`);
  return response.data;
};

export const createMutualFund = async (ledgerId: number, fund: MutualFundCreate): Promise<MutualFund> => {
  const response = await api.post(`/ledger/${ledgerId}/mutual-fund/create`, fund);
  return response.data;
};

export const updateMutualFund = async (ledgerId: number, fundId: number, fund: MutualFundUpdate): Promise<MutualFund> => {
  const response = await api.put(`/ledger/${ledgerId}/mutual-fund/${fundId}`, fund);
  return response.data;
};

export const updateMutualFundNav = async (ledgerId: number, fundId: number, navUpdate: MutualFundNavUpdate): Promise<MutualFund> => {
  const response = await api.put(`/ledger/${ledgerId}/mutual-fund/${fundId}/update-nav`, navUpdate);
  return response.data;
};

export const deleteMutualFund = async (ledgerId: number, fundId: number): Promise<void> => {
  await api.delete(`/ledger/${ledgerId}/mutual-fund/${fundId}`);
};

// MF Transaction API functions
export const buyMutualFund = async (ledgerId: number, transaction: MfTransactionCreate): Promise<MfTransaction> => {
  const response = await api.post(`/ledger/${ledgerId}/mf-transaction/buy`, transaction);
  return response.data;
};

export const sellMutualFund = async (ledgerId: number, transaction: MfTransactionCreate): Promise<MfTransaction> => {
  const response = await api.post(`/ledger/${ledgerId}/mf-transaction/sell`, transaction);
  return response.data;
};

export const switchMutualFundUnits = async (ledgerId: number, switchData: MfSwitchCreate): Promise<MfTransaction[]> => {
  const response = await api.post(`/ledger/${ledgerId}/mf-transaction/switch`, switchData);
  return response.data;
};



export const getFundTransactions = async (ledgerId: number, fundId: number): Promise<MfTransaction[]> => {
  const response = await api.get(`/ledger/${ledgerId}/mutual-fund/${fundId}/transactions`);
  return response.data;
};

export const getAllMfTransactions = async (ledgerId: number): Promise<MfTransaction[]> => {
  const response = await api.get(`/ledger/${ledgerId}/mf-transactions`);
  return response.data;
};

export const updateMfTransaction = async (ledgerId: number, transactionId: number, update: MfTransactionUpdate): Promise<MfTransaction> => {
  const response = await api.patch(`/ledger/${ledgerId}/mf-transaction/${transactionId}`, update);
  return response.data;
};

export const deleteMfTransaction = async (ledgerId: number, transactionId: number): Promise<void> => {
  await api.delete(`/ledger/${ledgerId}/mf-transaction/${transactionId}`);
};

// Summary API functions (for dashboard)
export const getMutualFundSummaries = async (ledgerId: number): Promise<MutualFundSummary[]> => {
  // This would be a new endpoint for dashboard summaries
  // For now, we'll calculate on frontend
  const funds = await getMutualFunds(ledgerId);
  return funds.map(fund => ({
    mutual_fund_id: fund.mutual_fund_id,
    name: fund.name,
    amc_name: fund.amc?.name || '',
    total_units: fund.total_units,
    average_cost_per_unit: fund.average_cost_per_unit,
    latest_nav: fund.latest_nav,
    current_value: fund.current_value,
    total_invested: fund.total_units * fund.average_cost_per_unit,
    unrealized_pnl: fund.current_value - (fund.total_units * fund.average_cost_per_unit),
    unrealized_pnl_percentage: fund.total_units * fund.average_cost_per_unit > 0
      ? ((fund.current_value - (fund.total_units * fund.average_cost_per_unit)) / (fund.total_units * fund.average_cost_per_unit)) * 100
      : 0,
  }));
};

export const getAmcSummaries = async (ledgerId: number): Promise<AmcSummary[]> => {
  // This would be a new endpoint for AMC summaries
  // For now, we'll calculate on frontend
  const funds = await getMutualFunds(ledgerId);
  const amcs = await getAmcs(ledgerId);

  return amcs.map(amc => {
    const amcFunds = funds.filter(fund => fund.amc_id === amc.amc_id);
    const totalUnits = amcFunds.reduce((sum, fund) => sum + fund.total_units, 0);
    const totalInvested = amcFunds.reduce((sum, fund) => sum + (fund.total_units * fund.average_cost_per_unit), 0);
    const currentValue = amcFunds.reduce((sum, fund) => sum + fund.current_value, 0);

    return {
      amc_id: amc.amc_id,
      name: amc.name,
      total_funds: amcFunds.length,
      total_units: totalUnits,
      average_cost_per_unit: totalUnits > 0 ? totalInvested / totalUnits : 0,
      latest_nav: 0, // Would need to calculate weighted average
      current_value: currentValue,
      total_invested: totalInvested,
      unrealized_pnl: currentValue - totalInvested,
      unrealized_pnl_percentage: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
    };
  });
};