import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './Icons.jsx';

const WIDTHS = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' };

/** Accessible modal (Esc / backdrop to close). */
export default function Modal({ open, onClose, title, subtitle, icon, children, footer, size = 'md', closeOnBackdrop = true }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-brand-midnight/50 backdrop-blur-[2px]" onClick={closeOnBackdrop ? onClose : undefined} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}
        className={`relative flex max-h-[92vh] w-full ${WIDTHS[size]} animate-fade-up flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              {icon && <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-blue">{icon}</span>}
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
                {subtitle && <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
              </div>
            </div>
            {onClose && (
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Close">
                <XIcon />
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
