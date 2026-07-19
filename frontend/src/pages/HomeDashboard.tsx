import { useEffect, useMemo, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { IntensityDisplay } from '../components/cards/IntensityDisplay';
import { MiniIntensityPanel } from '../components/cards/MiniIntensityPanel';
import { Seismogram, type SignalStatus } from '../components/cards/Seismogram';
import { Sidebar } from '../components/panels/Sidebar';
import { FooterBar } from '../components/panels/FooterBar';
import { INTENSITY_SCALE } from '../constants';
import { mdcApi } from '../services/api';
import { mdcSocket } from '../services/socket';
import type { SensorSample } from '../types';
import usherLogo from '../assets/usher-no-text.svg';
import { useTheme } from '../hooks/useTheme';
import { isFloorHeightConfigured, loadFloorHeightMm } from '../constants/buildingConfig';

type NodeState = {
  id: string;
  name: string;
  location: string;
  sensorIp: string;
  monitorIp: string;
  intensity: number;
  peakAcceleration: number;
  samples: SensorSample[];
  ping: 'alive' | 'connect_error';
  hasData: boolean;
  stale: boolean;
};

const STALE_AFTER_MS = 8000;

function formatClockDate(date: Date) {
  return date
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

function nodeSignalStatus(node: NodeState): SignalStatus {
  if (node.ping !== 'alive') return 'offline';
  if (!node.hasData) return 'connecting';
  if (node.stale) return 'stale';
  return 'live';
}

/** Physical elevation rank for a node's location label — higher = higher up the building. */
function floorRank(location: string): number {
  const loc = (location || '').toLowerCase();
  if (loc.includes('roof')) return 9999;
  if (loc.includes('basement')) return -1000;
  if (loc.includes('ground')) return 0;
  const match = loc.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function HomeDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [clock, setClock] = useState(new Date());
  const [nodes, setNodes] = useState<any[]>([]);
  const [intensity, setIntensity] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [socketConnected, setSocketConnected] = useState(mdcSocket.isConnected());
  const [telemetry, setTelemetry] = useState<Record<string, SensorSample[]>>({});
  const [pings, setPings] = useState<Record<string, 'alive' | 'connect_error'>>({});
  const [displayIntensity, setDisplayIntensity] = useState(1);
  const [loading, setLoading] = useState(true);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peakHeldRef = useRef<number>(1);
  const liveIntensityRef = useRef<number>(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [nodeRes, intensityRes, historyRes] = await Promise.all([
          mdcApi.getAllNodeInfo(),
          mdcApi.getIntensitySettings(),
          mdcApi.getAllHistory()
        ]);
        setNodes(nodeRes.data || []);
        setIntensity(intensityRes.data || null);
        setHistory(historyRes.data || []);
      } finally {
        setLoading(false);
      }
    };

    load();

    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    mdcSocket.registerListeners({
      onNodeTelemetry: (nodeName, samples) => {
        setTelemetry((current) => ({ ...current, [nodeName]: samples.slice(-90) }));
      },
      onIpPing: (ip, status) => {
        setPings((current) => ({ ...current, [ip]: status }));
      },
      onFirstAlarm: () => {
        mdcApi.getAllHistory().then((res) => setHistory(res.data || []));
      },
      onStatusChange: setSocketConnected
    });
  }, []);

  const nodeStates = useMemo<NodeState[]>(() => {
    return (nodes || []).map((node: any) => {
      const telemetrySamples = telemetry[node.node_name] || [];
      const latestSample = telemetrySamples.at(-1);
      const latestIntensity = latestSample?.intensity ?? 1;
      const pingKey = node.sensor_ip;
      const peakAcceleration = telemetrySamples.length
        ? telemetrySamples.reduce((max, s) => Math.max(max, Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)), 0)
        : parseFloat((0.008 + latestIntensity * 0.02).toFixed(5));
      const hasData = telemetrySamples.length > 0;
      const stale = hasData && clock.getTime() - (latestSample!.timestamp) > STALE_AFTER_MS;
      return {
        id: node.node_id,
        name: node.node_name,
        location: node.node_location,
        sensorIp: node.sensor_ip,
        monitorIp: node.monitor_ip,
        intensity: latestIntensity,
        peakAcceleration,
        samples: telemetrySamples,
        ping: pings[pingKey] || 'alive',
        hasData,
        stale
      };
    });
  }, [nodes, telemetry, pings, clock]);

  const summary = useMemo(() => {
    const maxIntensity = Math.max(...nodeStates.map((node) => node.intensity), 1);
    const yearKey = clock.getFullYear().toString();
    const eventsThisYear = history.filter((event: any) => {
      const createdAt = event.created_at;
      return typeof createdAt === 'string' && createdAt.slice(0, 4) === yearKey;
    }).length;
    const peakAcceleration = Math.max(...nodeStates.map((node) => node.peakAcceleration), 0.00001);
    const peakDisplacementMm = peakAcceleration * 1000;
    const driftRatio = (peakDisplacementMm / loadFloorHeightMm()) * 100;
    return {
      maxIntensity,
      eventsThisYear,
      peakAcceleration,
      driftRatio,
      driftRatioConfigured: isFloorHeightConfigured()
    };
  }, [nodeStates, history, clock]);

  const orderedNodeStates = useMemo(() => {
    return nodeStates
      .map((node, index) => ({ node, displayNumber: index + 1 }))
      .sort((a, b) => floorRank(b.node.location) - floorRank(a.node.location));
  }, [nodeStates]);

  useEffect(() => {
    liveIntensityRef.current = summary.maxIntensity;
    if (summary.maxIntensity >= peakHeldRef.current) {
      peakHeldRef.current = summary.maxIntensity;
      setDisplayIntensity(summary.maxIntensity);
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = window.setTimeout(() => {
        peakHeldRef.current = 0;
        setDisplayIntensity(liveIntensityRef.current);
      }, 8000);
    }
  }, [summary.maxIntensity]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    };
  }, []);

  const warningLevel = intensity?.warning_min ?? 4;
  const alertLevel = intensity?.alert_min ?? 6;
  const lastUpdateLabel = clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="app-shell app-shell--kiosk" data-theme={theme}>
      <header className="topbar-v2">
        <div className="topbar-clock-block">
          <Clock size={22} className="topbar-clock-icon" aria-hidden="true" />
          <div>
            <div className="topbar-clock-date">{formatClockDate(clock)}</div>
            <div className="topbar-clock-time">{clock.toLocaleTimeString('en-US', { hour12: false })} PHT</div>
          </div>
        </div>
        <div className="topbar-title">
          <img src={usherLogo} alt="" aria-hidden="true" className="topbar-logo" />
          <h1>USHER</h1>
          <p>Multi-Device Controller</p>
        </div>
        <div className="topbar-status">
          <span>USHER ERI ver. 2026.07.01</span>
          <span className="status-line" style={{ color: 'var(--status-live)' }}>
            <span className="status-dot live" /> {socketConnected ? 'System Operational' : 'Mock Feed Active'}
          </span>
        </div>
      </header>

      <div className="layout-grid">
        <Sidebar
          nodes={orderedNodeStates.map(({ node, displayNumber }) => ({ ...node, displayNumber }))}
          nodeServerIp={nodeStates[0]?.monitorIp || '—'}
          warningLevel={warningLevel}
          maxIntensity={displayIntensity}
          peakAcceleration={summary.peakAcceleration}
          eventsThisYear={summary.eventsThisYear}
          driftRatio={summary.driftRatio}
          driftRatioConfigured={summary.driftRatioConfigured}
          events={history}
        />

        <main>
          {loading ? (
            <div className="state-panel">
              <span className="state-panel-spinner" aria-hidden="true" />
              <p>Loading node telemetry…</p>
            </div>
          ) : nodeStates.length === 0 ? (
            <div className="state-panel">
              <p>No nodes configured.</p>
            </div>
          ) : (
            orderedNodeStates.map(({ node, displayNumber }) => {
              const scale = INTENSITY_SCALE.find((i) => i.level === node.intensity) || INTENSITY_SCALE[0];
              return (
                <section key={node.id} className="node-row">
                  <div className="node-row-title">
                    <span>
                      <span className="status-dot" style={{ backgroundColor: scale.ink }} />
                      {' '}Node {displayNumber} - {node.location}
                    </span>
                    <span className="node-ip">{node.monitorIp || '—'}</span>
                  </div>
                  <div className="node-row-top">
                    <MiniIntensityPanel intensity={node.intensity} peakAcceleration={node.peakAcceleration} />
                    <IntensityDisplay intensity={node.intensity} warningLevel={warningLevel} alertLevel={alertLevel} />
                  </div>
                  <Seismogram samples={node.samples} status={nodeSignalStatus(node)} />
                </section>
              );
            })
          )}
        </main>
      </div>

      <FooterBar
        socketConnected={socketConnected}
        serverIp={nodeStates[0]?.monitorIp || '—'}
        lastUpdateLabel={lastUpdateLabel}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
