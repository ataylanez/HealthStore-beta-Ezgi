'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEoiJourney, useStepGuard, type FieldError } from '../EoiJourneyProvider'
import { BackLink, ErrorSummary, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormField'

export default function DetailsStep() {
  const router = useRouter()
  const returnToCheck = useSearchParams().get('from') === 'check'
  const { data, update, hrefFor, nextHref, backHref } = useEoiJourney()
  const headingRef = useStepHeadingFocus()
  useStepGuard('details')
  const [errors, setErrors] = useState<FieldError[]>([])

  function errorFor(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message
  }

  function handleSubmit() {
    const errs: FieldError[] = []
    if (!data.name.trim()) errs.push({ field: 'eoi-name', message: 'Enter your full name' })
    if (!data.email.trim()) {
      errs.push({ field: 'eoi-email', message: 'Enter your NHS work email address' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.push({
        field: 'eoi-email',
        message: 'Enter an email address in the correct format, like name@nhs.net',
      })
    }
    if (!data.role.trim()) errs.push({ field: 'eoi-role', message: 'Enter your role' })
    if (!data.organisation.trim()) errs.push({ field: 'eoi-org', message: 'Enter your organisation' })
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    router.push(returnToCheck ? hrefFor('check-answers') : nextHref('details'))
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={returnToCheck ? hrefFor('check-answers') : backHref('details')} />
          <ErrorSummary errors={errors} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Your details
          </h1>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <FormField id="eoi-name" label="Full name" required error={errorFor('eoi-name')}>
              {(field) => (
                <TextInput
                  {...field}
                  value={data.name}
                  onChange={(e) => update({ name: e.target.value })}
                  autoComplete="name"
                  spellCheck={false}
                />
              )}
            </FormField>
            <FormField
              id="eoi-email"
              label="NHS work email address"
              required
              error={errorFor('eoi-email')}
            >
              {(field) => (
                <TextInput
                  {...field}
                  type="email"
                  value={data.email}
                  onChange={(e) => update({ email: e.target.value })}
                  autoComplete="email"
                  spellCheck={false}
                />
              )}
            </FormField>
            <FormField id="eoi-role" label="Role" required error={errorFor('eoi-role')}>
              {(field) => (
                <TextInput {...field} value={data.role} onChange={(e) => update({ role: e.target.value })} />
              )}
            </FormField>
            <FormField id="eoi-org" label="Organisation or ICB" required error={errorFor('eoi-org')}>
              {(field) => (
                <TextInput
                  {...field}
                  value={data.organisation}
                  onChange={(e) => update({ organisation: e.target.value })}
                  autoComplete="organization"
                />
              )}
            </FormField>
            <FormField id="eoi-phone" label="Phone (optional)">
              {(field) => (
                <TextInput
                  {...field}
                  type="tel"
                  value={data.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  autoComplete="tel"
                  spellCheck={false}
                  className="nhsuk-input--width-20"
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
