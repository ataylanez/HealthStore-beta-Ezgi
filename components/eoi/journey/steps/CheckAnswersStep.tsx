'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEoi } from '@/components/EoiProvider'
import {
  HELP_OPTIONS,
  TIMELINE_OPTIONS,
  useEoiJourney,
  useStepGuard,
  type FieldError,
} from '../EoiJourneyProvider'
import { BackLink, ErrorSummary, StepCaption, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import type { EoiStep } from '@/lib/eoiJourneyFlow'

const PROTOTYPE_REFERENCE = 'HSC6589L'

export default function CheckAnswersStep() {
  const router = useRouter()
  const { submit } = useEoi()
  const { app, flow, data, hrefFor, backHref, completeSubmission } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  const [errors, setErrors] = useState<FieldError[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Paused while submitting: completeSubmission clears the answers.
  useStepGuard('check-answers', submitting)

  const timelineLabel = TIMELINE_OPTIONS.find((o) => o.id === data.timeline)?.label ?? 'Not provided'
  const helpSummary =
    HELP_OPTIONS.filter((o) => data.help.includes(o.id))
      .map((o) =>
        o.id === 'other' && data.helpOtherDetails.trim()
          ? `Other (${data.helpOtherDetails.trim()})`
          : o.label,
      )
      .join(', ') || 'Not provided'

  async function handleSubmit() {
    if (submitting) return
    setErrors([])
    setSubmitting(true)
    // v2 is a non-functional prototype: nothing is sent or stored, the answers
    // are cleared and the confirmation page is shown.
    if (flow === 'v2') {
      completeSubmission(PROTOTYPE_REFERENCE)
      router.push(hrefFor('confirmation'))
      return
    }
    try {
      const helpLabels = HELP_OPTIONS.filter((o) => data.help.includes(o.id)).map((o) =>
        o.id === 'other' && data.helpOtherDetails.trim()
          ? `Other (${data.helpOtherDetails.trim()})`
          : o.label,
      )
      const combinedNotes = [
        helpLabels.length > 0 ? `Support requested: ${helpLabels.join(', ')}` : '',
        data.notes.trim(),
      ]
        .filter(Boolean)
        .join('\n\n')
      await submit({
        appId: app.id,
        appName: app.name,
        name: data.name,
        role: data.role,
        organisation: data.organisation,
        email: data.email,
        phone: data.phone,
        population_estimate: data.population,
        timeline: data.timeline,
        notes: combinedNotes,
      })
      completeSubmission(PROTOTYPE_REFERENCE)
      router.push(hrefFor('confirmation'))
    } catch (err) {
      setErrors([
        {
          field: 'eoi-check-answers',
          message:
            err instanceof Error ? err.message : 'Could not register your expression of interest.',
        },
      ])
      setSubmitting(false)
    }
  }

  function changeHref(step: EoiStep) {
    return `${hrefFor(step)}?from=check`
  }

  function row(key: string, value: ReactNode, step: EoiStep, hiddenText: string) {
    return (
      <div className="nhsuk-summary-list__row" key={key}>
        <dt className="nhsuk-summary-list__key">{key}</dt>
        <dd className="nhsuk-summary-list__value">{value}</dd>
        <dd className="nhsuk-summary-list__actions">
          <Link className="hs-link-button" href={changeHref(step)}>
            Change<span className="nhsuk-u-visually-hidden"> {hiddenText}</span>
          </Link>
        </dd>
      </div>
    )
  }

  const detailsRows = [
    row('Full name', data.name, 'details', 'your details'),
    row('Email', data.email, 'details', 'email'),
    row('Role', data.role, 'details', 'role'),
    row('Organisation', data.organisation, 'details', 'organisation'),
    row('Phone', data.phone.trim() || 'Not provided', 'details', 'phone'),
  ]
  // v2 asks each of these on its own page, so each Change link goes to that page.
  const interestRows =
    flow === 'v2'
      ? [
          row('Support needed', helpSummary, 'support', 'what support you need'),
          row('When you would like to start', timelineLabel, 'timeline', 'when you would like to start'),
          row('Number of patients', data.population.trim() || 'Not provided', 'population', 'number of patients'),
          row('How it would fit your service', data.notes.trim() || 'Not provided', 'workflow', 'how it would fit your service'),
        ]
      : [
          row('Support requested', helpSummary, 'support', 'what support you need'),
          row('Desired timeline', timelineLabel, 'timing', 'desired timeline'),
          row('Patient population', data.population.trim() || 'Not provided', 'timing', 'patient population'),
          row('Additional context', data.notes.trim() || 'Not provided', 'timing', 'additional context'),
        ]
  // Answers appear in the order they were asked.
  const answerRows = flow === 'v2' ? [...interestRows, ...detailsRows] : [...detailsRows, ...interestRows]

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={backHref('check-answers')} />
          <ErrorSummary errors={errors} />
          <StepCaption />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-l outline-none">
            Check your answers
          </h1>
          <dl className="nhsuk-summary-list" id="eoi-check-answers">
            <div className="nhsuk-summary-list__row nhsuk-summary-list__row--no-actions">
              <dt className="nhsuk-summary-list__key">Product</dt>
              <dd className="nhsuk-summary-list__value">{app.name}</dd>
            </div>
            {answerRows}
          </dl>
          {flow === 'v1' ? (
            <p style={{ fontSize: 'var(--text-label)', color: 'var(--text-muted)' }}>
              By continuing you agree that prototype data will be stored for demonstration purposes.
            </p>
          ) : null}
          <Button onClick={() => void handleSubmit()} loading={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
