import { resetTestState, setupTestEnvironment } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@test/mocks/server";
import { authHandlers } from "@test/mocks/handlers";

const { mockLocalStorage, mockNavigate } = setupTestEnvironment();

import Login from "@/features/auth/Login";
import Register from "@/features/auth/Register";

describe("Login Component", () => {
  beforeEach(() => {
    resetTestState();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderLoginComponent = () => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/login"]}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>,
    );

    return {
            title: screen.getByRole("heading", { name: /log in to cashio/i }),
      usernameInput: screen.getByPlaceholderText(/enter your username/i),
      passwordInput: screen.getByPlaceholderText(/enter your password/i),
      passwordToggleButton: screen.getByRole("button", {
        name: /show password/i,
      }),
      loginButton: screen.getByRole("button", { name: /log in/i }),
      user: userEvent.setup(),
    };
  };

  it("renders the login form", () => {
    const { title, usernameInput, passwordInput, loginButton } =
      renderLoginComponent();

    expect(title).toBeInTheDocument();
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it("sets focus on username input when component mounts", () => {
    const { usernameInput } = renderLoginComponent();
    expect(usernameInput).toHaveFocus();
  });

  it("displays validation errors when fields are empty", async () => {
    const { loginButton, user } = renderLoginComponent();

    await user.click(loginButton);

    expect(
      await screen.findByText(/username is required/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
  });

  it("allows the user to input username and password", async () => {
    const { usernameInput, passwordInput, user } = renderLoginComponent();

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  it("toggles password visibility", async () => {
    const { passwordInput, passwordToggleButton, user } =
      renderLoginComponent();

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(passwordToggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(passwordToggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it('navigates to the register page when "Create an account" is clicked', async () => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/login"]}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>,
    );

    const createAccountLink = screen.getByRole("link", {
      name: /create an account/i,
    });

    const user = userEvent.setup();
    await user.click(createAccountLink);

    expect(
      screen.getByRole("heading", { name: "Create your Cashio Account" }),
    ).toBeInTheDocument();
  });

  it("navigates to home page on successful authentication", async () => {
    server.use(authHandlers.loginSuccess);
    const { usernameInput, passwordInput, loginButton, user } =
      renderLoginComponent();

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLocalStorage.getItem("access_token")).toBe(
        "mock-access-token",
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("does not navigate to home page on failed authentication", async () => {
    server.use(authHandlers.loginFail);
    const { usernameInput, passwordInput, loginButton, user } =
      renderLoginComponent();

    await user.type(usernameInput, "wronguser");
    await user.type(passwordInput, "wrongpassword");
    await user.click(loginButton);

    expect(mockLocalStorage.getItem("access_token")).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
