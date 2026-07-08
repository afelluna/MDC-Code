# Database Schema (`usherctrl`)

MySQL/MariaDB database `usherctrl`. The full phpMyAdmin dump is
`Workspace/high_server_receiver/usherctrl.sql` and contains many Laravel/Passport tables
(`oauth_*`, `migrations`, `permissions`, `roles`, `users`, …) that are **legacy and unused**
by these Node services. The tables the running code actually touches are below.

Connection: `database/mysqldatabase.ts` (`mysql` driver, `multipleStatements: true`).
Always query via the parameterized helper: `db.query(sql, params)`.

## `nodes` — one row per field node
| Column | Type | Notes |
|--------|------|-------|
| `node_id` | char(36) | PK |
| `node_name` | varchar | unique, e.g. `usher01` — the key used everywhere in code & folders |
| `node_token` | varchar | unique; sent by the uploader to authenticate to the cloud |
| `project` | varchar | grouping (default `usher`) |
| `sensor_ip`, `monitor_ip` | varchar | pinged by `CheckIP` every 5 s |

Seed data: `usher01` (.10.11/.12), `usher02` (.10.21/.22), `usher03` (.10.31/.32).

## `node_profiles` — per-node calibration (1:1 with `nodes` via `node_id`)
| Column | Type | Notes |
|--------|------|-------|
| `positive_x_magni`, `positive_y_magni`, `positive_z_magni` | decimal(10,7) | axis magnitudes; surfaced as `xthold/ythold/zthold` in `fetch_settings` |
| `node_location` | varchar | e.g. lower/middle/upper |
| `node_id` | char(36) | FK → `nodes` |

## `intensity_configs` — global thresholds (single row, `LIMIT 1`)
| Column | Type | Notes |
|--------|------|-------|
| `warning_min`, `alert_min` | int | warning/alert intensity thresholds (→ `warning`/`warrant`) |
| `before`, `after` | int | waveform window sizes (default 22; → `tbefore`/`tafter`) |
| `green_light`, `yellow_light`, `red_light` | tinyint(1) | light-tower enable flags; `green_light` gates the serial green write |
| `usep` | varchar | feature flag (default `no`) |

## `warning_logs` — one row per first-alarm event
| Column | Type | Notes |
|--------|------|-------|
| `warn_id` | bigint | PK |
| `node_name` | varchar | |
| `event_unique_id` | varchar | the `eventId` |
| `intensity` | int | derived from last 2 chars of `eventId` on insert |
| `path`, `process`, `created_at`, `updated_at` | | |

## `event_max` — peak values per event
| Column | Type | Notes |
|--------|------|-------|
| `event_max_id` | bigint | PK |
| `filename`, `path` | varchar | the stored `.log` |
| `event_unique_id` | varchar | joins to `warning_logs` |
| `intensity_max`, `x_max`, `y_max`, `z_max` | varchar | per-file maxima |
| `year`, `month`, `day`, `hour` | varchar | partition fields from `getTimePath()` |

History endpoints `LEFT JOIN warning_logs ⨝ event_max ON event_unique_id`.

## `account_tbl` — dashboard login (no hashing, no sessions)
| Column | Notes |
|--------|-------|
| `username`, `password`, `email` | plaintext; `/loginUser` does a literal match, `/changePass` updates `password` for all rows. Default seed: `usherctrl` / `usherctrl2020`. |
