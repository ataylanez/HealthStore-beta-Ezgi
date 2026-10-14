'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import type { App } from '@/lib/data'
import Nav from './Nav'
import BackToTop from './BackToTop'
import { CompareBasketProvider } from './CompareBasketProvider'
import { EoiProvider } from './EoiProvider'
import { ToastProvider } from './ui/Toast'
import ClearDataModal from './ClearDataModal'
import AiAdvisorPanel, { type AiAdvisorClientProfile } from './ai/AiAdvisorPanel'
import NhsFrontendInit from '@/components/nhs/NhsFrontendInit'
import { AUTH_DISABLED } from '@/lib/authMode'
import { PORTAL_NAME, PORTAL_PATHS, isSupplierPortalPath } from '@/lib/supplierPortal'
import { clearSupplierPortal } from '@/components/supplier-portal/useSupplierPortal'

export default function AppShell({
  children,
  isLoggedIn = false,
  commissioningContextLabel = '',
  allApps,
  aiProfile,
}: {
  children: React.ReactNode
  isLoggedIn?: boolean
  commissioningContextLabel?: string
  allApps: App[]
  aiProfile?: AiAdvisorClientProfile | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isGatePage = pathname === '/gate'
  const isSupplierPortal = isSupplierPortalPath(pathname)
  const [showClearData, setShowClearData] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  /** Open-access treats everyone as able to use catalogue tools; hide auth/org chrome. */
  const openAccess = AUTH_DISABLED
  const showAuthChrome = !openAccess && isLoggedIn
  const icbSubheaderLabel =
    !openAccess && isLoggedIn && commissioningContextLabel ? commissioningContextLabel : ''

  /** The gate route renders without global nav/footer but still needs landmarks + skip link (WCAG 2.4.1, 1.3.1). */
  if (isGatePage) {
    return (
      <>
        <a href="#main-content" className="nhsuk-skip-link">
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1}>{children}</main>
      </>
    )
  }

  return (
    <div className={`hs-app-shell${isSupplierPortal ? ' hs-supplier-portal' : ''}`}>
      <a href="#main-content" className="nhsuk-skip-link">Skip to main content</a>
      <ToastProvider>
        <CompareBasketProvider allApps={allApps}>
          <EoiProvider>
            <Nav
              commissioningContextLabel={icbSubheaderLabel}
              isLoggedIn={showAuthChrome}
              onOpenAiPanel={showAuthChrome && aiProfile ? () => setAiPanelOpen(true) : undefined}
            />
            <main id="main-content" className="hs-app-shell__main" tabIndex={-1}>{children}</main>
            {showAuthChrome && aiProfile && (
              <AiAdvisorPanel
                open={aiPanelOpen}
                onClose={() => setAiPanelOpen(false)}
                profile={aiProfile}
              />
            )}
            {showAuthChrome && (
              <ClearDataModal open={showClearData} onClose={() => setShowClearData(false)} />
            )}
          </EoiProvider>
        </CompareBasketProvider>
      </ToastProvider>
      <BackToTop />
      <NhsFrontendInit />
      {/* [Provenance: NHS] Official NHS Footer markup. Grows to fill remaining viewport. */}
      <footer role="contentinfo" className="hs-app-shell__footer mt-16">
        <div className="nhsuk-footer-container">
          <div className="nhsuk-width-container">
            <h2 className="nhsuk-u-visually-hidden">Support links</h2>
            <div className="nhsuk-footer">
              <ul className="nhsuk-footer__list">
                <li className="nhsuk-footer__list-item nhsuk-footer-default__list-item">
                  <Link className="nhsuk-footer__list-item-link" href="/cookies">Cookies</Link>
                </li>
                {showAuthChrome && (
                  <li className="nhsuk-footer__list-item nhsuk-footer-default__list-item">
                    <button
                      type="button"
                      onClick={() => setShowClearData(true)}
                      className="nhsuk-footer__list-item-link nhsuk-u-padding-0"
                      style={{ background: 'none', border: 0, cursor: 'pointer' }}
                    >
                      Manage data
                    </button>
                  </li>
                )}
                <li className="nhsuk-footer__list-item nhsuk-footer-default__list-item">
                  <Link className="nhsuk-footer__list-item-link" href={PORTAL_PATHS.dashboard}>{PORTAL_NAME}</Link>
                </li>
                {isSupplierPortal && (
                  <li className="nhsuk-footer__list-item nhsuk-footer-default__list-item">
                    {/* Prototype control: signs out and wipes every onboarding form, draft and status. */}
                    <button
                      type="button"
                      onClick={() => {
                        clearSupplierPortal()
                        router.push(PORTAL_PATHS.signIn)
                      }}
                      className="nhsuk-footer__list-item-link nhsuk-u-padding-0"
                      style={{ background: 'none', border: 0, cursor: 'pointer' }}
                    >
                      Clear data
                    </button>
                  </li>
                )}
              </ul>
              <div>
                <p className="nhsuk-footer__copyright">
                  NHS HealthStore — prototype based on publicly available information as of March 2026.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
