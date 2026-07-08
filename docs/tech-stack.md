# Tech Stack

The MDC Controller is a small distributed system: two Node.js/TypeScript services, a MySQL
database, a pre-compiled Angular dashboard, and a serial-attached light tower + PA. Both
services build with `tsc` and run under PM2.

## 1. Backend services (`Workspace/high_server_receiver`, `Workspace/high_server_uploader`)
- **Runtime**: Node.js
- **Framework**: Express.js (`express`, `cors`, `morgan`, `body-parser`)
- **Language**: TypeScript 3.x (compiled to `dist/`; dev via `nodemon` + `ts-node`)
- **Real-time**: Socket.IO **v2** server + `socket-controllers` decorators
  (`@SocketController`, `@OnMessage`) — needs `reflect-metadata`
- **Validation**: `express-validator` (`check`) with a shared `middleware/validate.ts`
- **File uploads**: `express-fileupload` (receiver); also `multer` in deps
- **Process mgmt**: PM2 (`ecosystem.config.js`, app names `receiver` / `uploader`)

## 2. Database
- **Engine**: MySQL / MariaDB, database `usherctrl`
- **Driver**: `mysql` (callback + a promise wrapper in `database/mysqldatabase.ts`,
  `multipleStatements: true`)
- **Schema**: `Workspace/high_server_receiver/usherctrl.sql` (phpMyAdmin dump; the live app
  uses only a subset — see `database-schema.md`)

## 3. Hardware / physical I/O (receiver)
- **Serial light tower**: `serialport` v8 + `@serialport/parser-readline` — writes
  `green`/`yellow`/`yellowred`/`off` to `SERIAL_PATH` (default `/dev/ttyACM0`, 9600 baud)
- **PA audio**: `node-wav-player` plays `assets/pa-{green,yellow,red}.wav`
  (`node-omxplayer` also in deps for RPi/OMX playback)
- **Network liveness**: `ping` (`CheckIP`) probes node sensor/monitor IPs
- **Machine identity**: `node-machine-id` (`machineIdSync()` → `config.MACHINE_ID`)

## 4. Cloud sync & utilities (uploader)
- **HTTP client**: `request` / `request-promise` (`rp`) for multipart file POSTs to the
  cloud portal
- **File reads**: `n-readlines` (`lineByLine`) for streaming `.log` lines; `fs-extra`
  for move/remove
- **File watching**: `chokidar` is present (`WatchFileDir`) but the watch handlers are
  currently commented out — ingestion drain is timer-based polling, not chokidar
- **Date/Time**: `moment-timezone`, pinned to `Asia/Manila`

## 5. Frontend (`html/monitor`)
- **Framework**: Angular (pre-compiled `main-es2015.*.js` bundles; source repo is
  `ctrl_monitor_2020_deploy` on Bitbucket — not in this tree)
- **Served by**: Apache2 as a static site on port 80
- **Config**: `assets/config.json` → `{ ip, port }` of the receiver
- **Kiosk**: Firefox `--kiosk` via `start-kiosk.sh`
