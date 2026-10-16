'use client'

import { Fragment, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HELP_OPTIONS, useEoiJourney, type FieldError } from '../EoiJourneyProvider'
import { BackLink, ErrorSummary, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormField'

export default function SupportStep() {
  const router = useRouter()
  const returnToCheck = useSearchParams().get('from') === 'check'
  const { basePath, data, update, hydrated, detailsComplete } = useEoiJourney()
  const headingRef = useStepHeadingFocus()
  const [errors, setErrors] = useState<FieldError[]>([])

  // Guard: details and a verified email come first.
  useEffect(() => {
    if (!hydrated) return
    if (!detailsComplete) router.replace(`${basePath}/details`)
    else if (!data.verified) router.replace(`${basePath}/verify`)
  }, [hydrated, detailsComplete, data.verified, basePath, router])

  function errorFor(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message
  }

  function handleSubmit() {
    const errs: FieldError[] = []
    if (data.help.length === 0) {
      errs.push({
        field: `eoi-help-${HELP_OPTIONS[0].id}`,
        message: 'Select what support you need',
      })
    }
    if (data.help.includes('other') && !data.helpOtherDetails.trim()) {
      errs.push({
        field: 'eoi-help-other-details',
        message: 'Give more details about the support you need',
      })
    }
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    router.push(returnToCheck ? `${basePath}/check-answers` : `${basePath}/timing`)
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={returnToCheck ? `${basePath}/check-answers` : `${basePath}/verify`} />
          <ErrorSummary errors={errors} />
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div
              className={`nhsuk-form-group${errorFor(`eoi-help-${HELP_OPTIONS[0].id}`) ? ' nhsuk-form-group--error' : ''}`}
            >
              <fieldset className="nhsuk-fieldset" aria-describedby="eoi-help-hint">
                <legend className="nhsuk-fieldset__legend">
                  <h1
                    ref={headingRef}
                    tabIndex={-1}
                    className="nhsuk-heading-xl outline-none nhsuk-fieldset__heading"
                  >
                    What support do you need?
                  </h1>
                </legend>
                <div id="eoi-help-hint" className="nhsuk-hint">
                  Select all that apply.
                </div>
                {errorFor(`eoi-help-${HELP_OPTIONS[0].id}`) ? (
                  <span className="nhsuk-error-message" role="alert">
                    <span className="nhsuk-u-visually-hidden">Error:</span> Select what help you need
                  </span>
                ) : null}
                <div className="nhsuk-checkboxes nhsuk-checkboxes--conditional">
                  {HELP_OPTIONS.map((o) => {
                    const isOther = o.id === 'other'
                    return (
                      <Fragment key={o.id}>
                        <div className="nhsuk-checkboxes__item">
                          <input
                            className="nhsuk-checkboxes__input"
                            id={`eoi-help-${o.id}`}
                            type="checkbox"
                            checked={data.help.includes(o.id)}
                            aria-controls={isOther ? 'conditional-eoi-help-other' : undefined}
                            aria-expanded={isOther ? data.help.includes('other') : undefined}
                            onChange={(e) =>
                              update({
                                help: e.target.checked
                                  ? [...data.help, o.id]
                                  : data.help.filter((x) => x !== o.id),
                              })
                            }
                          />
                          <label
                            className="nhsuk-checkboxes__label nhsuk-label"
                            htmlFor={`eoi-help-${o.id}`}
                          >
                            {o.label}
                          </label>
                        </div>
                        {isOther && data.help.includes('other') ? (
                          <div className="nhsuk-checkboxes__conditional" id="conditional-eoi-help-other">
                            <FormField
                              id="eoi-help-other-details"
                              label="Give more details"
                              required
                              error={errorFor('eoi-help-other-details')}
                            >
                              {(field) => (
                                <TextInput
                                  {...field}
                                  value={data.helpOtherDetails}
                                  onChange={(e) => update({ helpOtherDetails: e.target.value })}
                                />
                              )}
                            </FormField>
                          </div>
                        ) : null}
                      </Fragment>
                    )
                  })}
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
