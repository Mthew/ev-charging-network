# Project Overview

This is a Next.js application for the "Oasis EV Data Platform". It's designed to collect data from EV users about their charging habits and desired charging locations to help strategically place new charging stations in Medellín, Colombia.

## Key Technologies

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI:** React, Tailwind CSS, shadcn/ui
*   **Charting:** Recharts
*   **Maps:** Google Maps Platform
*   **Database:** MySQL (`mysql2` driver)
*   **Authentication:** JSON Web Tokens (JWT)
*   **Forms:** React Hook Form & Zod
*   **Tooling:** Bun, Biome, ESLint

## Architecture

The project is structured as a standard Next.js application with the following key directories:

*   `src/app`: Contains the main application logic, including pages and API routes.
    *   `src/app/api`: API routes for handling form submissions, authentication, and other backend logic.
    *   `src/app/dashboard`: The private administrative dashboard for visualizing data.
*   `src/components`: Reusable React components.
*   `src/lib`: Core application logic, including database interactions and authentication.
*   `src/hooks`: Custom React hooks.
*   `src/config`: Application configuration, such as constants.
*   `src/types`: TypeScript type definitions.

# Building and Running

## Prerequisites

*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [Bun](https://bun.sh/)
*   A running [MySQL](https://www.mysql.com/) database instance.

## Setup

1.  **Install Dependencies:**
    ```bash
    bun install
    ```

2.  **Set Up Environment Variables:**
    Create a `.env.local` file in the root of the project with the following variables:
    ```env
    # Database Configuration
    DB_HOST=your_database_host
    DB_PORT=3306
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=ev_charging_network

    # Authentication
    JWT_SECRET=your_super_secret_and_long_jwt_key

    # Google Maps API
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
    ```

3.  **Database Setup:**
    The application will automatically create the necessary tables on its first run.

## Running the Application

*   **Development:**
    ```bash
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.

*   **Production Build:**
    ```bash
    bun run build
    ```

*   **Start Production Server:**
    ```bash
    bun run start
    ```

# Development Conventions

*   **Linting:** Run `bun run lint` to check for TypeScript and ESLint errors.
*   **Formatting:** Run `bun run format` to format the code using Biome.
*   **Authentication:** The application uses JWT for authentication. The login and verification logic can be found in `src/lib/auth.ts` and the corresponding API routes in `src/app/api/auth`.
*   **Database:** The application uses `mysql2` to connect to a MySQL database. The database initialization and query logic is in `src/lib/database.ts`.
*   **Google Maps:** The Google Maps integration is handled by the `src/components/GoogleMaps.tsx` component, which uses the `@googlemaps/js-api-loader` library.
