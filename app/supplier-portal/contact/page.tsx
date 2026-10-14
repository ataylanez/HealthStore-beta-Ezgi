import { PortalSkeletonPage } from '@/components/supplier-portal/PortalSkeletonPage'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Contact — ${PORTAL_SERVICE_NAME}` }

export default function ContactUsPage() {
  return <PortalSkeletonPage title="Contact" lede="Contact the HealthStore Team." />
}
