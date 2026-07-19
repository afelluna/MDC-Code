import { useMemo, useRef, useEffect } from 'react';
import type { SensorSample } from '../../types';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

export type SignalStatus = 'live' | 'stale' | 'connecting' | 'offline';

interface SeismogramProps {
  samples: SensorSample[];
  status: SignalStatus;
}

const STATUS_COPY: Record<SignalStatus, { overlay: string | null; tag: string; dot: 'live' | 'warn' | 'idle' | 'error' }> = {
  live: { overlay: null, tag: 'LIVE', dot: 'live' },
  stale: { overlay: 'Stale Data', tag: 'STALE', dot: 'warn' },
  connecting: { overlay: 'Connecting…', tag: 'CONNECTING', dot: 'idle' },
  offline: { overlay: 'No Signal', tag: 'OFFLINE', dot: 'error' },
};

const DECIMATION = 5;
const MAX_DATAPOINTS = 1200;

const AXES = [
  { label: 'X AXIS', stroke: '#ef4444', fill: 'rgba(239,68,68,0.08)' },
  { label: 'Y AXIS', stroke: '#3b82f6', fill: 'rgba(59,130,246,0.08)' },
  { label: 'Z AXIS', stroke: '#22c55e', fill: 'rgba(34,197,94,0.08)' },
];

export function Seismogram({ samples, status }: SeismogramProps) {
  const copy = STATUS_COPY[status];
  const chartRef = useRef<uPlot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartDataRef = useRef<[number[], number[], number[], number[]]>([[], [], [], []]);

  const options: uPlot.Options = useMemo(() => ({
    width: 600,
    height: 180,
    padding: [10, 10, 10, 10],
    legend: { show: false },
    cursor: { show: false },
    select: { show: false, left: 0, top: 0, width: 0, height: 0 },
    scales: {
      x: { time: true },
      y: {
        range: (_u, dataMin, dataMax) => {
          const maxAbs = Math.max(Math.abs(dataMin), Math.abs(dataMax));
          const finalMax = Math.max(maxAbs * 1.1, 0.0005);
          return [-finalMax, finalMax];
        },
      },
    },
    axes: [
      {
        size: 26,
        font: '11px "JetBrains Mono", monospace',
        stroke: '#64809e',
        grid: { stroke: 'rgba(148,180,214,0.12)', width: 1, dash: [4, 4] },
        ticks: { show: true, stroke: 'rgba(148,180,214,0.22)', size: 4 },
        space: 44,
        values: (_self, ticks) => ticks.map(t => {
          const d = new Date(t * 1000);
          return `${d.getSeconds().toString().padStart(2, '0')}s`;
        }),
      },
      {
        size: 36,
        font: '11px "JetBrains Mono", monospace',
        stroke: '#64809e',
        grid: { stroke: 'rgba(148,180,214,0.12)', width: 1, dash: [4, 4] },
        ticks: { show: true, stroke: 'rgba(148,180,214,0.22)', size: 4 },
        space: 26,
      },
    ],
    series: [
      {},
      ...AXES.map(a => ({
        label: a.label,
        stroke: a.stroke,
        fill: a.fill,
        width: 2.25,
        points: { show: false },
      })),
    ],
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = new uPlot(options, chartDataRef.current, containerRef.current);
    chartRef.current = chart;

    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [options]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      if (entries.length > 0 && chartRef.current) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          chartRef.current.setSize({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!samples.length || !chartRef.current) return;

    const batch = samples.length > DECIMATION
      ? samples.filter((_, i) => i % DECIMATION === 0)
      : samples;
    if (!batch.length) return;

    const buf = chartDataRef.current;
    for (const s of batch) {
      buf[0].push(s.timestamp / 1000);
      buf[1].push(s.x);
      buf[2].push(s.y);
      buf[3].push(s.z);
    }

    const excess = buf[0].length - MAX_DATAPOINTS;
    if (excess > 0) {
      buf[0].splice(0, excess);
      buf[1].splice(0, excess);
      buf[2].splice(0, excess);
      buf[3].splice(0, excess);
    }

    chartRef.current.setData(buf);
  }, [samples]);

  return (
    <div className="chart-panel">
      <div className="chart-wrapper">
        <div ref={containerRef} className="uplot-container" />
        {copy.overlay && (
          <div className="disconnected-overlay">{copy.overlay}</div>
        )}
      </div>

      <div className="chart-legend">
        <div className="chart-legend-axes">
          {AXES.map((axis) => (
            <span key={axis.label}>
              <i style={{ background: axis.stroke }} />
              {axis.label}
            </span>
          ))}
        </div>
        <span className={`live-tag live-tag-${status}`}>
          <span className={`status-dot ${copy.dot}`} /> {copy.tag}
        </span>
      </div>
    </div>
  );
}
