'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  COMPANY_PATHS,
  COMPANY_SECTIONS,
  COMPANY_SUBMITTED_SESSION_KEY,
  COMPANY_TITLE,
  companyCheckAnswersHref,
  companyQuestionHref,
  companySectionResumeStep,
  companySectionSubmitted,
  findCompanySection,
  type CompanySection,
} from '@/lib/supplierCompany'
import { PORTAL_PATHS } from '@/lib/supplierPortal'
import { useSupplierPortal } from './useSupplierPortal'

/** The chapter id Check your answers stored just before submitting, or null. */
function readSubmittedSection(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(COMPANY_SUBMITTED_SESSION_KEY)
  } catch {
    return null
  }
}

/**
 * Company information chapter submitted — confirmation. [Provenance: NHS Panel]
 *
 * Guard: only shown straight after Confirm and submit for the chapter in
 * `?section=` (session flag set by Check your answers, cleared here);
 * otherwise returns to Company information.
 */
export default function CompanyConfirmation() {
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
  // Read once on the client; the server render and first client render both
  // show nothing (hydrated is false in Confirmation), so there is no mismatch.
  const [submittedId] = useState<string | null>(readSubmittedSection)
  const ok = section !== undefined && submittedId === section.id

  useEffect(() => {
    if (!ok) router.replace(COMPANY_PATHS.page)
  }, [ok, router])

  if (!ok) return null
  return <Confirmation section={section} />
}

function Confirmation({ section }: { section: CompanySection }) {
  const { hydrated, company } = useSupplierPortal()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.removeItem(COMPANY_SUBMITTED_SESSION_KEY)
    } catch {
      // Ignore.
    }
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [hydrated])

  if (!hydrated) return null

  const values = company.values ?? {}
  const answers = { ...values, ...(company.draft ?? {}) }
  const outstanding = COMPANY_SECTIONS.filter((s) => !companySectionSubmitted(s.id, values))

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="nhsuk-panel" style={{ textAlign: 'center' }}>
            <h1 ref={headingRef} tabIndex={-1} className="nhsuk-panel__title outline-none">
              {section.title} completed
            </h1>
          </div>
          <p style={{ fontSize: 'var(--text-body)' }}>
            This section is now up to date on your Company information page.
          </p>
          {outstanding.length > 0 ? (
            <>
              <p style={{ fontSize: 'var(--text-body)' }}>You still need to complete:</p>
              {outstanding.map((s) => {
                const resume = companySectionResumeStep(s.id, answers)
                const href = resume ? companyQuestionHref(resume) : companyCheckAnswersHref(s.id)
                return (
                  <p key={s.id} style={{ fontSize: 'var(--text-body)' }}>
                    <Link className="nhsuk-link" href={href}>
                      {s.title}
                    </Link>
                  </p>
                )
              })}
              <p style={{ fontSize: 'var(--text-body)' }}>
                <Link className="nhsuk-link" href={PORTAL_PATHS.dashboard}>
                  Return to portal dashboard
                </Link>
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 'var(--text-body)' }}>
                <Link className="nhsuk-link" href={COMPANY_PATHS.page}>
                  {COMPANY_TITLE}
                </Link>
              </p>
              <p style={{ fontSize: 'var(--text-body)' }}>
                <Link className="nhsuk-link" href={PORTAL_PATHS.dashboard}>
                  Dashboard
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
