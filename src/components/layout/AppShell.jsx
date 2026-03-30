import { Outlet } from 'react-router-dom'
import InstallAppBanner from './InstallAppBanner'
import MobileDock from './MobileDock'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell() {
  return (
    <div className="relative flex min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-100/80 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-100/80 blur-3xl" />
      </div>

      <aside className="relative hidden w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] md:px-6 md:py-4 lg:gap-6 lg:px-8 lg:py-6 lg:pb-6">
            <Outlet />
          </div>
        </main>
        <InstallAppBanner />
        <MobileDock />
      </div>
    </div>
  )
}
