'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formBasePath } from '@/lib/supplierOnboarding'
import { useOnboardingProgress } from './useOnboardingProgress'

/**
 * Onboarding submitted — confirmation. [Provenance: NHS]
 *
 * Mirrors the Expression of interest confirmation: NHS Panel with the reference
 * number, then "What happens next". Guard: without a recorded submission there
 * is nothing to confirm, so direct visits return to the task list.
 */
export default function OnboardingConfirmationPage({ formId }: { formId: string }) {
  const router = useRouter()
  const { hydrated, submission } = useOnboardingProgress(formId)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (hydrated && !submission) router.replace(formBasePath(formId))
  }, [hydrated, submission, router, formId])

  useEffect(() => {
    if (submission) {
      window.scrollTo(0, 0)
      headingRef.current?.focus()
    }
  }, [submission])

  if (!submission) return null

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="nhsuk-panel" style={{ textAlign: 'center' }}>
            <h1 ref={headingRef} tabIndex={-1} className="nhsuk-panel__title outline-none">
              Onboarding form submitted
            </h1>
            <div className="nhsuk-panel__body">
              Your reference number
              <br />
              <strong>{submission.reference}</strong>
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-body)' }}>
            We have sent you a confirmation email with your reference number and a copy of your answers.
          </p>
          <h2 className="nhsuk-heading-m nhsuk-u-margin-top-6">What happens next</h2>
          <p style={{ fontSize: 'var(--text-body)' }}>
            Your product has been onboarded to the NHS HealthStore. You can keep its information and
            documents up to date from Manage products.
          </p>
        </div>
      </div>
    </div>
  )
}
