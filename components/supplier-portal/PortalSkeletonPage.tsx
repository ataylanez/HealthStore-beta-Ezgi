import { PortalBreadcrumb } from './PortalBreadcrumb'

/**
 * Page skeleton for portal sections whose scope is still to be confirmed
 * (Company information, Account management, Contact us in the IA).
 */
export function PortalSkeletonPage({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="hs-page">
      <PortalBreadcrumb items={[{ label: title }]} />
      <div className="max-w-3xl">
        <div className="hs-section">
          <h1 className="page-title-h1">{title}</h1>
          <p className="m-0 hs-measure leading-relaxed" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
            {lede}
          </p>
        </div>
        <div className="nhsuk-inset-text">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p>This section is not available yet.</p>
        </div>
      </div>
    </div>
  )
}
