export const STATUS_OPTIONS = ['Pending', 'Active', 'Rejected', 'Withdrawn', 'Completed']
export const STAGE_OPTIONS  = ['Interview', 'Approval', 'Offer', 'Onboarding', 'Closed']
export const TYPE_OPTIONS   = ['New', 'Replacement', 'Contract']

export const STATUS_COLORS = {
  Pending:   'bg-yellow-100 text-yellow-800',
  Active:    'bg-green-100 text-green-800',
  Rejected:  'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-700',
  Completed: 'bg-blue-100 text-blue-800',
}

export const STAGE_COLORS = {
  Interview:  'bg-sky-100 text-sky-800',
  Approval:   'bg-purple-100 text-purple-800',
  Offer:      'bg-orange-100 text-orange-800',
  Onboarding: 'bg-teal-100 text-teal-800',
  Closed:     'bg-gray-100 text-gray-700',
}

export const ROLES = { HR: 'HR', DCOO: 'DCOO', MD: 'MD' }
