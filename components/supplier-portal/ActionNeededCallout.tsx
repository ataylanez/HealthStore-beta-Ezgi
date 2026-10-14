import type { ReactNode } from 'react'

/**
 * NHS Warning callout labelled "Action needed" — the back office outcome on a
 * submission or a document that has expired.
 * https://service-manual.nhs.uk/design-system/components/warning-callout
 */
export function ActionNeededCallout({ children }: { children: ReactNode }) {
  return (
    <div className="nhsuk-warning-callout">
      <h2 className="nhsuk-warning-callout__label">
        <span role="text">
          <span className="nhsuk-u-visually-hidden">Important: </span>
          Action needed
        </span>
      </h2>
      <p>{children}</p>
    </div>
  )
}
