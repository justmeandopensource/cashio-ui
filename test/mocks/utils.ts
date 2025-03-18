import { vi } from "vitest";

// Mock localStorage
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock navigate function
export const mockNavigate = vi.fn();

// Setup for testing with localStorage and navigation
export function setupTestEnvironment() {
  // Mock localStorage
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
  });

  // Mock navigation
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });

  return { mockLocalStorage, mockNavigate };
}

// Reset state between tests
export function resetTestState() {
  mockLocalStorage.clear();
  mockNavigate.mockReset();
}
