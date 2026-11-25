import type {
  CandidateGender,
  EarningStatus,
  OfferCategory,
  OfferStatus,
  PipelineStage,
  Role,
} from './constants'

export type Profile = {
  id: string
  email: string
  fullName: string | null
  role: Role
  createdAt: string
}

export type Offer = {
  id: string
  userId: string
  title: string
  company: string | null
  category: OfferCategory
  status: OfferStatus
  commissionType: 'fixed' | 'percent'
  commissionValue: number | null
  commission: number | null
  salaryMin: number | null
  salaryMax: number | null
  salary: number | null
  location: string | null
  telegram: string | null
  description: string | null
  // Chinese package fields
  roleType: string | null
  accommodation: boolean | null
  visa: boolean | null
  flight: boolean | null
  videoCall: boolean | null
  createdAt: string
  updatedAt: string
}

export type Candidate = {
  id: string
  userId: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  stage: PipelineStage
  /** Desk market tag — Forex or Chinese (null = unset / legacy rows). */
  market: OfferCategory | null
  /** Candidate gender — male | female (null = unset / legacy rows). */
  gender: CandidateGender | null
  offerId: string | null
  telegram: string | null
  sentBy: string | null
  country: string | null
  age: number | null
  languages: string | null
  currentLocation: string | null
  notes: string | null
  expectedSalary: number | null
  createdAt: string
  updatedAt: string
}

export type Interview = {
  id: string
  userId: string
  candidateId: string
  offerId: string | null
  scheduledAt: string
  outcome: string | null
  notes: string | null
  createdAt: string
}

export type Earning = {
  id: string
  userId: string
  candidateId: string | null
  offerId: string | null
  amount: number
  status: EarningStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type Activity = {
  id: string
  userId: string
  entityType: string
  entityId: string | null
  message: string
  createdAt: string
}

export type DashboardMetrics = {
  totalIncome: number
  estimated: number
  candidates: number
  liveOffers: number
  interviewsUpcoming: number
  pendingEarnings: number
  paidEarnings: number
  overdueEarnings: number
  stageCounts: Record<string, number>
  incomeSeries: { label: string; income: number; estimated: number }[]
  estimatedList: Array<Earning & { candidateName?: string }>
  attention: AttentionItem[]
  recentCandidates: Candidate[]
  activity: Activity[]
  isDemo: boolean
}

export type AttentionItem = {
  id: string
  kind: 'overdue' | 'interview' | 'estimate' | 'stage'
  title: string
  subtitle: string
  href: string
}

export type AdminStats = {
  accounts: number
  seatsUsed: number
  seatsMax: number
  candidates: number
  offers: number
  interviews: number
  earnings: number
  estimated: number
  perAccount: Array<{
    id: string
    email: string
    fullName: string | null
    role: Role
    candidates: number
    offers: number
    interviews: number
    earnings: number
  }>
}

export type OfferFormValues = {
  title: string
  company: string
  category: OfferCategory
  status: OfferStatus
  commissionType: 'fixed' | 'percent'
  commissionValue: string
  commission: string
  salaryMin: string
  salaryMax: string
  salary: string
  location: string
  telegram: string
  description: string
  roleType: string
  accommodation: boolean
  visa: boolean
  flight: boolean
  videoCall: boolean
}
