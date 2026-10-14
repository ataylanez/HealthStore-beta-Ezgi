import { PortalSkeletonPage } from '@/components/supplier-portal/PortalSkeletonPage'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Account management — ${PORTAL_SERVICE_NAME}` }

export default function AccountManagementPage() {
  return (
    <PortalSkeletonPage
      title="Account management"
      lede="Manage access and your password."
    />
  )
}
