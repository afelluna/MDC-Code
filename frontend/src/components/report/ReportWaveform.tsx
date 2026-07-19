interface ReportWaveformProps {
  content: number[][];
}

const WIDTH = 700;
const HEIGHT = 220;
const PADDING = 32;

function buildPath(values: number[], maxAbs: number, plotW: number, plotH: number, midY: number): string {
  if (values.length < 2) return '';
  return values
    .map((v, i) => {
      const x = PADDING + (i / (values.length - 1)) * plotW;
      const y = midY - (v / maxAbs) * (plotH / 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function ReportWaveform({ content }: ReportWaveformProps) {
  if (!content || content.length < 2) {
    return <p className="event-report-note">No waveform samples available for this event.</p>;
  }

  const xs = content.map((row) => Number(row[2]));
  const ys = content.map((row) => Number(row[3]));
  const zs = content.map((row) => Number(row[4]));
  const maxAbs = Math.max(...xs.map(Math.abs), ...ys.map(Math.abs), ...zs.map(Math.abs), 0.0001);

  const plotW = WIDTH - PADDING * 2;
  const plotH = HEIGHT - PADDING * 2;
  const midY = PADDING + plotH / 2;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="report-waveform-svg">
      <line x1={PADDING} y1={midY} x2={WIDTH - PADDING} y2={midY} className="report-waveform-axis" />
      <path d={buildPath(xs, maxAbs, plotW, plotH, midY)} className="report-waveform-line report-waveform-x" />
      <path d={buildPath(ys, maxAbs, plotW, plotH, midY)} className="report-waveform-line report-waveform-y" />
      <path d={buildPath(zs, maxAbs, plotW, plotH, midY)} className="report-waveform-line report-waveform-z" />
    </svg>
  );
}
