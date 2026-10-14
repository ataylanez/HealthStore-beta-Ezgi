import { notFound } from 'next/navigation'
import TaskQuestionPage from '@/components/supplier-onboard/TaskQuestionPage'
import TaskStubPage from '@/components/supplier-onboard/TaskStubPage'
import { ALL_TASKS, SERVICE_NAME, findTask } from '@/lib/supplierOnboarding'
import { ONBOARDING_FORMS, findOnboardingForm } from '@/lib/supplierPortal'

type Params = Promise<{ formId: string; task: string }>

export function generateStaticParams() {
  return ONBOARDING_FORMS.flatMap((f) => ALL_TASKS.map((t) => ({ formId: f.id, task: t.slug })))
}

export async function generateMetadata({ params }: { params: Params }) {
  const { task: slug } = await params
  const match = findTask(slug)
  if (!match) return { title: `${SERVICE_NAME} — NHS HealthStore` }
  return { title: `${match.task.title} — ${SERVICE_NAME}` }
}

/** First question of a task (later questions live at .../[formId]/[task]/[step]). */
export default async function SupplierOnboardTaskPage({ params }: { params: Params }) {
  const { formId, task: slug } = await params
  const match = findTask(slug)
  if (!match || !findOnboardingForm(formId)) notFound()
  if (match.task.questions.length === 0) {
    return <TaskStubPage formId={formId} task={match.task} section={match.section} />
  }
  return <TaskQuestionPage formId={formId} task={match.task} step={1} />
}
