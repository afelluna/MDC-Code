# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository Overview

This is the **USHER MDC (Midrise) Controller** — the *high server* tier of the USHER
seismic monitoring system. It is the aggregation/concentrator box that sits between the
per-floor sensor/monitor nodes and the central USHER cloud portal. It ingests `.log`
data uploaded by the field nodes, persists it to MySQL + the local filesystem, drives a
physical **serial light tower + PA announcement** system, and serves the operator
dashboard. A separate uploader process forwards the buffered data further up to the cloud.

It is a sibling of `../IDC Controller Code` (the Lowrise gateway) and reuses the same
project skeleton (Express + Socket.IO + TypeScript + MySQL + PM2).

| Path | Purpose |
|---|---|
| `Workspace/high_server_receiver/` | Node/Express/Socket.IO backend — ingests node uploads, REST API for the dashboard, serial light-tower + PA control, IP ping monitor (port **3000**) |
| `Workspace/high_server_uploader/` | Headless Node service — watches per-node folders and forwards permin / firstalarm / eventMax files to the cloud portal (port **3001**) |
| `Workspace/usher01/`, `usher02/`, `usher03/` | Per-node storage roots (`eventMax/`, `firstalarm/`, `permin/`) written by the receiver and drained by the uploader |
| `html/monitor/` | Compiled **Angular** operator dashboard, served by Apache on port 80; connects back to the receiver's Socket.IO/REST on 3000 |
| `uploadedeventMax/` | Archive of eventMax `.log` files already forwarded to the cloud |
| `docs/` | Architecture & data-flow docs — **read these before touching an unfamiliar subsystem** |
| `start-kiosk.sh` | Boots Firefox in kiosk mode pointing at `http://localhost/monitor/#/home` |
| `Workspace/high_server_receiver/usherctrl.sql` | Full MySQL schema dump (database `usherctrl`) |

> The two `high_server_*` folders are independent git repos (Bitbucket) and each carry
> their own `node_modules/`, `dist/`, `.env`, and `package.json`. There is **no** root
> package/build — always `cd` into the specific service first.

---

## Commands

Both services share the same scripts (run inside `Workspace/high_server_receiver/` or
`Workspace/high_server_uploader/`):

```bash
npm install          # install deps (per service)
npm run dev          # nodemon + ts-node hot reload (src/server.ts)
npm run build        # tsc -p .  → outputs to dist/
npm start            # node dist/server.js — runs compiled output
```

There is **no lint, no test runner, and no TS path config beyond `tsconfig.json`** — `npm run build` (`tsc`) is the only static check. In production both run under **PM2**:

```bash
pm2 start ecosystem.config.js   # app name "receiver" or "uploader"
pm2 logs receiver               # (out/err are routed to /dev/null in ecosystem.config.js)
```

Each service needs a `.env` (copy from `.env.example`). Key values: `APP_PORT`
(3000 receiver / 3001 uploader), `DEV_DB_*` (MySQL `usherctrl`), `UPLOAD_STORAGE_DIR`
(default `../`, i.e. the `Workspace/` root), and on the uploader the `URL_*` cloud
endpoints + `UPLOAD_*` enable flags.

---

## Architecture (big picture)

```
 Field nodes (usher01/02/03)                MDC "High Server" box
 sensor + Angular monitor                   (this repo)
        │                                         │
        │  HTTP POST .log uploads                 ▼
        └───────────────────────────►  high_server_receiver  :3000
                                          │   ├─ writes Workspace/<node>/{permin,firstalarm,eventMax}
                                          │   ├─ INSERT warning_logs / event_max  (MySQL usherctrl)
                                          │   ├─ Socket.IO relay  → Angular dashboard
                                          │   ├─ Serial light tower (green/yellow/yellowred/off) + PA .wav
                                          │   └─ ping sensor_ip/monitor_ip every 5s → io.emit(host, alive|connect_error)
                                          │
                                          ▼  (drains the same folders)
                                       high_server_uploader  :3001
                                          └─ POST permin/firstalarm/eventMax → cloud portal (URL_* :3002)
```

Key facts that span multiple files:

- **The receiver is both an HTTP upload target and a Socket.IO hub.** `src/app.ts`
  stores the shared `server`, `socketio`, `eventemitter`, and `serial` instances on the
  Express app via `app.set(...)`; controllers/classes read them back with `app.get(...)`.
  Mutating that registry is how subsystems talk to each other.

- **Socket.IO event names are dynamic.** `SocketEventController`'s `@OnMessage("node")`
  re-broadcasts as `io.emit(nodeName, data)` — the *node name itself becomes the event
  name* the dashboard subscribes to. Likewise IP-ping results are emitted on events named
  after the host IP. See `docs/socket-events.md`.

- **The light tower is debounced + serial.** Browser/`light` socket messages set a
  pending color and a 1s timeout (`SocketEventController.startWriteTO`) before
  `Serial.writeEvent()` writes `green\n`/`yellow\n`/`yellowred\n`/`off\n` to
  `SERIAL_PATH` (default `/dev/ttyACM0`, 9600 baud) and plays the matching
  `assets/pa-*.wav`. Green is gated on the `intensity_configs.green_light` DB flag.
  The serial port auto-reconnects on error/close and emits `fdasPort` heartbeats.

- **The uploader is a set of independent timeout loops, one per node × stream.**
  `server.ts` reads every row of `nodes`, then constructs `PerminUpload`,
  `FirstAlarmUpload`, and `EventMaxUpload` per node. Each polls its folder, POSTs the
  oldest file (with `node_token`), and on HTTP 200 deletes (permin/firstalarm) or moves
  to `uploadedeventMax/` (eventMax), then re-arms its timer. Intervals: permin =
  `PERMIN` sec, firstalarm = 5s, eventMax = 20s. Each stream is gated by its
  `UPLOAD_*` env flag.

- **`.log` data format** is CSV per line: `index,timestamp_ms,x,y,z,intensity`.
  `UploadController.getAbsValues` / `readDataLogGraph` derive per-file max abs X/Y/Z and
  max intensity from this. See `docs/data-flow.md`.

- **REST response envelope** (every endpoint, via `middleware/responseHandler.ts`):
  `{ message, error, data }` where `error: false` means success. **There is no auth** —
  `loginUser`/`changePass` are plain `account_tbl` lookups; all routes are open.

- **All routes are mounted at root** (no `/api` prefix) in `src/routes/api.ts`.
  Timestamps use the `Asia/Manila` timezone via `moment-timezone`.

---

## Gotchas

- `Workspace/high_server_uploader/src/routes/api.ts` is empty — the uploader exposes no
  HTTP API; it only runs the polling loops from `server.ts`.
- `config.ts` calls `machineIdSync()` at import time and exposes it as `MACHINE_ID`
  (receiver only); the DB `port` default of `27017` in `*.env` interfaces is a leftover
  and unused (MySQL port comes from `DEV_DB_PORT`).
- The receiver's `WatchFileDir` chokidar watching is **commented out** — it currently
  only `mkdir`s the per-node event dirs. Don't assume file-watch ingestion here; the
  *uploader* does the polling.
- `Serial.ts.save` is a stray editor backup; the live file is `Serial.ts`.
- Two near-duplicate first-alarm code paths exist: `UploadController.firstAlarm` (HTTP)
  and `SocketEventController.firstalarm` (socket). Keep them in sync if you change the
  `warning_logs` insert.
- `multipleStatements: true` is set on the MySQL connection and SQL is string-built with
  `?` params — keep using parameterized `db.query(sql, params)`.

---

## Key Docs

- `docs/system-architecture.md` — components, tiers, and resilience model
- `docs/tech-stack.md` — runtimes, libraries, and what each is for
- `docs/data-flow.md` — node → receiver → disk → uploader → cloud, with the `.log` format
- `docs/api-reference.md` — every receiver REST route, params, and response
- `docs/socket-events.md` — Socket.IO message contract (dynamic event names)
- `docs/serial-light-tower.md` — serial protocol, debounce logic, PA audio
- `docs/database-schema.md` — `usherctrl` tables the code actually uses
- `docs/deployment.md` — PM2, Apache, kiosk, and `.env` setup
