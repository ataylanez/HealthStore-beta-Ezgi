'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { TIMELINE_OPTIONS, useEoiJourney, useStepGuard } from '../EoiJourneyProvider'
import { BackLink, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput, Textarea } from '@/components/ui/FormField'

export default function TimingStep() {
  const router = useRouter()
  const returnToCheck = useSearchParams().get('from') === 'check'
  const { flow, data, update, hrefFor, nextHref, backHref } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  useStepGuard('timing')

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={returnToCheck ? hrefFor('check-answers') : backHref('timing')} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Timing and context
          </h1>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              router.push(returnToCheck ? hrefFor('check-answers') : nextHref('timing'))
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
              hint={
                flow === 'v2'
                  ? 'Tell us how this would fit your service or clinical workflow. Do not enter patient-identifiable information.'
                  : 'Do not enter patient-identifiable information.'
              }
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
