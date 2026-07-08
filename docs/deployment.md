# Deployment & Setup

The MDC Controller runs on a single Linux box (Ubuntu, per `start-kiosk.sh` / Apache). It
hosts MySQL, the two Node services under PM2, Apache serving the Angular dashboard, and the
serial light tower on `/dev/ttyACM0`.

## 1. Prerequisites
- Node.js + npm, MySQL/MariaDB, Apache2, PM2 (`npm i -g pm2`)
- Serial device on `/dev/ttyACM0` (light tower) — the user running the receiver needs
  access (e.g. `dialout` group)
- Database `usherctrl` loaded from `Workspace/high_server_receiver/usherctrl.sql`

## 2. Database
```bash
mysql -u root -p -e "CREATE DATABASE usherctrl"
mysql -u root -p usherctrl < Workspace/high_server_receiver/usherctrl.sql
# create the app user referenced in .env (usheruser / connect@Usher2020 by default)
```

## 3. Environment files
Each service needs its own `.env` (copy from `.env.example`):

**`high_server_receiver/.env`** — `APP_PORT=3000`, `DEV_DB_*` (db `usherctrl`),
`UPLOAD_STORAGE_DIR=../` (the `Workspace/` root), the `LOGS_*` folder names,
`SERIAL_PATH=/dev/ttyACM0`, `BAUDRATE=9600`.

**`high_server_uploader/.env`** — `APP_PORT=3001`, same `DB`/`UPLOAD_STORAGE_DIR`/`LOGS_*`,
plus the cloud targets and enable flags:
```
PERMIN=5                 # permin poll interval (sec)
UPLOAD_PERMIN=true
UPLOAD_FIRSTALARM=true
UPLOAD_EVENT_MAX=true
UPLOAD_EVENT=false
URL_PERMIN=http://<cloud>:3002/high/uploadPermin
URL_FIRSTALARM=http://<cloud>:3002/high/firstAlarm
URL_EVENT_MAX=http://<cloud>:3002/uploadEventMax
```
`NODE_ENV` selects the `DEV_/TEST_/PROD_` DB block (defaults to `development`).

## 4. Build & run the services
```bash
# receiver
cd Workspace/high_server_receiver && npm install && npm run build
pm2 start ecosystem.config.js          # app "receiver" :3000

# uploader
cd ../high_server_uploader && npm install && npm run build
pm2 start ecosystem.config.js          # app "uploader" :3001

pm2 save && pm2 startup                 # persist across reboot
```
For development use `npm run dev` (nodemon + ts-node) instead of build+pm2.

> PM2 routes both services' stdout/stderr to `/dev/null` (see `ecosystem.config.js`); use
> `winston` log files (`logs/`) or temporarily edit the ecosystem file when debugging.

## 5. Dashboard (Apache + kiosk)
- Deploy the compiled Angular bundle under Apache's docroot so it serves at
  `http://localhost/monitor/` (the bundle is already in `html/monitor/`).
- Point `html/monitor/assets/config.json` at the receiver: `{ "ip": "<receiver-ip>",
  "port": 3000 }` (default `192.168.10.200:3000`).
- `start-kiosk.sh` disables the GNOME screensaver/idle and launches
  `firefox --kiosk http://localhost/monitor/#/home`. Wire it into the desktop session
  autostart for an unattended wall display.

## 6. Networking summary
| Port | Service |
|------|---------|
| 80 | Apache → Angular dashboard |
| 3000 | receiver (REST + Socket.IO + ingestion) |
| 3001 | uploader (no public API) |
| 3002 (remote) | central cloud portal the uploader POSTs to |
| 3306/3308 | MySQL |

Field nodes (`192.168.10.x`) upload to the receiver; the receiver pings their
`sensor_ip`/`monitor_ip`; the uploader pushes outbound to the cloud.
