import {
  INTERVIEW_OUTCOME_CONFIRMED,
  INTERVIEW_OUTCOME_DECLINED,
  type PipelineStage,
} from '@/lib/constants'

/** Map interview outcome → candidate pipeline stage. */
export function stageForInterviewOutcome(
  outcome: string | null | undefined,
): PipelineStage {
  if (outcome === INTERVIEW_OUTCOME_CONFIRMED) return 'Accepted'
  if (outcome === INTERVIEW_OUTCOME_DECLINED) return 'Rejected'
  // Scheduled / blank / free-text → Interview
  return 'Interview'
}
