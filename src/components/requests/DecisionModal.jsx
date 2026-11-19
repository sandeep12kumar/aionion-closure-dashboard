import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { CheckCircleIcon, SlashCircleIcon, XCircleIcon } from '../common/Icons.jsx';
import { api, errorMessage } from '../../api/client.js';
import { ACCOUNT_TYPE_LABEL } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/format.js';
import { showDecisionResult } from '../../utils/decisionToast.js';

const CONFIG = {
  COMPLETE: {
    title: 'Mark as Complete', icon: CheckCircleIcon, tone: 'bg-emerald-50 text-emerald-600', variant: 'success', button: 'Mark Complete',
    text: 'Confirm that the signature, CMR and eSigned closure form are verified and the closure is complete.',
  },
  NO_NEED: {
    title: 'Mark as No Need', icon: SlashCircleIcon, tone: 'bg-violet-50 text-violet-600', variant: 'violet', button: 'Mark No Need',
    text: 'The request moves to "No Need" and is closed in the closure app. The client is emailed that no action is required (with your remark, if any) and can apply again if needed.',
  },
  REJECTED: {
    title: 'Reject request', icon: XCircleIcon, tone: 'bg-red-50 text-red-600', variant: 'danger', button: 'Reject',
    text: 'The request is rejected and closed in the closure app. The client is emailed the rejected document and your reason, and can submit a fresh request.',
  },
};

const REJECT_ON = [
  { value: 'signature', label: 'Signature' },
  { value: 'cmr', label: 'CMR' },
];

export default function DecisionModal({ open, request, decision, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [rejectOn, setRejectOn] = useState('signature');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setReason(''); setRejectOn('signature'); } }, [open]);

  if (!decision) return null;
  const cfg = CONFIG[decision];
  const Icon = cfg.icon;
  const needsReason = decision === 'REJECTED';

  const submit = async () => {
    if (needsReason && reason.trim().length < 3) {
      toast.error('Please enter the reject reason.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.decide(request.id, {
        decision, reason: reason.trim(), ...(needsReason ? { rejectOn } : {}),
      });
      showDecisionResult(request.clientCode, res);
      onDone?.();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={cfg.title}
      icon={<Icon />}
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={cfg.variant} onClick={submit} loading={saving}>{cfg.button}</Button>
        </div>
      )}
    >
      {request && (
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-sm font-bold text-slate-900">{request.clientName}</p>
          <p className="mt-0.5 text-xs text-slate-500">{request.clientCode} · {request.requestNo}</p>
          <p className="mt-2 text-xs text-slate-500">
            {ACCOUNT_TYPE_LABEL[request.accountType] || '-'} · eSigned {formatDateTime(request.esignedAt)}
          </p>
        </div>
      )}
      <p className={`mt-4 flex gap-2 rounded-xl px-3 py-2.5 text-sm ${cfg.tone}`}><Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />{cfg.text}</p>
      {needsReason && (
        <fieldset className="mt-4">
          <legend className="field-label">Rejected document *</legend>
          <div className="grid grid-cols-2 gap-2">
            {REJECT_ON.map((o) => {
              const disabled = o.value === 'cmr' && !request?.files?.cmr;
              const active = rejectOn === o.value;
              return (
                <label key={o.value} title={disabled ? 'No CMR uploaded for this request' : undefined}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 transition
                    ${active ? 'bg-red-50 text-red-700 ring-red-300' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}
                    ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}>
                  <input type="radio" name="rejectOn" value={o.value} checked={active} disabled={disabled}
                    onChange={() => setRejectOn(o.value)} className="accent-red-600" />
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      <label className="mt-4 block">
        <span className="field-label">
          {needsReason ? 'Reject reason * (sent to the client)' : decision === 'NO_NEED' ? 'Remark (optional, sent to the client)' : 'Remark (optional)'}
        </span>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500}
          className="field-input resize-none"
          placeholder={needsReason ? 'Why is this request rejected? The client will see this.' : decision === 'NO_NEED' ? 'e.g. Duplicate request / request not completed' : 'Saved with the decision and in the logs'}
          autoFocus={needsReason} />
      </label>
    </Modal>
  );
}
