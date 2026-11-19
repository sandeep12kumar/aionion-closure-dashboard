import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-page px-4 text-center">
      <img src="/assets/aionion-logo.png" alt="Aionion Capital" className="h-12" />
      <h1 className="text-7xl font-extrabold text-brand-gradient">404</h1>
      <p className="text-slate-600">This page does not exist.</p>
      <Link to="/" className="rounded-xl bg-brand-gradient px-5 py-2.5 font-semibold text-white shadow-brand">Back to Dashboard</Link>
    </div>
  );
}
