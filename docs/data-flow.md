# Data Flow

This traces a reading from a field node, through the receiver, onto disk + MySQL, and out
to the cloud via the uploader.

## 1. The `.log` data format

Every seismic `.log` line is CSV: a row index, a millisecond timestamp, the three axis
accelerations, and a derived intensity:

```
index , timestamp_ms , x , y , z , intensity
0,1692171539543,0.00015312,-0.00014311,0.00007861,1
1,1692171539545,-0.00009647,-0.00000661,0.00024241,1
```

Field positions used by the code (`UploadController.getAbsValues` /
`readDataLogGraph`):

| idx | field | parsed as |
|----:|-------|-----------|
| 0 | row index | (ignored) |
| 1 | timestamp (ms) | `parseInt` |
| 2 | x | `parseFloat` |
| 3 | y | `parseFloat` |
| 4 | z | `parseFloat` |
| 5 | intensity | `parseInt` |

Per file the receiver derives **max absolute** x/y/z (PGA) and **max** intensity.

## 2. Storage layout

`UPLOAD_STORAGE_DIR` (default `../`, i.e. the `Workspace/` root) holds one folder per node:

```
Workspace/<node_name>/
├── permin/        # per-minute rolling readings (self-pruned to ≤20 files by receiver)
├── firstalarm/    # one (empty) file per first-alarm event, named with the eventId
├── eventMax/      # the peak waveform .log for each event
└── events/        # per-event waveform logs (LOGS_EVENT_DIR; used by before/during/after)
```

Folder names come from `.env` (`LOGS_PER_MIN_DIR`, `LOGS_FIRST_ALARM_DIR`,
`LOGS_EVENT_MAX_DIR`, `LOGS_EVENT_DIR`). Successfully uploaded eventMax files are moved to
`uploadedeventMax/` (`LOGS_UPLOADED_EVENT_MAX_DIR`).

## 3. Ingestion (receiver, port 3000)

| Stream | Endpoint | What the receiver does |
|--------|----------|------------------------|
| **First alarm** | `POST /firstAlarm` (or socket `firstalarm`) | `mkdir` the event dir, `INSERT INTO warning_logs (node_name, event_unique_id, created_at, intensity)` where intensity = last 2 chars of `eventId`, then `io.emit("newfirstalarm", {...})` |
| **Per-minute** | `POST /uploadPermin` | save file to `permin/`; if folder > 20 files, delete oldest 10 |
| **Event max** | `POST /uploadEventMax` | compute max abs x/y/z + max intensity, save file, `INSERT INTO event_max (...)`, then `io.emit("event_max-"+eventId, [intensity,x,y,z])` |
| **Event waveform** | `POST /uploadEvents` | save file under `events/<eventId>/`, return `orig_filename` |
| **Live stream** | `POST /upload` *(aliased to firstAlarm in routes)* / socket `node` | parse the CSV body and `io.emit(node_name, JSON)` for the dashboard |

All require `node_name` (and `eventId` where relevant) and respond with the standard
`{ message, error, data }` envelope.

## 4. Drain to cloud (uploader, port 3001)

On startup `server.ts` queries `SELECT node_name, node_token FROM nodes` and, for each row,
instantiates three pollers. Each is a self-rearming `setTimeout` loop:

| Class | Folder polled | Interval | On HTTP 200 | Cloud URL |
|-------|---------------|----------|-------------|-----------|
| `PerminUpload` | `permin/` | `PERMIN` sec | `fs.unlink` the file | `URL_PERMIN` |
| `FirstAlarmUpload` | `firstalarm/` | 5 s | `fsExtra.remove` the file | `URL_FIRSTALARM` |
| `EventMaxUpload` | `eventMax/` | 20 s | `fsExtra.move` → `uploadedeventMax/` | `URL_EVENT_MAX` |

Each loop sorts the folder, takes `files[0]` (oldest), POSTs it as `multipart/form-data`
with `node_token` (and `eventId` for firstalarm/eventMax), then re-arms regardless of
outcome. A stream only runs if its `UPLOAD_*` flag is `true` in `.env`. `EventUpload` is
defined but **not** started in `server.ts` (commented out).

## 5. Read-back for the dashboard

The dashboard reconstructs waveforms from the stored event logs via
`POST /getBefore`, `/getDuring`, `/getAfter` (each reads the event `.log` with
`n-readlines`, computes PGA + intensity, and returns `{ pgaX, pgaY, pgaZ, intensity,
content[] }`). History comes from `/getHistory` (latest 18) and `/getAllHistory`, both
LEFT JOINing `warning_logs` with `event_max`. See `api-reference.md`.
