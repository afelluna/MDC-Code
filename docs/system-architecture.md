# System Architecture

The USHER **MDC (Midrise) Controller** is the *high server* tier of the USHER seismic
monitoring system. It aggregates data from several per-floor nodes, persists and visualizes
it locally, drives a physical warning light tower + PA, and forwards everything to the
central cloud portal.

## 1. Where this box sits

```
 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │  usher01     │   │  usher02     │   │  usher03     │   ← field nodes (sensor + Angular monitor)
 │ sensor+mon   │   │ sensor+mon   │   │ sensor+mon   │
 └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
        │  HTTP POST .log uploads (per node)  │
        └──────────────────┬──────────────────┘
                           ▼
                ┌─────────────────────────────┐
                │   MDC "High Server" box      │   ← THIS REPO
                │                              │
                │  high_server_receiver :3000  │  ingest + API + Socket.IO + serial light/PA + IP ping
                │  high_server_uploader :3001  │  drain folders → cloud
                │  Apache :80  → /monitor (NG) │  operator dashboard (kiosk)
                │  MySQL  usherctrl            │  config + history
                │  /dev/ttyACM0  light tower   │  green / yellow / red + PA speaker
                └──────────────┬───────────────┘
                               │ HTTP POST
                               ▼
                       Central USHER cloud portal (URL_* :3002)
```

## 2. Component Overview

### A. Receiver — `Workspace/high_server_receiver` (port 3000)
The always-on hub. Responsibilities:
- **Ingestion**: HTTP `POST` endpoints accept `.log` uploads and event signals from the
  nodes (`/uploadPermin`, `/firstAlarm`, `/uploadEventMax`, `/uploadEvents`). Files land
  under `Workspace/<node_name>/{permin,firstalarm,eventMax}/`.
- **Persistence**: inserts `warning_logs` (first-alarm events) and `event_max`
  (per-event maxima) rows in MySQL `usherctrl`.
- **Dashboard API**: REST routes for history, node/intensity config, login, and the
  before/during/after waveform graphs (see `api-reference.md`).
- **Real-time relay**: Socket.IO hub. Re-broadcasts node telemetry, first-alarm events,
  and IP liveness to the Angular dashboard (see `socket-events.md`).
- **Physical alerting**: drives a serial light tower + PA speaker (see
  `serial-light-tower.md`).
- **Liveness**: `CheckIP` pings every `sensor_ip`/`monitor_ip` from the `nodes` table
  every 5s and emits the result on a socket event named after the host IP.

### B. Uploader — `Workspace/high_server_uploader` (port 3001)
Headless cloud-sync service. On boot it reads the `nodes` table and spins up three polling
loops **per node** (permin, firstalarm, eventMax). Each loop POSTs the oldest pending file
(authenticated with the node's `node_token`) to the configured cloud `URL_*`, and on
success deletes it (permin/firstalarm) or moves it to `uploadedeventMax/` (eventMax).
Listens on 3001 only to satisfy the shared app skeleton — it exposes no real HTTP API.

### C. Dashboard — `html/monitor` (Apache, port 80)
Pre-compiled **Angular** SPA. Reads `assets/config.json` (`{ ip, port }`, default
`192.168.10.200:3000`) to find the receiver, then opens a Socket.IO connection and calls
the receiver's REST API. Launched full-screen by `start-kiosk.sh` (Firefox kiosk →
`/monitor/#/home`).

### D. Database — MySQL `usherctrl`
Single shared schema used by both services. See `database-schema.md`.

## 3. Data Flow Path
1. **Seismic motion** at a node → 2. node uploads `.log`/event via HTTP →
3. **Receiver** writes file to local disk + MySQL, relays to dashboard, drives the light
   tower → 4. **Uploader** polls the folder and POSTs the file to the
5. **Cloud portal**, then removes/archives it locally.

## 4. Resilience model
- **Filesystem buffering**: if the cloud link is down, the uploader keeps retrying on its
  timer while the receiver keeps ingesting and logging locally — no data is lost in transit.
- **Serial auto-reconnect**: `Serial.ts` re-opens `/dev/ttyACM0` on error/close (10s) and
  emits `fdasPort` connecting/connected heartbeats so the dashboard can show port status.
- **Permin self-pruning**: the receiver keeps each node's `permin/` folder bounded (drops
  the oldest 10 once it exceeds 20 files) to protect disk.
- **Process recovery**: PM2 (`ecosystem.config.js`, `autorestart`, `max_memory_restart:
  1G`) restarts either service if it crashes.
