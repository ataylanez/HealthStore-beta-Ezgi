import { notFound } from 'next/navigation'
import CompanyQuestionPage from '@/components/supplier-portal/CompanyQuestionPage'
import { COMPANY_TASK, COMPANY_TITLE } from '@/lib/supplierCompany'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

type Params = Promise<{ step: string }>

export function generateStaticParams() {
  return COMPANY_TASK.questions.map((_, i) => ({ step: String(i + 1) }))
}

function parseStep(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const n = Number(raw)
  return n >= 1 && n <= COMPANY_TASK.questions.length ? n : null
}

export async function generateMetadata({ params }: { params: Params }) {
  const { step: raw } = await params
  const step = parseStep(raw)
  if (!step) return { title: `${COMPANY_TITLE} — ${PORTAL_SERVICE_NAME}` }
  return { title: `${COMPANY_TASK.questions[step - 1].label} — ${COMPANY_TITLE} — ${PORTAL_SERVICE_NAME}` }
}

/** One Company information question (1-based step into COMPANY_TASK.questions). */
export default async function CompanyQuestionRoute({ params }: { params: Params }) {
  const { step: raw } = await params
  const step = parseStep(raw)
  if (!step) notFound()
  return <CompanyQuestionPage step={step} />
}
