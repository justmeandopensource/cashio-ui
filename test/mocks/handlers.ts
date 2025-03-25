import { http, HttpResponse } from "msw";
import config from "@/config";
import {
  mockAccounts,
  mockCategories,
  mockLedgers,
  mockPaginatedTransactions,
  mockSplits,
  mockTagSuggestions,
  mockTransactions,
  mockTransferTransactions,
} from "./testData";

export const authHandlers = {
  // Login verification for valid credentials
  loginSuccess: http.post(`${config.apiBaseUrl}/user/login`, () => {
    return HttpResponse.json(
      { access_token: "mock-access-token" },
      { status: 200 },
    );
  }),

  // Login verification for invalid credentials
  loginFail: http.post(`${config.apiBaseUrl}/user/login`, () => {
    return HttpResponse.json(
      { error: "Incorrect username or password" },
      { status: 401 },
    );
  }),

  // Token verification for valid token
  verifyTokenSuccess: http.post(
    `${config.apiBaseUrl}/user/verify-token`,
    () => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),

  // Token verification for invalid token
  verifyTokenInvalid: http.post(
    `${config.apiBaseUrl}/user/verify-token`,
    () => {
      return HttpResponse.json({ error: "Invalid token" }, { status: 401 });
    },
  ),

  // Successful user creation
  createUserSuccess: http.post(`${config.apiBaseUrl}/user/create`, () => {
    return HttpResponse.json(
      { message: "user created successfully" },
      { status: 200 },
    );
  }),

  // Unsuccessful user creation (username already exists)
  createUserFail: http.post(`${config.apiBaseUrl}/user/create`, () => {
    return HttpResponse.json(
      { detail: "Username already registered" },
      { status: 400 },
    );
  }),
};

export const ledgerHandlers = {
  // Get empty ledger list
  getLedgersEmpty: http.get(`${config.apiBaseUrl}/ledger/list`, () => {
    return HttpResponse.json([], { status: 200 });
  }),

  // Get ledger list with data
  getLedgersWithData: http.get(`${config.apiBaseUrl}/ledger/list`, () => {
    return HttpResponse.json(mockLedgers, { status: 200 });
  }),

  // Get ledger list with error
  getLedgersError: http.get(`${config.apiBaseUrl}/ledger/list`, () => {
    return HttpResponse.json(
      { error: "Failed to fetch ledgers" },
      { status: 500 },
    );
  }),

  // Get a specific ledger by ledgerId
  getLedgerWithData: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId`,
    ({ params }) => {
      const ledgerId = params.ledgerId;

      const ledger = mockLedgers.find(
        (ledger) => ledger.ledger_id === ledgerId,
      );

      return HttpResponse.json(ledger, { status: 200 });
    },
  ),
};

export const accountHandlers = {
  // Get empty accounts for a ledger
  getAccountsEmpty: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/accounts`,
    () => {
      return HttpResponse.json([], { status: 200 });
    },
  ),

  // Get accounts for a ledger
  getAccountsWithData: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/accounts`,
    ({ params, request }) => {
      const url = new URL(request.url);
      const ignoreGroup = url.searchParams.get("ignore_group") === "true";

      const ledgerId = Number(params.ledgerId);
      let filteredAccounts = mockAccounts.filter(
        (account) => account.ledger_id === ledgerId,
      );

      if (ignoreGroup) {
        filteredAccounts = filteredAccounts.filter(
          (account) => account.is_group === false,
        );
      }

      return HttpResponse.json(filteredAccounts, { status: 200 });
    },
  ),

  // Get accounts with error
  getAccountsError: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/accounts`,
    () => {
      return HttpResponse.json(
        { error: "Failed to fetch accounts" },
        { status: 500 },
      );
    },
  ),

  // Get accounts for a ledger by type
  getGroupAccountsByType: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/accounts/group`,
    ({ params, request }) => {
      const ledgerId = Number(params.ledgerId);
      const url = new URL(request.url);

      const accountType = url.searchParams.get("account_type");

      const filteredAccounts = mockAccounts.filter(
        (account) =>
          account.ledger_id === ledgerId &&
          account.type === accountType &&
          account.is_group,
      );

      return HttpResponse.json(filteredAccounts, { status: 200 });
    },
  ),

  // Get accounts for a ledger by type - return empty list
  getGroupAccountsEmpty: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/accounts/group`,
    () => {
      return HttpResponse.json([], { status: 200 });
    },
  ),

  // Get group accounts with error
  getGroupAccountsError: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/accounts/group`,
    () => {
      return HttpResponse.json(
        { error: "Failed to fetch group accounts" },
        { status: 500 },
      );
    },
  ),

  // Create account successfully
  createAccountSuccess: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/account/create`,
    () => {
      return HttpResponse.json(
        { message: "Account created successfully" },
        { status: 200 },
      );
    },
  ),

  // Create account with error
  createAccountError: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/account/create`,
    () => {
      return HttpResponse.json(
        { error: "Failed to create account" },
        { status: 500 },
      );
    },
  ),

  // Update account successfully
  updateAccountSuccess: http.put(
    `${config.apiBaseUrl}/ledger/:ledgerId/account/:accountId/update`,
    () => {
      return HttpResponse.json(
        { message: "Account updated successfully" },
        { status: 200 },
      );
    },
  ),

  // Update account with error
  updateAccountError: http.put(
    `${config.apiBaseUrl}/ledger/:ledgerId/account/:accountId/update`,
    () => {
      return HttpResponse.json(
        { error: "Failed to update account" },
        { status: 500 },
      );
    },
  ),
};

export const categoryHandlers = {
  // Get empty categories
  getCategoriesEmpty: http.get(`${config.apiBaseUrl}/category/list`, () => {
    return HttpResponse.json([], { status: 200 });
  }),

  // Get categories with data
  getCategoriesWithData: http.get(
    `${config.apiBaseUrl}/category/list`,
    ({ request }) => {
      const url = new URL(request.url);
      const ignoreGroup = url.searchParams.get("ignore_group") === "true";

      let filteredCategories = mockCategories;

      if (ignoreGroup) {
        filteredCategories = mockCategories.filter(
          (category) => category.is_group === false,
        );
      }

      return HttpResponse.json(filteredCategories, { status: 200 });
    },
  ),

  // Get categories with error
  getCategoriesError: http.get(`${config.apiBaseUrl}/category/list`, () => {
    return HttpResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }),

  // Get group categories by type
  getGroupCategoriesByType: http.get(
    `${config.apiBaseUrl}/category/group`,
    ({ request }) => {
      const url = new URL(request.url);
      const categoryType = url.searchParams.get("category_type");

      const filteredCategories = mockCategories.filter(
        (category) => category.type === categoryType && category.is_group,
      );

      return HttpResponse.json(filteredCategories, { status: 200 });
    },
  ),

  // Get group categories by type - return empty list
  getGroupCategoriesEmpty: http.get(
    `${config.apiBaseUrl}/category/group`,
    () => {
      return HttpResponse.json([], { status: 200 });
    },
  ),

  // Get group categories with error
  getGroupCategoriesError: http.get(
    `${config.apiBaseUrl}/category/group`,
    () => {
      return HttpResponse.json(
        { error: "Failed to fetch group categories" },
        { status: 500 },
      );
    },
  ),

  // Create category successfully
  createCategorySuccess: http.post(
    `${config.apiBaseUrl}/category/create`,
    () => {
      return HttpResponse.json(
        { message: "Category created successfully" },
        { status: 200 },
      );
    },
  ),

  // Create category with error
  createCategoryError: http.post(`${config.apiBaseUrl}/category/create`, () => {
    return HttpResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }),
};

export const transactionHandlers = {
  // Create income transaction successfully
  addIncomeTransactionSuccess: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/income`,
    () => {
      return HttpResponse.json(
        { message: "Transaction added successfully" },
        { status: 200 },
      );
    },
  ),

  // Create income transaction error
  addIncomeTransactionError: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/income`,
    () => {
      return HttpResponse.json(
        { error: "Transaction failed" },
        { status: 500 },
      );
    },
  ),

  // Create expense transaction successfully
  addExpenseTransactionSuccess: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/expense`,
    () => {
      return HttpResponse.json(
        { message: "Transaction added successfully" },
        { status: 200 },
      );
    },
  ),

  // Create expense transaction error
  addExpenseTransactionError: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/expense`,
    () => {
      return HttpResponse.json(
        { error: "Transaction failed" },
        { status: 500 },
      );
    },
  ),

  // Transfer transaction success
  transferFundsSuccess: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/transfer`,
    () => {
      return HttpResponse.json(
        { message: "Transfer completed successfully." },
        { status: 200 },
      );
    },
  ),

  // Transfer transaction error
  transferFundsError: http.post(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/transfer`,
    () => {
      return HttpResponse.json({ message: "Transfer failed" }, { status: 500 });
    },
  ),

  // Get transactions with data
  getTransactionsWithData: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transactions`,
    ({ request }) => {
      const url = new URL(request.url);
      let filteredTransactions = [...mockTransactions];

      // Parse query parameters
      const accountId = url.searchParams.get("account_id");
      const page = parseInt(url.searchParams.get("page") || "1");
      const perPage = parseInt(url.searchParams.get("per_page") || "15");
      const fromDate = url.searchParams.get("from_date");
      const toDate = url.searchParams.get("to_date");
      const categoryId = url.searchParams.get("category_id");
      const tags = url.searchParams.getAll("tags");
      const tagsMatch = url.searchParams.get("tags_match") || "any";
      const searchText = url.searchParams.get("search_text");
      const transactionType = url.searchParams.get("transaction_type");

      // Filter by account ID
      if (accountId) {
        filteredTransactions = filteredTransactions.filter(
          (transaction) => transaction.account_id === parseInt(accountId),
        );
      }

      // Filter by date range
      if (fromDate) {
        const fromDateObj = new Date(fromDate);
        filteredTransactions = filteredTransactions.filter(
          (transaction) => new Date(transaction.date) >= fromDateObj,
        );
      }

      if (toDate) {
        const toDateObj = new Date(toDate);
        filteredTransactions = filteredTransactions.filter(
          (transaction) => new Date(transaction.date) <= toDateObj,
        );
      }

      // Filter by category ID
      if (categoryId) {
        filteredTransactions = filteredTransactions.filter(
          (transaction) => transaction.category_id === parseInt(categoryId),
        );
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        filteredTransactions = filteredTransactions.filter((transaction) => {
          if (!transaction.tags || transaction.tags.length === 0) return false;

          const transactionTagNames = transaction.tags.map((tag) => tag.name);

          if (tagsMatch === "all") {
            // All specified tags must be present
            return tags.every((tag) => transactionTagNames.includes(tag));
          } else {
            // At least one of the specified tags must be present
            return tags.some((tag) => transactionTagNames.includes(tag));
          }
        });
      }

      // Filter by search text in notes
      if (searchText) {
        filteredTransactions = filteredTransactions.filter((transaction) =>
          transaction.notes.toLowerCase().includes(searchText.toLowerCase()),
        );
      }

      // Filter by transaction type (income/expense)
      if (transactionType) {
        filteredTransactions = filteredTransactions.filter((transaction) => {
          if (transactionType.toLowerCase() === "income") {
            return transaction.credit > 0;
          } else if (transactionType.toLowerCase() === "expense") {
            return transaction.debit > 0;
          }
          return true;
        });
      }

      // Calculate pagination
      const totalItems = filteredTransactions.length;
      const totalPages = Math.ceil(totalItems / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = Math.min(startIndex + perPage, totalItems);
      const paginatedTransactions = filteredTransactions.slice(
        startIndex,
        endIndex,
      );

      // Return the paginated response with the structure expected by the component
      return HttpResponse.json(
        {
          transactions: paginatedTransactions,
          current_page: page,
          total_pages: totalPages,
        },
        { status: 200 },
      );
    },
  ),

  // Get transactions empty
  getTransactionsEmpty: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transactions`,
    () => {
      return HttpResponse.json(
        {
          transactions: [],
          current_page: 1,
          total_pages: 0,
        },
        { status: 200 },
      );
    },
  ),

  // Get transactions error
  getTransactionsError: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transactions`,
    () => {
      return HttpResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 },
      );
    },
  ),

  // Get transaction splits
  getTransactionSplitsWithData: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/:transactionId/splits`,
    ({ params }) => {
      const transactionId = Number(params.transactionId);
      let filteredSplits = mockSplits.filter(
        (split) => split.transaction_id === transactionId,
      );

      return HttpResponse.json(filteredSplits, { status: 200 });
    },
  ),

  // Get transaction splits error
  getTransactionSplitsError: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/:transactionId/splits`,
    () => {
      return HttpResponse.json(
        { error: "Failed to fetch split transactions " },
        { status: 500 },
      );
    },
  ),

  // Get transfer transactions
  getTransferTransactionsWithData: http.get(
    `${config.apiBaseUrl}/ledger/transfer/:transferId`,
    () => {
      return HttpResponse.json(mockTransferTransactions, { status: 200 });
    },
  ),

  // Get transaction splits error
  getTransferTransactionsError: http.get(
    `${config.apiBaseUrl}/ledger/transfer/:transferId`,
    () => {
      return HttpResponse.json(
        { error: "Failed to fetch transfer details." },
        { status: 500 },
      );
    },
  ),

  // Delete transaction succcess
  deleteTransactionSuccess: http.delete(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/:transactionId`,
    () => {
      return HttpResponse.json(
        { message: "Transaction deleted" },
        { status: 200 },
      );
    },
  ),

  // Delete transaction error
  deleteTransactionError: http.delete(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/:transactionId`,
    () => {
      return HttpResponse.json(
        { error: "Failed to delete transaction." },
        { status: 500 },
      );
    },
  ),

  // Get transactions with pagination
  getTransactionsWithPagination: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transactions`,
    () => {
      return HttpResponse.json(mockPaginatedTransactions, { status: 200 });
    },
  ),

  // Show Notes suggestions empty
  getNotesSuggestionsEmpty: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/notes/suggestions`,
    () => {
      return HttpResponse.json([], { status: 200 });
    },
  ),

  // Get note suggestions with data
  getNotesSuggestions: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/notes/suggestions`,
    ({ request }) => {
      const url = new URL(request.url);
      const searchText =
        url.searchParams.get("search_text")?.toLowerCase() || "";

      const suggestions = mockTransactions
        .filter((tx) => tx.notes && tx.notes.toLowerCase().includes(searchText))
        .map((tx) => tx.notes)
        .filter((note, index, self) => self.indexOf(note) === index)
        .slice(0, 10);

      return HttpResponse.json(suggestions, { status: 200 });
    },
  ),

  // Get note suggestions error
  getNotesSuggestionsError: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/notes/suggestions`,
    () => {
      return HttpResponse.json(
        { error: "Failed to fetch note suggestions." },
        { status: 500 },
      );
    },
  ),

  // Get tag suggestions based on query
  getTagsSuggestions: http.get(
    `${config.apiBaseUrl}/tags/search`,
    ({ request }) => {
      const url = new URL(request.url);
      const query = url.searchParams.get("query")?.toLowerCase() || "";

      const filteredSuggestions = mockTagSuggestions.filter((tag) =>
        tag.name.toLowerCase().includes(query),
      );

      return HttpResponse.json(filteredSuggestions, { status: 200 });
    },
  ),

  // Get tags suggestions error
  getTagsSuggestionsError: http.get(`${config.apiBaseUrl}/tags/search`, () => {
    return HttpResponse.json(
      { error: "Failed to fetch tag suggestions." },
      { status: 500 },
    );
  }),
};

// Combine all handlers
export const handlers = [
  ...Object.values(authHandlers),
  ...Object.values(ledgerHandlers),
  ...Object.values(accountHandlers),
  ...Object.values(categoryHandlers),
  ...Object.values(transactionHandlers),
];
