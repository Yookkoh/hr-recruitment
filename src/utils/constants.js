export const STATUS_OPTIONS = ['Pending', 'Active', 'Rejected', 'Withdrawn', 'Completed']
export const STAGE_OPTIONS  = ['Interview', 'Approval', 'Offer', 'Onboarding', 'Closed']
export const TYPE_OPTIONS   = ['New', 'Replacement', 'Contract']

export const STATUS_COLORS = {
  Pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-200',
  Active:    'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  Rejected:  'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
  Withdrawn: 'bg-gray-100 text-gray-700 dark:bg-slate-700/60 dark:text-slate-200',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-sky-500/15 dark:text-sky-200',
}

export const STAGE_COLORS = {
  Interview:  'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200',
  Approval:   'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
  Offer:      'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200',
  Onboarding: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200',
  Closed:     'bg-gray-100 text-gray-700 dark:bg-slate-700/60 dark:text-slate-200',
}

export const ROLES = { admin: 'admin', recruiter: 'recruiter', executive: 'executive' }
