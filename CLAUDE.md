# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm i           # install deps + run nuxt prepare
pnpm dev         # dev server (Nuxt 3, SSR disabled)
pnpm build       # production build → .output/
pnpm start       # run production server from .output/
pnpm preview     # preview production build locally
```

ESLint uses `@antfu/eslint-config` flat config (`eslint.config.js`). Run directly: `npx eslint .`. Prettier config at `.prettierrc.toml`.

## Architecture

This is a Nuxt 3 **SPA** (`ssr: false`) that bypasses the Totoro School campus fitness app by proxying all API calls to `app.xtotoro.com` through a thin server layer.

### Data flow

```
Browser (Vue/Vuetify) → TotoroApiWrapper (ky) → /api/totoro/[...slug]
  → server catch-all proxy → app.xtotoro.com
```

- **Frontend** calls `TotoroApiWrapper` (singleton ky client at `src/wrappers/TotoroApiWrapper.ts`), which encrypts request bodies via RSA before POSTing to `/api/totoro/...`.
- **Server** (`server/api/totoro/[...slug].ts`) strips the `/api/totoro` prefix, sets iPhone User-Agent headers, and forwards to `https://app.xtotoro.com`. Responses come back as-is (JSON).
- **Some API routes** have dedicated server handlers that do encryption on the server side instead (e.g., `server/api/run/`, `server/api/mornsign/`). In these cases the browser calls the Nuxt API directly and the server handles RSA + proxying.

### RSA encryption

Communication with Totoro uses RSA-1024 / PKCS1 padding. Keys live in `src/data/rsaKeys.ts`.

- **Server path** (`typeof window === 'undefined'`): uses `node:crypto.publicEncrypt` with chunking (117-byte max per chunk).
- **Browser path**: uses a vendored fork of `node-rsa` at `src/utils/nodeRSA.ts` (776 KB, do not edit — this is a bundled library). Always pass `publicKey` for encryption, `privateKey` for decryption.

### Shared state (composables)

Nuxt `useState` pattern in `composables/`:
- `useSession()` — login session (token, stuNumber, schoolId, etc.), **memory-only, lost on refresh**
- `useSunRunPaper()` — sun-run paper data (routes, task info)
- `useFreeRunPaper()` — free-run paper data
- `useMornSignPaper()` — morning check-in paper data

### Route simulation

`src/utils/generateRoute.ts`: takes `RunPoint` from server (checkpoints), interpolates intermediate points at ~0.0001-degree intervals, adds normal-distribution GPS deviation (`src/utils/normalRandom.ts`), trims to the required distance using Haversine/Vincenty distance (`src/utils/distanceCalculator.ts`).

### Morning check-in

`src/controllers/generateMorningExercisesReq.ts` generates the request payload: builds a MAC address from the student number (SHA-256 truncation in `src/utils/generateMac.ts`), applies GPS offset to the check-in point coordinates, and sets the required sign simulation time.

### Cron endpoint

`server/api/cron/morningsign.ts` is a **skeleton** — Vercel Cron fires daily at 22:00 UTC (per `vercel.json`) but the handler returns `{ success: false, message: 'Cron endpoint not yet implemented' }`. It needs to: read env vars → login → get sign paper → submit morning exercises.

## Known issues

- `src/utils/nodeRSA.ts` is a 776 KB vendored fork with hundreds of implicit-any TS errors. Consider replacing with an npm dependency.
- `src/middlewares/`, `src/classes/UserSession.ts`, and CLI utilities (`src/utils/argv.ts`, `src/utils/progressBar.ts`, `src/utils/userConfig.ts`, `src/utils/waitUntilRunned.ts`) are legacy dead code from a pre-Nuxt CLI version.
- 90+ `console.log` calls are scattered across the codebase with no stripping in production builds.
- A few server API endpoints catch errors and return HTTP 200 with raw error messages, leaking internal details.
- `wrangler.toml` has an outdated `compatibility_date` (2023-01-30).
