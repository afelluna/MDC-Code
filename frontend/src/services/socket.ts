import io from 'socket.io-client';
import { getApiBase } from './api';
import type { SensorSample } from '../types';

export interface SocketClientEvents {
  onNodeTelemetry: (nodeName: string, samples: SensorSample[]) => void;
  onIpPing: (ip: string, status: 'alive' | 'connect_error') => void;
  onFirstAlarm: (data: { node_name: string; event_unique_id: string; intensity: number; created_at: string }) => void;
  onStatusChange: (connected: boolean) => void;
}

class SocketManager {
  private socket: any = null;
  private listeners: Partial<SocketClientEvents> = {};
  private mockInterval: any = null;
  private connected: boolean = false;
  private mockActive: boolean = false;
  private mockPhase: Record<'usher01' | 'usher02' | 'usher03', number> = { usher01: 0, usher02: 0, usher03: 0 };

  constructor() {
    // Attempt real connection
    this.connect();
  }

  public registerListeners(listeners: Partial<SocketClientEvents>) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  private connect() {
    try {
      const base = getApiBase();
      this.socket = io(base, {
        transports: ['websocket', 'polling'],
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to backend on:', base);
        this.connected = true;
        this.stopMocking();
        this.listeners.onStatusChange?.(true);
      });

      this.socket.on('disconnect', () => {
        console.warn('[Socket] Disconnected. Activating mock fallback.');
        this.connected = false;
        this.startMocking();
        this.listeners.onStatusChange?.(false);
      });

      this.socket.on('connect_error', () => {
        this.connected = false;
        this.startMocking();
        this.listeners.onStatusChange?.(false);
      });

      // Listen for dynamic node channels
      const activeNodes = ['usher01', 'usher02', 'usher03'];
      activeNodes.forEach(node => {
        this.socket.on(node, (data: any) => {
          try {
            const raw = typeof data === 'string' ? JSON.parse(data) : data;
            if (Array.isArray(raw)) {
              const samples = raw.map((s: any[]) => ({
                timestamp: s[1],
                x: s[2],
                y: s[3],
                z: s[4],
                intensity: s[5]
              }));
              this.listeners.onNodeTelemetry?.(node, samples);
            }
          } catch (e) {
            // ignore
          }
        });
      });

      // Listen for global alarms
      this.socket.on('newfirstalarm', (data: any) => {
        this.listeners.onFirstAlarm?.(data);
      });

      // Listen for IP pings
      const ips = ['192.168.10.11', '192.168.10.12', '192.168.10.21', '192.168.10.22', '192.168.10.31', '192.168.10.32', '192.168.10.200'];
      ips.forEach(ip => {
        this.socket.on(ip, (msg: string) => {
          this.listeners.onIpPing?.(ip, msg === 'alive' ? 'alive' : 'connect_error');
        });
      });

    } catch (e) {
      console.warn('[Socket] Error initializing real socket. Starting mock fallback.');
      this.startMocking();
    }
  }

  // Inject a simulated earthquake event on demand for testing UI animations
  public triggerSimulatedEvent(nodeName: string, targetIntensity: number) {
    console.log(`[Socket] Injecting simulated event for ${nodeName} at intensity PEIS ${targetIntensity}`);
    
    // Fire first alarm
    const alarmData = {
      node_name: nodeName,
      event_unique_id: `event_sim_${Date.now()}_int${targetIntensity}`,
      intensity: targetIntensity,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    this.listeners.onFirstAlarm?.(alarmData);

    // Save to local mock history
    const history = JSON.parse(localStorage.getItem('mdc-mock-warning-history') || '[]');
    const nextId = history.length > 0 ? Math.max(...history.map((h: any) => h.warn_id)) + 1 : 1;
    const peak = parseFloat((0.005 + (targetIntensity * targetIntensity * 0.015)).toFixed(5));
    
    history.unshift({
      warn_id: nextId,
      node_name: nodeName,
      node_location: nodeName === 'usher01' ? 'Ground Floor' : nodeName === 'usher02' ? '7th Floor' : 'Rooftop',
      event_unique_id: alarmData.event_unique_id,
      intensity: targetIntensity,
      intensity_max: targetIntensity,
      x_max: (peak * 0.58).toFixed(5),
      y_max: (peak * 0.62).toFixed(5),
      z_max: (peak * 0.48).toFixed(5),
      created_at: alarmData.created_at
    });
    localStorage.setItem('mdc-mock-warning-history', JSON.stringify(history));

    // Temporarily swell the mock values for this node
    let decayTime = 12000; // 12 seconds
    let startTime = Date.now();

    const spikeTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > decayTime) {
        clearInterval(spikeTimer);
        return;
      }
      
      // Calculate decay factor
      const factor = Math.exp(-elapsed / 4000); // 4s half-life
      const currentPeak = factor * peak;
      
      // Send a high-amplitude batch
      const samples = this.generateBatch(nodeName as 'usher01' | 'usher02' | 'usher03', currentPeak, targetIntensity);
      this.listeners.onNodeTelemetry?.(nodeName, samples);
    }, 250);
  }

  private startMocking() {
    if (this.mockActive) return;
    this.mockActive = true;
    console.log('[Socket] Mock telemetry generator active.');

    // Baseline noise (Ground Floor has slightly more, Rooftop has structural sway)
    const baselines = {
      usher01: 0.0008, // Ground: stable but tiny ambient rumble
      usher02: 0.0018, // 7th floor: structural ambient noise
      usher03: 0.0022  // Rooftop: highest sway/noise
    };

    const intensities = {
      usher01: 1,
      usher02: 2,
      usher03: 2
    };

    let count = 0;
    this.mockInterval = setInterval(() => {
      count++;

      // Emit telemetry batches for all 3 nodes every 250ms
      const nodes = ['usher01', 'usher02', 'usher03'] as const;
      nodes.forEach(node => {
        const pga = baselines[node];
        const samples = this.generateBatch(node, pga, intensities[node]);
        this.listeners.onNodeTelemetry?.(node, samples);
      });

      // Periodically trigger a mock IP ping refresh every 4 seconds
      if (count % 16 === 0) {
        const ips = {
          '192.168.10.11': 'alive',
          '192.168.10.12': 'alive',
          '192.168.10.21': 'alive',
          '192.168.10.22': 'alive',
          '192.168.10.31': 'connect_error', // Rooftop warning IP
          '192.168.10.32': 'alive',
          '192.168.10.200': 'alive'
        };
        Object.entries(ips).forEach(([ip, status]) => {
          this.listeners.onIpPing?.(ip, status as any);
        });
      }
    }, 250);
  }

  private stopMocking() {
    if (!this.mockActive) return;
    this.mockActive = false;
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  // Synthesizes a batch of oscillating samples (per-axis sine + light noise)
  // rather than pure random noise, so the waveform reads as motion instead of
  // static — mirrors the IDC frontend's demo-mode generator. `node` is
  // optional (the simulated-event spike path has no persistent phase to
  // advance) and falls back to a fresh phase each call.
  private generateBatch(node: 'usher01' | 'usher02' | 'usher03' | null, peakPga: number, intensity: number): SensorSample[] {
    const SAMPLES_PER_BATCH = 125;
    const SAMPLE_SPACING_MS = 2; // 125 * 2ms = 250ms/batch

    const freqHz = 2 + Math.random() * 4; // 2-6Hz dominant, plausible structural response
    const startPhase = node ? (this.mockPhase[node] ?? 0) : 0;
    const now = Date.now();
    const samples: SensorSample[] = [];

    for (let i = 0; i < SAMPLES_PER_BATCH; i++) {
      const t = (i * SAMPLE_SPACING_MS) / 1000;
      const theta = startPhase + t * freqHz * 2 * Math.PI;
      const noise = () => (Math.random() - 0.5) * peakPga * 0.15;

      const x = peakPga * Math.sin(theta) * 0.6 + noise();
      const y = peakPga * Math.sin(theta + Math.PI / 3) * 0.6 + noise();
      const z = peakPga * Math.sin(theta + Math.PI / 1.7) * 0.4 + noise();

      samples.push({
        timestamp: now + i * SAMPLE_SPACING_MS,
        x: parseFloat(x.toFixed(6)),
        y: parseFloat(y.toFixed(6)),
        z: parseFloat(z.toFixed(6)),
        intensity
      });
    }

    if (node) {
      this.mockPhase[node] = startPhase + SAMPLES_PER_BATCH * (SAMPLE_SPACING_MS / 1000) * freqHz * 2 * Math.PI;
    }
    return samples;
  }

  public isConnected() {
    return this.connected;
  }
}

export const mdcSocket = new SocketManager();
export default mdcSocket;
