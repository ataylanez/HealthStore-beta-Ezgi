import Link from 'next/link'
import type { PortalStatus } from '@/lib/supplierPortal'
import { formatPortalDate } from '@/lib/supplierPortal'
import { PortalStatusTags } from './PortalStatusTag'

export type StatusTableRow = {
  id: string
  name: string
  href: string
  /** Secondary line under the name, e.g. "Product page". */
  detail?: string
  /** Primary status. Used when `statuses` is omitted. */
  status: PortalStatus
  /** All applicable statuses, highest priority first. */
  statuses?: PortalStatus[]
  /** ISO date or timestamp; omit when the item has not been updated yet. */
  date?: string
}

/**
 * NHS Table listing portal items with a status tag and a date.
 * [Provenance: NHS] https://service-manual.nhs.uk/design-system/components/table
 */
export function StatusTable({
  caption,
  nameHeading,
  dateHeading,
  rows,
}: {
  caption: string
  nameHeading: string
  dateHeading: string
  rows: StatusTableRow[]
}) {
  return (
    <table className="nhsuk-table">
      <caption className="nhsuk-table__caption nhsuk-u-visually-hidden">{caption}</caption>
      <thead className="nhsuk-table__head">
        <tr className="nhsuk-table__row">
          <th scope="col" className="nhsuk-table__header">{nameHeading}</th>
          <th scope="col" className="nhsuk-table__header">Status</th>
          <th scope="col" className="nhsuk-table__header">{dateHeading}</th>
        </tr>
      </thead>
      <tbody className="nhsuk-table__body">
        {rows.map((row) => (
          <tr key={row.id} className="nhsuk-table__row">
            <td className="nhsuk-table__cell">
              <Link className="nhsuk-link" href={row.href}>
                {row.name}
              </Link>
              {row.detail ? <div className="nhsuk-body-s nhsuk-u-secondary-text-color nhsuk-u-margin-bottom-0">{row.detail}</div> : null}
            </td>
            <td className="nhsuk-table__cell">
              <PortalStatusTags statuses={row.statuses?.length ? row.statuses : [row.status]} />
            </td>
            <td className="nhsuk-table__cell">{row.date ? formatPortalDate(row.date) : 'Not yet updated'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
