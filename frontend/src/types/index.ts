export interface SeismicAlert {
  id: string;
  date: string;
  time: string;
  intensity: number;
  acceleration: string;
  isCritical?: boolean;
}

export interface IntensityScaleItem {
  level: number;
  label: string;
  range: string;
  /** Saturated swatch/badge background color (hero card bg, strip swatch). */
  color: string;
  /** Foreground color to use on top of `color` (badge/hero text). */
  text: string;
  /** Foreground color to use on neutral light surfaces (cards, sidebars) — always readable on white/light-gray. */
  ink: string;
}

export interface SeismogramDataPoint {
  time: number;
  x: number;
  y: number;
  z: number;
}

export interface SensorSample {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  intensity?: number;
}

export interface SeismicDataResponse {
  intensity: number;
  peakAccel: number;
  timestamp: string;
  samples?: SensorSample[];
  rawSamples?: SensorSample[];
  raw?: {
    time: number;
    x: number;
    y: number;
    z: number;
  };
}
