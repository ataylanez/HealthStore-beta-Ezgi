import type { Metadata } from 'next'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import ResetCookieConsentButton from '@/components/ResetCookieConsentButton'

export const metadata: Metadata = {
  title: 'Cookies — NHS HealthStore',
  description: 'How the NHS HealthStore uses cookies and similar technologies, including analytics with Hotjar.',
}

/** NHS content page: breadcrumb, small main wrapper, two-thirds reading column, heading-xl / heading-m. */
export default function CookiesPage() {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb items={[{ label: 'Cookies' }]} />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h1 className="nhsuk-heading-xl">Cookies</h1>
            <p className="nhsuk-lede-text">This page explains how we use cookies and browser storage for this prototype.</p>

            <section aria-labelledby="cookies-storage-heading">
              <h2 id="cookies-storage-heading" className="nhsuk-heading-m">
                Cookie choice (browser storage)
              </h2>
              <p>
                When you accept or reject analytics, we store that choice in your browser&apos;s{' '}
                <strong>local storage</strong> (not an HTTP cookie) so we do not ask you again on every visit. If you clear
                site data for this site, you will be asked again.
              </p>
            </section>

            <section aria-labelledby="cookies-analytics-heading">
              <h2 id="cookies-analytics-heading" className="nhsuk-heading-m">
                Analytics (Hotjar)
              </h2>
              <p>
                We use Hotjar to help us understand how this prototype is used and improve it. While the cookie banner is
                still showing &mdash; before you have made a choice &mdash; analytics may run.
              </p>
              <p>
                If you choose <strong>Accept analytics cookies</strong>, Hotjar continues to load.
              </p>
              <p>
                If you choose <strong>Reject analytics cookies</strong>, we stop loading Hotjar on your device.
              </p>
            </section>

            <section aria-labelledby="cookies-change-heading">
              <h2 id="cookies-change-heading" className="nhsuk-heading-m">
                Change your mind
              </h2>
              <p>
                Use the button below to clear your saved analytics choice and reload the page. The cookie banner will appear
                again so you can accept or reject analytics cookies.
              </p>
              <ResetCookieConsentButton />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
