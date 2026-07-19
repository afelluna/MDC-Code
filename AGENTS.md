# Repository Guidelines

## Project Structure & Module Organization

This repository contains the USHER MDC high-server stack. Backend services live in `Workspace/high_server_receiver/` and `Workspace/high_server_uploader/`; each has its own `package.json`, `src/`, `dist/`, `.env`, and dependencies. Receiver code handles Express, Socket.IO, uploads, MySQL, serial light-tower control, and dashboard APIs. Uploader code forwards buffered files upstream.

The React/Vite dashboard source is in `frontend/src/`, with reusable UI in `components/`, pages in `pages/`, services in `services/`, and assets in `assets/` or `public/`. Legacy compiled dashboard files are under `html/monitor/`. Operational docs are in `docs/`; read the relevant architecture, API, socket, database, or deployment document before changing an unfamiliar subsystem.

## Build, Test, and Development Commands

Run backend commands inside either `Workspace/high_server_receiver/` or `Workspace/high_server_uploader/`:

```bash
npm install
npm run dev
npm run build
npm start
```

`npm run dev` starts `nodemon src/server.ts`; `npm run build` runs TypeScript into `dist/`; `npm start` runs compiled output. Production uses PM2, for example `pm2 start ecosystem.config.js`.

Run frontend commands inside `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

`build` performs `tsc -b` and Vite bundling; `lint` runs Oxlint.

## Coding Style & Naming Conventions

Use TypeScript for backend and frontend changes. Match local formatting: frontend files use two-space indentation and single quotes; older backend files mix two-space and tab indentation, so preserve nearby style. Use `PascalCase` for React components and backend classes, `camelCase` for variables/functions, and keep modules grouped under `controllers`, `classes`, `config`, `routes`, and `middleware`.

## Testing Guidelines

No test runner or test directories are currently configured. Treat `npm run build` as backend verification and `npm run build && npm run lint` as frontend verification. If adding tests, place them near covered code and document the runner in the relevant `package.json`.

## Commit & Pull Request Guidelines

Git history currently shows only `Initial commit`, so no strict convention is established. Use short, imperative subjects such as `Fix receiver upload parsing` or `Add dashboard lint checks`. Pull requests should describe the change, list verification commands, call out `.env` or deployment impacts, link any issue, and include screenshots for dashboard UI changes.

## Security & Configuration Tips

Do not commit secrets from `.env` or `.env.local`. Keep MySQL, cloud upload URLs, serial device paths, and node storage roots configurable. Prefer parameterized database queries and preserve the existing response envelope `{ message, error, data }`.
