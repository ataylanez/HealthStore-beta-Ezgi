import Link from 'next/link'
import Image from 'next/image'
import { ProcessSteps } from '@/components/storytelling'

const WHAT_WE_DO = [
  {
    title: 'Assurance support',
    body: 'We centrally hold supplier assurance evidence — completed DTAC, accessibility audit, security certifications and more - which are reviewed and monitored for expiry. We make assurance easier and faster by providing access to source documents in your workspace once verified for your local assurance purposes.',
  },
  {
    title: 'Opportunity identification',
    body: 'We learn of the local, unmet needs from published population data — QOF registers, secondary care activity and waiting lists — helping you address priority unmet needs.',
  },
  {
    title: 'Procurement and commercial support',
    body: 'We provide Buyer Packs and commercial route notes, and standard terms and pricing transparency reduces procurement lead time from months to weeks.',
  },
  {
    title: 'Deployment and implementation',
    body: 'Each product comes with an implementation manual that guides the integration process and offers supplier support.',
  },
  {
    title: 'Performance and benefit tracking',
    body: 'Once live, your workspace shows coverage, activation, retention and outcomes, benchmarked against peer deployments and categorised using an evidential basis.',
  },
  {
    title: 'Ongoing support to improve',
    body: 'Underperforming deployments are brought to your attention with actionable recommendations so that invitation, registration, and engagement continue to improve.',
  },
]

const HOW_IT_WORKS = [
  {
    title: 'Discover the keys to success',
    description: (
      <>
        Eligible cohorts, coverage gaps, admission volumes and modelled impact ranges — all sourced and dated.
        {/* NHS action link [Provenance: NHS — service-manual.nhs.uk/design-system/components/action-link] */}
        <span className="block mt-3">
          <Link className="nhsuk-action-link__link" href="#">
            <svg
              className="nhsuk-icon nhsuk-icon__arrow-right-circle"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              focusable="false"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 0 0-10 9h11.7l-4-4a1 1 0 0 1 1.5-1.4l5.6 5.7a1 1 0 0 1 0 1.4l-5.6 5.7a1 1 0 0 1-1.5 0 1 1 0 0 1 0-1.4l4-4H2A10 10 0 1 0 12 2z" />
            </svg>
            <span className="nhsuk-action-link__text">Deployment toolkit</span>
          </Link>
        </span>
      </>
    ),
    media: <Image src="/images/how-it-works-step-1.png" alt="" width={1024} height={829} className="hs-step__img" />,
  },
  {
    title: 'Explore and compare products',
    description: 'Side-by-side comparison of products for your pathway: evidence, service model, cost, implementation burden and route to buy.',
    media: <Image src="/images/how-it-works-step-2.png" alt="" width={1024} height={829} className="hs-step__img" />,
  },
  {
    title: 'Get support to commission',
    description: 'We’ll manage buyer materials, supplier introductions and governance guidance.',
    media: <Image src="/images/how-it-works-step-3.png" alt="" width={1021} height={880} className="hs-step__img" />,
  },
  {
    title: 'Track outcomes and improve',
    description: 'We’ll ensure your workspace shows deployment performance, peer benchmarks and benefit accrual, with alerts when something needs attention.',
    media: <Image src="/images/how-it-works-step-4.png" alt="" width={1024} height={829} className="hs-step__img" />,
  },
]

const PATHWAYS = [
  { href: '/catalogue/digital-therapeutics?condition=copd', title: 'COPD and pulmonary rehab', detail: 'Remote monitoring and self-management', tags: ['NICE HTG736', 'NICE HTG718'] },
  { href: '/catalogue/digital-therapeutics?condition=cardiac_rehab', title: 'Cardiac rehabilitation', detail: 'Digital post-event rehab programme', tags: ['NICE HTG761'] },
]

/**
 * Storytelling intro for the public home (what we do / how it works / pathways).
 * Laid out on the NHS grid: `.nhsuk-heading-l` section titles, lede intros in a
 * two-thirds column, and `.nhsuk-card-group` one-third card columns.
 * [Provenance: NHS] cards, card group, grid; ProcessSteps is the one bespoke part.
 */
export function HomeStorytelling() {
  return (
    <>
      <section aria-labelledby="home-what-heading" className="nhsuk-u-margin-bottom-7">
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h2 id="home-what-heading" className="nhsuk-heading-l">What the NHS HealthStore addresses</h2>
            <p className="nhsuk-body-m">
              It reduces the burden on local teams by bringing supplier evidence, NICE recommendations and commercial
              support together in one place. Commissioners retain all commissioning, clinical safety, assurance and
              deployment accountability.
            </p>
          </div>
        </div>
        <ul className="nhsuk-grid-row nhsuk-card-group">
          {WHAT_WE_DO.map((item) => (
            <li key={item.title} className="nhsuk-grid-column-one-third nhsuk-card-group__item">
              <div className="nhsuk-card">
                <div className="nhsuk-card__content">
                  <h3 className="nhsuk-card__heading nhsuk-heading-m">{item.title}</h3>
                  <p className="nhsuk-card__description">{item.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-how-heading" className="nhsuk-u-margin-bottom-7">
        <h2 id="home-how-heading" className="nhsuk-heading-l">How it works</h2>
        <ProcessSteps steps={HOW_IT_WORKS} className="hs-steps-grid--vertical" />
      </section>

      <section aria-labelledby="home-pathways-heading" className="nhsuk-u-margin-bottom-7">
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h2 id="home-pathways-heading" className="nhsuk-heading-l">Conditions and pathways we currently support</h2>
            <p className="nhsuk-body-m">
              Condition pathways with NICE Health Technology Guidance, verified supplier evidence and full local
              opportunity data.
            </p>
          </div>
        </div>
        {/* [Provenance: NHS] Clickable cards in a card group. */}
        <ul className="nhsuk-grid-row nhsuk-card-group">
          {PATHWAYS.map((p) => (
            <li key={p.href} className="nhsuk-grid-column-one-third nhsuk-card-group__item">
              <div className="nhsuk-card nhsuk-card--clickable">
                <div className="nhsuk-card__content">
                  <h3 className="nhsuk-card__heading nhsuk-heading-m">
                    <Link className="nhsuk-card__link" href={p.href}>{p.title}</Link>
                  </h3>
                  <p className="nhsuk-card__description">{p.detail}</p>
                  <p className="nhsuk-u-margin-bottom-0 flex flex-wrap gap-1">
                    {p.tags.map((tag) => (
                      <span key={tag} className="nhsuk-tag nhsuk-tag--blue">{tag}</span>
                    ))}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default HomeStorytelling
