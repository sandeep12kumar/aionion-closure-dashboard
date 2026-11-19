import { Spinner } from './Spinner.jsx';

const VARIANTS = {
  primary: 'bg-brand-gradient text-white shadow-brand hover:brightness-110',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:border-brand-blue/40 hover:bg-brand-mist/60 hover:text-brand-blue',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  violet: 'bg-violet-600 text-white hover:bg-violet-700',
};

const SIZES = {
  xs: 'h-8 px-2.5 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-3.5 text-sm gap-2 rounded-xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

export default function Button({
  children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', type = 'button', ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center whitespace-nowrap font-semibold transition
        disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
