# Oasis EV Data Platform

This project is the "Oasis EV Data Platform," a web solution for Oasis Group designed to strategically optimize the placement of new electric vehicle charging stations in Medellín.

## Core Concepts

Its core functionalities are twofold:

1.  A **public-facing data collection form** where EV users can submit their vehicle details, charging habits, and pinpoint desired new station locations on an interactive map.
2.  A **private administrative dashboard** that transforms this raw data into actionable insights through a dynamic heatmap, identifying high-demand areas, and interactive charts for detailed analysis.

The platform serves as a bridge between EV user needs and strategic business decisions, using real-world data to optimize infrastructure investment.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** React, Tailwind CSS, shadcn/ui
- **Charting:** Recharts
- **Maps:** Google Maps Platform
- **Database:** MySQL (`mysql2` driver)
- **Authentication:** JSON Web Tokens (JWT)
- **Forms:** React Hook Form & Zod
- **Tooling:** Bun, Biome, ESLint

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (LTS version recommended)
- [Bun](https://bun.sh/)
- A running [MySQL](https://www.mysql.com/) database instance.

### 1. Clone the Repository

```bash
git clone https://github.com/Mthew/ev-charging-network.git
cd ev-charging-network
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

Create a new file named `.env.local` in the root of the project. You can do this by copying the example file if one exists, or creating it from scratch. Add the following variables:

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
# This key needs permissions for Maps JavaScript API and Places API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Database Setup

Ensure your MySQL server is running and that you have created a database with the name you specified in `DB_NAME`.

The application is designed to automatically create the necessary tables (`ev_form_submissions`, `desired_locations`) on its first run, thanks to the `initializeDatabase` function in `src/lib/database.ts`.

### 5. Run the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- The public form is available at the root URL.
- The admin dashboard is at [/dashboard](http://localhost:3000/dashboard).
  - **Demo Admin:** `admin` / `admin123`
  - **Demo User:** `demo` / `demo123`

---

## Available Scripts

- `bun run dev`: Starts the development server with Turbopack.
- `bun run build`: Creates a production build of the application.
- `bun run start`: Starts the production server.
- `bun run lint`: Runs TypeScript checks and ESLint.
- `bun run format`: Formats the code using Biome.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
