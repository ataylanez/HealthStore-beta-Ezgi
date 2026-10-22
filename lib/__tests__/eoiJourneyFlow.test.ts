import { describe, it, expect } from 'vitest'
import {
  firstIncompleteStep,
  isStepComplete,
  nextStep,
  prevStep,
  type EoiStepAnswers,
} from '@/lib/eoiJourneyFlow'

const EMPTY: EoiStepAnswers = {
  name: '',
  email: '',
  role: '',
  organisation: '',
  help: [],
  helpOtherDetails: '',
  timeline: '',
  verified: false,
}

const DETAILS = { name: 'Sam Lee', email: 'sam@nhs.net', role: 'Commissioner', organisation: 'NHS Example ICB' }

describe('nextStep / prevStep', () => {
  it('v1 asks for details and a code before the questions', () => {
    expect(nextStep('v1', 'start')).toBe('details')
    expect(nextStep('v1', 'details')).toBe('verify')
    expect(nextStep('v1', 'verify')).toBe('support')
    expect(prevStep('v1', 'check-answers')).toBe('timing')
  })

  it('v2 asks the questions first, details last, with no code', () => {
    expect(nextStep('v2', 'start')).toBe('support')
    expect(nextStep('v2', 'support')).toBe('timeline')
    expect(nextStep('v2', 'timeline')).toBe('population')
    expect(nextStep('v2', 'population')).toBe('workflow')
    expect(nextStep('v2', 'workflow')).toBe('details')
    expect(nextStep('v2', 'details')).toBe('check-answers')
    expect(prevStep('v2', 'support')).toBe('start')
    expect(prevStep('v2', 'check-answers')).toBe('details')
    expect(nextStep('v2', 'verify')).toBeNull()
  })

  it('returns null at the ends of the flow', () => {
    expect(prevStep('v2', 'start')).toBeNull()
    expect(nextStep('v2', 'confirmation')).toBeNull()
  })
})

describe('isStepComplete', () => {
  it('requires a detail for "Other" support', () => {
    expect(isStepComplete('support', { ...EMPTY, help: ['other'] })).toBe(false)
    expect(isStepComplete('support', { ...EMPTY, help: ['other'], helpOtherDetails: 'Training' })).toBe(true)
  })

  it('rejects an implausible email', () => {
    expect(isStepComplete('details', { ...EMPTY, ...DETAILS, email: 'sam' })).toBe(false)
    expect(isStepComplete('details', { ...EMPTY, ...DETAILS })).toBe(true)
  })

  it('treats optional-only steps as complete', () => {
    expect(isStepComplete('timing', EMPTY)).toBe(true)
  })
})

describe('firstIncompleteStep', () => {
  it('v2 sends a deep link to details back to support when nothing is selected', () => {
    expect(firstIncompleteStep('v2', 'details', EMPTY)).toBe('support')
  })

  it('v2 requires a timeline, then details, before check answers', () => {
    expect(firstIncompleteStep('v2', 'check-answers', { ...EMPTY, help: ['assess_fit'] })).toBe('timeline')
    expect(
      firstIncompleteStep('v2', 'check-answers', { ...EMPTY, help: ['assess_fit'], timeline: 'medium' }),
    ).toBe('details')
    expect(
      firstIncompleteStep('v2', 'check-answers', { ...EMPTY, ...DETAILS, help: ['assess_fit'], timeline: 'medium' }),
    ).toBeNull()
  })

  it('v2 lets the optional population and workflow pages be skipped', () => {
    expect(firstIncompleteStep('v2', 'details', { ...EMPTY, help: ['assess_fit'], timeline: 'medium' })).toBeNull()
  })

  it('v2 never requires the one-time code', () => {
    expect(
      firstIncompleteStep('v2', 'check-answers', {
        ...EMPTY,
        ...DETAILS,
        help: ['assess_fit'],
        timeline: 'medium',
        verified: false,
      }),
    ).toBeNull()
  })

  it('v1 keeps the timeline optional', () => {
    expect(
      firstIncompleteStep('v1', 'check-answers', { ...EMPTY, ...DETAILS, help: ['assess_fit'], verified: true }),
    ).toBeNull()
  })

  it('v1 still requires details then the code before support', () => {
    expect(firstIncompleteStep('v1', 'support', EMPTY)).toBe('details')
    expect(firstIncompleteStep('v1', 'support', { ...EMPTY, ...DETAILS })).toBe('verify')
  })

  it('lets the first question page through with no answers', () => {
    expect(firstIncompleteStep('v2', 'support', EMPTY)).toBeNull()
  })
})
