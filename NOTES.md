# Asset Management Dashboard – Implementation Notes

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Docker (optional, for running the API)

### 1. Start the backend API

From the project root:

```bash
docker-compose up
```

Or from the `api/` directory:

```bash
cd api
docker build -t asset-management-api .
docker run -p 8000:8000 asset-management-api
```

Ensure the API is available at **http://localhost:8000** (see http://localhost:8000/docs for interactive docs).

### 2. Install and run the frontend

```bash
cd app
npm install
npm run dev
```

The app will be at **http://localhost:5173** (or the port Vite prints).

To build for production:

```bash
npm run build
npm run preview
```

### 3. API URL

The frontend uses `http://localhost:8000` by default. To override (e.g. for a different host or port), set:

```bash
VITE_API_URL=http://your-api-host:8000 npm run dev
```

---

## Framework and library choices

- **React 18 + TypeScript** – Used for familiarity and to showcase clear, type-safe code. The challenge allows any framework; the role’s production stack (e.g. Vue3/Vuetify) can be adopted on the job.
- **Vite** – Fast dev server and simple production build.
- **Material UI (MUI)** – Material Design component set, aligned with the JD’s mention of “Vuetify or similar Material Design libraries.” Provides layout, theming, and reusable components (tables, forms, chips, etc.).
- **TanStack Query (React Query)** – Server state for assets, telemetry, power, and configuration. Handles loading/error states, caching, and refetching. Keeps UI in sync with the backend and supports the optional WebSocket telemetry updates.
- **React Router** – Single-dashboard route and layout for navigation.
- **Recharts** – Power history/forecast line chart. React-friendly API; supports two series (history vs forecast), dual Y-axes (power and efficiency), and clear differentiation (solid vs dashed, colors).
- **React Hook Form + Zod + @hookform/resolvers** – Form state and client-side validation matching the API’s rules (enums, ranges, email, power_factor ≠ 0). Zod schema mirrors the backend; server validation errors are surfaced via a helper and displayed in the form.
- **Axios** – HTTP client with a small typed API wrapper; error handling for validation responses.
- **WebSocket (native)** – Real-time telemetry via `ws://localhost:8000/ws/telemetry`. The Telemetry panel subscribes and updates the displayed metrics when messages arrive, while still using the REST endpoint for initial load.

---

## What I would improve with more time

- **Tests** – Unit tests (Vitest) for API client, Zod schema, and key components; one E2E (Playwright) for “select asset → see telemetry” and “submit configuration form.”
- **CI/CD** – GitHub Actions workflow: install, lint, typecheck, build, and run the above tests.
- **Error handling** – Global error boundary and clearer messaging when the API is unreachable.
- **Accessibility** – ARIA labels, keyboard navigation, and focus management, especially in the asset list and form.
- **Chart UX** – Time axis with actual timestamps (e.g. “8h ago” to “now” to “+16h”), and optional toggle for efficiency vs power only.
- **Configuration** – Invalidate or refetch configuration list after save so other views stay consistent; optional “unsaved changes” warning when leaving the form.

---

## Assumptions and decisions

- **API base URL** – Default `http://localhost:8000`; configurable via `VITE_API_URL` so the same build can target different environments.
- **Configuration 404** – If `GET /api/configuration/{asset_id}` returns 404, the form is prefilled with asset name and location only; all other fields use the client-side defaults (e.g. priority “medium,” maintenance_interval_days 30).
- **Form reset on asset change** – When the user selects a different asset, the configuration form is reset and then repopulated from the new asset and/or its stored configuration when the queries resolve.
- **WebSocket and REST** – Telemetry panel uses REST for initial load and subscribes to the WebSocket for live updates; when a WebSocket message contains data for the selected asset, that value is shown and a “Live” chip is displayed.
- **Power chart** – History and forecast are plotted as two series (solid blue and dashed orange) on a combined timeline; efficiency is a separate line (right Y-axis). Zero reference line indicates consumption vs generation.
- **Responsive layout** – Grid layout: asset list stacks above the detail panel on small screens (xs), and sits beside it on medium and up (md). No separate mobile navigation; the same dashboard works across breakpoints.
