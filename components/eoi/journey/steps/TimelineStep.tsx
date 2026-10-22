'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TIMELINE_OPTIONS, useEoiJourney, useStepGuard, type FieldError } from '../EoiJourneyProvider'
import { BackLink, ErrorSummary, StepCaption, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'

/** v2: "When would you like to start?" as its own question page (radios, legend is the h1). */
export default function TimelineStep() {
  const router = useRouter()
  const returnToCheck = useSearchParams().get('from') === 'check'
  const { app, data, update, hrefFor, nextHref, backHref } = useEoiJourney()
  const headingRef = useStepHeadingFocus()
  const [errors, setErrors] = useState<FieldError[]>([])

  useStepGuard('timeline')

  const firstOptionId = `eoi-timeline-${TIMELINE_OPTIONS[0].id}`
  const error = errors[0]?.message

  function handleSubmit() {
    if (!data.timeline) {
      setErrors([{ field: firstOptionId, message: `Select when you would like to start using ${app.name}` }])
      return
    }
    router.push(returnToCheck ? hrefFor('check-answers') : nextHref('timeline'))
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={returnToCheck ? hrefFor('check-answers') : backHref('timeline')} />
          <ErrorSummary errors={errors} />
          <StepCaption />
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div className={`nhsuk-form-group${error ? ' nhsuk-form-group--error' : ''}`}>
              <fieldset
                className="nhsuk-fieldset"
                aria-describedby={`eoi-timeline-hint${error ? ' eoi-timeline-error' : ''}`}
              >
                <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
                  <h1 ref={headingRef} tabIndex={-1} className="nhsuk-fieldset__heading outline-none">
                    When would you like to start using {app.name}?
                  </h1>
                </legend>
                <div id="eoi-timeline-hint" className="nhsuk-hint">
                  An estimate is fine. Choose &quot;Exploratory only&quot; if you are not sure yet.
                </div>
                {error ? (
                  <span id="eoi-timeline-error" className="nhsuk-error-message">
                    <span className="nhsuk-u-visually-hidden">Error:</span> {error}
                  </span>
                ) : null}
                <div className="nhsuk-radios">
                  {TIMELINE_OPTIONS.map((o) => (
                    <div key={o.id} className="nhsuk-radios__item">
                      <input
                        className="nhsuk-radios__input"
                        id={`eoi-timeline-${o.id}`}
                        type="radio"
                        name="eoi-timeline"
                        value={o.id}
                        checked={data.timeline === o.id}
                        onChange={() => update({ timeline: o.id })}
                      />
                      <label className="nhsuk-radios__label nhsuk-label" htmlFor={`eoi-timeline-${o.id}`}>
                        {o.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <Button type="submit">Continue</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
