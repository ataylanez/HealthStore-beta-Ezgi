'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { formatAnswer } from '@/components/supplier-onboard/CheckAnswersPage'
import { Button } from '@/components/ui/Button'
import {
  COMPANY_PATHS,
  COMPANY_SUBMITTED_SESSION_KEY,
  COMPANY_TITLE,
  companyConfirmationHref,
  companyQuestionHref,
  companySectionChanged,
  companySectionComplete,
  companySectionQuestions,
  companySectionSubmitted,
  findCompanySection,
  type CompanySection,
} from '@/lib/supplierCompany'
import { useSupplierPortal } from './useSupplierPortal'

const DECLARATION = 'By submitting you confirm that this information is accurate and up to date.'

/**
 * Check your answers for one Company information chapter. [Provenance: NHS / GOV.UK pattern]
 *
 * Reached from the chapter's last question (`?section=<id>`). Lists every
 * answer on the chapter's route with a Change link that returns here. Confirm
 * and submit applies the chapter's draft straight away (no review) and moves
 * to the confirmation page. Other chapters are not affected.
 *
 * Guard: redirects to the Company information page when the chapter is
 * unknown, a required answer on its route is missing, or it has already been
 * submitted and nothing has changed.
 */
export default function CompanyCheckAnswers() {
  return (
    <Suspense fallback={null}>
      <Loader />
    </Suspense>
  )
}

function Loader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const section = findCompanySection(searchParams.get('section'))

  useEffect(() => {
    if (!section) router.replace(COMPANY_PATHS.page)
  }, [section, router])

  if (!section) return null
  return <SectionCheckAnswers key={section.id} section={section} />
}

function SectionCheckAnswers({ section }: { section: CompanySection }) {
  const router = useRouter()
  const { hydrated, company, submitCompanySection } = useSupplierPortal()
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const values = company.values ?? {}
  const draft = company.draft ?? {}
  const merged = { ...values, ...draft }
  const firstTime = !companySectionSubmitted(section.id, values)
  const hasChanges = firstTime || companySectionChanged(section.id, draft, values)
  const canSubmit = hydrated && hasChanges && companySectionComplete(section.id, merged)

  useEffect(() => {
    if (hydrated && !canSubmit && !submitting) router.replace(COMPANY_PATHS.page)
  }, [hydrated, canSubmit, submitting, router])

  useEffect(() => {
    if (canSubmit) {
      window.scrollTo(0, 0)
      headingRef.current?.focus()
    }
  }, [canSubmit])

  if (!canSubmit) return null

  function confirmAndSubmit() {
    if (submitting) return
    setSubmitting(true)
    try {
      sessionStorage.setItem(COMPANY_SUBMITTED_SESSION_KEY, section.id)
    } catch {
      // Session storage unavailable — the confirmation page will send the user back.
    }
    submitCompanySection(section.id)
    router.push(companyConfirmationHref(section.id))
  }

  const rows = companySectionQuestions(section.id, merged)

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={COMPANY_PATHS.page} />
          <span className="nhsuk-caption-l">
            {COMPANY_TITLE} — {section.title}
          </span>
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            {firstTime ? 'Check your answers before submitting' : 'Check your changes before submitting'}
          </h1>

          <dl className="nhsuk-summary-list nhsuk-u-margin-bottom-7">
            {rows.map(({ question, step }) => (
              <div key={question.id} className="nhsuk-summary-list__row">
                <dt className="nhsuk-summary-list__key">{question.label}</dt>
                <dd className="nhsuk-summary-list__value">{formatAnswer(question, merged)}</dd>
                <dd className="nhsuk-summary-list__actions">
                  <Link className="hs-link-button" href={companyQuestionHref(step, { returnTo: 'check-answers' })}>
                    Change<span className="nhsuk-u-visually-hidden"> {question.label.toLowerCase()}</span>
                  </Link>
                </dd>
              </div>
            ))}
          </dl>

          <h2 className="nhsuk-heading-m">{firstTime ? 'Submit this section' : 'Submit your changes'}</h2>
          <p className="nhsuk-body-m">{DECLARATION}</p>
          <Button variant="confirm" onClick={confirmAndSubmit} loading={submitting}>
            {submitting ? 'Submitting…' : 'Confirm and submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
