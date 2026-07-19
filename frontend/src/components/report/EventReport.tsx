import { forwardRef } from 'react';
import { INTENSITY_SCALE, getIntensityMessage } from '../../constants';
import { loadFloorHeightMm, isFloorHeightConfigured } from '../../constants/buildingConfig';
import { ReportWaveform } from './ReportWaveform';
import usherLogo from '../../assets/usher-no-text.svg';

export interface ReportEvent {
  warn_id: number;
  node_name: string;
  node_location: string;
  event_unique_id: string;
  intensity: number;
  intensity_max: number;
  created_at: string;
}

export interface ReportWaveformData {
  pgaX: string | number;
  pgaY: string | number;
  pgaZ: string | number;
  intensity: number;
  content: number[][];
}

interface EventReportProps {
  event: ReportEvent;
  waveform: ReportWaveformData | null;
  warningLevel: number;
  alertLevel: number;
}

function operationalGuidance(intensity: number, warningLevel: number, alertLevel: number) {
  if (intensity >= alertLevel) {
    return {
      tone: 'critical' as const,
      title: 'Alert threshold met — escalate',
      body: 'Recorded PEIS intensity meets or exceeds the configured Alert threshold. Recommend a visual inspection of the structure and escalation to a Structural Engineer of Record before resuming normal occupancy.'
    };
  }
  if (intensity >= warningLevel) {
    return {
      tone: 'warning' as const,
      title: 'Warning threshold met — monitor',
      body: 'Recorded PEIS intensity meets or exceeds the configured Warning threshold. Continue monitoring for aftershocks; a precautionary walkthrough is recommended.'
    };
  }
  return {
    tone: 'normal' as const,
    title: 'Below configured thresholds',
    body: 'Recorded PEIS intensity is below the configured Warning threshold. No structural action is indicated based on sensor data alone.'
  };
}

export const EventReport = forwardRef<HTMLDivElement, EventReportProps>(function EventReport(
  { event, waveform, warningLevel, alertLevel },
  ref
) {
  const scale = INTENSITY_SCALE.find((i) => i.level === event.intensity) || INTENSITY_SCALE[0];
  const msg = getIntensityMessage(event.intensity);
  const guidance = operationalGuidance(event.intensity, warningLevel, alertLevel);
  const floorHeightMm = loadFloorHeightMm();
  const floorConfigured = isFloorHeightConfigured();

  const pgaX = waveform ? Number(waveform.pgaX) : null;
  const pgaY = waveform ? Number(waveform.pgaY) : null;
  const pgaZ = waveform ? Number(waveform.pgaZ) : null;
  const peakAccel = Math.max(pgaX || 0, pgaY || 0, pgaZ || 0);
  const displacementMm = peakAccel * 1000;
  const driftRatio = (displacementMm / floorHeightMm) * 100;

  const generatedAt = new Date().toLocaleString('en-US', { hour12: false });

  return (
    <div className="event-report" ref={ref}>
      <header className="event-report-header">
        <div className="event-report-brand">
          <img src={usherLogo} alt="" aria-hidden="true" />
          <div>
            <strong>USHER</strong>
            <span>Seismic Event Report</span>
          </div>
        </div>
        <div className="event-report-ref">
          <span>Report reference</span>
          <strong>{event.event_unique_id}</strong>
        </div>
      </header>

      <section className="event-report-alert" style={{ borderColor: scale.ink }}>
        <div>
          <span className="event-report-alert-label">PEIS Level</span>
          <h2 style={{ color: scale.ink }}>{event.intensity} — {msg.title}</h2>
          <p>{msg.desc}</p>
        </div>
        <div className="event-report-guidance">
          <span className={`event-report-guidance-badge ${guidance.tone}`}>{guidance.title}</span>
          <p>{guidance.body}</p>
        </div>
      </section>

      <section className="event-report-grid">
        <div>
          <span>Node</span>
          <strong>{event.node_name} — {event.node_location}</strong>
        </div>
        <div>
          <span>Date / time</span>
          <strong>{event.created_at}</strong>
        </div>
        <div>
          <span>Warn ID</span>
          <strong>{event.warn_id}</strong>
        </div>
      </section>

      <section className="event-report-scale">
        <h3>PHIVOLCS Earthquake Intensity Scale</h3>
        <div className="peis-strip">
          {INTENSITY_SCALE.map((item) => (
            <div
              key={item.level}
              className={`peis-strip-item${item.level === event.intensity ? ' active' : ''}`}
              style={{ backgroundColor: item.color, color: item.text }}
            >
              {item.level}
            </div>
          ))}
        </div>
      </section>

      <section className="event-report-metrics">
        <h3>Peak Recorded Values</h3>
        <div className="event-report-metric-grid">
          <div><span>PGA X</span><strong>{pgaX !== null ? `${pgaX.toFixed(5)} m/s²` : '—'}</strong></div>
          <div><span>PGA Y</span><strong>{pgaY !== null ? `${pgaY.toFixed(5)} m/s²` : '—'}</strong></div>
          <div><span>PGA Z</span><strong>{pgaZ !== null ? `${pgaZ.toFixed(5)} m/s²` : '—'}</strong></div>
          <div><span>Est. displacement</span><strong>{displacementMm.toFixed(3)} mm</strong></div>
          <div>
            <span>Drift ratio {floorConfigured ? '' : '(default height)'}</span>
            <strong>{driftRatio.toFixed(3)}%</strong>
          </div>
        </div>
        {!floorConfigured && (
          <p className="event-report-note">
            Drift ratio uses a default {(floorHeightMm / 1000).toFixed(1)} m story height. Configure the real
            floor height in Admin Settings for an accurate value.
          </p>
        )}
      </section>

      <section className="event-report-waveform">
        <h3>Recorded Acceleration — X / Y / Z</h3>
        <ReportWaveform content={waveform?.content || []} />
        <div className="report-waveform-legend">
          <span className="x">X axis</span>
          <span className="y">Y axis</span>
          <span className="z">Z axis</span>
        </div>
      </section>

      <footer className="event-report-footer">
        <p>
          This report is generated automatically from recorded accelerometer data (peak acceleration, PEIS
          intensity, and a story-height-based drift estimate). It does not perform structural frequency analysis,
          code-demand comparison, or a building health score, and is not a substitute for assessment by a
          licensed Structural Engineer.
        </p>
        <div className="event-report-footer-meta">
          <span>Generated {generatedAt}</span>
          <span>USHER MDC Portal</span>
        </div>
      </footer>
    </div>
  );
});
