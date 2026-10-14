import CompanyCheckAnswers from '@/components/supplier-portal/CompanyCheckAnswers'
import { COMPANY_TITLE } from '@/lib/supplierCompany'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Check your answers — ${COMPANY_TITLE} — ${PORTAL_SERVICE_NAME}` }

export default function CompanyCheckAnswersPage() {
  return <CompanyCheckAnswers />
}
