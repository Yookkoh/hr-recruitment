import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getNavigationItems } from './navigation'

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all ${
          isActive
            ? 'bg-white text-slate-950 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)]'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <span className="flex h-5 w-5 items-center justify-center"><Icon /></span>
      {label}
    </NavLink>
  )
}

export default function Sidebar({ onClose }) {
  const { role } = useAuth()
  const items = getNavigationItems(role)

  return (
    <div className="relative flex h-full flex-col overflow-hidden border-r border-white/10 bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-0 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative flex h-20 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-extrabold text-white shadow-[0_18px_40px_-22px_rgba(37,99,235,0.8)]">
            ST
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Operations</p>
            <p className="text-sm font-semibold text-white">Staff Tracker</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative px-5 pb-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Access</p>
          <p className="mt-1 text-sm font-medium text-slate-100 capitalize">{role || 'team member'}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Manage recruitment workflows, updates, and reporting from a single workspace.</p>
        </div>
      </div>

      <div className="relative px-5">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
      </div>

      <nav className="relative flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {items.map(item => (
          <NavItem key={item.key} to={item.to} end={item.end} icon={item.icon} label={item.label} onClick={onClose} />
        ))}
      </nav>

      <div className="relative border-t border-white/10 px-5 py-4 text-xs leading-5 text-slate-400">
        Recruitment operations workspace with status tracking, filters, exports, and account management.
      </div>
    </div>
  )
}
