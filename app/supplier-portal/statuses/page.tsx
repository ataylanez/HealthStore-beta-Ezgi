import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import { PORTAL_STATUS_GROUPS, PORTAL_STATUS_TAGS, PortalStatusTag } from '@/components/supplier-portal/PortalStatusTag'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Statuses — ${PORTAL_SERVICE_NAME}` }

/**
 * Prototype reference: every portal status and its NHS tag colour in one place.
 * Not linked from the dashboard — visit /supplier-portal/statuses directly.
 */
export default function PortalStatusesPage() {
  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb items={[{ label: 'Statuses' }]} />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="hs-section">
            <h1 className="nhsuk-heading-xl">Statuses</h1>
            <p className="nhsuk-body-l hs-measure">
              All status tags used in the supplier portal, grouped by where they appear. Prototype reference only.
            </p>
          </div>

          {PORTAL_STATUS_GROUPS.map((group) => (
            <section key={group.title} className="hs-section" aria-labelledby={`status-${group.title}`}>
              <h2 id={`status-${group.title}`} className="nhsuk-heading-m">
                {group.title}
              </h2>
              <table className="nhsuk-table">
                <caption className="nhsuk-table__caption nhsuk-u-visually-hidden">{group.title} statuses</caption>
                <thead className="nhsuk-table__head">
                  <tr className="nhsuk-table__row">
                    <th scope="col" className="nhsuk-table__header">
                      Status
                    </th>
                    <th scope="col" className="nhsuk-table__header">
                      Label
                    </th>
                    <th scope="col" className="nhsuk-table__header">
                      Colour
                    </th>
                  </tr>
                </thead>
                <tbody className="nhsuk-table__body">
                  {group.statuses.map((status) => {
                    const tag = PORTAL_STATUS_TAGS[status]
                    const colour = tag.modifier.replace('nhsuk-tag--', '')
                    return (
                      <tr key={`${group.title}-${status}`} className="nhsuk-table__row">
                        <td className="nhsuk-table__cell">
                          <code>{status}</code>
                        </td>
                        <td className="nhsuk-table__cell">
                          <PortalStatusTag status={status} />
                        </td>
                        <td className="nhsuk-table__cell">{colour}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
