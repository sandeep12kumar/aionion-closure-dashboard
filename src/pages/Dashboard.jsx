import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import TrendChart from '../components/charts/TrendChart.jsx';
import StatusBar from '../components/charts/StatusBar.jsx';
import Button from '../components/common/Button.jsx';
import { Skeleton } from '../components/common/Spinner.jsx';
import {
  ActivityIcon, ChevronRightIcon, CheckCircleIcon, ClockIcon, PenIcon, RefreshIcon, SlashCircleIcon, UsersIcon, XCircleIcon,
} from '../components/common/Icons.jsx';
import { ACCOUNT_TYPE_LABEL, ACTION_LABEL, ACTION_TONE } from '../utils/constants.js';
import { formatNumber, percent, timeAgo } from '../utils/format.js';

const PERIODS = [6, 12, 24];

const STATUS_PARTS = (t) => [
  { key: 'bucket', label: 'Bucket', value: t.bucket, color: '#fab219', icon: ClockIcon, darkText: true },
  { key: 'complete', label: 'Complete', value: t.complete, color: '#0ca30c', icon: CheckCircleIcon },
  { key: 'no_need', label: 'No Need', value: t.no_need, color: '#6250d6', icon: SlashCircleIcon },
  { key: 'rejected', label: 'Rejected', value: t.rejected, color: '#d03b3b', icon: XCircleIcon },
];

function StatCard({ label, hint, value, icon: Icon, tone, to, children }) {
  return (
    <Link to={to} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:ring-brand-blue/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900">{formatNumber(value)}</p>
          <p className="mt-3 text-sm font-bold text-slate-800">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
        </div>
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon /></span>
      </div>
      {children}
      <ChevronRightIcon className="absolute bottom-4 right-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-blue" />
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [months, setMonths] = useState(12);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.summary(months);
      setData(res.data);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { load(); }, [load]);

  const t = data?.totals;
  const openTab = (tab) => navigate(`/maker-checker?tab=${tab}`);

  return (
    <div className="mx-auto max-w-7xl animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Live closure activity overview with status distribution and monthly trends.</p>
        </div>
        <div className="flex items-center gap-3">
          {updatedAt && <span className="text-xs text-slate-400">Updated {timeAgo(updatedAt)}</span>}
          <Button variant="outline" size="sm" onClick={load} loading={loading}><RefreshIcon className="h-4 w-4" />Refresh</Button>
        </div>
      </div>

      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {!t ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-36" />) : (
          <>
            <Link to="/maker-checker" className="relative overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white shadow-brand sm:col-span-2 xl:col-span-1">
              <div className="bg-dots absolute inset-0" aria-hidden="true" />
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-brand-coral/40 blur-2xl" aria-hidden="true" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[40px] font-extrabold leading-none tracking-tight">{formatNumber(t.total)}</p>
                  <p className="mt-3 text-sm font-bold">Total Accounts</p>
                  <p className="mt-0.5 text-xs text-white/70">{formatNumber(t.today)} new today</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25"><UsersIcon /></span>
              </div>
            </Link>
            <StatCard to="/maker-checker?tab=bucket" label="Bucket" hint="Current bucket cases" value={t.bucket} icon={ClockIcon} tone="bg-amber-50 text-amber-600">
              <p className="mt-3 text-xs text-slate-500">
                <span className="font-semibold text-emerald-600">{data.bucketBreakdown.awaitingReview} eSigned</span>
                {' · '}{data.bucketBreakdown.inProgress} in progress
              </p>
            </StatCard>
            <StatCard to="/maker-checker?tab=no_need" label="No Need" hint="Entries marked as no need" value={t.no_need} icon={SlashCircleIcon} tone="bg-violet-50 text-violet-600" />
            <StatCard to="/maker-checker?tab=complete" label="Complete" hint="Successfully completed entries" value={t.complete} icon={CheckCircleIcon} tone="bg-emerald-50 text-emerald-600" />
            <StatCard to="/maker-checker?tab=rejected" label="Rejected" hint="Rejected entries" value={t.rejected} icon={XCircleIcon} tone="bg-red-50 text-red-600" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="card min-w-0 p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Request Trend</h2>
              <p className="text-xs text-slate-500">Closure requests created per month (IST)</p>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Period">
              {PERIODS.map((m) => (
                <button key={m} type="button" onClick={() => setMonths(m)} aria-pressed={months === m}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${months === m ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  Last {m} months
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            {data ? <TrendChart data={data.trend} /> : <Skeleton className="h-[290px]" />}
          </div>
        </section>

        <section className="card min-w-0 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Status Distribution</h2>
          <p className="text-xs text-slate-500">{t ? `${formatNumber(t.total)} total accounts` : '...'}</p>
          <div className="mt-6">
            {t ? <StatusBar parts={STATUS_PARTS(t)} onSelect={openTab} /> : <Skeleton className="h-56" />}
          </div>
          {data && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">By account type</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                {Object.entries(data.accountTypes).map(([type, count]) => (
                  <div key={type} className="rounded-xl bg-slate-50 px-2 py-2.5">
                    <dd className="tabular text-lg font-extrabold text-slate-900">{formatNumber(count)}</dd>
                    <dt className="text-[11px] font-medium text-slate-500">{ACCOUNT_TYPE_LABEL[type]}</dt>
                    <dd className="text-[10px] text-slate-400">{percent(count, t.total)}%</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>
      </div>

      {/* Work queue + activity */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card min-w-0 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Awaiting review</h2>
              <p className="text-xs text-slate-500">eSigned requests in the bucket, oldest first</p>
            </div>
            <Link to="/maker-checker?tab=bucket" className="text-sm font-semibold text-brand-blue hover:underline">Open bucket</Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {data?.awaitingReview.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-500">Nothing waiting - all eSigned requests are reviewed.</li>
            )}
            {data?.awaitingReview.map((r) => (
              <li key={r.id}>
                <Link to={`/maker-checker?tab=bucket&open=${r.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><PenIcon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">{r.clientName}</span>
                    <span className="block text-xs text-slate-500">{r.clientCode} · {ACCOUNT_TYPE_LABEL[r.accountType] || '-'}</span>
                  </span>
                  <span className="text-right text-xs text-slate-500">eSigned<br /><span className="font-semibold text-slate-700">{timeAgo(r.esignedAt)}</span></span>
                </Link>
              </li>
            ))}
            {!data && Array.from({ length: 3 }, (_, i) => <li key={i} className="py-3"><Skeleton className="h-10" /></li>)}
          </ul>
        </section>

        <section className="card min-w-0 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-bold text-slate-900">Recent admin activity</h2>
          </div>
          <ul className="mt-4 space-y-1">
            {data?.recentActivity.length === 0 && <li className="py-8 text-center text-sm text-slate-500">No activity yet.</li>}
            {data?.recentActivity.map((log) => (
              <li key={log.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${ACTION_TONE[log.action] || 'bg-brand-mist text-brand-blue'}`}>
                  {(log.adminName || '?').slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">{log.adminName || log.adminEmail || 'Unknown'}</span>
                  {' '}{(ACTION_LABEL[log.action] || log.action).toLowerCase()}
                  {log.clientCode && <span className="font-semibold text-slate-900"> {log.clientCode}</span>}
                </span>
                <span className="whitespace-nowrap text-xs text-slate-400">{timeAgo(log.at)}</span>
              </li>
            ))}
            {!data && Array.from({ length: 4 }, (_, i) => <li key={i} className="py-1.5"><Skeleton className="h-8" /></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
