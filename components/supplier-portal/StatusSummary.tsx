'use client'

import { formatPortalDate, type PortalStatus } from '@/lib/supplierPortal'
import { PortalStatusTag } from './PortalStatusTag'

/**
 * Status and "Last updated" as an NHS Summary list (no actions), followed by
 * NHS Inset text when there are unsubmitted changes.
 */
export function StatusSummary({
  status,
  lastUpdated,
  commissioningStoreLink,
  draftMessage,
}: {
  status: PortalStatus
  /** Omit when nothing has been saved yet. */
  lastUpdated?: string
  /** Live Commissioning Store page — opens in a new window. */
  commissioningStoreLink?: { href: string; label: string }
  /** Shown while there are unsubmitted changes (Draft changes, Unpublished, Unpublished changes). */
  draftMessage: string
}) {
  const isDraft = status === 'draft_changes' || status === 'unpublished' || status === 'unpublished_changes'
  return (
    <>
      <dl className="nhsuk-summary-list">
        <div className="nhsuk-summary-list__row">
          <dt className="nhsuk-summary-list__key">Status</dt>
          <dd className="nhsuk-summary-list__value">
            <PortalStatusTag status={status} />
          </dd>
        </div>
        <div className="nhsuk-summary-list__row">
          <dt className="nhsuk-summary-list__key">Last updated</dt>
          <dd className="nhsuk-summary-list__value">{lastUpdated ? formatPortalDate(lastUpdated) : 'Not yet updated'}</dd>
        </div>
        {commissioningStoreLink ? (
          <div className="nhsuk-summary-list__row">
            <dt className="nhsuk-summary-list__key">Store link</dt>
            <dd className="nhsuk-summary-list__value">
              <a className="nhsuk-link" href={commissioningStoreLink.href} target="_blank" rel="noopener noreferrer">
                {commissioningStoreLink.label}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {isDraft && (
        <div className="nhsuk-inset-text">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p>{draftMessage}</p>
        </div>
      )}
    </>
  )
}
