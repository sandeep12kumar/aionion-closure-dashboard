import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { ReviewBadge, StageBadge } from '../components/common/Badge.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { DownloadIcon, ListIcon, SearchIcon, SortIcon } from '../components/common/Icons.jsx';
import RowActions from '../components/requests/RowActions.jsx';
import FileViewerModal from '../components/requests/FileViewerModal.jsx';
import DecisionModal from '../components/requests/DecisionModal.jsx';
import RequestDrawer from '../components/requests/RequestDrawer.jsx';
import LogsModal from '../components/requests/LogsModal.jsx';
import { ACCOUNT_TYPE_LABEL, TABS } from '../utils/constants.js';
import { formatDate, formatTime, formatDateTime } from '../utils/format.js';

const VALID_TABS = TABS.map((t) => t.key);

function SortHeader({ label, field, sort, onSort }) {
  const active = sort.by === field;
  return (
    <th className="th">
      <button type="button" onClick={() => onSort(field)} className={`inline-flex items-center gap-1 uppercase tracking-wider ${active ? 'text-brand-blue' : 'hover:text-slate-700'}`}>
        {label}
        <SortIcon className={`h-3.5 w-3.5 ${active ? '' : 'opacity-40'}`} />
        <span className="sr-only">{active ? (sort.dir === 'asc' ? 'sorted ascending' : 'sorted descending') : 'sortable'}</span>
      </button>
    </th>
  );
}

/** Maker & Checker: Bucket / Complete / No Need / Rejected with document review and decisions. */
export default function MakerChecker() {
  const { canAct, isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = VALID_TABS.includes(params.get('tab')) ? params.get('tab') : 'bucket';

  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [search, setSearch] = useState(params.get('search') || '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState({ by: 'createdAt', dir: 'desc' });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [viewer, setViewer] = useState(null); // { row, kind }
  const [decision, setDecision] = useState(null); // { row, decision }
  const [drawerId, setDrawerId] = useState(Number(params.get('open')) || null);
  const [logsOpen, setLogsOpen] = useState(false);

  // global search from the top bar
  useEffect(() => {
    const q = params.get('search') || '';
    setSearchInput(q);
    setSearch(q);
  }, [params]);

  // debounce the table search box
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [tab, search, pageSize, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.requests({ tab, search, page, pageSize, sortBy: sort.by, sortDir: sort.dir });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tab, search, page, pageSize, sort]);

  useEffect(() => { load(); }, [load]);

  const switchTab = (key) => {
    const next = new URLSearchParams(params);
    next.set('tab', key);
    next.delete('open');
    setParams(next, { replace: true });
  };

  const onSort = (field) => setSort((s) => ({ by: field, dir: s.by === field && s.dir === 'desc' ? 'asc' : 'desc' }));

  const closeDrawer = useCallback(() => {
    setDrawerId(null);
    if (params.get('open')) {
      const next = new URLSearchParams(params);
      next.delete('open');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const afterChange = () => {
    setViewer(null);
    setDecision(null);
    setDrawerId(null);
    load();
  };

  const moveToBucket = async (row) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Move ${row.clientCode} back to the Bucket? The decision "${row.review?.label}" will be undone.`)) return;
    try {
      const res = await api.moveToBucket(row.id);
      toast.success(`${row.clientCode}: ${res.message}`);
      afterChange();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const decided = tab !== 'bucket';
  const columns = decided ? 10 : 8;

  return (
    <div className="mx-auto max-w-[1500px] animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Maker &amp; Checker</h1>
          <p className="mt-1 text-sm text-slate-500">Review signature, CMR and the eSigned closure form, then mark each request.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLogsOpen(true)}><ListIcon className="h-4 w-4" />Get Logs</Button>
          <a href={api.exportUrl({ tab, search })} className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-gradient px-3.5 text-sm font-semibold text-white shadow-brand hover:brightness-110">
            <DownloadIcon className="h-4 w-4" />Export {TABS.find((t) => t.key === tab)?.label}
          </a>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        {/* tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-3" role="tablist">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button key={t.key} type="button" role="tab" aria-selected={active} onClick={() => switchTab(t.key)}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-3 text-sm font-semibold transition
                  ${active ? 'text-brand-blue' : 'text-slate-500 hover:text-slate-800'}`}>
                <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                {t.label}
                <span className={`tabular rounded-full px-2 py-0.5 text-xs font-bold ${active ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {data?.counts?.[t.key] ?? '-'}
                </span>
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-brand-blue to-brand-coral" />}
              </button>
            );
          })}
        </div>

        {/* toolbar */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Show
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="field-input h-9 w-20 py-1">
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            entries
          </label>
          <div className="relative sm:w-80">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search client code, name, PAN, mobile..."
              className="field-input h-10 pl-9" aria-label="Search requests" />
            {loading && data && <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue" />}
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <SortHeader label="Client Code" field="clientCode" sort={sort} onSort={onSort} />
                <SortHeader label="Status" field="stage" sort={sort} onSort={onSort} />
                <SortHeader label="Date & Time" field="createdAt" sort={sort} onSort={onSort} />
                <SortHeader label="Name" field="clientName" sort={sort} onSort={onSort} />
                <th className="th">Email</th>
                <th className="th">Pan Number</th>
                <th className="th">Phone Number</th>
                {decided && <SortHeader label="Decided" field="reviewedAt" sort={sort} onSort={onSort} />}
                {decided && <th className="th">Reason</th>}
                <th className="th sticky right-0 bg-slate-50 text-right shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.25)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!data && loading && <tr><td colSpan={columns} className="py-16 text-center"><Spinner className="mx-auto h-7 w-7 text-brand-blue" /></td></tr>}
              {error && <tr><td colSpan={columns} className="py-8 text-center text-sm text-red-600">{error}</td></tr>}
              {data?.rows.length === 0 && (
                <tr><td colSpan={columns} className="py-16 text-center">
                  <p className="text-sm font-semibold text-slate-700">No requests here</p>
                  <p className="text-xs text-slate-500">{search ? 'Try a different search.' : 'This tab is empty.'}</p>
                </td></tr>
              )}
              {data?.rows.map((row) => (
                <tr key={row.id} className="group transition hover:bg-brand-mist/40">
                  <td className="td">
                    <button type="button" onClick={() => setDrawerId(row.id)} className="font-bold text-brand-blue hover:underline" title="View details">
                      {row.clientCode}
                    </button>
                  </td>
                  <td className="td">
                    <StageBadge stage={row.stage} />
                    <span className="mt-1 block whitespace-nowrap text-xs text-slate-500">{ACCOUNT_TYPE_LABEL[row.accountType] || '-'}</span>
                  </td>
                  <td className="td whitespace-nowrap tabular"><span className="block">{formatDate(row.createdAt)}</span><span className="text-xs text-slate-400">{formatTime(row.createdAt)}</span></td>
                  <td className="td min-w-[160px] font-semibold text-slate-900">{row.clientName || '-'}</td>
                  <td className="td max-w-[240px]">
                    <span className="block truncate" title={row.email}>{row.email || '-'}</span>
                  </td>
                  <td className="td font-mono text-xs">{row.pan}</td>
                  <td className="td tabular">{row.mobile}</td>
                  {decided && (
                    <td className="td whitespace-nowrap">
                      <ReviewBadge review={row.review} />
                      <span className="mt-1 block text-xs text-slate-500">{row.review?.by}</span>
                      <span className="block text-xs text-slate-400">{formatDateTime(row.review?.at)}</span>
                    </td>
                  )}
                  {decided && (
                    <td className="td max-w-[220px] text-xs" title={row.review?.reason || ''}>
                      {row.review?.rejectedOn && (
                        <span className="mb-0.5 block font-semibold text-red-700">{row.review.rejectedOn} rejected</span>
                      )}
                      <span className="block truncate">{row.review?.reason || '-'}</span>
                    </td>
                  )}
                  <td className="td sticky right-0 bg-white shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.25)] group-hover:bg-[#f7f8ff]">
                    <RowActions
                      row={row}
                      canAct={canAct}
                      isAdmin={isAdmin}
                      onView={(r, kind) => setViewer({ row: r, kind })}
                      onDecide={(r, d) => setDecision({ row: r, decision: d })}
                      onMoveToBucket={moveToBucket}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.total > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
          </div>
        )}
      </div>

      <FileViewerModal
        open={Boolean(viewer)}
        request={viewer?.row}
        kind={viewer?.kind}
        canReject={canAct && viewer?.row?.tab === 'bucket' && viewer?.row?.canDecide && ['signature', 'cmr'].includes(viewer?.kind)}
        onClose={() => setViewer(null)}
        onDecided={afterChange}
        onStale={load}
      />
      <DecisionModal
        open={Boolean(decision)}
        request={decision?.row}
        decision={decision?.decision}
        onClose={() => setDecision(null)}
        onDone={afterChange}
      />
      <RequestDrawer
        id={drawerId}
        canAct={canAct}
        isAdmin={isAdmin}
        onClose={closeDrawer}
        onView={(r, kind) => setViewer({ row: r, kind })}
        onDecide={(r, d) => setDecision({ row: r, decision: d })}
        onMoveToBucket={moveToBucket}
      />
      <LogsModal open={logsOpen} onClose={() => setLogsOpen(false)} initialSearch={search} />
    </div>
  );
}
