import { useEffect, useState } from 'react'

const DISMISS_KEY = 'staff-tracker-install-banner-dismissed-v1'

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true
}

function isIosSafari() {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios|opr\//.test(userAgent)

  return isIosDevice && isSafari
}

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [standalone, setStandalone] = useState(() => isStandaloneMode())
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1')
    } catch {
      setDismissed(false)
    }

    setStandalone(isStandaloneMode())
    setShowIosHint(isIosSafari())

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)')
    const handleDisplayModeChange = event => setStandalone(event.matches)
    const handleBeforeInstallPrompt = event => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const handleInstalled = () => {
      setDeferredPrompt(null)
      setStandalone(true)
      setDismissed(true)
    }

    if (mediaQuery?.addEventListener) mediaQuery.addEventListener('change', handleDisplayModeChange)
    else mediaQuery?.addListener?.(handleDisplayModeChange)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      if (mediaQuery?.removeEventListener) mediaQuery.removeEventListener('change', handleDisplayModeChange)
      else mediaQuery?.removeListener?.(handleDisplayModeChange)

      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  function handleDismiss() {
    setDismissed(true)

    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Ignore storage issues and keep the banner dismissed for this session.
    }
  }

  async function handleInstall() {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      handleDismiss()
    }

    setDeferredPrompt(null)
  }

  if (dismissed || standalone || (!deferredPrompt && !showIosHint)) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.8rem)] z-20 px-4 sm:px-6 lg:hidden">
      <div className="pointer-events-auto mx-auto max-w-lg rounded-[26px] border border-white/70 bg-white/92 p-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/92 dark:shadow-[0_32px_90px_-48px_rgba(2,6,23,0.98)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-extrabold text-white dark:bg-slate-100 dark:text-slate-950">
            ST
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Install Staff Tracker</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {deferredPrompt
                ? 'Add it to your home screen for full-screen navigation, faster startup, and a cleaner mobile workflow.'
                : 'On iPhone, open Safari share menu and tap Add to Home Screen for the best app-like experience.'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950"
                >
                  Install App
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
