import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { INTENSITY_SCALE } from '../../constants';
import { StatTiles } from './StatTiles';

/** How many event-log rows to show on the kiosk before handing off to the client dashboard. */
const VISIBLE_EVENT_COUNT = 10;

export interface SidebarNodeInfo {
  id: string;
  name: string;
  location: string;
  intensity: number;
  ping: 'alive' | 'connect_error';
  hasData: boolean;
  stale: boolean;
  displayNumber: number;
}

export interface SidebarEventInfo {
  warn_id: number;
  node_name: string;
  node_location: string;
  intensity: number;
  created_at: string;
}

interface SidebarProps {
  nodes: SidebarNodeInfo[];
  nodeServerIp: string;
  warningLevel: number;
  maxIntensity: number;
  peakAcceleration: number;
  eventsThisYear: number;
  driftRatio: number;
  driftRatioConfigured: boolean;
  events: SidebarEventInfo[];
}

function nodeStatusLabel(node: SidebarNodeInfo, warningLevel: number) {
  if (node.ping !== 'alive') return { label: 'Offline', tone: 'error' as const };
  if (!node.hasData) return { label: 'Connecting…', tone: 'idle' as const };
  if (node.stale) return { label: 'Stale', tone: 'warn' as const };
  if (node.intensity >= warningLevel) return { label: 'Warning', tone: 'warn' as const };
  return { label: 'Live', tone: 'live' as const };
}

export function Sidebar({
  nodes,
  nodeServerIp,
  warningLevel,
  maxIntensity,
  peakAcceleration,
  eventsThisYear,
  driftRatio,
  driftRatioConfigured,
  events,
}: SidebarProps) {
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0)),
    [events]
  );

  return (
    <aside className="sidebar">
      <StatTiles
        maxIntensity={maxIntensity}
        peakAcceleration={peakAcceleration}
        eventsThisYear={eventsThisYear}
        driftRatio={driftRatio}
        driftRatioConfigured={driftRatioConfigured}
        stacked
      />

      <div className="side-card">
        <h4>Node Status</h4>
        {nodes.map((node) => {
          const status = nodeStatusLabel(node, warningLevel);
          return (
            <div key={node.id} className="side-row">
              <span className="side-row-label">Node {node.displayNumber} - {node.location}</span>
              <span className="side-row-value">
                <span className={`status-dot ${status.tone}`} /> {status.label}
              </span>
            </div>
          );
        })}
        <div className="side-row">
          <span className="side-row-label">Server</span>
          <span className="side-row-value font-mono">{nodeServerIp}</span>
        </div>
      </div>

      <div className="side-card side-card--grow">
        <h4>Event Log</h4>
        {sortedEvents.length === 0 ? (
          <p className="event-log-empty">No warning events recorded yet.</p>
        ) : (
          <>
            <div className="event-log-list">
              {sortedEvents.slice(0, VISIBLE_EVENT_COUNT).map((event) => {
                const scale = INTENSITY_SCALE.find((i) => i.level === event.intensity) || INTENSITY_SCALE[0];
                return (
                  <div key={event.warn_id} className="event-log-item">
                    <span className="event-log-badge" style={{ backgroundColor: scale.color, color: scale.text }}>
                      {event.intensity}
                    </span>
                    <div className="event-log-body">
                      <span className="event-log-time">{event.created_at}</span>
                      <span className="event-log-node">{event.node_name} — {event.node_location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {sortedEvents.length > VISIBLE_EVENT_COUNT && (
              <Link to="/portal" className="event-log-more">
                See More in Portal Dashboard <ChevronRight size={15} />
              </Link>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
