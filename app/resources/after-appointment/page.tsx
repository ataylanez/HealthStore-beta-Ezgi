import Link from 'next/link'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'

export const metadata = { title: 'After a patient appointment — NHS HealthStore' }

const AFTER_LINKS = [
  {
    href: '/resources/after-appointment/continued-access-to-alternative-care',
    title: 'Continued access to alternative care',
  },
  {
    href: '/resources/after-appointment/clinical-responsibility',
    title: 'Clinical responsibility',
  },
] as const

export default function AfterAppointmentPage() {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb
        items={[{ label: 'Resource library', href: '/resources' }, { label: 'After a patient appointment' }]}
      />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
      <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">
      <h1 className="nhsuk-heading-xl">After a patient appointment</h1>
      <p className="nhsuk-lede-text">
        What happens once the consultation has ended — the care a patient is entitled to if they choose not to use a
        digital therapeutic, and who holds clinical responsibility from that point on.
      </p>

      <ul className="nhsuk-list nhsuk-list--bullet">
        {AFTER_LINKS.map(item => (
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
