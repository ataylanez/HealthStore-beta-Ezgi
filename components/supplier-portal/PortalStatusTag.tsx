import type { PortalStatus } from '@/lib/supplierPortal'

/**
 * NHS Tag for Supplier portal statuses. Maps each status to an existing
 * `nhsuk-tag` colour modifier — no new styles.
 * https://service-manual.nhs.uk/design-system/components/tag
 */
export const PORTAL_STATUS_TAGS: Record<PortalStatus, { label: string; modifier: string }> = {
  incomplete: { label: 'Incomplete', modifier: 'nhsuk-tag--white' },
  submitted: { label: 'Submitted', modifier: 'nhsuk-tag--green' },
  action_needed: { label: 'Action needed', modifier: 'nhsuk-tag--red' },
  up_to_date: { label: 'Up to date', modifier: 'nhsuk-tag--blue' },
  draft_changes: { label: 'Draft changes', modifier: 'nhsuk-tag--yellow' },
  in_review: { label: 'In review', modifier: 'nhsuk-tag--purple' },
  published: { label: 'Published', modifier: 'nhsuk-tag--blue' },
  unpublished: { label: 'Unpublished', modifier: 'nhsuk-tag--white' },
  unpublished_changes: { label: 'Unpublished changes', modifier: 'nhsuk-tag--yellow' },
}

/** Statuses grouped by where they appear in the portal (prototype reference). */
export const PORTAL_STATUS_GROUPS: { title: string; statuses: PortalStatus[] }[] = [
  { title: 'Company information', statuses: ['incomplete', 'draft_changes', 'up_to_date'] },
  { title: 'Product onboarding', statuses: ['incomplete', 'submitted', 'action_needed'] },
  { title: 'Manage products', statuses: ['up_to_date', 'draft_changes', 'in_review', 'action_needed'] },
  {
    title: 'Published pages',
    statuses: ['published', 'unpublished', 'unpublished_changes', 'in_review', 'action_needed'],
  },
]

export function PortalStatusTag({ status }: { status: PortalStatus }) {
  const tag = PORTAL_STATUS_TAGS[status]
  return <strong className={`nhsuk-tag ${tag.modifier}`}>{tag.label}</strong>
}

/** One or more status tags, in priority order (e.g. Action needed then Draft changes). */
export function PortalStatusTags({ statuses }: { statuses: PortalStatus[] }) {
  return (
    <span className="hs-portal-status-tags">
      {statuses.map((status) => (
        <PortalStatusTag key={status} status={status} />
      ))}
    </span>
  )
}
