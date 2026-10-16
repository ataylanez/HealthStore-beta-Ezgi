'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PdpSectionLink } from '@/lib/pdpOnThisPage'

/**
 * Product section nav — the official NHS Contents list, with the product name
 * as its visually-hidden label. Each item links to a section page; the current
 * page is rendered as plain bold text (NHS `nhsuk-contents-list__current`).
 * The overview itself is reached via the breadcrumb.
 * [Provenance: NHS] service-manual.nhs.uk/design-system/components/contents-list
 */
export default function PdpSectionNav({
  sections,
  title,
}: {
  sections: PdpSectionLink[]
  /** Product name — used in the nav's accessible label. */
  title: string
}) {
  const pathname = usePathname()
  if (sections.length === 0) return null

  return (
    <nav className="nhsuk-contents-list" role="navigation" aria-label={`${title} pages`}>
      <h2 className="nhsuk-u-visually-hidden">Contents</h2>
      <ol className="nhsuk-contents-list__list">
        {sections.map((item) => {
          const isActive = pathname === item.href
          return (
            <li
              key={item.id}
              className={`nhsuk-contents-list__item${isActive ? ' nhsuk-contents-list__item--current' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? (
                <span className="nhsuk-contents-list__current">{item.label}</span>
              ) : (
                <Link className="nhsuk-contents-list__link" href={item.href}>
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
