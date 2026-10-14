import { Suspense } from 'react'
import SupplierSignInForm from '@/components/supplier-portal/SupplierSignInForm'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Sign in — ${PORTAL_SERVICE_NAME}` }

export default function SupplierSignInPage() {
  return (
    <Suspense fallback={null}>
      <SupplierSignInForm />
    </Suspense>
  )
}
