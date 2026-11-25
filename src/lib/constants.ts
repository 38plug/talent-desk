export const APP_NAME = 'Talent Desk'
export const APP_TAGLINE = 'Forex Recruiting Command Center'

export const OWNER_EMAIL = 'qrrupt@gmail.com'
/** Preferred desk admin (not co-owner). One-time localStorage bootstrap promotes this seat to `admin`. */
export const PRIMARY_ADMIN_EMAIL = 'prof@gmail.com'
export const MAX_ACCOUNTS = 4

export const ROLES = ['owner', 'admin', 'moderator', 'user'] as const
export type Role = (typeof ROLES)[number]

/** Assignable from Admin Actions (owner stays protected / unassignable). */
export const MANAGEABLE_ROLES: Role[] = ['admin', 'moderator', 'user']

export const ADMIN_VIEW_ROLES: Role[] = ['owner', 'admin', 'moderator']
export const ADMIN_MANAGE_ROLES: Role[] = ['owner', 'admin']

/** Every signed-in role may see/create/edit/remove desk-shared offers & candidates. */
export const PIPELINE_ROLES: Role[] = ['owner', 'admin', 'moderator', 'user']

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

/** Same values as offer categories — single-select desk market on candidates. */
export const CANDIDATE_MARKETS = OFFER_CATEGORIES
export type CandidateMarket = OfferCategory

export function marketLabel(market: CandidateMarket | null | undefined): string {
  if (market === 'forex') return 'Forex'
  if (market === 'chinese') return 'Chinese'
  return '—'
}

/** Single-select gender on candidates (null = unset / legacy rows). */
export const CANDIDATE_GENDERS = ['male', 'female'] as const
export type CandidateGender = (typeof CANDIDATE_GENDERS)[number]

export function genderLabel(gender: CandidateGender | null | undefined): string {
  if (gender === 'male') return 'Male'
  if (gender === 'female') return 'Female'
  return '—'
}

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
