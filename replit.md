# Climate Action Hub

A gamified climate-action app with campaigns, goals, leaderboards, and crowdfunding.

## Run & Operate

- `pnpm dev` — run the API (port 5000) and web app (port 5173)
- `pnpm run dev:serverless` — run the frontend and API through Vercel's local emulator
- `pnpm run build:vercel` — build the Vercel static frontend output
- `pnpm --filter @workspace/api-server run dev` — run only the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No database or required development environment variables.
- Optional env: `API_PORT`, `FRONTEND_PORT`, `SESSION_SECRET`.
- Vercel requires `SESSION_SECRET`; see `VERCEL_DEPLOYMENT.md`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Data: bundled CSV snapshots with in-memory runtime updates
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- CSV seed data: `artifacts/api-server/src/data`
- In-memory store: `artifacts/api-server/src/lib/dataStore.ts`
- API routes: `artifacts/api-server/src/routes`
- Frontend: `artifacts/climate-change/src`

## Architecture decisions

- CSV files are bundled into the API executable at build time.
- Registrations, enrollments, completions, and donations persist only until restart.
- Seeded `@demo.com` accounts use the development password `demo`.

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
