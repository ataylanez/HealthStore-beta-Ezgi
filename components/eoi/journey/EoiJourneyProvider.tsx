'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  firstIncompleteStep,
  isDetailsComplete,
  nextStep,
  prevStep,
  type EoiFlow,
  type EoiStep,
} from '@/lib/eoiJourneyFlow'

/**
 * Shared state for the express-interest journeys, which are split across one
 * route per step (GOV.UK one-question-per-page). Step order lives in
 * lib/eoiJourneyFlow.ts; v1 (below) and v2 (/apps/[slug]/get-in-touch:
 * start, support, timing, details, check-answers, confirmation) reuse the same
 * step components.
 *
 *   /apps/[slug]/express-interest                 start
 *   /apps/[slug]/express-interest/details         your details
 *   /apps/[slug]/express-interest/verify          one-time code
 *   /apps/[slug]/express-interest/support         what support do you need
 *   /apps/[slug]/express-interest/timing          timing and context
 *   /apps/[slug]/express-interest/check-answers   check your answers (submits)
 *   /apps/[slug]/express-interest/confirmation    confirmation panel
 *
 * The provider lives in the route-group layout, so it stays mounted while the
 * user navigates between steps. Answers are mirrored to sessionStorage so a
 * refresh or browser-back does not lose them. Steps guard themselves with
 * useStepGuard: if an earlier step's answers are missing (e.g. arriving at
 * /support in v1 without a verified email) they redirect back to that step.
 */

export const HELP_OPTIONS = [
  { id: 'assess_fit', label: 'Assess pathway fit' },
  { id: 'business_case', label: 'Build or review a business case' },
  { id: 'assurance', label: 'Clarify assurance and local work' },
  { id: 'commercial_route', label: 'Commercial route and buyer pack' },
  { id: 'implementation', label: 'Implementation planning' },
  { id: 'other', label: 'Other' },
] as const

export const TIMELINE_OPTIONS = [
  { id: 'immediate', label: 'Within 3 months' },
  { id: 'medium', label: '3 to 6 months' },
  { id: 'planning', label: '6 to 12 months' },
  { id: 'exploratory', label: 'Exploratory only' },
] as const

export const PROTOTYPE_OTP = '123456'

export type FieldError = { field: string; message: string }

export type EoiApp = { id: string; name: string; slug: string }

export type EoiJourneyData = {
  name: string
  email: string
  role: string
  organisation: string
  phone: string
  help: string[]
  helpOtherDetails: string
  timeline: string
  population: string
  notes: string
  /** True once the one-time code has been entered correctly. */
  verified: boolean
}

const EMPTY_DATA: EoiJourneyData = {
  name: '',
  email: '',
  role: '',
  organisation: '',
  phone: '',
  help: [],
  helpOtherDetails: '',
  timeline: '',
  population: '',
  notes: '',
  verified: false,
}

type StoredJourney = { data: EoiJourneyData; reference: string | null }

type EoiJourneyContextValue = {
  app: EoiApp
  flow: EoiFlow
  /** e.g. `/apps/[slug]/express-interest` */
  basePath: string
  /** URL of a step in this journey. */
  hrefFor: (step: EoiStep) => string
  /** URL of the step after `step`. */
  nextHref: (step: EoiStep) => string
  /** URL of the step before `step`; the product page before the start page. */
  backHref: (step: EoiStep) => string
  data: EoiJourneyData
  update: (patch: Partial<EoiJourneyData>) => void
  /** Reference number once submitted; null before. */
  reference: string | null
  /** Records the reference and clears the stored answers. */
  completeSubmission: (reference: string) => void
  /** True once sessionStorage has been read on the client (guards wait for this). */
  hydrated: boolean
  /** All required "Your details" fields present and plausible. */
  detailsComplete: boolean
}

const EoiJourneyContext = createContext<EoiJourneyContextValue | null>(null)

function storageKey(flow: EoiFlow, slug: string) {
  // v1 keeps its original key so in-progress journeys survive this change.
  return flow === 'v1' ? `hs-eoi-journey:${slug}` : `hs-eoi-journey:${flow}:${slug}`
}

export function EoiJourneyProvider({
  app,
  flow,
  basePath,
  children,
}: {
  app: EoiApp
  flow: EoiFlow
  basePath: string
  children: ReactNode
}) {
  const [data, setData] = useState<EoiJourneyData>(EMPTY_DATA)
  const [reference, setReference] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Restore after mount (not in the initializer) to keep SSR/client markup consistent.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(flow, app.slug))
      if (raw) {
        const stored = JSON.parse(raw) as StoredJourney
        if (stored.data) setData({ ...EMPTY_DATA, ...stored.data })
        if (stored.reference) setReference(stored.reference)
      }
    } catch {
      // Ignore corrupt/unavailable storage — start fresh.
    }
    setHydrated(true)
  }, [flow, app.slug])

  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(storageKey(flow, app.slug), JSON.stringify({ data, reference } satisfies StoredJourney))
    } catch {
      // Storage full/unavailable — journey still works in memory.
    }
  }, [hydrated, data, reference, flow, app.slug])

  const update = useCallback((patch: Partial<EoiJourneyData>) => {
    setData((d) => ({ ...d, ...patch }))
  }, [])

  const completeSubmission = useCallback((ref: string) => {
    setReference(ref)
    setData(EMPTY_DATA)
  }, [])

  const detailsComplete = isDetailsComplete(data)

  const hrefFor = useCallback(
    (step: EoiStep) => (step === 'start' ? basePath : `${basePath}/${step}`),
    [basePath],
  )
  const nextHref = useCallback(
    (step: EoiStep) => hrefFor(nextStep(flow, step) ?? 'start'),
    [flow, hrefFor],
  )
  const backHref = useCallback(
    (step: EoiStep) => {
      const prev = prevStep(flow, step)
      return prev ? hrefFor(prev) : `/apps/${app.slug}`
    },
    [flow, hrefFor, app.slug],
  )

  const value = useMemo<EoiJourneyContextValue>(
    () => ({
      app,
      flow,
      basePath,
      hrefFor,
      nextHref,
      backHref,
      data,
      update,
      reference,
      completeSubmission,
      hydrated,
      detailsComplete,
    }),
    [
      app,
      flow,
      basePath,
      hrefFor,
      nextHref,
      backHref,
      data,
      update,
      reference,
      completeSubmission,
      hydrated,
      detailsComplete,
    ],
  )

  return <EoiJourneyContext.Provider value={value}>{children}</EoiJourneyContext.Provider>
}

export function useEoiJourney(): EoiJourneyContextValue {
  const ctx = useContext(EoiJourneyContext)
  if (!ctx) throw new Error('useEoiJourney must be used within EoiJourneyProvider')
  return ctx
}

/**
 * Redirects to the earliest earlier step whose required answers are missing.
 * Pass `paused` to hold off (e.g. while check answers is submitting and the
 * stored answers are being cleared).
 */
export function useStepGuard(step: EoiStep, paused = false) {
  const router = useRouter()
  const { flow, data, hydrated, hrefFor } = useEoiJourney()
  const missing = hydrated && !paused ? firstIncompleteStep(flow, step, data) : null

  useEffect(() => {
    if (missing) router.replace(hrefFor(missing))
  }, [missing, hrefFor, router])
}
