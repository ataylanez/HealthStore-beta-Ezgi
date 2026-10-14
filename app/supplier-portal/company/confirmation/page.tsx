import CompanyConfirmation from '@/components/supplier-portal/CompanyConfirmation'
import { COMPANY_TITLE } from '@/lib/supplierCompany'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Submitted — ${COMPANY_TITLE} — ${PORTAL_SERVICE_NAME}` }

export default function CompanyConfirmationPage() {
  return <CompanyConfirmation />
}
