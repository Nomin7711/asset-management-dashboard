# Asset Management System – Submission Notes

Hi, my name is **Nomin** and I built this Asset Management Dashboard using **React**, **TypeScript**, **Vite**, **Material UI (MUI)**, **TanStack Query**, **React Router**, **Recharts**, and **React Hook Form** with **Zod**. This dashboard lets you view and manage industrial assets (pumps, compressors, generators), see live telemetry and power history/forecast, and create or update asset configuration with validated forms. It includes a responsive layout with light/dark theme and optional real-time updates via WebSocket.

---

## 1. Setup instructions

The source code is included in the submission email and is also pushed to GitHub—feel free to check it out there:

**https://github.com/Nomin7711/asset-management-dashboard**

### Prerequisites

- Node.js 18+ and npm  
- Docker (optional, for running the backend API)

### Run the app

**1. Start the backend API** (from project root):

```bash
docker compose up
```

Or from the `api/` directory:

```bash
cd api
docker build -t asset-management-api .
docker run -p 8000:8000 asset-management-api
```

API: **http://localhost:8000** · Docs: **http://localhost:8000/docs**

**2. Install and run the frontend:**

```bash
cd app
npm install
npm run dev
```

App: **http://localhost:5173** (or the port Vite prints).

**Production build:** `npm run build` then `npm run preview`.

**Override API URL:** `VITE_API_URL=http://your-host:8000 npm run dev`

**Tests:** `npm run test` (watch) or `npm run test:run` (single run).

---

## 2. Architecture overview & design

**Framework and library choices:** React 19 + TypeScript, Vite, MUI, TanStack Query, React Router, Recharts, React Hook Form + Zod, Axios. Vitest and Testing Library for unit and integration tests.

**Why this stack:**  
Because the project execution length was short, I chose what I use the most for **familiarity** and speed: TypeScript for type safety and clear API contracts, MUI for a consistent Material Design UI and theming, and TanStack Query for server state, caching, and efficient data fetching. Vite gives a fast dev server and simple build; React Hook Form with Zod keeps form state and validation in sync with the API rules.

**Advantages:**  
Strong typing end-to-end, predictable loading/error states, reusable components, and a single place for server state (React Query) so the UI stays in sync with the backend. Real-time telemetry is handled by combining REST for initial load and WebSocket for live updates.

**Practical skills applied:**  
Component structure and composition, custom hooks, **memoization** (e.g. `useMemo` for derived data and chart stats) to avoid unnecessary re-renders, colocated tests with shared setup, client- and server-side validation with clear error display, and responsive layout with a single dashboard across breakpoints.

---

## 3. Future considerations

What I'd improve and some fresh ideas on the current codebase:

- **E2E tests** – Playwright (or Cypress) for critical flows: select asset → see telemetry, submit configuration form.
- **CI/CD** – GitHub Actions: install, lint, typecheck, build, and run unit/integration (and E2E when added).
- **Error handling** – Global error boundary and clearer messaging when the API is unreachable.
- **Accessibility** – ARIA labels, keyboard navigation, and focus management in the asset list and configuration form.
- **Charts** – Time axis with real timestamps ("8h ago" → "now" → "+16h"); optional toggle for efficiency vs power only; tooltips with more context.
- **Configuration UX** – Invalidate/refetch configuration list after save; "unsaved changes" warning when leaving the form.
- **Ideas for later** – Asset comparison view (side-by-side metrics), simple alerts/notifications for status changes, and export of configuration or power data (e.g. CSV/PDF).

---

## 4. Summary

**Assumptions I made:**  
API base URL defaults to `http://localhost:8000` and is overridable via `VITE_API_URL`. If `GET /api/configuration/{asset_id}` returns 404, the form is prefilled with asset name and location only; other fields use client-side defaults. When the user switches asset, the form resets and repopulates from the new asset and its configuration. Telemetry uses REST for initial load and WebSocket for live updates; when a message is for the selected asset, the panel shows the value and a "Live" chip. The power chart shows history and forecast as two series with efficiency on a second Y-axis; zero reference line for consumption vs generation. One responsive layout for all breakpoints.

**Experience:**  
Working with **real-time data** and learning about the API's telemetry and power history/forecast structure was insightful. I spent about **4 hours** in total: around **40 minutes** understanding the data and researching similar asset dashboards on the internet, then choosing a design and implementing. My solution and graphs are focused rather than exhaustive—I thought focusing on the **main functionality** and providing a **clear structure** and **user-friendly interface** would make the dashboard easy to use, and I paid attention to that.

I added **test cases** (unit and integration with Vitest and Testing Library), handled **errors and validation** (client-side with Zod and server-side errors surfaced in the form), and paid attention to **efficient data fetching** using React Query and React hooks (e.g. `useMemo`) to store computed results and avoid unnecessary re-renders. I chose **TypeScript** and **MUI** for type safety and a consistent, maintainable UI.

This experience was challenging and brought the creativity out of me. Thanks for giving me this opportunity—I hope we'll talk soon.
