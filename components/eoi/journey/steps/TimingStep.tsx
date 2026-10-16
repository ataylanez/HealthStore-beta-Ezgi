'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TIMELINE_OPTIONS, useEoiJourney } from '../EoiJourneyProvider'
import { BackLink, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput, Textarea } from '@/components/ui/FormField'

export default function TimingStep() {
  const router = useRouter()
  const returnToCheck = useSearchParams().get('from') === 'check'
  const { basePath, data, update, hydrated, detailsComplete } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  // Guard: details and a verified email come first.
  useEffect(() => {
    if (!hydrated) return
    if (!detailsComplete) router.replace(`${basePath}/details`)
    else if (!data.verified) router.replace(`${basePath}/verify`)
  }, [hydrated, detailsComplete, data.verified, basePath, router])

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={returnToCheck ? `${basePath}/check-answers` : `${basePath}/support`} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Timing and context
          </h1>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              router.push(`${basePath}/check-answers`)
            }}
          >
            <div className="nhsuk-form-group">
              <fieldset className="nhsuk-fieldset">
                <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--s">
                  Desired timeline (optional)
                </legend>
                <div className="nhsuk-radios">
                  {TIMELINE_OPTIONS.map((o) => (
                    <div key={o.id} className="nhsuk-radios__item">
                      <input
                        className="nhsuk-radios__input"
                        id={`eoi-timeline-${o.id}`}
                        type="radio"
                        name="eoi-timeline"
                        checked={data.timeline === o.id}
                        onChange={() => update({ timeline: o.id })}
                      />
                      <label
                        className="nhsuk-radios__label nhsuk-label"
                        htmlFor={`eoi-timeline-${o.id}`}
                      >
                        {o.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <FormField
              id="eoi-population"
              label="Estimated patient population (optional)"
              hint="For example, 2,000 COPD patients."
            >
              {(field) => (
                <TextInput
                  {...field}
                  value={data.population}
                  onChange={(e) => update({ population: e.target.value })}
                  className="nhsuk-input--width-20"
                />
              )}
            </FormField>
            <FormField
              id="eoi-notes"
              label="Additional context (optional)"
              hint="Do not enter patient-identifiable information."
            >
              {(field) => (
                <Textarea
                  {...field}
                  rows={4}
                  value={data.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              )}
            </FormField>
            <Button type="submit">Continue</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
