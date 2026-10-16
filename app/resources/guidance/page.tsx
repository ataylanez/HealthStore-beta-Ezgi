import Link from 'next/link'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'

export const metadata = { title: 'Training and guidance — NHS HealthStore' }

const GUIDANCE_LINKS = [
  {
    href: '/resources/guidance/nhs-10-year-health-plan',
    title: 'Alignment with The NHS 10-Year Health Plan',
  },
  {
    href: '/resources/guidance/dtx-evidence',
    title: 'Evidence of digital therapeutics (DTx) success',
  },
  {
    href: '/resources/guidance/understanding-digital-capabilities',
    title: "Find ways of understanding patients' digital capabilities",
  },
  {
    href: '/resources/guidance/targeted-human-support',
    title: 'Using targeted human support to enable digital inclusion',
  },
  {
    href: '/resources/guidance/local-partners-digital-inclusion',
    title: 'Utilising local partners and third-sector organisations to help deliver digital inclusion work',
  },
] as const

export default function GuidancePage() {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb
        items={[
          { label: 'Resource library', href: '/resources' },
          { label: 'Training and guidance' },
        ]}
      />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
      <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">
      <h1 className="nhsuk-heading-xl">Training and guidance</h1>
      <p className="nhsuk-lede-text">
        Practical guidance to help clinicians and commissioners recommend digital therapeutics well — from national
        policy alignment and evidence, through to understanding patient digital capability and supporting digital
        inclusion.
      </p>

      <ul className="nhsuk-list nhsuk-list--bullet">
        {GUIDANCE_LINKS.map(item => (
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
