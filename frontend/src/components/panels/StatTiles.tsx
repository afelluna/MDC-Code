import { HeartPulse, Waves, CalendarClock, MoveVertical } from 'lucide-react';
import { INTENSITY_SCALE, getIntensityMessage } from '../../constants';

interface StatTilesProps {
  maxIntensity: number;
  peakAcceleration: number;
  eventsThisYear: number;
  driftRatio: number;
  driftRatioConfigured: boolean;
  stacked?: boolean;
}

export function StatTiles({ maxIntensity, peakAcceleration, eventsThisYear, driftRatio, driftRatioConfigured, stacked }: StatTilesProps) {
  const scale = INTENSITY_SCALE.find((i) => i.level === maxIntensity) || INTENSITY_SCALE[0];
  const msg = getIntensityMessage(maxIntensity);

  return (
    <div className={`stat-tiles${stacked ? ' stat-tiles-stacked' : ''}`}>
      <div className="stat-tile">
        <div className="stat-tile-icon" style={{ backgroundColor: `${scale.ink}18`, color: scale.ink }}>
          <HeartPulse size={18} />
        </div>
        <div className="stat-tile-body">
          <span className="stat-tile-label">Global Max PEIS</span>
          <span className="stat-tile-value" style={{ color: scale.ink }}>{maxIntensity}</span>
          <span className="stat-tile-sub" style={{ color: scale.ink }}>{msg.title}</span>
        </div>
      </div>

      <div className="stat-tile">
        <div className="stat-tile-icon" style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand)' }}>
          <CalendarClock size={18} />
        </div>
        <div className="stat-tile-body">
          <span className="stat-tile-label">Total Events</span>
          <span className="stat-tile-value">{eventsThisYear}</span>
          <span className="stat-tile-sub">(This Year)</span>
        </div>
      </div>

      <div className="stat-tile">
        <div className="stat-tile-icon" style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand)' }}>
          <Waves size={18} />
        </div>
        <div className="stat-tile-body">
          <span className="stat-tile-label">Peak Acceleration</span>
          <span className="stat-tile-value">{peakAcceleration.toFixed(5)}</span>
          <span className="stat-tile-sub">(m/s²)</span>
        </div>
      </div>

      <div className="stat-tile">
        <div className="stat-tile-icon" style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand)' }}>
          <MoveVertical size={18} />
        </div>
        <div className="stat-tile-body">
          <span className="stat-tile-label">Drift Ratio</span>
          <span className="stat-tile-value">{driftRatio.toFixed(2)}%</span>
          <span className="stat-tile-sub">{driftRatioConfigured ? '(Peak / Story height)' : '(Peak / default 3m — configure in Admin)'}</span>
        </div>
      </div>
    </div>
  );
}
