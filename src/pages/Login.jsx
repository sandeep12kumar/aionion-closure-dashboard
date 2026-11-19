import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';
import Button from '../components/common/Button.jsx';
import PasswordInput from '../components/common/PasswordInput.jsx';
import { CheckCircleIcon, GridCheckIcon, LockIcon, MailIcon, ShieldIcon } from '../components/common/Icons.jsx';

const FEATURES = [
  { icon: GridCheckIcon, text: 'Maker & Checker review of every closure request' },
  { icon: CheckCircleIcon, text: 'Signature, CMR and eSigned form in one place' },
  { icon: ShieldIcon, text: 'Every view and decision recorded in admin logs' },
];

/** Illustration: a phone showing an account-closure confirmation with a "CLOSED" stamp. */
function ClosureIllustration() {
  return (
    <div className="relative mx-auto mt-10 h-72 w-60">
      <div className="absolute inset-0 rotate-[-4deg] rounded-[2.2rem] bg-white/10 ring-1 ring-white/20" />
      <div className="absolute inset-2 rounded-[2rem] bg-white p-4 shadow-2xl">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-200" />
        <div className="mt-5 flex items-center gap-2">
          <img src="/assets/aionion-icon.png" alt="" className="h-7 w-7" />
          <span className="text-xs font-bold text-brand-midnight">Account Closure</span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full rounded bg-slate-100" />
          <div className="h-2 w-4/5 rounded bg-slate-100" />
          <div className="h-2 w-3/5 rounded bg-slate-100" />
        </div>
        <div className="mt-5 rounded-xl bg-brand-mist p-3">
          <p className="text-[10px] font-semibold text-brand-midnight">Request ACR2026...</p>
          <div className="mt-2 flex gap-2">
            <span className="h-5 flex-1 rounded-md bg-brand-blue/80" />
            <span className="h-5 flex-1 rounded-md bg-white ring-1 ring-brand-blue/30" />
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 -rotate-12 rounded-lg border-4 border-brand-coral bg-white/80 px-4 py-1 text-2xl font-black tracking-widest text-brand-coral">
          CLOSED
        </div>
      </div>
      <div className="absolute -right-8 top-12 flex h-14 w-14 animate-float items-center justify-center rounded-2xl bg-brand-coral text-white shadow-xl">
        <LockIcon className="h-7 w-7" />
      </div>
      <div className="absolute -left-8 bottom-10 flex h-12 w-12 animate-float items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-xl [animation-delay:1.5s]">
        <CheckCircleIcon className="h-7 w-7" />
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await login({ ...form, email: form.email.trim() });
      toast.success(`Welcome, ${user.name}`);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="bg-dots absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-coral/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-blue/50 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-coral">Back office</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight">Account Closure<br />Dashboard</h1>
          <ul className="mt-6 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20"><Icon className="h-4 w-4" /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex-1"><ClosureIllustration /></div>
        <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Research &nbsp;|&nbsp; Trust &nbsp;|&nbsp; Forever</p>
      </aside>

      {/* Form */}
      <main className="flex min-h-screen flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <img src="/assets/aionion-logo.png" alt="Aionion Capital" className="h-14 w-auto" />

          <h2 className="mt-12 text-3xl font-extrabold tracking-tight text-brand-blue">Login</h2>
          <p className="mt-4 text-lg font-bold text-slate-900">Welcome to the Admin Login!</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Please enter your credentials to access your account and manage closure requests.
          </p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input id="email" type="email" autoComplete="username" autoFocus value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setError(''); }}
                  placeholder="you@aionioncapital.com" className="field-input h-12 pl-11" />
              </div>
            </div>

            <PasswordInput
              label="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setError(''); }}
              placeholder="Enter your password"
              className="[&_input]:h-12"
            />

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input type="checkbox" checked={form.remember} onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 accent-brand-blue" />
              Keep me logged in
            </label>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">{error}</p>}

            <Button type="submit" size="lg" loading={loading} className="w-full">Login</Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <LockIcon className="h-3.5 w-3.5" /> Forgot your password? Contact your dashboard administrator.
          </p>
        </div>
      </main>
    </div>
  );
}
