# Asset Management Dashboard

Frontend for the asset management coding challenge: a single-page dashboard to view assets, telemetry, power history/forecast, and manage asset configuration.

---

## Design

- **Layout** – Persistent sidebar (desktop) or collapsible drawer (mobile). Main content shows either the **Dashboard** (overview + asset list + power chart) or **Asset detail** (single asset with telemetry, power chart, and configuration form). Responsive grid: asset list stacks above detail on small screens (xs), side-by-side on medium and up (md).
- **Navigation** – React Router: `/` = Dashboard, `/asset/:assetId` = Asset detail. Breadcrumb-style path in the app bar; “Asset Management” in the sidebar links home.
- **Theming** – MUI theme with primary green (`#4a7c59`). Light/dark mode toggle in the app bar; preference stored in `localStorage` and applied via `ThemeProvider` + `createTheme`. CssBaseline and no background image on Paper for a clean look.
- **Data flow** – TanStack Query for all server state (assets, telemetry, power, configuration). REST for CRUD; WebSocket (`/ws/telemetry`) for live telemetry updates. Form state and validation (React Hook Form + Zod) stay on the client; API validation errors are mapped and shown on the configuration form.
- **Charts** – Recharts: Dashboard uses Bar (status/type counts) and Pie (status distribution); PowerChart shows power history vs forecast (solid/dashed) and efficiency on a second Y-axis.

---

## Why these technologies (brief) and trade-offs

| Choice | Why | Trade-off |
|--------|-----|-----------|
| **React + TypeScript** | Type-safe UI and clear contracts with the API; widely used and easy to onboard. | Heavier than a minimal stack; TS adds build/config overhead. |
| **Vite** | Fast dev server and simple production build; native ESM. | Different from CRA; some tooling assumes Webpack. |
| **MUI (Material UI)** | Matches “Vuetify or similar Material Design” from the brief; theming, layout, tables, forms, chips out of the box. | Bundle size; custom styling sometimes fights the theme. |
| **TanStack Query** | Server state, caching, loading/error, refetch; fits REST + optional WebSocket. | Another paradigm to learn; overkill for purely static data. |
| **React Router** | Standard SPA routing; nested routes for layout + Dashboard/Asset detail. | Client-side only; SEO would need SSR/remix. |
| **Recharts** | React-friendly charts; good for line/bar/pie and dual axes. | Less flexible than D3 for bespoke visuals; ResponsiveContainer uses ResizeObserver (needs a stub in jsdom for tests). |
| **React Hook Form + Zod** | Form state and validation aligned with API rules (enums, ranges, email, power_factor ≠ 0). | Two libraries to wire; Zod schema must stay in sync with backend. |
| **Axios** | Typed HTTP client; interceptors and error shape for validation parsing. | Extra dependency over `fetch`; tree-shaking limited. |
| **Vitest + Testing Library** | Unit and integration tests; jsdom for components; fast and Vite-native. | Not E2E; real browser flows would need Playwright/Cypress. |

---

## Setup instructions

### Prerequisites

- **Node.js 18+** and npm  
- **Docker** (optional, for running the backend API)

### 1. Start the backend API

From the **project root** (parent of `app/`):

```bash
docker compose up
```

Or from the `api/` directory:

```bash
cd api
docker build -t asset-management-api .
docker run -p 8000:8000 asset-management-api
```

The API should be at **http://localhost:8000** (see http://localhost:8000/docs for Swagger).

### 2. Install and run the frontend

```bash
cd app
npm install
npm run dev
```

App runs at **http://localhost:5173** (or the port Vite prints).

**Production build:**

```bash
npm run build
npm run preview
```

### 3. API base URL

Default is `http://localhost:8000`. Override for another host/port:

```bash
VITE_API_URL=http://your-api-host:8000 npm run dev
```

### 4. Tests

```bash
npm run test        # watch
npm run test:run    # single run
```

**Test organization** – Unit and component tests are **colocated** next to the code they test (e.g. `AssetList.test.tsx` beside `AssetList.tsx`). This is the usual React/Vitest approach: easy to find, refactor, and keep in sync. The `src/test/` folder holds only **shared** test setup: `setup.ts` (jsdom, ResizeObserver stub, cleanup) and `test-utils.tsx` (custom `render` with QueryClient + MemoryRouter). Putting all tests in a single top-level test folder is an alternative (e.g. `src/test/components/…`) if you prefer strict separation; the repo uses colocation by default.

---

## What I’d improve

- **E2E** – Playwright (or Cypress) for flows like “select asset → see telemetry” and “submit configuration form.”
- **CI/CD** – GitHub Actions: install, lint, typecheck, build, unit + integration tests (and E2E if added).
- **Error handling** – Global error boundary and clearer messaging when the API is unreachable.
- **Accessibility** – ARIA labels, keyboard navigation, focus management in asset list and configuration form.
- **Charts** – Time axis with real timestamps (e.g. “8h ago” → “now” → “+16h”); optional toggle for efficiency vs power only.
- **Configuration UX** – Invalidate/refetch configuration list after save; “unsaved changes” warning when leaving the form.

---

## Assumptions

- **API base URL** – Default `http://localhost:8000`; overridable via `VITE_API_URL` so the same build can target different environments.
- **Configuration 404** – If `GET /api/configuration/{asset_id}` returns 404, the form is prefilled with asset name and location only; other fields use client-side defaults (e.g. priority “medium,” maintenance_interval_days 30).
- **Form on asset change** – Switching asset resets the form and repopulates it when the new asset’s (and optional configuration) queries resolve.
- **Telemetry** – REST for initial load; WebSocket for live updates. When a message is for the selected asset, the panel shows the value and a “Live” chip.
- **Power chart** – History and forecast as two series (e.g. solid blue, dashed orange) on one timeline; efficiency on the right Y-axis. Zero reference line for consumption vs generation.
- **Responsive** – One layout for all breakpoints; no separate mobile app or navigation.
