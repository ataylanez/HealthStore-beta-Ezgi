import type { ReactNode } from 'react'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'

const TRAINING_AND_GUIDANCE = { label: 'Training and guidance', href: '/resources/guidance' }

export function GuidanceArticle({
  title,
  section = TRAINING_AND_GUIDANCE,
  children,
}: {
  title: string
  /** Parent section shown in the breadcrumb. Defaults to Training and guidance. */
  section?: { label: string; href: string }
  children: ReactNode
}) {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb
        items={[
          { label: 'Resource library', href: '/resources' },
          { label: section.label, href: section.href },
          { label: title },
        ]}
      />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
        <div className="nhsuk-grid-row">
          <article className="nhsuk-grid-column-two-thirds">
            <h1 className="nhsuk-heading-xl">{title}</h1>
            {children}
          </article>
        </div>
      </div>
    </div>
  )
}

function TickIcon() {
  return (
    <svg
      className="nhsuk-icon nhsuk-icon__tick"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      width="34"
      height="34"
    >
      <path strokeWidth="4" strokeLinecap="round" d="M18.4 7.8l-8.5 8.4L5.6 12" stroke="#007f3b" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg
      className="nhsuk-icon nhsuk-icon__cross"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      width="34"
      height="34"
    >
      <path
        d="M17 18.5c-.4 0-.8-.1-1.1-.4l-10-10c-.6-.6-.6-1.6 0-2.1.6-.6 1.5-.6 2.1 0l10 10c.6.6.6 1.5 0 2.1-.3.3-.6.4-1 .4z"
        fill="#d5281b"
      />
      <path
        d="M7 18.5c-.4 0-.8-.1-1.1-.4-.6-.6-.6-1.5 0-2.1l10-10c.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1l-10 10c-.3.3-.6.4-1 .4z"
        fill="#d5281b"
      />
    </svg>
  )
}

/** NHS Do / Don't list — service-manual.nhs.uk/design-system/components/do-and-dont-lists */
export function DoDontList({
  title,
  type,
  items,
}: {
  title: string
  type: 'tick' | 'cross'
  items: string[]
}) {
  return (
    <div className="nhsuk-do-dont-list">
      <h2 className="nhsuk-do-dont-list__label">{title}</h2>
      <ul className={`nhsuk-list ${type === 'tick' ? 'nhsuk-list--tick' : 'nhsuk-list--cross'}`} role="list">
        {items.map(item => (
          <li key={item}>
            {type === 'tick' ? <TickIcon /> : <CrossIcon />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
