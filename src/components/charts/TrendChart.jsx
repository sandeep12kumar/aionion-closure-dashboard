import { useEffect, useMemo, useRef, useState } from 'react';
import { formatNumber } from '../../utils/format.js';

/**
 * Single-series area chart (requests per month).
 * dataviz specs: 2px line, ~10% area wash, hairline solid grid, >=8px markers with a 2px surface ring,
 * crosshair + tooltip on hover, direct label only on the latest point, table view for screen readers.
 */
const COLOR = '#1E2BFF';
const SURFACE = '#ffffff';
const PAD = { top: 28, right: 44, bottom: 34, left: 40 };

/** Clean tick step - never below 1, request counts are whole numbers. */
const niceStep = (raw) => {
  if (raw <= 1) return 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const r = raw / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * p;
};

export default function TrendChart({ data, height = 290, label = 'Requests per month' }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(300); // measured from the container on mount
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const n = data.length;
    const innerW = width - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const maxValue = Math.max(0, ...data.map((d) => d.count));
    const step = niceStep(maxValue / 4);
    const top = Math.max(step * 4, step * Math.ceil(maxValue / step));
    const ticks = [];
    for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
    const x = (i) => PAD.left + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
    const y = (v) => PAD.top + innerH - (v / top) * innerH;
    const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.count)}`).join(' ');
    const area = n ? `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z` : '';
    const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 58))));
    return { n, innerW, innerH, ticks, x, y, line, area, every };
  }, [data, width, height]);

  const onMove = (e) => {
    if (!geo.n) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = geo.n <= 1 ? 0 : Math.round(((px - PAD.left) / geo.innerW) * (geo.n - 1));
    setHover(Math.min(geo.n - 1, Math.max(0, i)));
  };

  const last = geo.n - 1;
  const active = hover ?? null;

  return (
    <div ref={wrapRef} className="relative w-full min-w-0 overflow-hidden">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`${label}: ${data.map((d) => `${d.label} ${d.count}`).join(', ')}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block touch-none select-none"
      >
        {/* grid + y ticks */}
        {geo.ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={geo.y(t)} y2={geo.y(t)} stroke={t === 0 ? '#cbd5e1' : '#e9edf3'} strokeWidth="1" />
            <text x={PAD.left - 10} y={geo.y(t)} textAnchor="end" dominantBaseline="middle" className="tabular fill-slate-500 text-[11px]">
              {formatNumber(t)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) => (((i % geo.every === 0 && last - i >= geo.every) || i === last) ? (
          <text key={d.month} x={geo.x(i)} y={height - 10} textAnchor="middle"
            className={`text-[11px] ${i === active ? 'fill-slate-900 font-semibold' : 'fill-slate-500'}`}>
            {d.label}
          </text>
        ) : null))}

        {/* area + line */}
        <path d={geo.area} fill={COLOR} fillOpacity="0.1" />
        <path d={geo.line} fill="none" stroke={COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* crosshair */}
        {active !== null && (
          <line x1={geo.x(active)} x2={geo.x(active)} y1={PAD.top - 8} y2={geo.y(0)} stroke="#94a3b8" strokeWidth="1" />
        )}

        {/* latest point: marker + direct label */}
        {geo.n > 0 && (
          <g>
            <circle cx={geo.x(last)} cy={geo.y(data[last].count)} r="5" fill={COLOR} stroke={SURFACE} strokeWidth="2" />
            <text x={geo.x(last) + 9} y={geo.y(data[last].count)} dominantBaseline="middle" className="tabular fill-slate-900 text-[12px] font-bold">
              {formatNumber(data[last].count)}
            </text>
          </g>
        )}

        {/* hovered marker */}
        {active !== null && active !== last && (
          <circle cx={geo.x(active)} cy={geo.y(data[active].count)} r="5" fill={COLOR} stroke={SURFACE} strokeWidth="2" />
        )}
      </svg>

      {/* tooltip */}
      {active !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-brand-midnight px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: Math.min(Math.max(geo.x(active), 70), width - 70), top: geo.y(data[active].count) - 12 }}
        >
          <p className="font-semibold text-white/70">{data[active].label}</p>
          <p className="tabular text-sm font-bold">{formatNumber(data[active].count)} request{data[active].count === 1 ? '' : 's'}</p>
        </div>
      )}

      {/* table view for screen readers */}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Month</th><th>Requests</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.month}><td>{d.label}</td><td>{d.count}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
