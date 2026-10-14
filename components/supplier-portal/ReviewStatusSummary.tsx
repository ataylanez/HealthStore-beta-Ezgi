'use client'

import { formatPortalDate, type PortalStatus } from '@/lib/supplierPortal'
import { PortalStatusTags } from './PortalStatusTag'

/**
 * Status and "Last updated" as an NHS Summary list (no actions), followed by
 * NHS Inset text explaining a draft, a pending review, or a rejected review.
 */
export function ReviewStatusSummary({
  status,
  statuses,
  lastUpdated,
  commissioningStoreLink,
  draftMessage,
  actionNeededMessage,
  onSimulateApproval,
  onSimulateRejection,
}: {
  /** Primary status. Used when `statuses` is omitted. */
  status: PortalStatus
  /** All applicable statuses, highest priority first (e.g. Action needed, Draft changes). */
  statuses?: PortalStatus[]
  /** Omit when nothing has been saved yet. */
  lastUpdated?: string
  /** Live Commissioning Store page — opens in a new window. */
  commissioningStoreLink?: { href: string; label: string }
  /** Shown while there are unsubmitted changes (Draft changes, Unpublished, Unpublished changes). */
  draftMessage: string
  /** Shown when a review was rejected (Action needed). */
  actionNeededMessage?: string
  /** Prototype stand-in for the back office review, shown while In review. */
  onSimulateApproval: () => void
  /** Prototype stand-in for a rejected review, shown while In review. */
  onSimulateRejection?: () => void
}) {
  const shown = statuses?.length ? statuses : [status]
  const isDraft = shown.some((s) => s === 'draft_changes' || s === 'unpublished' || s === 'unpublished_changes')
  const isActionNeeded = shown.includes('action_needed')
  const isInReview = shown.includes('in_review')
  return (
    <>
      <dl className="nhsuk-summary-list">
        <div className="nhsuk-summary-list__row">
          <dt className="nhsuk-summary-list__key">Status</dt>
          <dd className="nhsuk-summary-list__value">
            <PortalStatusTags statuses={shown} />
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
              <a
                className="nhsuk-link"
                href={commissioningStoreLink.href}
                target="_blank"
                rel="noopener noreferrer"
              >
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

      {isActionNeeded && actionNeededMessage && (
        <div className="nhsuk-inset-text">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p>{actionNeededMessage}</p>
        </div>
      )}

      {isInReview && (
        <div className="nhsuk-inset-text">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p>
            Your changes were submitted for review. The NHS HealthStore team will check them and contact you if anything else
            is needed.
          </p>
          {/* Prototype shortcuts, same treatment as "Mark all as complete" on the onboarding form. */}
          <p className="nhsuk-u-margin-bottom-0">
            <button
              type="button"
              className="nhsuk-link"
              onClick={onSimulateApproval}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
            >
              Simulate approval
            </button>
            {onSimulateRejection && (
              <>
                {' · '}
                <button
                  type="button"
                  className="nhsuk-link"
                  onClick={onSimulateRejection}
                  style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
                >
                  Simulate rejection
                </button>
              </>
            )}
          </p>
        </div>
      )}
    </>
  )
}
