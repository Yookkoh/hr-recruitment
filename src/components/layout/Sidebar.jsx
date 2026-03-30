import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-600 text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function Sidebar({ onClose }) {
  const { role } = useAuth()

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            ST
          </div>
          <span className="font-bold text-gray-900">Staff Tracker</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600 lg:hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavItem to="/" end icon="📋" label="Dashboard" />

        {role === 'HR' && (
          <NavItem to="/records/new"  icon="➕" label="Add Record" />
        )}
        {role === 'HR' && (
          <NavItem to="/records/bulk" icon="📥" label="Bulk Upload" />
        )}
        {role === 'admin' && (
          <NavItem to="/admin/users" icon="👥" label="Users" />
        )}
      </nav>
    </div>
  )
}
