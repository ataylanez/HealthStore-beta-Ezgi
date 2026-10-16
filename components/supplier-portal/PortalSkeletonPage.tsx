import { PortalBreadcrumb } from './PortalBreadcrumb'

/**
 * Page skeleton for portal sections whose scope is still to be confirmed
 * (Company information, Account management, Contact us in the IA).
 */
export function PortalSkeletonPage({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb items={[{ label: title }]} />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="hs-section">
            <h1 className="nhsuk-heading-xl">{title}</h1>
            <p className="nhsuk-body-l hs-measure">
              {lede}
            </p>
          </div>
          <div className="nhsuk-inset-text">
            <span className="nhsuk-u-visually-hidden">Information: </span>
            <p>This section is not available yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
