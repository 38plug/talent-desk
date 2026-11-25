import type { Candidate, Offer } from '@/lib/types'

/**
 * Estimate desk commission from a linked offer (and optional candidate salary for %).
 * Forex fixed → commissionValue; forex % → of expectedSalary / offer salary / salaryMin;
 * Chinese package → commission.
 */
export function estimateOfferCommission(
  offer: Offer | null | undefined,
  candidate?: Candidate | null,
): number | null {
  if (!offer) return null

  if (offer.category === 'chinese') {
    const n = offer.commission
    return n != null && Number.isFinite(n) && n >= 0 ? n : null
  }

  if (offer.commissionType === 'percent') {
    const rate = offer.commissionValue
    if (rate == null || !Number.isFinite(rate)) return null
    const base =
      candidate?.expectedSalary ?? offer.salary ?? offer.salaryMin ?? offer.salaryMax ?? null
    if (base == null || !Number.isFinite(base)) return null
    return Math.round(((base * rate) / 100) * 100) / 100
  }

  const fixed = offer.commissionValue ?? offer.commission
  return fixed != null && Number.isFinite(fixed) && fixed >= 0 ? fixed : null
}
