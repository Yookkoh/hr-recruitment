import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-brand-600',
  }

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${styles[type]}`}>
      {message}
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-white">✕</button>
    </div>
  )
}
