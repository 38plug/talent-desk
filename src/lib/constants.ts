export const APP_NAME = 'Talent Desk'
export const APP_TAGLINE = 'Forex Recruiting Command Center'

export const OWNER_EMAIL = 'qrrupt@gmail.com'
export const MAX_ACCOUNTS = 4

export const ROLES = ['owner', 'admin', 'moderator', 'user'] as const
export type Role = (typeof ROLES)[number]

export const ADMIN_VIEW_ROLES: Role[] = ['owner', 'admin', 'moderator']
export const ADMIN_MANAGE_ROLES: Role[] = ['owner', 'admin']

export const PIPELINE_STAGES = [
  'Screening',
  'Interview',
  'Offer',
  'Accepted',
  'Hired',
  'Rejected',
] as const
export type PipelineStage = (typeof PIPELINE_STAGES)[number]

export const EARNING_STATUSES = ['Estimated', 'Pending', 'Paid', 'Overdue'] as const
export type EarningStatus = (typeof EARNING_STATUSES)[number]

export const OFFER_CATEGORIES = ['forex', 'chinese'] as const
export type OfferCategory = (typeof OFFER_CATEGORIES)[number]

export const OFFER_STATUSES = ['Live', 'Paused', 'Closed'] as const
export type OfferStatus = (typeof OFFER_STATUSES)[number]

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: 'LayoutDashboard', index: '01' },
  { to: '/candidates', label: 'Candidates', icon: 'Users', index: '02' },
  { to: '/offers', label: 'Offers', icon: 'Briefcase', index: '03' },
  { to: '/interviews', label: 'Interviews', icon: 'Calendar', index: '04' },
  { to: '/earnings', label: 'Earnings', icon: 'Wallet', index: '05' },
  { to: '/settings', label: 'Settings', icon: 'Settings', index: '06' },
] as const

export const ADMIN_NAV = {
  to: '/admin',
  label: 'Admin',
  icon: 'Shield',
  index: '07',
} as const
