import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

/** "Showing 1-10 of 77" + page buttons. */
export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);

  const numbers = [];
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  for (let p = start; p <= Math.min(pages, start + 4); p += 1) numbers.push(p);

  const btn = 'flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800">{from}-{to}</span> of <span className="font-semibold text-slate-800">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button type="button" className={`${btn} text-slate-600 hover:bg-slate-100`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        {numbers.map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}
            className={`${btn} ${n === page ? 'bg-brand-gradient text-white shadow-brand' : 'text-slate-600 hover:bg-slate-100'}`}>
            {n}
          </button>
        ))}
        <button type="button" className={`${btn} text-slate-600 hover:bg-slate-100`} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
