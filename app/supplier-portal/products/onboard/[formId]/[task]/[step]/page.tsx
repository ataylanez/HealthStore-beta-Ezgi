import { notFound, redirect } from 'next/navigation'
import TaskQuestionPage from '@/components/supplier-onboard/TaskQuestionPage'
import { ALL_TASKS, SERVICE_NAME, findTask, taskHref } from '@/lib/supplierOnboarding'
import { ONBOARDING_FORMS, findOnboardingForm } from '@/lib/supplierPortal'

type Params = Promise<{ formId: string; task: string; step: string }>

export function generateStaticParams() {
  return ONBOARDING_FORMS.flatMap((f) =>
    ALL_TASKS.flatMap((t) =>
      t.questions.slice(1).map((_, i) => ({ formId: f.id, task: t.slug, step: String(i + 2) })),
    ),
  )
}

function parseStep(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const n = Number(raw)
  return n >= 1 ? n : null
}

export async function generateMetadata({ params }: { params: Params }) {
  const { task: slug, step: rawStep } = await params
  const match = findTask(slug)
  const step = parseStep(rawStep)
  if (!match || !step || !match.task.questions[step - 1]) {
    return { title: `${SERVICE_NAME} — NHS HealthStore` }
  }
  const question = match.task.questions[step - 1]
  return { title: `${question.pageTitle ?? question.label} — ${match.task.title} — ${SERVICE_NAME}` }
}

/** Question pages 2..n of a multi-question task. Step 1 is the bare task URL. */
export default async function SupplierOnboardTaskStepPage({ params }: { params: Params }) {
  const { formId, task: slug, step: rawStep } = await params
  const match = findTask(slug)
  if (!match || !findOnboardingForm(formId)) notFound()
  const step = parseStep(rawStep)
  if (!step || !match.task.questions[step - 1]) notFound()
  if (step === 1) redirect(taskHref(formId, match.task))
  return <TaskQuestionPage formId={formId} task={match.task} section={match.section} step={step} />
}
