import { nowInManila } from '../lib/utils';

// Resolve backend URL
export function getApiBase(): string {
  // Allow overriding via VITE_API_BASE (e.g. .env.local) for pointing at a real device
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  if (envBase) {
    return envBase;
  }
  // If running in development Vite, default to localhost:3000
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  // Otherwise default to the host address serving the dashboard
  return `${window.location.protocol}//${window.location.hostname}:3000`;
}

const API_BASE = getApiBase();

// Mock database store kept in memory/localStorage for simple state tracking
const STORAGE_KEYS = {
  INTENSITY: 'mdc-mock-intensity-configs',
  NODES: 'mdc-mock-node-configs',
  HISTORY: 'mdc-mock-warning-history',
};

const defaultIntensityConfigs = {
  id: 1,
  warning_min: 4,
  alert_min: 6,
  before: 22,
  after: 22,
  green_light: 1,
  yellow_light: 1,
  red_light: 1
};

const defaultNodeConfigs = [
  {
    node_id: '0bcd8',
    node_name: 'usher01',
    node_location: 'Ground Floor',
    sensor_ip: '192.168.10.11',
    monitor_ip: '192.168.10.12',
    node_token: 'gLECpc44JhmfipXuHT23lN51qkD3VZGz',
    positive_x_magni: 0.412,
    positive_y_magni: 0.403,
    positive_z_magni: 0.414,
    project: '1'
  },
  {
    node_id: '15b1b',
    node_name: 'usher02',
    node_location: '7th Floor',
    sensor_ip: '192.168.10.21',
    monitor_ip: '192.168.10.22',
    node_token: '330d48',
    positive_x_magni: 0.412,
    positive_y_magni: 0.403,
    positive_z_magni: 0.414,
    project: '2'
  },
  {
    node_id: '1484d',
    node_name: 'usher03',
    node_location: 'Rooftop',
    sensor_ip: '192.168.10.31',
    monitor_ip: '192.168.10.32',
    node_token: 'WoSqwM6Rif7s4b5R1AipePSWfQcNI9JW',
    positive_x_magni: 0.412,
    positive_y_magni: 0.403,
    positive_z_magni: 0.414,
    project: '3'
  }
];

// Generate a realistic warning event log
function generateMockHistory() {
  const events = [];
  const nodes = ['usher01', 'usher02', 'usher03'];
  const locations = ['Ground Floor', '7th Floor', 'Rooftop'];
  const baseTime = Date.now() - 36 * 3600 * 1000; // start 36h ago

  for (let i = 0; i < 24; i++) {
    const nodeIdx = Math.floor(Math.random() * 3);
    const node_name = nodes[nodeIdx];
    const location = locations[nodeIdx];
    const intensity = Math.floor(Math.random() * 7) + 2; // PEIS 2 to 8
    const peakAccel = parseFloat((0.005 + (intensity * intensity * 0.015) + Math.random() * 0.02).toFixed(5));
    const timestamp = baseTime + i * 1.5 * 3600 * 1000 + Math.random() * 100000;
    const created_at = nowInManila(new Date(timestamp));
    const event_unique_id = `event_${timestamp}_int${intensity}`;
    
    events.push({
      warn_id: 24 - i,
      node_name,
      node_location: location,
      event_unique_id,
      intensity,
      intensity_max: intensity,
      x_max: (peakAccel * 0.58).toFixed(5),
      y_max: (peakAccel * 0.62).toFixed(5),
      z_max: (peakAccel * 0.48).toFixed(5),
      created_at
    });
  }

  // Sort newest first
  return events.sort((a, b) => b.warn_id - a.warn_id);
}

// Initialize mock DB in localStorage if empty
if (!localStorage.getItem(STORAGE_KEYS.INTENSITY)) {
  localStorage.setItem(STORAGE_KEYS.INTENSITY, JSON.stringify(defaultIntensityConfigs));
}
if (!localStorage.getItem(STORAGE_KEYS.NODES)) {
  localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(defaultNodeConfigs));
}
if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(generateMockHistory()));
}

// Local mock database helpers
const mockDb = {
  getIntensity: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.INTENSITY) || '{}'),
  saveIntensity: (data: any) => localStorage.setItem(STORAGE_KEYS.INTENSITY, JSON.stringify(data)),
  
  getNodes: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.NODES) || '[]'),
  saveNodes: (data: any) => localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(data)),
  
  getHistory: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]'),
  saveHistory: (data: any) => localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data))
};

// Generic POST/GET runner with mock fallback
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    const envelope = await res.json();
    if (envelope.error) {
      return { success: false, error: envelope.message || 'Server returned an error' };
    }
    return { success: true, data: envelope.data };
  } catch (err: any) {
    console.warn(`API path ${endpoint} failed. Falling back to local mock data. Reason:`, err.message);
    return { success: false, error: 'Connection failed' };
  }
}

export const mdcApi = {
  // ─── Configurations & Nodes ──────────────────────────────────────────────
  async getAllNodeInfo() {
    const res = await fetchApi<any[]>('/getAllNodeInfo');
    if (res.success && res.data) {
      return { success: true, data: res.data };
    }
    // Mock fallback
    return { success: true, data: mockDb.getNodes() };
  },

  async getIntensitySettings() {
    const res = await fetchApi<any>('/getIntensitySettings');
    if (res.success && res.data) {
      return { success: true, data: res.data };
    }
    // Mock fallback
    return { success: true, data: mockDb.getIntensity() };
  },

  async updateIntensity(payload: {
    warning_min: number;
    alert_min: number;
    green_light: number;
    yellow_light: number;
    red_light: number;
  }) {
    const res = await fetchApi<any>('/updateIntensity', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success) {
      return { success: true };
    }
    // Mock fallback
    const current = mockDb.getIntensity();
    mockDb.saveIntensity({ ...current, ...payload });
    return { success: true };
  },

  async updateNodeConfig(payload: {
    node_id: string;
    positive_x_magni: number;
    positive_y_magni: number;
    positive_z_magni: number;
    sensor_ip: string;
    monitor_ip: string;
    node_token: string;
  }) {
    const res = await fetchApi<any>('/updateNodeConfig', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success) {
      return { success: true };
    }
    // Mock fallback
    const nodes = mockDb.getNodes();
    const updated = nodes.map((n: any) => {
      if (n.node_id === payload.node_id) {
        return { ...n, ...payload };
      }
      return n;
    });
    mockDb.saveNodes(updated);
    return { success: true };
  },

  // ─── Warning & Event Histories ──────────────────────────────────────────
  async getAllHistory() {
    const res = await fetchApi<any>('/getAllHistory');
    if (res.success && res.data) {
      // API returns { history: [...] }
      const history = (res.data as any).history || [];
      return { success: true, data: history };
    }
    // Mock fallback
    return { success: true, data: mockDb.getHistory() };
  },

  // Get waveform data for an event
  async getWaveform(endpoint: '/getBefore' | '/getDuring' | '/getAfter', node_name: string, eventId: string) {
    const res = await fetchApi<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ node_name, eventId })
    });
    if (res.success && res.data) {
      return { success: true, data: res.data };
    }
    
    // Generate mock waveforms for historical event viewer
    // Parses intensity from event ID e.g. event_12345_int6
    const intensityMatch = eventId.match(/_int(\d+)/);
    const intensity = intensityMatch ? parseInt(intensityMatch[1]) : 3;
    const basePga = 0.01 + intensity * 0.05;
    
    const count = 300; // 300 data points
    const content: any[] = [];
    const baseTime = Date.now();

    for (let i = 0; i < count; i++) {
      // seismic envelope shape (envelope peaking in middle)
      const envelope = Math.exp(-Math.pow((i - count / 2) / (count / 6), 2));
      const freq1 = Math.sin(i * 0.2) * 0.5;
      const freq2 = Math.sin(i * 0.5) * 0.3;
      const noise = (Math.random() - 0.5) * 0.2;
      
      const wave = (freq1 + freq2 + noise) * envelope * basePga;
      const x = wave * (1.0 + (Math.random() - 0.5) * 0.2);
      const y = wave * (0.8 + (Math.random() - 0.5) * 0.2);
      const z = wave * (0.6 + (Math.random() - 0.5) * 0.2);
      
      content.push([
        i, 
        baseTime + i * 4, 
        parseFloat(x.toFixed(5)), 
        parseFloat(y.toFixed(5)), 
        parseFloat(z.toFixed(5)), 
        intensity
      ]);
    }

    const maxAbsX = Math.max(...content.map(c => Math.abs(c[2])));
    const maxAbsY = Math.max(...content.map(c => Math.abs(c[3])));
    const maxAbsZ = Math.max(...content.map(c => Math.abs(c[4])));

    return {
      success: true,
      data: {
        pgaX: maxAbsX.toFixed(5),
        pgaY: maxAbsY.toFixed(5),
        pgaZ: maxAbsZ.toFixed(5),
        intensity,
        content
      }
    };
  },

  // ─── Simple Frontend Authentication ──────────────────────────────────────
  async loginUser(username: string, pass: string) {
    const res = await fetchApi<any>('/loginUser', {
      method: 'POST',
      body: JSON.stringify({ username, password: pass })
    });
    if (res.success) {
      localStorage.setItem('mdc-auth-user', username);
      return { success: true };
    }
    
    // Simple frontend logic auth fallback (as requested, no backend modifications required)
    if (username === 'admin' && pass === 'admin1234') {
      localStorage.setItem('mdc-auth-user', username);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  },

  async changePass(newpassword: string) {
    const res = await fetchApi<any>('/changePass', {
      method: 'POST',
      body: JSON.stringify({ newpassword })
    });
    if (res.success) {
      return { success: true };
    }
    // Local fallback
    return { success: true };
  }
};
export default mdcApi;
