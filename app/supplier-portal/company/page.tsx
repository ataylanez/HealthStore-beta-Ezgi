import CompanyInformationPage from '@/components/supplier-portal/CompanyInformationPage'
import { COMPANY_TITLE } from '@/lib/supplierCompany'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `${COMPANY_TITLE} — ${PORTAL_SERVICE_NAME}` }

export default function CompanyPage() {
  return <CompanyInformationPage />
}
