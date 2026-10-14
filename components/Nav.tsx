'use client'

/**
 * Global header — NHS.UK frontend Header styling + React-safe “More” overflow menu.
 * Official header.js moves DOM nodes (incompatible with React reconciliation); this
 * mirrors the same visual/interaction pattern with ResizeObserver instead.
 * [Provenance: NHS] service-manual.nhs.uk/design-system/components/header
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCompareBasket } from '@/components/CompareBasketProvider'
import {
  PORTAL_PATHS,
  PORTAL_SERVICE_NAME,
  SAMPLE_SUPPLIER,
  isPortalFocusedPath,
  isSupplierPortalPath,
} from '@/lib/supplierPortal'
import { useSupplierPortal } from '@/components/supplier-portal/useSupplierPortal'
import PhaseBanner from '@/components/PhaseBanner'

const NHS_LOGO = (
  <svg
    className="nhsuk-logo"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 16"
    height={40}
    width={100}
    focusable="false"
    aria-hidden="true"
  >
    <path className="nhsuk-logo__background" fill="#005eb8" d="M0 0h40v16H0z" />
    <path
      className="nhsuk-logo__text"
      fill="#fff"
      d="M3.9 1.5h4.4l2.6 9h.1l1.8-9h3.3l-2.8 13H9l-2.7-9h-.1l-1.8 9H1.1M17.3 1.5h3.6l-1 4.9h4L25 1.5h3.5l-2.7 13h-3.5l1.1-5.6h-4.1l-1.2 5.6h-3.4M37.7 4.4c-.7-.3-1.6-.6-2.9-.6-1.4 0-2.5.2-2.5 1.3 0 1.8 5.1 1.2 5.1 5.1 0 3.6-3.3 4.5-6.4 4.5-1.3 0-2.9-.3-4-.7l.8-2.7c.7.4 2.1.7 3.2.7s2.8-.2 2.8-1.5c0-2.1-5.1-1.3-5.1-5 0-3.4 2.9-4.4 5.8-4.4 1.6 0 3.1.2 4 .6"
    />
  </svg>
)

const CHEVRON_DOWN = (
  <svg
    className="nhsuk-icon nhsuk-icon__chevron-down"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={16}
    height={16}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M15.5 12a1 1 0 0 1-.29.71l-5 5a1 1 0 0 1-1.42-1.42l4.3-4.29-4.3-4.29a1 1 0 0 1 1.42-1.42l5 5a1 1 0 0 1 .29.71z" />
  </svg>
)

const USER_ICON = (
  <svg
    className="nhsuk-icon nhsuk-icon--user"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={16}
    height={16}
    fill="currentColor"
    focusable="false"
    aria-hidden="true"
  >
    <path d="M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm0 2a9 9 0 0 0-5 16.5V18a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1.5A9 9 0 0 0 12 3Zm0 3a3.5 3.5 0 1 1-3.5 3.5A3.4 3.4 0 0 1 12 6Z" />
  </svg>
)

type NavEntry = {
  id: string
  href?: string
  label: ReactNode
  ariaLabel?: string
  active?: boolean
  onClick?: () => void
}

function flashFocusThenBlur(el: HTMLElement, fromKeyboard: boolean) {
  // Keep keyboard focus for a11y; pointer clicks get a brief yellow flash then clear.
  if (fromKeyboard) return
  window.setTimeout(() => {
    if (document.activeElement === el) el.blur()
  }, 180)
}

function NavLinkContent({
  entry,
  onNavigate,
}: {
  entry: NavEntry
  onNavigate?: () => void
}) {
  if (entry.onClick) {
    return (
      <button
        type="button"
        className="nhsuk-header__navigation-link"
        onClick={e => {
          entry.onClick?.()
          onNavigate?.()
          flashFocusThenBlur(e.currentTarget, e.detail === 0)
        }}
      >
        {entry.label}
      </button>
    )
  }
  return (
    <Link
      className="nhsuk-header__navigation-link"
      href={entry.href ?? '/'}
      aria-current={entry.active ? 'page' : undefined}
      aria-label={entry.ariaLabel}
      onClick={e => {
        onNavigate?.()
        flashFocusThenBlur(e.currentTarget, e.detail === 0)
      }}
    >
      {entry.label}
    </Link>
  )
}

export default function Nav({
  commissioningContextLabel: _commissioningContextLabel,
  isLoggedIn,
  onOpenAiPanel,
}: {
  commissioningContextLabel: string
  isLoggedIn: boolean
  onOpenAiPanel?: () => void
}) {
  const path = usePathname() ?? ''
  const router = useRouter()
  const { ids, count } = useCompareBasket()
  const { signedIn: portalAccount, signOut: portalSignOut } = useSupplierPortal()
  const isPortal = isSupplierPortalPath(path)
  const menuId = useId()

  const navRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const moreRef = useRef<HTMLLIElement>(null)

  const [overflowIds, setOverflowIds] = useState<string[]>([])
  const [moreOpen, setMoreOpen] = useState(false)

  const compareHref =
    ids.length > 0 ? `/compare?ids=${ids.map(id => encodeURIComponent(id)).join(',')}` : '/compare'

  const commissionerEntries: NavEntry[] = [
    {
      id: 'about',
      href: '/about',
      label: 'About',
      active: path === '/about',
    },
    {
      id: 'catalogue',
      href: '/catalogue',
      label: 'Product catalogue',
      active: path === '/catalogue' || path.startsWith('/catalogue/') || path.startsWith('/apps/'),
    },
    {
      id: 'compare',
      href: compareHref,
      label: (
        <>
          <span className="hs-nav-link-label">Comparison tool</span>
          {count > 0 ? (
            <span className="hs-nav-count" aria-hidden>
              {count}
            </span>
          ) : null}
        </>
      ),
      ariaLabel: count > 0 ? `Comparison tool, ${count} selected` : 'Comparison tool',
      active: path === '/compare',
    },
    {
      id: 'funding',
      href: '/funding',
      label: 'Funding index',
      active: path === '/funding',
    },
    {
      id: 'resources',
      href: '/resources',
      label: 'Resource library',
      active: path === '/resources' || path.startsWith('/resources/'),
    },
  ]

  if (isLoggedIn && onOpenAiPanel) {
    commissionerEntries.push({
      id: 'ai',
      label: 'AI Advisor',
      onClick: onOpenAiPanel,
    })
  }

  // Supplier portal: same NHS header navigation, portal sections instead.
  const portalEntries: NavEntry[] = [
    {
      id: 'portal-dashboard',
      href: PORTAL_PATHS.dashboard,
      label: 'Dashboard',
      active: path === PORTAL_PATHS.dashboard,
    },
    {
      id: 'portal-products',
      href: PORTAL_PATHS.products,
      label: 'Product management',
      active: path === PORTAL_PATHS.products || path.startsWith(`${PORTAL_PATHS.products}/`),
    },
    {
      id: 'portal-published',
      href: PORTAL_PATHS.published,
      label: 'Published pages',
      active: path === PORTAL_PATHS.published || path.startsWith(`${PORTAL_PATHS.published}/`),
    },
  ]

  const primaryEntries = isPortal ? portalEntries : commissionerEntries

  const primaryIds = primaryEntries.map(e => e.id).join('|')

  const measure = useCallback(() => {
    const list = listRef.current
    const more = moreRef.current
    if (!list) return

    document.body.classList.add('js-enabled')

    const ids = primaryIds.split('|').filter(Boolean)

    const setItemHidden = (id: string, hidden: boolean) => {
      const el = itemRefs.current.get(id)
      if (el) el.hidden = hidden
    }
    const setMoreHidden = (hidden: boolean) => {
      if (!more) return
      more.hidden = hidden
      more.classList.toggle('nhsuk-mobile-menu-container--visible', !hidden)
    }
    const rowOverflows = () => list.scrollWidth - list.clientWidth > 1

    // Reveal every primary item. Hide More first so we can see whether the
    // full set fits on one row (Notify / nhsuk-frontend header behaviour).
    for (const id of ids) setItemHidden(id, false)
    setMoreHidden(true)

    if (!rowOverflows()) {
      setOverflowIds(prev => (prev.length === 0 ? prev : []))
      setMoreOpen(false)
      return
    }

    // Reserve More, then hide items from the right until nothing is clipped.
    setMoreHidden(false)
    const overflow: string[] = []
    for (let i = ids.length - 1; i >= 0 && rowOverflows(); i -= 1) {
      const id = ids[i]
      setItemHidden(id, true)
      overflow.unshift(id)
    }

    setOverflowIds(prev => {
      if (prev.length === overflow.length && prev.every((id, i) => id === overflow[i])) return prev
      return overflow
    })
  }, [primaryIds])

  useLayoutEffect(() => {
    document.body.classList.add('js-enabled')
    measure()
  }, [measure, path, count, isLoggedIn])

  useEffect(() => {
    document.body.classList.add('js-enabled')
    const onResize = () => {
      window.requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onResize)
    const ro = listRef.current ? new ResizeObserver(onResize) : null
    if (listRef.current && ro) ro.observe(listRef.current)
    const fontsReady = document.fonts?.ready?.then(onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
      void fontsReady
    }
  }, [measure])

  useEffect(() => {
    if (!moreOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    function onPointer(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [moreOpen])

  // Push page content down while More is open (NHS WCAG: do not cover content).
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    if (moreOpen) {
      const dropdown = nav.querySelector('.nhsuk-header__drop-down:not(.nhsuk-header__drop-down--hidden)') as HTMLElement | null
      nav.style.marginBottom = dropdown ? `${dropdown.offsetHeight}px` : '0'
    } else {
      nav.style.marginBottom = '0'
    }
  }, [moreOpen, overflowIds])

  const overflowSet = new Set(overflowIds)
  const moreVisible = overflowIds.length > 0
  const overflowEntries = primaryEntries.filter(e => overflowSet.has(e.id))
  const moreHasCurrent = overflowEntries.some(e => e.active)

  // Supplier sign-in and onboarding form pages are focused journeys: NHS header
  // without the navigation row (the official header supports this variant).
  const hideNavigation = isPortalFocusedPath(path)
  const serviceName = isPortal ? PORTAL_SERVICE_NAME : 'NHS Commissioning Store'

  return (
    <header className="nhsuk-header" role="banner">
      <div className="nhsuk-header__container">
        <div className="nhsuk-header__logo">
          <Link
            className="nhsuk-header__link nhsuk-header__link--service"
            href={isPortal ? PORTAL_PATHS.dashboard : '/'}
            aria-label={`${serviceName} homepage`}
            onClick={e => flashFocusThenBlur(e.currentTarget, e.detail === 0)}
          >
            {NHS_LOGO}
            <span className="nhsuk-header__service-name">{serviceName}</span>
          </Link>
        </div>

        {isPortal && portalAccount && (
          <nav className="nhsuk-header__account" aria-label="Account">
            <ul className="nhsuk-header__account-list">
              <li className="nhsuk-header__account-item">
                <Link className="nhsuk-header__account-link" href={PORTAL_PATHS.account}>
                  {USER_ICON}
                  {SAMPLE_SUPPLIER.contactName}
                </Link>
              </li>
              <li className="nhsuk-header__account-item">
                <button
                  type="button"
                  className="nhsuk-header__account-button"
                  onClick={() => {
                    portalSignOut()
                    router.push(PORTAL_PATHS.signIn)
                  }}
                >
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {!hideNavigation && (
      <div className="nhsuk-navigation-container">
        <nav
          ref={navRef}
          className="nhsuk-navigation"
          id="header-navigation"
          role="navigation"
          aria-label="Menu"
        >
          <ul
            ref={listRef}
            className="nhsuk-header__navigation-list nhsuk-header__navigation-list--left-aligned"
          >
            {primaryEntries.map(entry => (
              <li
                key={entry.id}
                ref={el => {
                  if (el) itemRefs.current.set(entry.id, el)
                  else itemRefs.current.delete(entry.id)
                }}
                className={`nhsuk-header__navigation-item${entry.active ? ' nhsuk-header__navigation-item--current' : ''}`}
                hidden={overflowSet.has(entry.id)}
              >
                <NavLinkContent entry={entry} onNavigate={() => setMoreOpen(false)} />
              </li>
            ))}

            <li
              ref={moreRef}
              className={`nhsuk-mobile-menu-container${moreVisible ? ' nhsuk-mobile-menu-container--visible' : ''}`}
              hidden={!moreVisible}
            >
              <button
                type="button"
                className={`nhsuk-header__menu-toggle nhsuk-header__navigation-link${moreVisible ? ' nhsuk-header__menu-toggle--visible' : ''}${moreHasCurrent ? ' hs-nav-more--current' : ''}`}
                id="toggle-menu"
                aria-expanded={moreOpen}
                aria-controls={menuId}
                onClick={() => setMoreOpen(o => !o)}
              >
                <span className="nhsuk-u-visually-hidden">Browse </span>
                More
                {CHEVRON_DOWN}
              </button>
            </li>
          </ul>

          <ul
            id={menuId}
            className={`nhsuk-header__drop-down${moreOpen && moreVisible ? '' : ' nhsuk-header__drop-down--hidden'}`}
          >
            {overflowEntries.map(entry => (
              <li
                key={entry.id}
                className={`nhsuk-header__navigation-item${entry.active ? ' nhsuk-header__navigation-item--current' : ''}`}
              >
                <NavLinkContent entry={entry} onNavigate={() => setMoreOpen(false)} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
      )}

      {/* GOV.UK: phase banner sits inside <header>, after service navigation. */}
      <PhaseBanner tag="Alpha" />
    </header>
  )
}
