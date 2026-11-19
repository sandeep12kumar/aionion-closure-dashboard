import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import ChangePasswordModal from '../components/common/ChangePasswordModal.jsx';
import {
  ChevronDownIcon, DashboardIcon, GridCheckIcon, KeyIcon, LogoutIcon, MenuIcon, SearchIcon, ShieldIcon, XIcon,
} from '../components/common/Icons.jsx';
import { formatDateTime, initials } from '../utils/format.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/maker-checker', label: 'Maker & Checker', icon: GridCheckIcon },
];

const ROLE_LABEL = { ADMIN: 'Administrator', OPERATIONS: 'Operations', VIEWER: 'Viewer' };

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center px-6">
        <img src="/assets/aionion-logo.png" alt="Aionion Capital" className="h-11 w-auto" />
      </div>
      <p className="px-6 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Account Closure</p>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition
              ${isActive ? 'bg-brand-gradient text-white shadow-brand' : 'text-slate-600 hover:bg-brand-mist hover:text-brand-blue'}`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 overflow-hidden rounded-2xl bg-brand-gradient p-4 text-white">
        <div className="flex items-center gap-2 text-sm font-bold"><ShieldIcon className="h-4 w-4 text-brand-coral" />Back office</div>
        <p className="mt-1 text-xs leading-relaxed text-white/70">Every view and decision is recorded in the admin logs.</p>
      </div>
    </div>
  );
}

/** Sidebar (Dashboard, Maker & Checker) + top bar (search, user menu) + page outlet. */
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef(null);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/maker-checker${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
  };

  const onLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-page">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-midnight/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="relative h-full w-72 animate-fade-up bg-white shadow-2xl">
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-6 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
              <XIcon />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:h-20 sm:px-8">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
              <MenuIcon />
            </button>

            <form onSubmit={search} className="relative hidden max-w-md flex-1 sm:block">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search client code, name, PAN, mobile..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10"
              />
            </form>

            <div className="ml-auto flex items-center gap-3">
              <div className="relative" ref={menuRef}>
                <button type="button" onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition hover:bg-slate-100" aria-haspopup="menu" aria-expanded={menuOpen}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white ring-2 ring-brand-coral/40">
                    {initials(user?.name)}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-[160px] truncate text-sm font-bold text-slate-900">{user?.name}</span>
                    <span className="block text-[11px] font-medium text-slate-500">{ROLE_LABEL[user?.role]}</span>
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                </button>

                {menuOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-64 animate-fade-up overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-900/5">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                      {user?.lastLoginAt && <p className="mt-1 text-[11px] text-slate-400">Previous login: {formatDateTime(user.lastLoginAt)}</p>}
                    </div>
                    <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setPasswordOpen(true); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <KeyIcon className="h-4 w-4" /> Change password
                    </button>
                    <button type="button" role="menuitem" onClick={onLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                      <LogoutIcon className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>

      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}
