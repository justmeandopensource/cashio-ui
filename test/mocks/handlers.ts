import { http, HttpResponse } from "msw";
import config from "@/config";
import { mockAccounts, mockCategories, mockLedgers } from "./testData";

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

  // Show Notes suggestions
  getNotesSuggestionsEmpty: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/transaction/notes/suggestions`,
    () => {
      return HttpResponse.json([], { status: 200 });
    },
  ),
};

// Combine all handlers
export const handlers = [
  ...Object.values(authHandlers),
  ...Object.values(ledgerHandlers),
  ...Object.values(accountHandlers),
  ...Object.values(categoryHandlers),
  ...Object.values(transactionHandlers),
  ...Object.values(transactionHandlers),
];
