export default function Spinner({ className = '' }) {
  return (
    <div className={`h-6 w-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent ${className}`} />
  )
}
