import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "@/features/auth/Login";
import Register from "@/features/auth/Register";
import { server } from "@test/mocks/server";
import { authHandlers } from "@test/mocks/handlers";

describe("Register Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderRegisterComponent = () => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/register"]}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>,
    );

    return {
      title: screen.getByRole("heading", { name: /Create your Cashio Account/i }),
      fullnameInput: screen.getByPlaceholderText(/enter your full name/i),
      usernameInput: screen.getByPlaceholderText(/create a username/i),
      emailInput: screen.getByPlaceholderText(/enter your email/i),
      passwordInput: screen.getByPlaceholderText(/create a password/i),
      passwordToggleButton: screen.getByRole("button", {
        name: /show password/i,
      }),
      createButton: screen.getByRole("button", { name: /create accoun/i }),
      user: userEvent.setup(),
    };
  };

  it("renders the register form", () => {
    const {
      title,
      fullnameInput,
      usernameInput,
      emailInput,
      passwordInput,
      createButton,
    } = renderRegisterComponent();

    expect(title).toBeInTheDocument();
    expect(fullnameInput).toBeInTheDocument();
    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
  });

  it("sets focus on full name input when component mounts", () => {
    const { fullnameInput } = renderRegisterComponent();
    expect(fullnameInput).toHaveFocus();
  });

  it("displays validation errors when fields are empty", async () => {
    const { createButton, user } = renderRegisterComponent();

    await user.click(createButton);

    expect(
      await screen.findByText(/full name is required/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/username is required/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/valid email is required/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });

  it("allows the user to input full name, username, email and password", async () => {
    const { fullnameInput, usernameInput, emailInput, passwordInput } =
      renderRegisterComponent();

    const user = userEvent.setup();
    await user.type(fullnameInput, "Test User");
    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(fullnameInput).toHaveValue("Test User");
    expect(usernameInput).toHaveValue("testuser");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("toggles password visibility", async () => {
    const { passwordInput, passwordToggleButton, user } =
      renderRegisterComponent();

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(passwordToggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(passwordToggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it('navigates to the login page when "Log In" is clicked', async () => {
    const { user } = renderRegisterComponent();

    const logInLink = screen.getByRole("link", {
      name: /log in/i,
    });

    await user.click(logInLink);

    expect(
            screen.getByRole("heading", { name: /log in to cashio/i }),
    ).toBeInTheDocument();
  });

  it("redirects to /login after successful account creation", async () => {
    // Mock successful user creation
    server.use(authHandlers.createUserSuccess);

    const {
      fullnameInput,
      usernameInput,
      emailInput,
      passwordInput,
      createButton,
      user,
    } = renderRegisterComponent();

    // Fill in the form
    await user.type(fullnameInput, "Test User");
    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit the form
    await user.click(createButton);

    // Wait for the redirection to /login
    await waitFor(() => {
      expect(
              screen.getByRole("heading", { name: /log in to cashio/i }),
      ).toBeInTheDocument();
    });
  });

  it("clears form fields when account creation fails", async () => {
    // Mock unsuccessful user creation (username already exists)
    server.use(authHandlers.createUserFail);

    const {
      fullnameInput,
      usernameInput,
      emailInput,
      passwordInput,
      createButton,
      user,
    } = renderRegisterComponent();

    // Fill in the form
    await user.type(fullnameInput, "Test User");
    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit the form
    await user.click(createButton);

    // Check that the form fields are cleared
    expect(fullnameInput).toHaveValue("");
    expect(usernameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
    expect(fullnameInput).toHaveFocus();
  });
});
