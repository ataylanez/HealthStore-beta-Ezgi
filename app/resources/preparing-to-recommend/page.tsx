import Link from 'next/link'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'

export const metadata = { title: 'Preparing to recommend a DTx — NHS HealthStore' }

const PREPARING_LINKS = [
  {
    href: '/resources/preparing-to-recommend/what-the-nhs-healthstore-is',
    title: 'What The NHS HealthStore is',
  },
  {
    href: '/resources/preparing-to-recommend/using-nhs-healthstore',
    title: 'Using NHS HealthStore',
  },
  {
    href: '/resources/preparing-to-recommend/clinician-onboarding-guidance',
    title: 'Clinician onboarding guidance',
  },
  {
    href: '/resources/preparing-to-recommend/case-studies-and-best-practice',
    title: 'Case studies and best practice',
  },
  {
    href: '/resources/preparing-to-recommend/embedding-dtx-into-a-pathway',
    title: 'Embedding digital therapeutics (DTx) into a service or pathway',
  },
  {
    href: '/resources/preparing-to-recommend/identifying-suitable-patients',
    title: 'Identifying suitable patients for digital therapeutics (DTx) inclusion',
  },
  {
    href: '/resources/preparing-to-recommend/introducing-dtx-to-patients',
    title: 'How to introduce digital therapeutics (DTx) to your patients',
  },
] as const

export default function PreparingToRecommendPage() {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb
        items={[
          { label: 'Resource library', href: '/resources' },
          { label: 'Preparing to recommend a DTx' },
        ]}
      />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
      <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">
      <h1 className="nhsuk-heading-xl">Preparing to recommend a DTx</h1>
      <p className="nhsuk-lede-text">
        What to understand before recommending a digital therapeutic — how The NHS HealthStore works, how to embed a
        DTx in a pathway, which patients are suitable, and how to introduce it in the consultation.
      </p>

      <ul className="nhsuk-list nhsuk-list--bullet">
        {PREPARING_LINKS.map(item => (
          <li key={item.title}>
            <Link href={item.href}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      </div>
      </div>
      </div>
    </div>
  )
}
