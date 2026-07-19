import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Search, Waves, Lock, Radio, Settings2, Sun, Moon, FileText, X, Loader2 } from 'lucide-react';
import { mdcApi } from '../services/api';
import { mdcSocket } from '../services/socket';
import { useTheme } from '../hooks/useTheme';
import { loadFloorHeightMm, saveFloorHeightMm } from '../constants/buildingConfig';
import { EventReport, type ReportEvent } from '../components/report/EventReport';
import { exportElementToPdf, exportLogAsCsv } from '../lib/exportPdf';

type HistoryItem = {
  warn_id: number;
  node_name: string;
  node_location: string;
  event_unique_id: string;
  intensity: number;
  intensity_max: number;
  created_at: string;
};

type PortalTab = 'events' | 'admin';

export function Portal() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<PortalTab>('events');

  // ── Event History state (formerly ClientDashboard) ──────────────────────
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<HistoryItem | null>(null);
  const [waveform, setWaveform] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const result = await mdcApi.getAllHistory();
      setHistory(result.data || []);
      if ((result.data || []).length) {
        setSelectedEvent(result.data[0]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadWaveform = async () => {
      if (!selectedEvent) return;
      // /getDuring and /getAfter are broken on the receiver (expect a per-minute
      // folder per event that never exists) — /getBefore is the only endpoint that
      // reliably returns real accelerogram content for a given event.
      const result = await mdcApi.getWaveform('/getBefore', selectedEvent.node_name, selectedEvent.event_unique_id);
      setWaveform(result.data || null);
    };
    loadWaveform();
  }, [selectedEvent]);

  const filtered = useMemo(() => history.filter((item) => {
    const needle = query.toLowerCase();
    return `${item.node_name} ${item.event_unique_id} ${item.created_at}`.toLowerCase().includes(needle);
  }), [history, query]);

  const exportCsv = () => {
    const rows = filtered.map((item) => [item.warn_id, item.node_name, item.node_location, item.event_unique_id, item.intensity, item.created_at].join(','));
    const content = ['warn_id,node_name,node_location,event_unique_id,intensity,created_at', ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mdc-warning-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Event report (preview + CSV/PDF export) — operates on the selected event ──
  const [showReport, setShowReport] = useState(false);
  const [reportExporting, setReportExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadWaveformCsv = () => {
    if (!selectedEvent || !waveform?.content) return;
    exportLogAsCsv(waveform.content, `${selectedEvent.event_unique_id}.csv`);
  };

  const downloadReportPdf = async () => {
    if (!reportRef.current || !selectedEvent) return;
    setReportExporting(true);
    try {
      await exportElementToPdf(reportRef.current, `${selectedEvent.event_unique_id}.pdf`);
    } finally {
      setReportExporting(false);
    }
  };

  // ── Admin Settings state (formerly AdminPanel) ───────────────────────────
  const [nodes, setNodes] = useState<any[]>([]);
  const [intensity, setIntensity] = useState<any>(null);
  const [auth, setAuth] = useState({ username: 'admin', password: '' });
  const [status, setStatus] = useState('');
  const [pings, setPings] = useState<Record<string, 'alive' | 'connect_error'>>({});
  const [socketConnected, setSocketConnected] = useState(mdcSocket.isConnected());
  const [floorHeightM, setFloorHeightM] = useState(() => loadFloorHeightMm() / 1000);

  useEffect(() => {
    const load = async () => {
      const [nodeRes, intensityRes] = await Promise.all([
        mdcApi.getAllNodeInfo(),
        mdcApi.getIntensitySettings()
      ]);
      setNodes(nodeRes.data || []);
      setIntensity(intensityRes.data || null);
    };
    load();

    mdcSocket.registerListeners({
      onIpPing: (ip, ipStatus) => {
        setPings((current) => ({ ...current, [ip]: ipStatus }));
      },
      onStatusChange: setSocketConnected
    });
  }, []);

  // IPs actually configured on the fetched nodes — no hardcoded/fabricated list
  const monitoredIps = useMemo(() => {
    const ips = new Set<string>();
    nodes.forEach((n) => {
      if (n.sensor_ip) ips.add(n.sensor_ip);
      if (n.monitor_ip) ips.add(n.monitor_ip);
    });
    return Array.from(ips);
  }, [nodes]);

  const currentNode = useMemo(() => nodes[0], [nodes]);

  const updateNodeField = (field: string, value: string | number) => {
    setNodes((currentNodes) =>
      currentNodes.map((item) =>
        item.node_id === currentNode?.node_id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await mdcApi.loginUser(auth.username, auth.password);
    setStatus(result.success ? 'Access granted' : result.error || 'Unable to authenticate');
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentNode) return;
    await mdcApi.updateNodeConfig({
      node_id: currentNode.node_id,
      positive_x_magni: currentNode.positive_x_magni,
      positive_y_magni: currentNode.positive_y_magni,
      positive_z_magni: currentNode.positive_z_magni,
      sensor_ip: currentNode.sensor_ip,
      monitor_ip: currentNode.monitor_ip,
      node_token: currentNode.node_token
    });
    await mdcApi.updateIntensity({
      warning_min: intensity.warning_min,
      alert_min: intensity.alert_min,
      green_light: intensity.green_light,
      yellow_light: intensity.yellow_light,
      red_light: intensity.red_light
    });
    saveFloorHeightMm(floorHeightM * 1000);
    setStatus('Settings saved');
  };

  return (
    <div className="app-shell app-shell--kiosk portal-shell" data-theme={theme}>
      <header className="page-header">
        <div>
          <p className="eyebrow">USHER MDC Portal</p>
          <h1>{tab === 'events' ? 'Warning logs & event review' : 'Administrative controls'}</h1>
        </div>
        <div className="page-header-actions">
          <div className="portal-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'events'}
              className={`portal-tab${tab === 'events' ? ' active' : ''}`}
              onClick={() => setTab('events')}
            >
              Event History
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'admin'}
              className={`portal-tab${tab === 'admin' ? ' active' : ''}`}
              onClick={() => setTab('admin')}
            >
              Admin Settings
            </button>
          </div>
          {tab === 'events' ? (
            <button className="ghost-button" onClick={exportCsv}><Download size={16} /> Export CSV</button>
          ) : (
            <div className="status-pill live"><span className="pulse-dot" /> {socketConnected ? 'Live' : 'Mock Feed Active'}</div>
          )}
          <button
            type="button"
            className={`theme-toggle ${theme}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <Sun size={13} className="theme-toggle-icon sun" />
            <Moon size={13} className="theme-toggle-icon moon" />
            <span className="theme-toggle-thumb" />
          </button>
        </div>
      </header>

      {tab === 'events' ? (
        <main className="client-grid">
          <section className="panel-card table-card">
            <div className="panel-title-row">
              <h3>Event history</h3>
              <label className="search-box">
                <Search size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" />
              </label>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Node</th>
                    <th>PEIS</th>
                    <th>Event ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => (
                    <tr key={event.warn_id} onClick={() => setSelectedEvent(event)} className={selectedEvent?.warn_id === event.warn_id ? 'selected-row' : ''}>
                      <td>{event.created_at}</td>
                      <td>{event.node_name}</td>
                      <td><span className={`pill ${event.intensity >= 6 ? 'pill-warn' : 'pill-good'}`}>PEIS {event.intensity}</span></td>
                      <td>{event.event_unique_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel-card detail-card">
            <div className="panel-title-row">
              <h3>Historical waveform</h3>
              <span className="chip chip-amber"><Waves size={14} /> {selectedEvent?.node_name || 'Select event'}</span>
            </div>
            {selectedEvent ? (
              <>
                <p className="detail-copy">{selectedEvent.created_at} • {selectedEvent.node_location}</p>
                <div className="wave-summary">
                  <div>
                    <p>Peak intensity</p>
                    <strong>{selectedEvent.intensity_max}</strong>
                  </div>
                  <div>
                    <p>Event ID</p>
                    <strong>{selectedEvent.event_unique_id}</strong>
                  </div>
                </div>
                <div className="wave-box">
                  {waveform?.content ? (
                    <svg viewBox="0 0 300 140" className="wave-svg">
                      <line x1="0" y1="70" x2="300" y2="70" className="graph-grid" />
                      {waveform.content.slice(0, 200).map((point: any, index: number) => {
                        const x = (index / 199) * 300;
                        const y = 70 - point[2] * 80;
                        return <circle key={index} cx={x} cy={y} r="1.2" className="wave-dot" />;
                      })}
                    </svg>
                  ) : (
                    <p className="empty-state">Waveform preview loading…</p>
                  )}
                </div>
                <div className="wave-actions">
                  <button type="button" className="ghost-button" onClick={downloadWaveformCsv} disabled={!waveform?.content}>
                    <Download size={15} /> Download CSV log
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setShowReport(true)} disabled={!waveform?.content}>
                    <FileText size={15} /> Generate report
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">No event selected.</p>
            )}
          </section>
        </main>
      ) : (
        <main className="admin-grid">
          <section className="panel-card form-card">
            <div className="panel-title-row">
              <h3>Node coefficients & IPs</h3>
              <span className="chip chip-blue"><Settings2 size={14} /> Configure</span>
            </div>
            {currentNode ? (
              <form className="form-stack" onSubmit={handleSave}>
                <label>
                  Positive X multiplier
                  <input
                    type="number"
                    step="0.001"
                    value={currentNode.positive_x_magni}
                    onChange={(event) => updateNodeField('positive_x_magni', Number(event.target.value))}
                  />
                </label>
                <label>
                  Positive Y multiplier
                  <input
                    type="number"
                    step="0.001"
                    value={currentNode.positive_y_magni}
                    onChange={(event) => updateNodeField('positive_y_magni', Number(event.target.value))}
                  />
                </label>
                <label>
                  Positive Z multiplier
                  <input
                    type="number"
                    step="0.001"
                    value={currentNode.positive_z_magni}
                    onChange={(event) => updateNodeField('positive_z_magni', Number(event.target.value))}
                  />
                </label>
                <label>
                  Sensor IP
                  <input value={currentNode.sensor_ip} onChange={(event) => updateNodeField('sensor_ip', event.target.value)} />
                </label>
                <label>
                  Monitor IP
                  <input value={currentNode.monitor_ip} onChange={(event) => updateNodeField('monitor_ip', event.target.value)} />
                </label>
                <label>
                  Warning threshold
                  <input type="number" value={intensity?.warning_min || 4} onChange={(event) => setIntensity((value: any) => ({ ...value, warning_min: Number(event.target.value) }))} />
                </label>
                <label>
                  Alert threshold
                  <input type="number" value={intensity?.alert_min || 6} onChange={(event) => setIntensity((value: any) => ({ ...value, alert_min: Number(event.target.value) }))} />
                </label>
                <label>
                  Floor / story height (m) — used for drift ratio
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={floorHeightM}
                    onChange={(event) => setFloorHeightM(Number(event.target.value))}
                  />
                </label>
                <button type="submit">Save settings</button>
              </form>
            ) : null}
          </section>

          <section className="panel-card form-card">
            <div className="panel-title-row">
              <h3>Authentication & pings</h3>
              <span className="chip chip-green"><Radio size={14} /> Live</span>
            </div>
            <form className="form-stack" onSubmit={handleLogin}>
              <label>
                Username
                <input value={auth.username} onChange={(event) => setAuth({ ...auth, username: event.target.value })} />
              </label>
              <label>
                Password
                <input type="password" value={auth.password} onChange={(event) => setAuth({ ...auth, password: event.target.value })} />
              </label>
              <button type="submit"><Lock size={16} /> Sign in</button>
            </form>
            {status ? <p className="status-text">{status}</p> : null}

            <div className="ping-list">
              {monitoredIps.map((ip) => {
                const pingStatus = pings[ip];
                return (
                  <div key={ip} className="ping-row">
                    <span>{ip}</span>
                    <span className={`pill ${pingStatus === 'alive' ? 'pill-good' : 'pill-warn'}`}>
                      {pingStatus || 'awaiting ping'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {showReport && selectedEvent && (
        <div className="report-modal-backdrop" role="dialog" aria-modal="true">
          <div className="report-modal-toolbar">
            <h3>Event report — {selectedEvent.event_unique_id}</h3>
            <div className="report-modal-actions">
              <button type="button" onClick={downloadWaveformCsv} disabled={!waveform?.content}>
                <Download size={14} /> CSV
              </button>
              <button type="button" onClick={downloadReportPdf} disabled={reportExporting}>
                {reportExporting ? <Loader2 size={14} className="spin" /> : <FileText size={14} />}
                {reportExporting ? 'Generating…' : 'Download PDF'}
              </button>
              <button type="button" className="close-btn" onClick={() => setShowReport(false)}>
                <X size={14} /> Close
              </button>
            </div>
          </div>
          <EventReport
            ref={reportRef}
            event={selectedEvent as ReportEvent}
            waveform={waveform}
            warningLevel={intensity?.warning_min ?? 4}
            alertLevel={intensity?.alert_min ?? 6}
          />
        </div>
      )}
    </div>
  );
}
