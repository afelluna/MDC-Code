import type { IntensityScaleItem } from '../types';

// PEIS Intensity Scale — reference data (fixed standard)
// `color`/`text` are a badge pair (saturated background + matching foreground) used on hero
// cards and the PEIS strip. `ink` is a separate foreground made to stay readable when placed
// directly on the app's neutral light surfaces (cards, sidebars) — some `color` values (e.g.
// white, pale blue) are too light to use as text there.
export const INTENSITY_SCALE: IntensityScaleItem[] = [
  { level: 1, label: '1', range: '<0.0017', color: '#132a47', text: '#eaf2fb', ink: '#7fa8d9' },
  { level: 2, label: '2', range: '0.0017 - 0.005', color: '#1d4ed8', text: '#ffffff', ink: '#60a5fa' },
  { level: 3, label: '3', range: '0.005 - 0.014', color: '#0891b2', text: '#ffffff', ink: '#22d3ee' },
  { level: 4, label: '4', range: '0.014 - 0.039', color: '#0d9488', text: '#ffffff', ink: '#2dd4bf' },
  { level: 5, label: '5', range: '0.039 - 0.092', color: '#16a34a', text: '#ffffff', ink: '#4ade80' },
  { level: 6, label: '6', range: '0.092 - 0.18', color: '#d97706', text: '#ffffff', ink: '#fbbf24' },
  { level: 7, label: '7', range: '0.18 - 0.34', color: '#ea580c', text: '#ffffff', ink: '#fb923c' },
  { level: 8, label: '8', range: '0.34 - 0.65', color: '#c2410c', text: '#ffffff', ink: '#f97316' },
  { level: 9, label: '9', range: '0.65 - 1.24', color: '#dc2626', text: '#ffffff', ink: '#f87171' },
  { level: 10, label: '10', range: '>1.24', color: '#991b1b', text: '#ffffff', ink: '#ef4444' },
];

// Intensity message logic mapping to PHIVOLCS descriptions
export function getIntensityMessage(level: number) {
  if (level >= 10) return { title: "COMPLETELY DEVASTATING (X)", desc: "Some well-built wooden and most masonry structures destroyed with foundations." };
  if (level === 9) return { title: "DEVASTATING (IX)", desc: "Damage considerable in specially designed structures; well-designed frame structures thrown out of plumb." };
  if (level === 8) return { title: "VERY DESTRUCTIVE (VIII)", desc: "Damage slight in specially designed structures; considerable damage in ordinary substantial buildings." };
  if (level === 7) return { title: "DESTRUCTIVE (VII)", desc: "Damage negligible in buildings of good design; slight to moderate in well-built ordinary structures." };
  if (level === 6) return { title: "STRONG (VI)", desc: "Felt by all, many frightened. Some heavy furniture moved. Damage slight." };
  if (level === 5) return { title: "STRONG (V)", desc: "Felt by nearly everyone; many awakened. Some dishes, windows broken. Unstable objects overturned." };
  if (level === 4) return { title: "MODERATELY STRONG (IV)", desc: "Felt indoors by many, outdoors by few during the day. At night, some awakened. Dishes, windows disturbed." };
  if (level === 3) return { title: "WEAK (III)", desc: "Felt noticeably indoors, especially on upper floors. Many people do not recognize it as an earthquake." };
  if (level === 2) return { title: "SLIGHTLY FELT (II)", desc: "Felt noticeably indoors, especially on upper floors. Many people do not recognize it as an earthquake." };
  return { title: "SCARCELY PERCEPTIBLE (I)", desc: "Not felt except by a very few under especially favorable conditions." };
}
