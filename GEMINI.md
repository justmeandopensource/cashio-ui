# Gemini Project Context: cashio-ui

This document provides a foundational context for AI models interacting with the `cashio-ui` project. Its purpose is to ensure that AI-generated code, analysis, and modifications align with the project's established standards and architecture.

## Project Overview

`cashio-ui` is the frontend for the Cashio personal finance tracking application. It provides a user interface for managing users, accounts, transactions, and other financial data. The application is built with React and TypeScript.

## Tech Stack

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **UI Library:** Chakra UI
*   **Routing:** React Router
*   **Data Fetching:** React Query
*   **State Management:** Zustand
*   **HTTP Client:** Axios
*   **Charting:** Recharts
*   **Testing:** Vitest, React Testing Library
*   **Linting:** ESLint
*   **Package Manager:** npm
*   **Versioning:** `semantic-release`

## Project Structure

The `cashio-ui` project is organized by features, a common pattern for scalable frontend applications.

```
cashio-ui/
├── src/
│   ├── components/       # Shared, reusable UI components
│   ├── features/         # Feature-based modules
│   │   ├── auth/         # Authentication feature (login, register)
│   │   ├── home/         # Home page feature
│   │   └── ...           # Other features (ledger, account, etc.)
│   ├── App.tsx           # Main application component with routing
│   ├── main.tsx          # Application entry point
│   ├── config.ts         # Application configuration
│   └── version.ts        # Application version
├── package.json          # Project dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── ...
```

*   **`src/components/`**: This directory contains reusable UI components that are shared across multiple features (e.g., buttons, modals, layout components).
*   **`src/features/`**: The core of the application is organized into feature-based modules. Each feature directory (e.g., `auth`, `ledger`, `account`) encapsulates all the logic and components related to that specific feature.
*   **`src/App.tsx`**: The main application component that sets up the routing using `react-router-dom`.
*   **`src/main.tsx`**: The entry point of the React application. It initializes the `ChakraProvider`, `QueryClientProvider`, and renders the `App` component.
*   **`src/config.ts`**: Contains application-level configuration, such as API base URLs.

## Development Workflow

### Setup

1.  Install the dependencies: `npm install`
2.  Set up the required environment variables. A `.env` file can be used for this. Refer to `dotenv-template` for the required variables.

### Running the Application

To run the application for development, use the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

### Testing

To run the tests, use the following command:

```bash
npm test
```

To run the tests in UI mode, use:

```bash
npm run test:ui
```

## Coding Style & Conventions

*   Follow the established coding style, which is enforced by ESLint.
*   Use TypeScript for all new code.
*   Organize code by features. When adding a new feature, create a new directory in `src/features`.
*   Use Chakra UI for UI components whenever possible. Create new components in `src/components` if they are reusable across features.
*   Use React Query for all data fetching from the API.
*   Use Zustand for global state management.
*   Use path aliases (`@`, `@components`, `@features`) for cleaner imports.

## Deployment

The application is designed to be deployed as a static site. The `npm run build` command generates the static files in the `dist` directory. These files can be served by any static file server. The project also includes a `Dockerfile` for building a Docker image that serves the application with Nginx.

## Versioning and Releases

The project uses `semantic-release` for automated versioning and releases. Commit messages should follow the Conventional Commits specification.

*   `feat`: A new feature
*   `fix`: A bug fix
*   `docs`: Documentation only changes
*   `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
*   `refactor`: A code change that neither fixes a bug nor adds a feature
*   `perf`: A code change that improves performance
*   `test`: Adding missing tests or correcting existing tests
*   `build`: Changes that affect the build system or external dependencies
*   `ci`: Changes to our CI configuration files and scripts

This ensures that version numbers are bumped automatically and a changelog is generated based on the commit history.
