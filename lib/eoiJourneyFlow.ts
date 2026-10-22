/**
 * Step order for the express-interest journeys. Kept free of React so the
 * ordering and guard rules can be unit tested.
 *
 *   v1  /apps/[slug]/express-interest  details first, then a one-time code
 *   v2  /apps/[slug]/get-in-touch      why you're interested first, one question per page,
 *                                      details last, no code
 */

export type EoiStep =
  | 'start'
  | 'details'
  | 'verify'
  | 'support'
  | 'timing'
  | 'timeline'
  | 'population'
  | 'workflow'
  | 'check-answers'
  | 'confirmation'

export type EoiFlow = 'v1' | 'v2'

export const EOI_FLOWS: Record<EoiFlow, readonly EoiStep[]> = {
  v1: ['start', 'details', 'verify', 'support', 'timing', 'check-answers', 'confirmation'],
  v2: ['start', 'support', 'timeline', 'population', 'workflow', 'details', 'check-answers', 'confirmation'],
}

/** The answers the guards need; the journey provider's data satisfies this. */
export type EoiStepAnswers = {
  name: string
  email: string
  role: string
  organisation: string
  help: string[]
  helpOtherDetails: string
  timeline: string
  verified: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** All required "Your details" fields present and plausible. */
export function isDetailsComplete(a: EoiStepAnswers): boolean {
  return (
    a.name.trim() !== '' &&
    EMAIL_PATTERN.test(a.email.trim()) &&
    a.role.trim() !== '' &&
    a.organisation.trim() !== ''
  )
}

/** Whether a step's required answers are present. Optional-only steps are always complete. */
export function isStepComplete(step: EoiStep, a: EoiStepAnswers): boolean {
  switch (step) {
    case 'details':
      return isDetailsComplete(a)
    case 'verify':
      return a.verified
    case 'timeline':
      // v2 asks this on its own page, so it is required there; v1's timing page keeps it optional.
      return a.timeline !== ''
    case 'support':
      return a.help.length > 0 && (!a.help.includes('other') || a.helpOtherDetails.trim() !== '')
    default:
      return true
  }
}

export function nextStep(flow: EoiFlow, step: EoiStep): EoiStep | null {
  const steps = EOI_FLOWS[flow]
  const i = steps.indexOf(step)
  return i >= 0 && i < steps.length - 1 ? steps[i + 1] : null
}

export function prevStep(flow: EoiFlow, step: EoiStep): EoiStep | null {
  const steps = EOI_FLOWS[flow]
  const i = steps.indexOf(step)
  return i > 0 ? steps[i - 1] : null
}

/**
 * The earliest step before `step` whose required answers are missing, or null
 * when the user may be on `step`. Steps use this to redirect deep links.
 */
export function firstIncompleteStep(flow: EoiFlow, step: EoiStep, a: EoiStepAnswers): EoiStep | null {
  const steps = EOI_FLOWS[flow]
  const i = steps.indexOf(step)
  for (const earlier of steps.slice(0, Math.max(i, 0))) {
    if (!isStepComplete(earlier, a)) return earlier
  }
  return null
}
