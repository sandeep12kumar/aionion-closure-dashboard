import Button from '../common/Button.jsx';
import { CheckIcon, FileIcon, PenIcon, SlashCircleIcon, UndoIcon } from '../common/Icons.jsx';

/** Text shown only on very wide screens; icon + tooltip + screen-reader label otherwise. */
const Label = ({ children }) => (
  <>
    <span className="hidden 2xl:inline">{children}</span>
    <span className="sr-only 2xl:hidden">{children}</span>
  </>
);

/** Action buttons for one Maker & Checker row. */
export default function RowActions({ row, canAct, isAdmin, onView, onDecide, onMoveToBucket }) {
  const pdfKind = row.files.signed ? 'signed' : row.files.unsigned ? 'unsigned' : null;
  const notEsigned = 'Available after the client eSigns the closure form';
  const view = '!px-2 2xl:!px-2.5';

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button size="xs" variant="outline" disabled={!pdfKind} onClick={() => onView(row, pdfKind)} className={view}
        title={pdfKind === 'signed' ? 'View eSigned closure form' : pdfKind ? 'View closure form (not yet eSigned)' : 'Closure form not generated yet'}>
        <FileIcon className="h-4 w-4" /><Label>{pdfKind === 'unsigned' ? 'Form' : 'PDF'}</Label>
      </Button>

      {row.tab === 'bucket' && (
        <>
          <Button size="xs" variant="success" disabled={!canAct || !row.canDecide} onClick={() => onDecide(row, 'COMPLETE')}
            title={!canAct ? 'Read-only access' : row.canDecide ? 'Mark as Complete' : notEsigned}>
            <CheckIcon className="h-4 w-4" />Complete
          </Button>
          <Button size="xs" variant="outline" disabled={!canAct} onClick={() => onDecide(row, 'NO_NEED')}
            className="!text-violet-700 hover:!border-violet-300 hover:!bg-violet-50" title={canAct ? 'Mark as No Need' : 'Read-only access'}>
            <SlashCircleIcon className="h-4 w-4" />No Need
          </Button>
        </>
      )}

      <Button size="xs" variant="outline" disabled={!row.files.cmr} onClick={() => onView(row, 'cmr')}
        className={`${view} !text-rose-700 hover:!border-rose-300 hover:!bg-rose-50`} title={row.files.cmr ? 'View CMR' : 'No CMR uploaded (no transfer)'}>
        <FileIcon className="h-4 w-4" /><Label>CMR</Label>
      </Button>
      <Button size="xs" variant="outline" disabled={!row.files.signature} onClick={() => onView(row, 'signature')}
        className={`${view} !text-rose-700 hover:!border-rose-300 hover:!bg-rose-50`} title={row.files.signature ? 'View signature' : 'Signature not uploaded yet'}>
        <PenIcon className="h-4 w-4" /><Label>Signature</Label>
      </Button>

      {row.tab !== 'bucket' && isAdmin && (
        <Button size="xs" variant="ghost" onClick={() => onMoveToBucket(row)} title="Undo the decision and move back to Bucket">
          <UndoIcon className="h-4 w-4" />Bucket
        </Button>
      )}
    </div>
  );
}
