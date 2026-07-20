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

// Backend timestamps (event log created_at) are always stamped in Asia/Manila
// (see moment-timezone usage in SocketEventController / UploadController). Force
// the header clock to the same zone rather than the host OS's local time, so a
// kiosk box misconfigured to a different timezone doesn't show a header clock
// that disagrees with its own event log.
const PHT_TIMEZONE = 'Asia/Manila';

function formatClockDate(date: Date) {
  return date
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: PHT_TIMEZONE })
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
  const [loading, setLoading] = useState(true);
  const [heldIntensity, setHeldIntensity] = useState<Record<string, number>>({});

  const nodeLiveRef = useRef<Record<string, number>>({});
  const nodePeakRef = useRef<Record<string, number>>({});
  const nodeTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingTelemetryRef = useRef<Record<string, SensorSample[]>>({});
  const telemetryDirtyRef = useRef(false);
  const telemetryFrameRef = useRef<number | null>(null);

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
    // Coalesce telemetry into a ref instead of setState-per-message: the real
    // sensor backend can push "node" events far more often/burstier than the
    // 250ms-cadenced mock feed did, and rendering (+ uPlot redraw) on every
    // single message is what makes the live feed feel laggy. Flushing once
    // per animation frame caps the render rate regardless of message rate.
    const flushTelemetry = () => {
      telemetryFrameRef.current = null;
      if (!telemetryDirtyRef.current) return;
      telemetryDirtyRef.current = false;
      setTelemetry({ ...pendingTelemetryRef.current });
    };

    mdcSocket.registerListeners({
      onNodeTelemetry: (nodeName, samples) => {
        pendingTelemetryRef.current[nodeName] = samples.slice(-90);
        telemetryDirtyRef.current = true;
        if (telemetryFrameRef.current == null) {
          telemetryFrameRef.current = window.requestAnimationFrame(flushTelemetry);
        }
      },
      onIpPing: (ip, status) => {
        setPings((current) => ({ ...current, [ip]: status }));
      },
      onFirstAlarm: () => {
        mdcApi.getAllHistory().then((res) => setHistory(res.data || []));
      },
      onStatusChange: setSocketConnected
    });

    return () => {
      if (telemetryFrameRef.current != null) {
        window.cancelAnimationFrame(telemetryFrameRef.current);
        telemetryFrameRef.current = null;
      }
    };
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
    const maxIntensity = Math.max(...nodeStates.map((node) => heldIntensity[node.id] ?? node.intensity), 1);
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
  }, [nodeStates, heldIntensity, history, clock]);

  const orderedNodeStates = useMemo(() => {
    return nodeStates
      .map((node, index) => ({ node, displayNumber: index + 1 }))
      .sort((a, b) => floorRank(b.node.location) - floorRank(a.node.location));
  }, [nodeStates]);

  // How long a node's display holds at its peak PEIS before falling back to
  // live readings. Mirrors the physical event capture window configured in
  // intensity_configs (`after` = seconds recorded past the trigger), so the
  // dashboard doesn't drop back to idle before the recorder itself considers
  // the event finished. Floor of 5s guards against a misconfigured 0/blank value.
  const eventHoldMs = Math.max(Number(intensity?.after) || 8, 5) * 1000;

  useEffect(() => {
    nodeStates.forEach((node) => {
      nodeLiveRef.current[node.id] = node.intensity;
      const peak = nodePeakRef.current[node.id] ?? 0;
      if (node.intensity >= peak) {
        nodePeakRef.current[node.id] = node.intensity;
        setHeldIntensity((current) =>
          current[node.id] === node.intensity ? current : { ...current, [node.id]: node.intensity }
        );
        if (nodeTimerRef.current[node.id]) window.clearTimeout(nodeTimerRef.current[node.id]);
        nodeTimerRef.current[node.id] = window.setTimeout(() => {
          nodePeakRef.current[node.id] = 0;
          setHeldIntensity((current) => ({ ...current, [node.id]: nodeLiveRef.current[node.id] ?? 1 }));
        }, eventHoldMs);
      }
    });
  }, [nodeStates, eventHoldMs]);

  useEffect(() => {
    return () => {
      Object.values(nodeTimerRef.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const warningLevel = intensity?.warning_min ?? 4;
  const alertLevel = intensity?.alert_min ?? 6;
  const lastUpdateLabel = clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: PHT_TIMEZONE });

  return (
    <div className="app-shell app-shell--kiosk" data-theme={theme}>
      <header className="topbar-v2">
        <div className="topbar-clock-block">
          <Clock size={22} className="topbar-clock-icon" aria-hidden="true" />
          <div>
            <div className="topbar-clock-date">{formatClockDate(clock)}</div>
            <div className="topbar-clock-time">{clock.toLocaleTimeString('en-US', { hour12: false, timeZone: PHT_TIMEZONE })} PHT</div>
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
          maxIntensity={summary.maxIntensity}
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
              const displayedIntensity = heldIntensity[node.id] ?? node.intensity;
              const scale = INTENSITY_SCALE.find((i) => i.level === displayedIntensity) || INTENSITY_SCALE[0];
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
                    <MiniIntensityPanel intensity={displayedIntensity} peakAcceleration={node.peakAcceleration} />
                    <IntensityDisplay intensity={displayedIntensity} warningLevel={warningLevel} alertLevel={alertLevel} />
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
