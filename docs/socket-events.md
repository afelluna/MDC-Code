# Socket.IO Event Contract

The receiver runs a **Socket.IO v2** server (attached in `src/app.ts`, controllers wired in
`src/server.ts` via `socket-controllers`). The dashboard (and the nodes) connect to it on
port 3000. Handlers live in `src/controllers/SocketEventController.ts`; many other emits
happen from `UploadController` and the `CheckIP`/`Serial` classes.

> **Dynamic event names are the key idea.** The server re-broadcasts node telemetry and IP
> liveness on events *named after the node or the host IP*, not on a fixed channel. A client
> must first learn the node names/IPs (via `GET /getAllNodeInfo`) and then `socket.on(name,
> ...)`.

## Inbound messages the server listens for (`@OnMessage`)

| Event | Payload `message[]` | Server reaction |
|-------|---------------------|-----------------|
| `request_settings` | `[node_name]` | Looks up node thresholds + intensity config, emits `fetch_settings` back to that socket with `{ xthold, ythold, zthold, warning, warrant, usep, tafter, tbefore, datetime }` |
| `request_fdasPort` | — | emits `fdasPort: ["connected"]` to all |
| `node` | `[node_name, data]` | **re-broadcasts** as `io.emit(node_name, data)` — telemetry relay |
| `firstalarm` | `[node_name, eventId]` | mkdir event dir, `INSERT warning_logs`, emits `newfirstalarm` (mirror of `POST /firstAlarm`) |
| `light` | `[color, node_name]` | echoes `io.emit(node_name+"-light", color)` **and** debounces a serial light-tower write (see `serial-light-tower.md`) |
| `announcement` | `[color, node_name]` | echoes `io.emit(node_name+"-announcement", color)` |

## Outbound events the server emits (dashboard subscribes)

| Event name | Emitted by | Payload | Meaning |
|------------|-----------|---------|---------|
| `<node_name>` (e.g. `usher02`) | `node` handler / `UploadController.upload` | telemetry array/JSON | live readings for that node |
| `<node_name>-light` | `light` handler | color string | light-tower color for that node's monitor |
| `<node_name>-announcement` | `announcement` handler | color string | PA announcement cue |
| `newfirstalarm` | first-alarm paths | `{ created_at, node_name, event_unique_id, intensity }` | a new warning was logged |
| `event_max-<eventId>` | `uploadEventMax` | `[intensity, x, y, z]` | peak values for a finished event |
| `fetch_settings` | `request_settings` | settings object (see above) | per-node threshold config |
| `fdasPort` | `Serial` heartbeat / `request_fdasPort` | `["connected"]` / `["connecting..."]` | serial light-tower port status |
| `<host_ip>` (e.g. `192.168.10.11`) | `CheckIP` (every 5s) | `"alive"` or `"connect_error"` | ping liveness of each sensor_ip / monitor_ip |

## Client compatibility note

The server is `socket.io@^2.3.0`. Browser clients must use `socket.io-client` **2.x**
(or a client that negotiates with a v2 server) — a v3/v4 client will fail to connect.
