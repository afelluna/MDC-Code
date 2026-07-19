import { motion } from 'framer-motion';
import { INTENSITY_SCALE, getIntensityMessage } from '../../constants';
import usherLogo from '../../assets/usher-no-text.svg';

interface IntensityDisplayProps {
  intensity: number;
  /** PEIS level at which the card begins the "breathing" signal (config warning level). */
  warningLevel?: number;
  /** PEIS level at which the card escalates to the critical pulse (config alert level). */
  alertLevel?: number;
}

type SignalTier = 'calm' | 'elevated' | 'critical';
function signalTier(level: number, warning: number, alert: number): SignalTier {
  if (level >= alert) return 'critical';
  if (level >= warning) return 'elevated';
  return 'calm';
}

export function IntensityDisplay({
  intensity,
  warningLevel = 5,
  alertLevel = 8,
}: IntensityDisplayProps) {
  const currentIntensityData = INTENSITY_SCALE.find(i => i.level === intensity) || INTENSITY_SCALE[0];
  const msg = getIntensityMessage(intensity);
  const tier = signalTier(intensity, warningLevel, alertLevel);

  return (
    <div className="hero-card" style={{ backgroundColor: currentIntensityData.color, color: currentIntensityData.text }}>
      {/* Static radial sheen */}
      <div className="hero-sheen" aria-hidden="true" />

      {/* Signal glow — breathes (elevated) or pulses (critical); calm = inert */}
      {tier !== 'calm' && <div className={`peis-glow ${tier}`} aria-hidden="true" />}

      {/* Expanding wave rings — critical tier only */}
      {tier === 'critical' && (
        <>
          <div className="peis-wave" aria-hidden="true" />
          <div className="peis-wave delay" aria-hidden="true" />
        </>
      )}

      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={intensity}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="hero-content"
      >
        {/* Shield watermark centered directly behind the level number */}
        <span className="hero-shield-wrap">
          <img src={usherLogo} alt="" aria-hidden="true" className="hero-shield-watermark" />
          <span className={`hero-number${tier === 'critical' ? ' peis-number-critical' : ''}`}>
            {currentIntensityData.label || intensity}
          </span>
        </span>

        {/* Message panel — glass surface, hairline border */}
        <div
          className="hero-message-panel"
          style={{
            backgroundColor: intensity > 2 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.04)',
            borderColor: intensity > 2 ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.08)',
          }}
        >
          <h2 className="hero-label">{msg.title}</h2>
          <div className="hero-caption-row" aria-hidden="true">
            <span className="hero-caption-rule" />
            <span className="hero-caption">Phil. Earthquake Intensity Scale</span>
            <span className="hero-caption-rule" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
