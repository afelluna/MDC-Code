# Serial Light Tower & PA

The receiver drives a physical stack-light tower and a PA speaker over a serial port. This
is the box's local, hardware-level alerting — independent of the cloud.

Files: `src/classes/Serial.ts` (port + audio), `src/controllers/SocketEventController.ts`
(`light` handler + debounce), `src/app.ts` (instantiation), `assets/pa-*.wav`.

## Wiring

- `app.ts` constructs `new Serial(config.SERIAL_PATH, config.BAUDRATE)` and stores it as
  `app.set("serial", serial)`. Other code calls `app.get("serial").writeEvent(color)`.
- Defaults from `.env`: `SERIAL_PATH=/dev/ttyACM0`, `BAUDRATE=9600`.
- The port is opened ~5 s after startup (gives the device time to enumerate).

## Color protocol

`Serial.writeEvent(value)` writes `value + "\n"` to the port. Valid values:

| Value | Meaning | PA file |
|-------|---------|---------|
| `green` | all-clear / normal | `assets/pa-green.wav` |
| `yellow` | warning | `assets/pa-yellow.wav` |
| `yellowred` | alert (yellow + red) | `assets/pa-red.wav` |
| `off` | lights off | (none) |

After writing, `runPA()` plays the matching `.wav` via `node-wav-player`, stopping any
currently-playing clip first (`paPlaying` guard).

## Debounce + priority (the `light` socket handler)

A node can emit many `light` messages in quick succession. `SocketEventController`
coalesces them:

1. `@OnMessage("light")` receives `[color, node_name]`, echoes `io.emit(node_name+"-light",
   color)` to the dashboard, then updates a single pending `this.color` using a priority
   ladder so a higher alert can't be downgraded mid-window:
   `yellowred` > `yellow` > `green`/`off`.
2. It resets a **1 s** timeout (`execStopStartTO` → `startWriteTO`). Only when 1 s passes
   without a new message does it actually call `serial.writeEvent(this.color)`.
3. **Green is gated on the DB**: before writing `green` it reads
   `intensity_configs.green_light`; if that flag is falsy, the green write is skipped.
   Other colors write unconditionally.

This means the tower reflects the *highest* color seen in the last second, debounced to one
serial write — avoiding flicker and serial spam.

## Port resilience & status heartbeat

`initSerial()` handles `open` / `error` / `close`:
- On `error` or `close` it schedules a re-`initSerial()` after 10 s (auto-reconnect).
- It continuously emits `fdasPort` on a 5 s timer: `["connected"]` once open,
  `["connecting..."]` while down — so the dashboard can show live port status.

> `Serial.ts.save` is a stale editor backup; ignore it. `stressTest()` exists for bench
> testing (rapid green/off cycling) and is not called in normal operation.
