import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api, errorMessage } from '../../api/client.js';
import Button from '../common/Button.jsx';
import { ReviewBadge, StageBadge } from '../common/Badge.jsx';
import { Spinner } from '../common/Spinner.jsx';
import {
  CheckIcon, FileIcon, MailIcon, PenIcon, PhoneIcon, ShieldIcon, SlashCircleIcon, SwapIcon, UndoIcon, UserIcon, XCircleIcon, XIcon,
} from '../common/Icons.jsx';
import { ACCOUNT_TYPE_LABEL, ACTION_LABEL } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/format.js';

function Field({ label, children, mono }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className={`mt-0.5 break-words text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{children ?? '-'}</dd>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><Icon className="h-4 w-4 text-brand-blue" />{title}</h3>
      {children}
    </section>
  );
}

const EVENT_TONE = {
  SENT: 'bg-sky-500', RESENT: 'bg-sky-500', VERIFIED: 'bg-emerald-500', REDIRECTED: 'bg-brand-blue',
  FAILED: 'bg-red-500', SEND_FAILED: 'bg-red-500', EXPIRED: 'bg-amber-500', LOCKED: 'bg-red-600', NAME_MISMATCH: 'bg-red-500', START_FAILED: 'bg-red-500',
};

/** Right-side panel: every stored detail of one request, its OTP/eSign log and admin history. */
export default function RequestDrawer({ id, canAct, isAdmin, onClose, onView, onDecide, onMoveToBucket }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return undefined;
    setData(null);
    setError('');
    api.request(id).then((res) => setData(res.data)).catch((err) => setError(errorMessage(err)));
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  if (!id) return null;
  const r = data?.record;
  const row = data?.row;

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-brand-midnight/40 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label="Request details" className="relative flex h-full w-full max-w-xl animate-slide-in flex-col bg-white shadow-2xl">
        {/* header */}
        <div className="relative overflow-hidden bg-brand-gradient px-6 py-5 text-white">
          <div className="bg-dots absolute inset-0" aria-hidden="true" />
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 hover:bg-white/10" aria-label="Close"><XIcon /></button>
          <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-brand-coral">Closure request</p>
          <h2 className="relative mt-1 pr-8 text-xl font-extrabold">{row?.clientName || '...'}</h2>
          {row && (
            <div className="relative mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold ring-1 ring-white/20">{row.clientCode}</span>
              <span className="text-white/75">{row.requestNo}</span>
              <StageBadge stage={row.stage} />
              <ReviewBadge review={row.review} />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!data && !error && <div className="flex justify-center py-16"><Spinner className="h-7 w-7 text-brand-blue" /></div>}
          {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

          {r && (
            <>
              {row.review && (
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    {row.review.label}{row.review.rejectedOn ? ` (${row.review.rejectedOn})` : ''} by {row.review.by}
                  </p>
                  <p className="text-xs text-slate-500">{formatDateTime(row.review.at)}</p>
                  {row.review.reason && <p className="mt-2 text-sm text-slate-700">&ldquo;{row.review.reason}&rdquo;</p>}
                </div>
              )}

              <Section icon={UserIcon} title="Client">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Client code">{r.client_code}</Field>
                  <Field label="PAN" mono>{r.pan_no}</Field>
                  <Field label="DP ID" mono>{r.dp_id}</Field>
                  <Field label="Depository">{r.client_depository}</Field>
                  <Field label="Mobile">{r.mobile_no}</Field>
                  <Field label="Email">{r.email_id}</Field>
                  <Field label="Address"><span className="font-medium">{r.resi_address}</span></Field>
                  <Field label="Branch / RM">{[r.branch_code, r.rm_code].filter(Boolean).join(' / ') || '-'}</Field>
                </dl>
              </Section>

              <Section icon={FileIcon} title="Request">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Requested on">{formatDateTime(r.created_at)}</Field>
                  <Field label="Reason">{r.closure_reason || 'Not provided'}</Field>
                  <Field label="Account to close">{ACCOUNT_TYPE_LABEL[r.account_type] || '-'}</Field>
                  <Field label="Current step">{r.current_step} of 5</Field>
                </dl>
              </Section>

              <Section icon={SwapIcon} title="Security balance transfer">
                {r.transfer_security_balance === 'YES' ? (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Field label="Transfer">Yes</Field>
                    <Field label="Depository">{r.depository}</Field>
                    <Field label="Target DP ID" mono>{r.nsdl_dp_id || r.cdsl_dp_id}</Field>
                    <Field label="DP name">{r.depository_participant_name}</Field>
                    <Field label="CMR password">{r.cmr_password_protected ? 'Protected (see CMR viewer)' : 'Not protected'}</Field>
                  </dl>
                ) : <p className="text-sm text-slate-600">No - the client did not tick the transfer box.</p>}
              </Section>

              <Section icon={PenIcon} title="Documents">
                <div className="flex flex-wrap gap-2">
                  <Button size="xs" variant="outline" disabled={!row.files.signature} onClick={() => onView(row, 'signature')}><PenIcon className="h-4 w-4" />Signature</Button>
                  <Button size="xs" variant="outline" disabled={!row.files.cmr} onClick={() => onView(row, 'cmr')}><FileIcon className="h-4 w-4" />CMR</Button>
                  <Button size="xs" variant="outline" disabled={!row.files.unsigned} onClick={() => onView(row, 'unsigned')}><FileIcon className="h-4 w-4" />Closure form</Button>
                  <Button size="xs" variant="outline" disabled={!row.files.signed} onClick={() => onView(row, 'signed')}><ShieldIcon className="h-4 w-4" />eSigned PDF</Button>
                </div>
              </Section>

              <Section icon={ShieldIcon} title="Aadhaar eSign & email">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="eSign status">{r.esign_status || '-'}</Field>
                  <Field label="eSigned on">{formatDateTime(r.esign_completed_at)}</Field>
                  <Field label="Aadhaar name">{r.esign_aadhaar_name || '-'}</Field>
                  <Field label="Name match">{r.esign_name_score != null ? `${Math.round(r.esign_name_score * 100)}%` : '-'}</Field>
                  <Field label="Signed PDF emailed">{r.signed_pdf_mail_status || '-'}</Field>
                  <Field label="Emailed on">{formatDateTime(r.signed_pdf_mailed_at)}</Field>
                </dl>
              </Section>

              <Section icon={PhoneIcon} title={`OTP & eSign log (${data.otpLog.length})`}>
                {data.otpLog.length === 0 ? <p className="text-sm text-slate-500">No events.</p> : (
                  <ol className="relative space-y-3 border-l-2 border-slate-100 pl-4">
                    {data.otpLog.map((e, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <li key={i} className="relative">
                        <span className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full ring-2 ring-white ${EVENT_TONE[e.event] || 'bg-slate-400'}`} />
                        <p className="text-sm font-semibold text-slate-800">
                          {e.purpose} · {e.channel} · <span className="text-slate-600">{e.event}</span>
                          {e.attempt ? <span className="text-xs font-normal text-slate-400"> (attempt {e.attempt})</span> : null}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(e.at)}{e.sent_to ? ` · ${e.sent_to}` : ''}{e.provider ? ` · ${e.provider}` : ''}
                          {e.otp ? ` · OTP ${e.otp}` : ''}{e.entered_otp ? ` · entered ${e.entered_otp}` : ''}
                        </p>
                        {e.message && <p className="text-xs text-slate-500">{e.message}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </Section>

              <Section icon={MailIcon} title={`Admin history (${data.adminLogs.length})`}>
                {data.adminLogs.length === 0 ? <p className="text-sm text-slate-500">No admin actions yet.</p> : (
                  <ul className="space-y-2">
                    {data.adminLogs.map((log) => (
                      <li key={log.id} className="flex items-start justify-between gap-3 text-sm">
                        <span><span className="font-semibold text-slate-800">{log.adminName}</span> <span className="text-slate-600">{(ACTION_LABEL[log.action] || log.action).toLowerCase()}</span>
                          {log.reason && <span className="block text-xs text-slate-500">&ldquo;{log.reason}&rdquo;</span>}
                        </span>
                        <span className="whitespace-nowrap text-xs text-slate-400">{formatDateTime(log.at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </>
          )}
        </div>

        {/* actions */}
        {row && canAct && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
            {row.tab === 'bucket' ? (
              <>
                <Button size="sm" variant="outline" onClick={() => onDecide(row, 'NO_NEED')} className="!text-violet-700"><SlashCircleIcon className="h-4 w-4" />No Need</Button>
                <Button size="sm" variant="danger" disabled={!row.canDecide} onClick={() => onDecide(row, 'REJECTED')}><XCircleIcon className="h-4 w-4" />Reject</Button>
                <Button size="sm" variant="success" disabled={!row.canDecide} onClick={() => onDecide(row, 'COMPLETE')}><CheckIcon className="h-4 w-4" />Complete</Button>
              </>
            ) : isAdmin && (
              <Button size="sm" variant="outline" onClick={() => onMoveToBucket(row)}><UndoIcon className="h-4 w-4" />Move back to Bucket</Button>
            )}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
