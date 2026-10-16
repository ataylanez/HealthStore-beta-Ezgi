import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { LOCAL_ASSURANCE_SENTENCE } from '@/lib/content/productNarratives'

/** NHS content page: breadcrumb, small main wrapper, two-thirds reading column, heading-xl / heading-m. */
export default function AboutPage() {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb items={[{ label: 'How it works' }]} />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h1 className="nhsuk-heading-xl">How the NHS HealthStore helps</h1>
            <p className="nhsuk-lede-text">
              We bring supplier evidence, NICE recommendations and commercial support together in one place.
              Commissioners retain all commissioning, clinical safety, assurance and deployment accountability.
            </p>

            <section>
              <h2 className="nhsuk-heading-m">Assurance support</h2>
              <p>
                We centrally hold supplier assurance evidence — completed DTAC, accessibility audit, security
                certifications and more - which are reviewed and monitored for expiry. {LOCAL_ASSURANCE_SENTENCE}
              </p>
            </section>
            <section>
              <h2 className="nhsuk-heading-m">Accountability stays local</h2>
              <p>Clinical safety, local assurance, procurement, deployment and governance remain your responsibility.</p>
            </section>
            <section>
              <h2 className="nhsuk-heading-m">Impact modelling</h2>
              <p>Pathway fit with visible assumptions — conservative, central and evidence-led scenarios.</p>
            </section>
            <section>
              <h2 className="nhsuk-heading-m">Commercial route</h2>
              <p>Buyer documentation, supplier conversations under clear roles, framework guidance.</p>
            </section>

            <section>
              <h2 className="nhsuk-heading-m">What we broker</h2>
              <ul className="nhsuk-list nhsuk-list--bullet">
                <li>Pathway fit and impact modelling with visible assumptions</li>
                <li>Commercial route guidance and buyer documentation</li>
                <li>Supplier conversations under clear roles</li>
                <li>Mobilisation and evaluation design support</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
