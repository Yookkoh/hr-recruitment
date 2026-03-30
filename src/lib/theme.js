export const THEME_STORAGE_KEY = 'staff-tracker-theme'
export const THEME_META_COLORS = {
  light: '#edf3f9',
  dark: '#020617',
}

export function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getInitialTheme() {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.dataset.theme
    if (theme === 'light' || theme === 'dark') return theme
  }

  if (typeof window === 'undefined') return 'light'

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  } catch {
    return getSystemTheme()
  }

  return getSystemTheme()
}

export function applyTheme(theme, root = document.documentElement) {
  root.dataset.theme = theme
  root.style.colorScheme = theme
  root.classList.toggle('dark', theme === 'dark')

  const themeColorMeta = root.ownerDocument?.querySelector?.('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', THEME_META_COLORS[theme] ?? THEME_META_COLORS.light)
  }
}
