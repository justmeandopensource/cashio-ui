export const mockLedgers = [
  {
    ledger_id: "1",
    name: "UK",
    currency_symbol: "GBP",
    user_id: 1,
  },
  {
    ledger_id: "2",
    name: "India",
    currency_symbol: "INR",
    user_id: 1,
  },
];

export const mockAccounts = [
  {
    account_id: 1,
    ledger_id: 1,
    name: "Current Accounts",
    type: "asset" as const,
    opening_balance: 0,
    balance: 0,
    net_balance: 0,
    is_group: true,
    parent_account_id: null,
  },
  {
    account_id: 2,
    ledger_id: 1,
    name: "Test Bank 1",
    type: "asset" as const,
    opening_balance: 100,
    balance: 0,
    net_balance: 100,
    is_group: false,
    parent_account_id: 1,
  },
  {
    account_id: 3,
    ledger_id: 1,
    name: "Test Bank 2",
    type: "asset" as const,
    opening_balance: 0,
    balance: 0,
    net_balance: 0,
    is_group: false,
    parent_account_id: 1,
  },
  {
    account_id: 4,
    ledger_id: 1,
    name: "Credit Cards",
    type: "liability" as const,
    opening_balance: 0,
    balance: 0,
    net_balance: 0,
    is_group: true,
    parent_account_id: null,
  },
  {
    account_id: 5,
    ledger_id: 1,
    name: "Test Credit Card 1",
    type: "liability" as const,
    opening_balance: 0,
    balance: 200,
    net_balance: 200,
    is_group: false,
    parent_account_id: 4,
  },
  {
    account_id: 6,
    ledger_id: 1,
    name: "Test Credit Card 2",
    type: "liability" as const,
    opening_balance: 0,
    balance: 0,
    net_balance: 0,
    is_group: false,
    parent_account_id: 4,
  },
  {
    account_id: 7,
    ledger_id: 1,
    name: "Test Loan",
    type: "liability" as const,
    opening_balance: 0,
    balance: 0,
    net_balance: 0,
    is_group: false,
    parent_account_id: null,
  },
  {
    account_id: 8,
    ledger_id: 2,
    name: "Wallet",
    type: "asset" as const,
    opening_balance: 0,
    balance: 0,
    net_balance: 0,
    is_group: false,
    parent_account_id: null,
  },
];

export const mockCategories = [
  {
    category_id: 1,
    user_id: 1,
    name: "Utilities",
    type: "expense",
    is_group: true,
    parent_category_id: null,
  },
  {
    category_id: 2,
    user_id: 1,
    name: "Water",
    type: "expense",
    is_group: false,
    parent_category_id: 1,
  },
  {
    category_id: 3,
    user_id: 1,
    name: "Salary",
    type: "income",
    is_group: true,
    parent_category_id: null,
  },
  {
    category_id: 4,
    user_id: 1,
    name: "Test Company",
    type: "income",
    is_group: false,
    parent_category_id: 3,
  },
];

export const mockTransactions = [
  {
    transaction_id: 1,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 35.56,
    date: "2025-03-23T10:11:01.426000",
    notes: "Council Water #1",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [
      {
        name: "milton",
        tag_id: 1,
        user_id: 1,
      },
    ],
  },
  {
    transaction_id: 2,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 2.99,
    date: "2025-03-23T10:09:24.349000",
    notes: "",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:09:50.123125",
    tags: [
      {
        name: "leicester",
        tag_id: 2,
        user_id: 1,
      },
      {
        name: "mcd",
        tag_id: 3,
        user_id: 1,
      },
    ],
  },
  {
    transaction_id: 3,
    account_id: 2,
    account_name: "Test Bank 1",
    category_id: 4,
    category_name: "Test Company",
    credit: 999.99,
    debit: 0,
    date: "2025-03-23T10:08:47.423000",
    notes: "Salary from Test Company into Test Bank 1",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:09:19.720731",
    tags: [
      {
        name: "employer1",
        tag_id: 4,
        user_id: 1,
      },
    ],
  },
  {
    transaction_id: 4,
    account_id: 3,
    account_name: "Test Bank 2",
    category_id: 4,
    category_name: "Test Company",
    credit: 888.88,
    debit: 0,
    date: "2025-02-23T10:08:47.423000",
    notes: "Salary from Test Company into Test Bank 2",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:09:19.720731",
    tags: [
      {
        name: "employer2",
        tag_id: 5,
        user_id: 1,
      },
    ],
  },
  {
    transaction_id: 5,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: null,
    category_name: null,
    credit: 0,
    debit: 100,
    date: "2025-02-23T10:08:47.423000",
    notes: "Water splits",
    is_split: true,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:09:19.720731",
    tags: [
      {
        name: "milton",
        tag_id: 1,
        user_id: 1,
      },
    ],
  },
  {
    transaction_id: 6,
    account_id: 2,
    account_name: "Test Bank 1",
    category_id: null,
    category_name: null,
    credit: 0,
    debit: 99,
    date: "2025-02-23T10:08:47.423000",
    notes: "Fund Transfer",
    is_split: false,
    is_transfer: true,
    transfer_id: "62cf5895-9540-402a-9d67-fdc250b79acf",
    transfer_type: "source",
    created_at: "2025-03-23T10:09:19.720731",
    tags: [],
  },
  {
    transaction_id: 7,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: null,
    category_name: null,
    credit: 99,
    debit: 0,
    date: "2025-02-23T10:08:47.423000",
    notes: "Fund Transfer",
    is_split: false,
    is_transfer: true,
    transfer_id: "62cf5895-9540-402a-9d67-fdc250b79acf",
    transfer_type: "destination",
    created_at: "2025-03-23T10:09:19.720731",
    tags: [],
  },
  {
    transaction_id: 8,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 9,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 10,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 11,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 12,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 13,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 14,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 15,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
  {
    transaction_id: 16,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: 2,
    category_name: "Water",
    credit: 0,
    debit: 10,
    date: "2025-03-23T10:11:01.426000",
    notes: "Test transaction",
    is_split: false,
    is_transfer: false,
    transfer_id: "None",
    transfer_type: null,
    created_at: "2025-03-23T10:11:44.768354",
    tags: [],
  },
];

export const mockSplits = [
  {
    split_id: 1,
    transaction_id: 5,
    category_id: 2,
    credit: 0,
    debit: 50,
    notes: "Water split 1",
    category_name: "Water",
  },
  {
    split_id: 2,
    transaction_id: 5,
    category_id: 2,
    credit: 0,
    debit: 50,
    notes: "Water split 2",
    category_name: "Water",
  },
];

export const mockTransferTransactions = {
  source_transaction: {
    transaction_id: 6,
    account_id: 2,
    account_name: "Test Bank 1",
    category_id: null,
    category_name: null,
    credit: 0,
    debit: 99,
    date: "2025-02-23T10:08:47.423000",
    notes: "Fund Transfer",
    is_split: false,
    is_transfer: true,
    transfer_id: "62cf5895-9540-402a-9d67-fdc250b79acf",
    transfer_type: "source",
    created_at: "2025-03-23T10:09:19.720731",
    tags: [],
  },
  destination_transaction: {
    transaction_id: 7,
    account_id: 5,
    account_name: "Test Credit Card 1",
    category_id: null,
    category_name: null,
    credit: 99,
    debit: 0,
    date: "2025-02-23T10:08:47.423000",
    notes: "Fund Transfer",
    is_split: false,
    is_transfer: true,
    transfer_id: "62cf5895-9540-402a-9d67-fdc250b79acf",
    transfer_type: "destination",
    created_at: "2025-03-23T10:09:19.720731",
    tags: [],
  },
  source_account_name: "Test Bank 1",
  destination_account_name: "Test Credit Card 1",
  source_ledger_name: "UK",
  destination_ledger_name: "UK",
};

const generateMockTransactions = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const transactionId = i + 1;
    return {
      transaction_id: transactionId,
      account_id: 5,
      account_name: "Test Credit Card 1",
      category_id: 2,
      category_name: "Water",
      credit: 0,
      debit: 100,
      date: new Date(2025, 2, 23, 10, 11, 1, 426).toISOString(),
      notes: `Test transaction ${transactionId}`,
      is_split: false,
      is_transfer: false,
      transfer_id: "None",
      transfer_type: null,
      created_at: new Date(2025, 2, 23, 10, 11, 44, 768).toISOString(),
      tags: [],
    };
  });
};

export const mockPaginatedTransactions = {
  transactions: generateMockTransactions(18),
  total_transactions: 18,
  total_pages: Math.ceil(18 / 15),
  current_page: 1,
  per_page: 15,
};

export const mockTagSuggestions = [
  { tag_id: "1", name: "milton" },
  { tag_id: "2", name: "leicester" },
  { tag_id: "3", name: "mcd" },
  { tag_id: "4", name: "employer1" },
  { tag_id: "5", name: "employer2" },
];
