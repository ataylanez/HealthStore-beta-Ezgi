import type { ReactNode } from 'react'
import PortalGuard from '@/components/supplier-portal/PortalGuard'

export default function SupplierPortalLayout({ children }: { children: ReactNode }) {
  return <PortalGuard>{children}</PortalGuard>
}
