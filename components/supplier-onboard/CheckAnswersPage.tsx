'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { Button } from '@/components/ui/Button'
import {
  CHECKBOX_SEPARATOR,
  CONFIRMED_VALUE,
  MULTI_UPLOAD_CONFIRMED_SUFFIX,
  SECTIONS,
  SUBMISSION_DECLARATION,
  UPLOAD_REFERENCE_SUFFIX,
  confirmationPath,
  fieldKey,
  formBasePath,
  isQuestionAnswered,
  isValidIsoDate,
  otherDetailsKey,
  parseUploadedDocuments,
  knownProductName,
  optionDisplayLabel,
  questionDisplayLabel,
  substituteProductName,
  taskStepHref,
  visibleQuestions,
  type OnboardingQuestion,
  type TaskAnswers,
} from '@/lib/supplierOnboarding'
import { useOnboardingProgress } from './useOnboardingProgress'

const NOT_PROVIDED = 'Not provided'

/**
 * Check your answers. [Provenance: NHS / GOV.UK "Check answers" pattern]
 *
 * Replays every answer from every section as NHS Summary lists (one per task,
 * grouped under the numbered section headings from the task list), each row
 * with a Change link back to its question page. Only questions on the
 * supplier's route (see `visibleQuestions`) are shown. The declaration sits above the
 * NHS green "Confirm and submit" action; confirming records a reference and
 * moves to the confirmation page.
 *
 * Guard: reachable only once every task is Completed (the Submit button that
 * leads here is disabled otherwise); direct visits are sent back to the list.
 */
export default function CheckAnswersPage({ formId }: { formId: string }) {
  const router = useRouter()
  const { hydrated, allComplete, getAnswers, completeSubmission } = useOnboardingProgress(formId)
  const taskListHref = formBasePath(formId)
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (hydrated && !allComplete && !submitting) router.replace(taskListHref)
  }, [hydrated, allComplete, submitting, router, taskListHref])

  useEffect(() => {
    if (hydrated && allComplete) headingRef.current?.focus()
  }, [hydrated, allComplete])

  if (!hydrated || !allComplete) return null

  function confirmAndSubmit() {
    if (submitting) return
    setSubmitting(true)
    completeSubmission()
    router.push(confirmationPath(formId))
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={taskListHref} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Check your answers before submitting
          </h1>

          {SECTIONS.map((section, sectionIndex) => (
            <section key={section.id} aria-labelledby={`${section.id}-check-heading`} className="nhsuk-u-margin-bottom-7">
              <h2 id={`${section.id}-check-heading`} className="nhsuk-heading-m">
                {sectionIndex + 1}. {section.title}
              </h2>
              {section.tasks.map((task) => {
                const answers = getAnswers(task.id)
                const visible = visibleQuestions(task, answers)
                const answersFor = (taskId: string) => (taskId === task.id ? answers : getAnswers(taskId))
                const productName = knownProductName(answersFor)
                const labelFor = (question: OnboardingQuestion) => questionDisplayLabel(question, answersFor)
                const displayQuestion = (question: OnboardingQuestion): OnboardingQuestion => {
                  if (question.type !== 'radios' && question.type !== 'checkboxes') return question
                  return {
                    ...question,
                    options: question.options.map((o) => ({
                      ...o,
                      label: optionDisplayLabel(question, o, answersFor),
                      hint: o.hint ? substituteProductName(o.hint, productName) : o.hint,
                    })),
                  }
                }
                return (
                  <div key={task.id} className="nhsuk-u-margin-bottom-5">
                    {/* Task title shown only when it is not simply repeated by its single question. */}
                    {(visible.length !== 1 || labelFor(visible[0].question) !== task.title) && (
                      <h3 className="nhsuk-heading-s nhsuk-u-margin-bottom-2">{task.title}</h3>
                    )}
                    <dl className="nhsuk-summary-list">
                      {visible.map(({ question, step }) => {
                        if (question.hideInSummary) return null
                        const label = labelFor(question)
                        return (
                        <div key={question.id} className="nhsuk-summary-list__row">
                          <dt className="nhsuk-summary-list__key">
                            {question.code && (
                              <span className="nhsuk-u-secondary-text-color nhsuk-body-s nhsuk-u-margin-bottom-0" style={{ display: 'block' }}>
                                {question.code}
                              </span>
                            )}
                            {label}
                          </dt>
                          <dd className="nhsuk-summary-list__value">{formatAnswer(displayQuestion(question), answers)}</dd>
                          <dd className="nhsuk-summary-list__actions">
                            <Link className="hs-link-button" href={taskStepHref(formId, task, step)}>
                              Change<span className="nhsuk-u-visually-hidden"> {question.code ? `${question.code} ` : ''}{label}</span>
                            </Link>
                          </dd>
                        </div>
                        )
                      })}
                    </dl>
                  </div>
                )
              })}
            </section>
          ))}

          <h2 className="nhsuk-heading-m">Submit your onboarding form</h2>
          <p className="nhsuk-body-m">{SUBMISSION_DECLARATION}</p>
          <Button variant="confirm" onClick={confirmAndSubmit} loading={submitting}>
            {submitting ? 'Submitting…' : 'Confirm and submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Option label, with nested follow-up text appended when that option reveals a field. */
function choiceLabel(question: OnboardingQuestion, value: string, answers: TaskAnswers): string | undefined {
  if (question.type !== 'radios' && question.type !== 'checkboxes') return undefined
  const label = question.options.find((o) => o.value === value)?.label
  if (!label) return undefined
  const followUp = question.options.find((o) => o.value === value)?.followUp || (value === 'other' ? { label: 'Give details' } : undefined)
  if (!followUp) return label
  const details = (answers[otherDetailsKey(question.id)] ?? '').trim()
  return details ? `${label}: ${details}` : label
}

/** Human-readable replay of one answer, per question type. Shared with Company information. */
export function formatAnswer(question: OnboardingQuestion, answers: TaskAnswers): ReactNode {
  const raw = answers[question.id] ?? ''
  const empty = <span className="nhsuk-u-secondary-text-color">{NOT_PROVIDED}</span>

  switch (question.type) {
    case 'radios':
      return choiceLabel(question, raw, answers) ?? empty

    case 'checkboxes': {
      const chosen = raw.split(CHECKBOX_SEPARATOR).filter(Boolean)
      const labels = chosen
        .map((value) => choiceLabel(question, value, answers))
        .filter((label): label is string => !!label)
      return labels.length > 0 ? labels.join(', ') : empty
    }

    case 'textarea':
      return raw.trim() ? <span style={{ whiteSpace: 'pre-wrap' }}>{raw.trim()}</span> : empty

    case 'text': {
      const value = raw.trim()
      if (!value) return empty
      if (question.inputType === 'url' && /^https?:\/\//i.test(value)) {
        return (
          <a className="nhsuk-link" href={value} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
            {value}
            <span className="nhsuk-u-visually-hidden"> (opens in new tab)</span>
          </a>
        )
      }
      return question.suffix ? `${value}${question.suffix}` : value
    }

    case 'fields': {
      // One line per field; `inline` fields join the previous line (e.g. "First Last").
      const lines: string[] = []
      for (const field of question.fields) {
        const value = (answers[fieldKey(question.id, field)] ?? '').trim()
        if (!value) continue
        if (field.inline && lines.length > 0) lines[lines.length - 1] += ` ${value}`
        else lines.push(value)
      }
      if (lines.length === 0) return empty
      return (
        <>
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </>
      )
    }

    case 'date': {
      if (!isValidIsoDate(raw)) return empty
      const [y, m, d] = raw.split('-').map(Number)
      return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    case 'upload': {
      if (question.multiple) {
        if (raw === NOT_PROVIDED) return raw
        const docs = parseUploadedDocuments(raw)
        if (docs.length === 0) return empty
        return (
          <ul className="nhsuk-list nhsuk-u-margin-bottom-0">
            {docs.map((doc, i) => (
              <li key={`${doc.uploadedAt}-${i}`}>{doc.name}</li>
            ))}
          </ul>
        )
      }
      if (!isQuestionAnswered(question, answers)) return empty
      if (question.noReference) return raw
      return (
        <>
          {answers[`${question.id}${UPLOAD_REFERENCE_SUFFIX}`]}
          <br />
          <span>{raw}</span>
        </>
      )
    }

    case 'blocked':
    case 'info':
      return empty

    case 'multi-upload': {
      const docs = parseUploadedDocuments(raw)
      const confirmed = answers[`${question.id}${MULTI_UPLOAD_CONFIRMED_SUFFIX}`] === CONFIRMED_VALUE
      if (docs.length === 0) return empty
      return (
        <>
          <ul className="nhsuk-list nhsuk-u-margin-bottom-2">
            {docs.map((doc, i) => (
              <li key={`${doc.uploadedAt}-${i}`}>
                {doc.reference}
                <br />
                <span>{doc.name}</span>
              </li>
            ))}
          </ul>
          <span className="nhsuk-body-m nhsuk-u-margin-bottom-0">
            {docs.length} {docs.length === 1 ? 'document' : 'documents'}
            {confirmed ? ', marked as complete' : ''}
          </span>
        </>
      )
    }
  }
}
