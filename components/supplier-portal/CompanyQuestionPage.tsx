'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { ErrorSummary } from '@/components/eoi/journey/shared'
import { QuestionField } from '@/components/supplier-onboard/TaskQuestionPage'
import { Button } from '@/components/ui/Button'
import {
  COMPANY_PATHS,
  COMPANY_TASK,
  companyCheckAnswersHref,
  companyNextStep,
  companyPrevStep,
  companyQuestionHref,
  companyReturnHref,
  companySectionForStep,
  companySectionQuestions,
  type CompanyReturnTo,
} from '@/lib/supplierCompany'
import { isQuestionAnswered, isQuestionVisible, questionKeys, type OnboardingQuestion, type TaskAnswers } from '@/lib/supplierOnboarding'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * One Company information question. [Provenance: NHS / GOV.UK one thing per page]
 *
 * Same layout, caption and controls as a product onboarding task page
 * (TaskQuestionPage / QuestionField): the chapter title and "question x of y"
 * in the caption, and the question as the page heading. Two modes, chosen by
 * the `return` query parameter:
 *  - chapter walkthrough (no `return`): Save and continue to the next question
 *    in this chapter, then to the chapter's Check your answers. Save and exit
 *    keeps the draft and returns to the Company information page; Cancel and
 *    exit discards this page's unsaved edits and does the same.
 *  - single edit (`return=check-answers`): Save and exit / Cancel and exit
 *    return to the chapter's Check your answers.
 * Saving writes to the company draft; nothing is applied until the chapter is
 * submitted from Check your answers.
 */
export default function CompanyQuestionPage({ step }: { step: number }) {
  return (
    <Suspense fallback={null}>
      <Loader step={step} />
    </Suspense>
  )
}

function Loader({ step }: { step: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawReturn = searchParams.get('return')
  const returnTo: CompanyReturnTo | null = rawReturn === 'check-answers' ? rawReturn : null
  const { hydrated, company, saveCompanyDraft } = useSupplierPortal()

  const question = COMPANY_TASK.questions[step - 1]
  const section = companySectionForStep(step)
  const saved = useMemo(() => ({ ...(company.values ?? {}), ...(company.draft ?? {}) }), [company])

  // A question that is not on the current route is skipped to the next one in
  // the chapter that is, or to the chapter's Check your answers at its end.
  const offRoute = hydrated && !isQuestionVisible(question, COMPANY_TASK, saved)
  useEffect(() => {
    if (!offRoute) return
    if (returnTo) {
      router.replace(companyReturnHref(returnTo, section.id))
      return
    }
    const next = companyNextStep(step, saved)
    router.replace(next ? companyQuestionHref(next) : companyCheckAnswersHref(section.id))
  }, [offRoute, returnTo, router, step, saved, section.id])

  if (!hydrated || offRoute) return null

  // Mounted only once stored answers are known, so the draft can be initialised
  // from them without a post-mount state update.
  return <QuestionForm key={`${step}-${rawReturn ?? ''}`} step={step} question={question} saved={saved} returnTo={returnTo} save={saveCompanyDraft} />
}

function QuestionForm({
  step,
  question,
  saved,
  returnTo,
  save,
}: {
  step: number
  question: OnboardingQuestion
  saved: TaskAnswers
  returnTo: CompanyReturnTo | null
  save: (changes: TaskAnswers) => void
}) {
  const router = useRouter()
  const singleEdit = returnTo !== null
  const section = companySectionForStep(step)
  const exitHref = companyReturnHref(returnTo, section.id)

  /** Unsaved answers for this page only. */
  const [draft, setDraft] = useState<TaskAnswers>(() => {
    const initial: TaskAnswers = {}
    for (const key of questionKeys(question)) initial[key] = saved[key] ?? ''
    return initial
  })
  const [error, setError] = useState<string | undefined>()

  const merged = useMemo(() => ({ ...saved, ...draft }), [saved, draft])
  const inSection = companySectionQuestions(section.id, merged)
  const position = inSection.findIndex((v) => v.step === step) + 1
  const total = inSection.length
  const nextStep = companyNextStep(step, merged)
  const prevStep = companyPrevStep(step, merged)
  const backHref = singleEdit ? exitHref : prevStep ? companyQuestionHref(prevStep) : COMPANY_PATHS.page

  const patch = (changes: TaskAnswers) => {
    setDraft((d) => ({ ...d, ...changes }))
    if (error) setError(undefined)
  }
  /** Patch and persist immediately (document uploads). */
  const commit = (changes: TaskAnswers) => {
    setDraft((d) => ({ ...d, ...changes }))
    save(changes)
  }

  function validate(): boolean {
    if (question.optional || isQuestionAnswered(question, merged)) return true
    setError(missingMessage(question))
    return false
  }

  function saveAndContinue() {
    if (!validate()) return
    save(draft)
    router.push(nextStep ? companyQuestionHref(nextStep) : companyCheckAnswersHref(section.id))
  }

  function saveAndExit() {
    if (singleEdit && !validate()) return
    save(draft)
    router.push(exitHref)
  }

  const errorField =
    question.type === 'radios' || question.type === 'checkboxes'
      ? `${question.id}-${question.options[0]?.value}`
      : question.type === 'upload'
        ? `${question.id}-file`
        : question.type === 'date'
          ? `${question.id}-day`
          : question.type === 'fields'
            ? `${question.id}-${question.fields[0]?.key}`
            : question.id
  const errors = error ? [{ field: errorField, message: error }] : []

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={backHref} />
          <ErrorSummary errors={errors} />
          {/* Caption gives chapter context, the questionnaire reference (e.g. A1) and
              the position in the chapter — the same as an onboarding task page. */}
          <span className="nhsuk-caption-l">
            {section.title}
            {question.code ? ` — ${question.code}` : ''}
            {!singleEdit && total > 1 && position > 0 ? ` — question ${position} of ${total}` : ''}
          </span>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (singleEdit) saveAndExit()
              else saveAndContinue()
            }}
          >
            <QuestionField question={question} draft={draft} patch={patch} commit={commit} />

            <div className="nhsuk-u-margin-top-6 flex flex-wrap items-center gap-4">
              {singleEdit ? (
                <Button type="submit">Save and exit</Button>
              ) : (
                <>
                  <Button type="submit">Save and continue</Button>
                  <Button type="button" variant="secondary" onClick={saveAndExit}>
                    Save and exit
                  </Button>
                </>
              )}
              <Button type="button" variant="secondary" onClick={() => router.push(exitHref)}>
                Cancel and exit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function missingMessage(question: OnboardingQuestion): string {
  switch (question.type) {
    case 'radios':
    case 'checkboxes':
      return 'Select an answer'
    case 'upload':
      return question.noReference ? 'Select a file' : 'Select a file and enter a reference name'
    case 'fields':
      return 'Complete the required fields'
    case 'multi-upload':
      return 'Add at least one document and mark the question as complete'
    case 'date':
      return 'Enter a valid date'
    default:
      return 'Enter an answer'
  }
}
