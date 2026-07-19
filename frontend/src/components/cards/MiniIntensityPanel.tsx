import { Shield } from 'lucide-react';
import { INTENSITY_SCALE, getIntensityMessage } from '../../constants';

interface MiniIntensityPanelProps {
  intensity: number;
  peakAcceleration: number;
}

export function MiniIntensityPanel({ intensity, peakAcceleration }: MiniIntensityPanelProps) {
  const currentIntensityData = INTENSITY_SCALE.find(i => i.level === intensity) || INTENSITY_SCALE[0];
  const msg = getIntensityMessage(intensity);
  const displacementMm = peakAcceleration * 1000;

  return (
    <div className="mini-panel">
      <div className="mini-panel-top">
        <div className="mini-shield">
          <Shield strokeWidth={1.75} style={{ color: currentIntensityData.ink, fill: `${currentIntensityData.ink}1a` }} />
          <span className="mini-shield-number" style={{ color: currentIntensityData.ink }}>
            {currentIntensityData.label || intensity}
          </span>
        </div>
        <div>
          <p className="mini-panel-label">PEIS Level</p>
          <p className="mini-panel-title" style={{ color: currentIntensityData.ink }}>{msg.title}</p>
        </div>
      </div>

      <div className="mini-panel-stat">
        <p className="mini-panel-stat-label">Peak Acceleration</p>
        <p className="mini-panel-stat-value">{peakAcceleration.toFixed(5)} m/s²</p>
      </div>

      <div className="mini-panel-stat">
        <p className="mini-panel-stat-label">Displacement</p>
        <p className="mini-panel-stat-value">{displacementMm.toFixed(3)} mm</p>
      </div>

      <div className="peis-strip">
        {INTENSITY_SCALE.map((item) => (
          <div
            key={item.level}
            className={`peis-strip-item${item.level === intensity ? ' active' : ''}`}
            style={{ backgroundColor: item.color, color: item.text }}
          >
            {item.level}
          </div>
        ))}
      </div>
    </div>
  );
}
