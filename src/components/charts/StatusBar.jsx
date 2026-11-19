import { formatNumber, percent } from '../../utils/format.js';

/**
 * One whole split into parts (dataviz "tall segmented bar"): 28px, 4px corners, 2px surface gaps,
 * share printed inside only when it fits, legend with icon + label + count (status colors never alone).
 *
 * parts: [{ key, label, value, color, icon: Component, darkText? }]
 */
export default function StatusBar({ parts, onSelect }) {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const visible = parts.filter((p) => p.value > 0);

  return (
    <div>
      <div className="flex h-7 w-full gap-0.5" role="img"
        aria-label={parts.map((p) => `${p.label} ${p.value} (${percent(p.value, total)}%)`).join(', ')}>
        {total === 0 && <div className="h-full w-full rounded bg-slate-100" />}
        {visible.map((p) => {
          const share = percent(p.value, total);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelect?.(p.key)}
              title={`${p.label}: ${p.value} (${share}%)`}
              className="flex h-full min-w-[6px] items-center overflow-hidden rounded px-2 transition hover:brightness-110 focus-visible:ring-2"
              style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.color }}
            >
              {share >= 9 && (
                <span className={`tabular text-xs font-bold ${p.darkText ? 'text-slate-900' : 'text-white'}`}>{share}%</span>
              )}
            </button>
          );
        })}
      </div>

      <ul className="mt-5 space-y-1">
        {parts.map(({ key, label, value, color, icon: Icon }) => (
          <li key={key}>
            <button type="button" onClick={() => onSelect?.(key)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50">
              <span className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ backgroundColor: color }} />
              <Icon className="h-4 w-4 flex-shrink-0 text-slate-500" />
              <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
              <span className="tabular text-sm font-bold text-slate-900">{formatNumber(value)}</span>
              <span className="tabular w-10 text-right text-xs text-slate-500">{percent(value, total)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
