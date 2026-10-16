/**
 * Service phase banner — GOV.UK Phase banner (Alpha/Beta).
 * Shown under the NHS header on every page.
 * [Provenance: GOV.UK] design-system.service.gov.uk/components/phase-banner
 */
import type { ReactNode } from 'react'

export default function PhaseBanner({
  tag = 'Alpha',
  children,
}: {
  tag?: string
  children?: ReactNode
}) {
  return (
    <div className="hs-phase-banner">
      <div className="govuk-phase-banner hs-phase-banner__inner nhsuk-width-container">
        <p className="govuk-phase-banner__content">
          <strong className="govuk-tag govuk-phase-banner__content__tag">{tag}</strong>
          <span className="govuk-phase-banner__text">
            {children ?? (
              <>This is a new service. Help us improve it and give your feedback.</>
            )}
          </span>
        </p>
      </div>
    </div>
  )
}
