'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEoi } from '@/components/EoiProvider'
import {
  HELP_OPTIONS,
  TIMELINE_OPTIONS,
  useEoiJourney,
  type FieldError,
} from '../EoiJourneyProvider'
import { BackLink, ErrorSummary, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'

const PROTOTYPE_REFERENCE = 'HSC6589L'

export default function CheckAnswersStep() {
  const router = useRouter()
  const { submit } = useEoi()
  const { app, basePath, data, hydrated, detailsComplete, completeSubmission } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  const [errors, setErrors] = useState<FieldError[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Guard: details and a verified email come first.
  useEffect(() => {
    if (!hydrated || submitting) return
    if (!detailsComplete) router.replace(`${basePath}/details`)
    else if (!data.verified) router.replace(`${basePath}/verify`)
  }, [hydrated, submitting, detailsComplete, data.verified, basePath, router])

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
      router.push(`${basePath}/confirmation`)
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

  function changeHref(step: 'details' | 'support' | 'timing') {
    return `${basePath}/${step}?from=check`
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={`${basePath}/timing`} />
          <ErrorSummary errors={errors} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Check your answers
          </h1>
          <dl className="nhsuk-summary-list" id="eoi-check-answers">
            <div className="nhsuk-summary-list__row nhsuk-summary-list__row--no-actions">
              <dt className="nhsuk-summary-list__key">Product</dt>
              <dd className="nhsuk-summary-list__value">{app.name}</dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Full name</dt>
              <dd className="nhsuk-summary-list__value">{data.name}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('details')}>
                  Change<span className="nhsuk-u-visually-hidden"> your details</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Email</dt>
              <dd className="nhsuk-summary-list__value">{data.email}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('details')}>
                  Change<span className="nhsuk-u-visually-hidden"> email</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Role</dt>
              <dd className="nhsuk-summary-list__value">{data.role}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('details')}>
                  Change<span className="nhsuk-u-visually-hidden"> role</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Organisation</dt>
              <dd className="nhsuk-summary-list__value">{data.organisation}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('details')}>
                  Change<span className="nhsuk-u-visually-hidden"> organisation</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Phone</dt>
              <dd className="nhsuk-summary-list__value">{data.phone.trim() || 'Not provided'}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('details')}>
                  Change<span className="nhsuk-u-visually-hidden"> phone</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Support requested</dt>
              <dd className="nhsuk-summary-list__value">{helpSummary}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('support')}>
                  Change<span className="nhsuk-u-visually-hidden"> what support you need</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Desired timeline</dt>
              <dd className="nhsuk-summary-list__value">{timelineLabel}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('timing')}>
                  Change<span className="nhsuk-u-visually-hidden"> desired timeline</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Patient population</dt>
              <dd className="nhsuk-summary-list__value">{data.population.trim() || 'Not provided'}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('timing')}>
                  Change<span className="nhsuk-u-visually-hidden"> patient population</span>
                </Link>
              </dd>
            </div>
            <div className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">Additional context</dt>
              <dd className="nhsuk-summary-list__value">{data.notes.trim() || 'Not provided'}</dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={changeHref('timing')}>
                  Change<span className="nhsuk-u-visually-hidden"> additional context</span>
                </Link>
              </dd>
            </div>
          </dl>
          <p style={{ fontSize: 'var(--text-label)', color: 'var(--text-muted)' }}>
            By continuing you agree that prototype data will be stored for demonstration purposes.
          </p>
          <Button onClick={() => void handleSubmit()} loading={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
