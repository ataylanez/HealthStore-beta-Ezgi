'use client'

import Link from 'next/link'
import { formBasePath } from '@/lib/supplierOnboarding'
import {
  MANAGED_PRODUCTS,
  PORTAL_PATHS,
  SUPPLIER_PAGE_ID,
  publishedProductHref,
  type PortalStatus,
} from '@/lib/supplierPortal'
import { PortalStatusTags } from './PortalStatusTag'
import { companyStatus, publishedPageStatus, useOnboardingFormSummaries } from './portalStatus'
import { useSupplierPortal } from './useSupplierPortal'

/** Portal section an item belongs to. Items with no group (e.g. Company information) are listed first. */
type Group = 'Product management' | 'Published pages'
const GROUPS: Group[] = ['Product management', 'Published pages']

type Item = { id: string; label: string; href: string; statuses: PortalStatus[]; group?: Group }

/**
 * Items waiting on the supplier, as NHS Task lists (link + status tag) under a
 * subheading per portal section. Ungrouped items come first without a heading.
 * https://service-manual.nhs.uk/design-system/components/task-list
 */
export default function DashboardAttentionList() {
  const { hydrated: formsReady, summaries } = useOnboardingFormSummaries()
  const { hydrated, getRecord, company } = useSupplierPortal()
  if (!formsReady || !hydrated) return null

  // Incomplete and Unpublished only — not drafts or unpublished changes.
  const items: Item[] = []
  if (companyStatus(company) === 'incomplete') {
    items.push({ id: 'company', label: 'Company information', href: PORTAL_PATHS.company, statuses: ['incomplete'] })
  }
  for (const s of summaries) {
    if (s.status !== 'incomplete') continue
    items.push({
      id: `form-${s.form.id}`,
      label: `${s.form.productName} onboarding form`,
      href: formBasePath(s.form.id),
      statuses: [s.status],
      group: 'Product management',
    })
  }
  for (const p of MANAGED_PRODUCTS) {
    if (publishedPageStatus(getRecord('pages', p.id)) === 'unpublished') {
      items.push({
        id: `page-${p.id}`,
        label: `${p.name} product page`,
        href: publishedProductHref(p.id),
        statuses: ['unpublished'],
        group: 'Published pages',
      })
    }
  }
  if (publishedPageStatus(getRecord('pages', SUPPLIER_PAGE_ID)) === 'unpublished') {
    items.push({
      id: 'page-supplier',
      label: 'Supplier page',
      href: PORTAL_PATHS.supplierPage,
      statuses: ['unpublished'],
      group: 'Published pages',
    })
  }

  // Ungrouped items first (no subheading), then one subheaded list per section.
  const ungrouped = items.filter((i) => !i.group)
  const grouped = GROUPS.map((group) => ({ group, items: items.filter((i) => i.group === group) })).filter(
    (g) => g.items.length > 0,
  )

  return (
    <section aria-labelledby="attention-heading" className="hs-section">
      <h2 id="attention-heading" className="nhsuk-heading-m">
        Needs your attention
      </h2>
      {items.length === 0 ? (
        <p className="nhsuk-body-m">There is nothing waiting for you.</p>
      ) : (
        <>
          {ungrouped.length > 0 && <TaskList items={ungrouped} />}
          {grouped.map(({ group, items: groupItems }) => {
            const headingId = `attention-${group.toLowerCase().replace(/\s+/g, '-')}`
            return (
              <div key={group} role="group" aria-labelledby={headingId}>
                {/* Subheading styled like a task-list row (same size and 12px vertical padding), in bold grey. */}
                <h3
                  id={headingId}
                  className="nhsuk-body-m nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color nhsuk-u-margin-bottom-0"
                  style={{ paddingTop: 12, paddingBottom: 12 }}
                >
                  {group}
                </h3>
                <TaskList items={groupItems} />
              </div>
            )
          })}
        </>
      )}
    </section>
  )
}

function TaskList({ items }: { items: Item[] }) {
  return (
    <ul className="nhsuk-task-list">
      {items.map((item) => (
        <li key={item.id} className="nhsuk-task-list__item nhsuk-task-list__item--with-link">
          <div className="nhsuk-task-list__name-and-hint">
            <Link className="nhsuk-task-list__link nhsuk-link" href={item.href} aria-describedby={`${item.id}-status`}>
              {item.label}
            </Link>
          </div>
          <div className="nhsuk-task-list__status" id={`${item.id}-status`}>
            <PortalStatusTags statuses={item.statuses} />
          </div>
        </li>
      ))}
    </ul>
  )
}
