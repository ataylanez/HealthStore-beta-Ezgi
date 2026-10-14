'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PORTAL_PATHS } from '@/lib/supplierPortal'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * Prototype sign-in gate for the Supplier portal: any portal URL redirects to
 * sign-in when signed out (the sign-in page itself is always reachable).
 * Nothing renders until stored state has been read, to avoid a flash of
 * signed-in content.
 */
export default function PortalGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { hydrated, signedIn } = useSupplierPortal()
  const isSignIn = pathname === PORTAL_PATHS.signIn

  useEffect(() => {
    if (hydrated && !signedIn && !isSignIn) {
      router.replace(`${PORTAL_PATHS.signIn}?next=${encodeURIComponent(pathname ?? PORTAL_PATHS.dashboard)}`)
    }
  }, [hydrated, signedIn, isSignIn, pathname, router])

  if (isSignIn) return <>{children}</>
  if (!hydrated || !signedIn) return null
  return <>{children}</>
}
