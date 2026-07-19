import { useEffect, useMemo, useState } from 'react';
import { Download, Search, Waves } from 'lucide-react';
import { mdcApi } from '../services/api';

type HistoryItem = {
  warn_id: number;
  node_name: string;
  node_location: string;
  event_unique_id: string;
  intensity: number;
  intensity_max: number;
  created_at: string;
};

export function ClientDashboard() {
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

  return (
    <div className="app-shell client-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Client portal</p>
          <h1>Warning logs & event review</h1>
        </div>
        <button className="ghost-button" onClick={exportCsv}><Download size={16} /> Export CSV</button>
      </header>

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
            </>
          ) : (
            <p className="empty-state">No event selected.</p>
          )}
        </section>
      </main>
    </div>
  );
}
