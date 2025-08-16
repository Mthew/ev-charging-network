# Oasis EV Data Platform: Project Analysis

**Generated on:** 2025-08-15

## 1. Project Summary

This project, the "Oasis EV Data Platform," is a web application built with Next.js and TypeScript, designed for the Oasis Group. Its primary goal is to inform the strategic placement of new electric vehicle (EV) charging stations in Medellín, Colombia. The application has two main parts:

1.  A **public-facing data collection form** where EV users can submit detailed information about their vehicles, daily driving habits, and current charging locations. Crucially, users can pinpoint on an interactive map multiple desired locations for new charging stations.
2.  A **private administrative dashboard** protected by a login system. This dashboard provides authorized users with actionable insights from the collected data. It features a dynamic heatmap visualizing high-demand areas for new stations, alongside interactive charts and statistics breaking down vehicle types, usage patterns, and more.

The platform serves as a bridge between EV user needs and strategic business decisions, using real-world data to optimize infrastructure investment.

## 2. Key Technologies and Dependencies

The project leverages a modern web development stack. The core technologies are as follows:

- **Framework:** Next.js (v15.3.2) using the App Router.
- **Programming Language:** TypeScript.
- **UI Framework:** React (v18.3.1).
- **UI Components:** `shadcn/ui`, a collection of accessible and composable components built on Radix UI.
- **Styling:** Tailwind CSS for utility-first styling.
- **Charting Library:** `recharts` for creating interactive charts (Bar, Pie, Line) on the dashboard.
- **External API Integration:** The Google Maps Platform is used extensively via `@googlemaps/js-api-loader` for interactive maps, address autocompletion, and heatmap visualization.
- **Backend & API:**
  - Next.js API Routes for server-side logic.
  - **Database:** MySQL, accessed via the `mysql2` library. There is no ORM like Prisma present.
- **Authentication:**
  - `jsonwebtoken` (JWT) for creating and verifying user sessions.
  - `bcryptjs` for hashing passwords.
- **Form Management:**
  - `react-hook-form` for efficient and scalable form state management.
  - `zod` for schema validation.
- **Development Tools:**
  - `Biome` for code formatting and linting.
  - `ESLint` for code quality.

## 3. Folder Structure

The project follows a structure typical of a Next.js application using the App Router. The most important directories are:

- `src/app/`: Contains the primary application routes and UI.
  - `page.tsx`: The main public-facing data collection form.
  - `dashboard/page.tsx`: The private administrative dashboard for data analysis.
  - `api/`: Houses all backend API endpoints.
    - `submit-form/route.ts`: Handles the ingestion of data from the public form.
    - `analytics/route.ts`: Provides aggregated data to the dashboard.
    - `auth/`: Contains endpoints for user `login`, `logout`, and session `verify`.
- `src/components/`: Home to reusable React components.
  - `GoogleMaps.tsx`: A critical component that renders the interactive map, markers, and heatmap.
  - `GooglePlacesAutocomplete.tsx`: Enhances address input fields with Google Places API.
  - `ui/`: Contains the `shadcn/ui` components (Button, Card, Input, etc.).
- `src/lib/`: Core business logic and external service integrations.
  - `database.ts`: Manages the entire database lifecycle, including connection pooling, schema initialization, and all data queries (CRUD operations).
  - `auth.ts`: Contains all logic for user authentication, password management, and JWT handling.
  - `google-maps-loader.ts`: A utility for loading the Google Maps API script.
- `src/hooks/`: Contains custom React hooks.
  - `useAuth.ts`: A hook to manage and provide authentication state across the application.

## 4. Critical Components and Files

The core functionality of the platform relies on the interplay between the frontend, backend, and database. The most critical files are:

- **`src/lib/database.ts`**: This is the most crucial file in the project. It is the single source of truth for all interactions with the MySQL database, handling everything from connection management and table creation to inserting new submissions and querying complex analytics.
- **`src/app/api/submit-form/route.ts`**: The gateway for all user-submitted data. This API endpoint validates incoming data from the public form and uses `database.ts` to persist it, forming the foundation of the entire dataset.
- **`src/app/api/analytics/route.ts`**: The engine that powers the administrative dashboard. It fetches, aggregates, and processes the raw data from the database into the meaningful statistics and chart data structures required by the frontend.
- **`src/app/dashboard/page.tsx`**: The central hub for data visualization. This component integrates all the charts and the heatmap, manages filtering logic, and presents the data in a digestible format for administrators.
- **`src/components/GoogleMaps.tsx`**: A key interactive element used in both the public form (for users to select locations) and the dashboard (to display the heatmap). Its functionality is central to the project's location-based analysis.
- **`src/app/page.tsx`**: The main data submission form component. It uses `react-hook-form` and `zod` for a robust user experience and integrates the `GooglePlacesAutocomplete` and `GoogleMaps` components.
- **`src/lib/auth.ts` & `src/hooks/useAuth.ts`**: This pair is critical for securing the dashboard. `auth.ts` handles the low-level logic of password verification and token generation, while the `useAuth` hook provides a clean, reusable way to manage authentication state on the client side.

## 5. Potential Improvements

The codebase is well-structured, but several areas could be enhanced for production-readiness:

- **Missing Environment Variable Validations:** The application relies on environment variables for database credentials, JWT secrets, and the Google Maps API key. There is no validation at startup to ensure these variables are present and correctly formatted, which could lead to runtime errors. A library like Zod could be used to validate `process.env` on application start.
- **Incomplete Filtering Logic:** The `POST` endpoint in `src/app/api/analytics/route.ts` is intended to filter data but currently returns the complete, unfiltered dataset. Implementing the SQL filtering logic in `getAnalyticsData` based on the request body is a critical next step for the dashboard to be fully interactive.
- **Refactoring Opportunity:** The `dashboard/page.tsx` component is very large and handles multiple responsibilities, including authentication state, data fetching, filter management, and rendering all UI elements. It could be broken down into smaller, more focused components (e.g., `SummaryCards`, `VehicleTypeChart`) and the data fetching/filtering logic could be moved into a dedicated custom hook (e.g., `useAnalyticsData`).
- **Performance Bottleneck in Analytics:** The `getAnalyticsData` function in `src/lib/database.ts` executes multiple separate `await` calls to the database for each piece of analytical data. These queries could be run in parallel using `Promise.all` to reduce the total response time of the analytics API endpoint.
- **Hardcoded Demo Data:** The dashboard page contains a function `generateDemoLocations` to show sample data on the heatmap. This should be removed or conditionally used only when no real data is available, as it might confuse administrators.
