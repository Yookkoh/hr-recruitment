export function DashboardIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4v16M4 10.5h16" />
    </svg>
  )
}

export function PlusIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function UploadIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16V4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m7 9 5-5 5 5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16.75A2.75 2.75 0 0 1 6.75 14h10.5A2.75 2.75 0 0 1 20 16.75v.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25v-.5Z" />
    </svg>
  )
}

export function UsersIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.5 7.5a3 3 0 1 1 5.999 0 3 3 0 0 1-6 0ZM2.5 8.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M1.5 18.25A4.75 4.75 0 0 1 6.25 13.5h1.5A4.75 4.75 0 0 1 12.5 18.25V20h-11v-1.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 19.5v-1a4 4 0 0 1 4-4h.5a4 4 0 0 1 4 4v1" />
    </svg>
  )
}

function canManageRecords(role) {
  return ['recruiter', 'admin'].includes(role)
}

export function getNavigationItems(role) {
  const items = [
    {
      key: 'dashboard',
      to: '/',
      end: true,
      label: 'Dashboard',
      mobileLabel: 'Home',
      icon: DashboardIcon,
    },
  ]

  if (canManageRecords(role)) {
    items.push(
      {
        key: 'new-record',
        to: '/records/new',
        label: 'Add Record',
        mobileLabel: 'New',
        icon: PlusIcon,
      },
      {
        key: 'bulk-upload',
        to: '/records/bulk',
        label: 'Bulk Upload',
        mobileLabel: 'Import',
        icon: UploadIcon,
      },
    )
  }

  if (role === 'admin') {
    items.push({
      key: 'users',
      to: '/admin/users',
      label: 'Users',
      mobileLabel: 'Users',
      icon: UsersIcon,
    })
  }

  return items
}
