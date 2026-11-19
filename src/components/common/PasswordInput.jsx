import { useId, useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons.jsx';

export default function PasswordInput({ label, error, className = '', ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="field-label">{label}</label>}
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} className={`field-input pr-11 ${error ? 'border-red-500' : ''}`} {...props} />
        <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-brand-blue">
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
