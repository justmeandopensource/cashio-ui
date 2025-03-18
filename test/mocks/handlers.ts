import { http, HttpResponse } from "msw";
import config from "@/config";
import { mockAccounts, mockLedgers } from "./testData";

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
    () => {
      return HttpResponse.json(mockAccounts, { status: 200 });
    },
  ),

  // Get accounts for a ledger by type
  getAccountsWithDataByType: http.get(
    `${config.apiBaseUrl}/ledger/:ledgerId/accounts/group`,
    ({ request }) => {
      // Get the URL from the request
      const url = new URL(request.url);

      // Extract the account_type from query parameters
      const accountType = url.searchParams.get("account_type");

      // Filter mockAccounts based on the account_type
      const filteredAccounts = mockAccounts.filter(
        (account) => account.type === accountType,
      );

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
};

// Combine all handlers
export const handlers = [
  ...Object.values(authHandlers),
  ...Object.values(ledgerHandlers),
];
