import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getNavigationItems } from './navigation'

function DockItem({ item }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1.5 py-2 text-center transition-all ${
          isActive
            ? 'bg-slate-950 text-white shadow-[0_20px_34px_-24px_rgba(15,23,42,0.95)] dark:bg-slate-100 dark:text-slate-950'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        }`
      }
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-current/10">
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate text-[10px] font-semibold tracking-tight">{item.mobileLabel ?? item.label}</span>
    </NavLink>
  )
}

export default function MobileDock() {
  const { role } = useAuth()
  const items = getNavigationItems(role)

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-2 lg:hidden">
      <nav className="pointer-events-auto mx-auto max-w-lg rounded-[26px] border border-white/70 bg-white/92 p-1.5 shadow-[0_32px_80px_-44px_rgba(15,23,42,0.65)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92 dark:shadow-[0_36px_90px_-50px_rgba(2,6,23,0.98)] pb-[calc(env(safe-area-inset-bottom)+0.35rem)]">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map(item => (
            <DockItem key={item.key} item={item} />
          ))}
        </div>
      </nav>
    </div>
  )
}
