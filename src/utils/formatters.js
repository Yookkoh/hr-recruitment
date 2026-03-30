export function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (isNaN(date)) return value

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(value) {
  if (value == null || value === '') return '-'
  return `MVR ${Number(value).toLocaleString()}`
}

export function formatPhone(value) {
  if (!value) return '-'
  return String(value)
}
