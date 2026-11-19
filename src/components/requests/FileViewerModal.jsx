import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { Spinner } from '../common/Spinner.jsx';
import {
  DownloadIcon, FileIcon, KeyIcon, PenIcon, RefreshIcon, RotateLeftIcon, RotateRightIcon, ZoomInIcon, ZoomOutIcon,
} from '../common/Icons.jsx';
import { api, errorMessage } from '../../api/client.js';
import { showDecisionResult } from '../../utils/decisionToast.js';

const TITLES = {
  signature: 'Signature',
  cmr: 'CMR (Client Master Report)',
  signed: 'eSigned Closure Form',
  unsigned: 'Closure Form (not yet eSigned)',
};

/**
 * View a stored document (signature / CMR / closure form) with zoom + rotate,
 * the CMR password (if protected) and - for eSigned bucket requests, from the CMR or Signature
 * viewer - Reject with a reason (saved as cmr_reject / sign_reject in acnt_closure).
 * onStale: the request no longer exists -> the page reloads its list.
 */
export default function FileViewerModal({ open, request, kind, canReject, onClose, onDecided, onStale }) {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [password, setPassword] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!open || !request) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    setZoom(1);
    setRotation(0);
    setReason('');
    setPassword(null);
    api.fileLink(request.id, kind)
      .then((file) => {
        if (cancelled) return;
        setType(file.contentType === 'application/pdf' ? 'pdf' : 'image');
        setUrl(file.url);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load the document.'));
        if (err.response?.data?.code === 'REQUEST_NOT_FOUND') onStale?.();
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      setUrl('');
    };
  }, [open, request, kind]);

  const showPassword = async () => {
    setPasswordLoading(true);
    try {
      const res = await api.cmrPassword(request.id);
      setPassword(res.data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const reject = async () => {
    if (reason.trim().length < 3) {
      toast.error('Please enter the reject reason.');
      return;
    }
    setRejecting(true);
    try {
      const res = await api.decide(request.id, { decision: 'REJECTED', reason: reason.trim(), rejectOn: kind });
      showDecisionResult(request.clientCode, res);
      onDecided?.();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRejecting(false);
    }
  };

  const tool = 'flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition hover:brightness-110 disabled:opacity-40';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={kind === 'signature' ? <PenIcon /> : <FileIcon />}
      title={`${TITLES[kind]} - ${request?.clientCode || ''}`}
      subtitle={request ? `${request.clientName} · ${request.requestNo}` : ''}
      footer={canReject && (
        <div>
        <p className="mb-2 text-xs text-slate-500">The reject reason is emailed to the client along with the rejection.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            placeholder={kind === 'cmr' ? 'CMR reject reason (e.g. CMR does not match, wrong DP ID)' : 'Signature reject reason (e.g. signature not clear, does not match)'}
            aria-label={kind === 'cmr' ? 'CMR reject reason' : 'Signature reject reason'}
            className="field-input flex-1"
          />
          <Button variant="danger" onClick={reject} loading={rejecting} className="sm:w-44">
            Reject {kind === 'cmr' ? 'CMR' : 'Signature'}
          </Button>
        </div>
        </div>
      )}
    >
      {/* toolbar */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        {type === 'image' && (
          <>
            <button type="button" className={`${tool} bg-brand-blue`} onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Zoom in"><ZoomInIcon /></button>
            <button type="button" className={`${tool} bg-brand-blue`} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Zoom out"><ZoomOutIcon /></button>
          </>
        )}
        <button type="button" className={`${tool} bg-emerald-600`} onClick={() => setRotation((r) => r - 90)} aria-label="Rotate left"><RotateLeftIcon /></button>
        <button type="button" className={`${tool} bg-emerald-600`} onClick={() => setRotation((r) => r + 90)} aria-label="Rotate right"><RotateRightIcon /></button>
        <button type="button" className={`${tool} bg-slate-400`} onClick={() => { setZoom(1); setRotation(0); }} aria-label="Reset view"><RefreshIcon className="h-4 w-4" /></button>
        {request && (
          <a href={api.fileUrl(request.id, kind, true)} className={`${tool} bg-brand-midnight`} aria-label="Download" title="Download">
            <DownloadIcon />
          </a>
        )}
      </div>

      {/* viewer */}
      <div className="relative flex h-[58vh] items-center justify-center overflow-auto rounded-xl bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:22px_22px] ring-1 ring-slate-200">
        {loading && <div className="flex flex-col items-center gap-2 text-slate-500"><Spinner className="h-7 w-7 text-brand-blue" /><span className="text-sm">Loading document...</span></div>}
        {!loading && error && <p className="px-6 text-center text-sm text-red-600">{error}</p>}
        {!loading && url && type === 'image' && (
          <img src={url} alt={TITLES[kind]} className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} />
        )}
        {!loading && url && type === 'pdf' && (
          <div className="h-full w-full transition-transform duration-200" style={{ transform: `rotate(${rotation}deg)` }}>
            <iframe title={TITLES[kind]} src={`${url}#view=FitH`} className="h-full w-full bg-white" />
          </div>
        )}
      </div>

      {/* CMR password */}
      {kind === 'cmr' && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm ring-1 ring-amber-200">
          <KeyIcon className="h-4 w-4 text-amber-600" />
          {!password && (
            <>
              <span className="text-amber-900">If the CMR asks for a password:</span>
              <Button size="xs" variant="outline" onClick={showPassword} loading={passwordLoading}>Show CMR password</Button>
            </>
          )}
          {password && !password.protected && <span className="text-amber-900">This CMR is not password protected.</span>}
          {password?.protected && (
            <>
              <span className="text-amber-900">CMR password:</span>
              <code className="rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-bold text-slate-900 ring-1 ring-amber-200">{password.password}</code>
              <button type="button" className="text-xs font-semibold text-amber-700 hover:underline"
                onClick={() => navigator.clipboard?.writeText(password.password).then(() => toast.success('Copied'))}>Copy</button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
