# REST API Reference (receiver, port 3000)

All routes are defined in `Workspace/high_server_receiver/src/routes/api.ts` and mounted at
**root** (no `/api` prefix). Validation uses `express-validator` `check()`; failures return
through `middleware/validate.ts`. Every handler responds with the standard envelope from
`middleware/responseHandler.ts`:

```json
{ "message": "string", "error": false, "data": { } }
```

`error: false` = success. **There is no authentication** on any route.

## Ingestion / event endpoints

| Method | Path | Required body fields | Handler | Notes |
|--------|------|----------------------|---------|-------|
| POST | `/firstAlarm` | `node_name`, `eventId` | `UploadController.firstAlarm` | mkdir event dir + `INSERT warning_logs`; emits `newfirstalarm` |
| POST | `/upload` | `node_name` | `UploadController.firstAlarm` | **route aliases firstAlarm** (despite the name) |
| POST | `/uploadPermin` | `node_name` | `UploadController.uploadPermin` | saves file; prunes folder to ≤20 |
| POST | `/uploadEvents` | `node_name`, `eventId` | `UploadController.uploadEvents` | saves to `events/<eventId>/`; returns `orig_filename` |
| POST | `/uploadEventMax` | `node_name`, `eventId` | `UploadController.uploadEventMax` | computes maxima, `INSERT event_max`, emits `event_max-<eventId>` |

(File payload arrives as multipart `file` via `express-fileupload`.)

## History endpoints

| Method | Path | Body | Handler | Returns |
|--------|------|------|---------|---------|
| GET | `/getHistory` | — | `getHistory` | latest **18** warning_logs ⨝ event_max, newest first |
| GET | `/getAllHistory` | — | `getAllHistory` | all warning_logs ⨝ event_max, newest first |
| POST | `/getWarningLogById` | `warn_id` | `getWarningLogById` | one `warning_logs` row |

## Waveform graph endpoints

Each reads the event `.log` and returns `{ pgaX, pgaY, pgaZ, intensity, content[] }` where
`content[]` rows are `[1, timestamp, x, y, z, intensity]`.

| Method | Path | Body | Handler |
|--------|------|------|---------|
| POST | `/getBefore` | `eventId`, `node_name` | `getBefore` |
| POST | `/getDuring` | `eventId`, `node_name` | `getDuring` |
| POST | `/getAfter` | `eventId`, `node_name` | `getAfter` |

## Node / config endpoints (`ConfigController`)

| Method | Path | Required body | Handler | Effect |
|--------|------|---------------|---------|--------|
| GET | `/getAllNodeInfo` | — | `getAllNodeInfo` | `nodes ⨝ node_profiles`, ordered by project |
| POST | `/getNodeInfo` | `node_name` | `getNodeInfo` | single node + profile |
| GET | `/getIntensitySettings` | — | `getIntensitySettings` | first `intensity_configs` row |
| POST | `/updateIntensity` | `warning_min`, `alert_min` (+ `green_light`, `yellow_light`, `red_light`) | `updateIntensity` | UPDATE `intensity_configs` |
| POST | `/updateNodeConfig` | `node_id`, `positive_x_magni`, `positive_y_magni`, `positive_z_magni`, `sensor_ip`, `monitor_ip`, `node_token` | `updateNodeConfig` | UPDATE `node_profiles` + `nodes` |

## Auth endpoints (no token issued — boolean check only)

| Method | Path | Required body | Handler | Effect |
|--------|------|---------------|---------|--------|
| POST | `/loginUser` | `username`, `password` | `loginUser` | plain `account_tbl` match, returns success/fail |
| POST | `/changePass` | `newpassword` | `changePass` | `UPDATE account_tbl SET password = ?` (all rows) |

> The uploader (`high_server_uploader`) exposes **no** REST routes — its `routes/api.ts`
> is an empty router; it only runs the polling loops.
