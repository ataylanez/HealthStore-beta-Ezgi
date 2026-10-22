'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useEoiJourney, type FieldError } from './EoiJourneyProvider'

/** NHS back link — always a real link now that each step has its own URL. */
export function BackLink({ href }: { href: string }) {
  return (
    <div className="nhsuk-back-link">
      <Link href={href} className="nhsuk-back-link__link">
        <svg
          className="nhsuk-icon nhsuk-icon__chevron-left"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          height="24"
          width="24"
        >
          <path d="M8.5 12c0-.3.1-.5.3-.7l5-5c.4-.4 1-.4 1.4 0s.4 1 0 1.4L10.9 12l4.3 4.3c.4.4.4 1 0 1.4s-1 .4-1.4 0l-5-5c-.2-.2-.3-.4-.3-.7z" />
        </svg>
        Back
      </Link>
    </div>
  )
}

export function ErrorSummary({ errors }: { errors: FieldError[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [errors])
  if (errors.length === 0) return null
  return (
    <div
      ref={ref}
      className="nhsuk-error-summary"
      aria-labelledby="eoi-error-summary-title"
      role="alert"
      tabIndex={-1}
    >
      <h2 className="nhsuk-error-summary__title" id="eoi-error-summary-title">
        There is a problem
      </h2>
      <div className="nhsuk-error-summary__body">
        <ul className="nhsuk-list nhsuk-error-summary__list">
          {errors.map((e) => (
            <li key={e.field}>
              <a href={`#${e.field}`}>{e.message}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Scrolls to top and focuses the page H1 on mount, mirroring a full page load. */
export function useStepHeadingFocus() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [])
  return headingRef
}

/** NHS caption above each question naming the journey (question-pages pattern). */
export function StepCaption() {
  const { app, flow } = useEoiJourney()
  return (
    <span className="nhsuk-caption-l">
      {flow === 'v2' ? `Get in touch about ${app.name}` : `Express interest in ${app.name}`}
    </span>
  )
}
