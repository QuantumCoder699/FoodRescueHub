# Food Rescue Hub — Self-Deployment Guide

Food Rescue Hub is a React + Vite + TypeScript + TailwindCSS frontend. The current version is a polished presentation/demo build with local in-browser state; it does not require Firebase credentials or a backend to run.

## Requirements

- Node.js 18 or newer
- pnpm 9 or newer (npm also works for installing dependencies, but pnpm is recommended because the repository includes `pnpm-lock.yaml`)

## Run locally

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Validate and build

```bash
pnpm check
pnpm build
```

The production frontend is generated in `dist/public` and the small Express static server bundle is generated at `dist/index.js`.

## Run the production build locally

```bash
pnpm start
```

Set `PORT` if your host requires a specific port:

```bash
PORT=3000 pnpm start
```

## Deployment notes

This project can be deployed to any Node.js host that supports a build step and a long-running start command. Use `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm start`. The app is client-side and uses the existing Express fallback so routes resolve to the frontend entry point.

The demo state is intentionally local and resettable from the sidebar. To connect a real database, authentication provider, uploads, or live maps, add those services and environment variables in a future backend integration.
