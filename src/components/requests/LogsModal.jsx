import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Pagination from '../common/Pagination.jsx';
import { Spinner } from '../common/Spinner.jsx';
import { DownloadIcon, ListIcon, SearchIcon } from '../common/Icons.jsx';
import { api, errorMessage } from '../../api/client.js';
import { ACTION_LABEL, ACTION_TONE } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/format.js';

/** "Get Logs": searchable admin_logs with CSV export. */
export default function LogsModal({ open, onClose, initialSearch = '' }) {
  const [filters, setFilters] = useState({ search: initialSearch, action: '', from: '', to: '' });
  const [query, setQuery] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const start = { search: initialSearch, action: '', from: '', to: '' };
      setFilters(start);
      setQuery(start);
      setPage(1);
    }
  }, [open, initialSearch]);

  // debounce typing
  useEffect(() => {
    const t = setTimeout(() => { setQuery(filters); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    api.logs({ ...query, page, pageSize: 25 })
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [open, query, page]);

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} size="xl" title="Admin logs" subtitle="Every login, view and decision in the dashboard" icon={<ListIcon />}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={filters.search} onChange={set('search')} placeholder="Client code, request no, admin..." className="field-input pl-9" />
        </div>
        <select value={filters.action} onChange={set('action')} className="field-input lg:w-52" aria-label="Action">
          <option value="">All actions</option>
          {Object.entries(ACTION_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={set('from')} className="field-input lg:w-40" aria-label="From date" />
        <input type="date" value={filters.to} onChange={set('to')} className="field-input lg:w-40" aria-label="To date" />
        <a href={api.logsExportUrl(query)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white shadow-brand hover:brightness-110">
          <DownloadIcon className="h-4 w-4" />Export
        </a>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr><th className="th">Date &amp; Time</th><th className="th">Admin Name</th><th className="th">Admin Email</th><th className="th">Action</th><th className="th">Client</th><th className="th">Status change</th><th className="th">Reason</th><th className="th">IP</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading && !data && <tr><td colSpan={8} className="py-10 text-center"><Spinner className="mx-auto h-6 w-6 text-brand-blue" /></td></tr>}
            {error && <tr><td colSpan={8} className="py-6 text-center text-sm text-red-600">{error}</td></tr>}
            {data?.rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-sm text-slate-500">No logs found.</td></tr>}
            {data?.rows.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60">
                <td className="td whitespace-nowrap tabular text-xs">{formatDateTime(log.at)}</td>
                <td className="td whitespace-nowrap font-semibold text-slate-800">{log.adminName || '-'}</td>
                <td className="td whitespace-nowrap text-xs text-slate-600">{log.adminEmail || '-'}</td>
                <td className="td"><span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_TONE[log.action] || 'bg-brand-mist text-brand-blue'}`}>{ACTION_LABEL[log.action] || log.action}</span></td>
                <td className="td"><span className="block font-semibold text-slate-800">{log.clientCode || '-'}</span><span className="text-xs text-slate-500">{log.requestNo}</span></td>
                <td className="td whitespace-nowrap text-xs">{log.oldStatus || log.newStatus ? `${log.oldStatus || '-'} -> ${log.newStatus || '-'}` : '-'}</td>
                <td className="td max-w-[220px] truncate text-xs" title={log.reason || ''}>{log.reason || '-'}</td>
                <td className="td text-xs text-slate-500">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <div className="mt-4"><Pagination page={page} pageSize={25} total={data.total} onChange={setPage} /></div>}
    </Modal>
  );
}
