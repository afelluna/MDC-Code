# MDC Controller — Docs

Architecture and data-flow documentation for the USHER **MDC (Midrise) Controller**, the
*high server* tier that aggregates field-node data, drives a serial light tower + PA, serves
the operator dashboard, and forwards everything to the cloud portal.

Start with `CLAUDE.md` in the repo root for the working overview, then dive into:

| Doc | What it covers |
|-----|----------------|
| [system-architecture.md](system-architecture.md) | Where this box sits, the components, and the resilience model |
| [tech-stack.md](tech-stack.md) | Runtimes, frameworks, libraries, and what each does |
| [data-flow.md](data-flow.md) | The `.log` format, storage layout, ingestion, and cloud drain |
| [api-reference.md](api-reference.md) | Every receiver REST route, params, and response |
| [socket-events.md](socket-events.md) | Socket.IO message contract (dynamic event names) |
| [serial-light-tower.md](serial-light-tower.md) | Serial protocol, debounce/priority, PA audio |
| [database-schema.md](database-schema.md) | The `usherctrl` tables the code actually uses |
| [deployment.md](deployment.md) | PM2, Apache, kiosk, `.env`, and networking |
