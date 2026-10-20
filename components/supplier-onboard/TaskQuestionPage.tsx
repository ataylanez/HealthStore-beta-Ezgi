'use client'

import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { ErrorSummary } from '@/components/eoi/journey/shared'
import { NhsFileUpload } from '@/components/nhs/NhsFileUpload'
import { Button } from '@/components/ui/Button'
import { FormField, Textarea, TextInput } from '@/components/ui/FormField'
import {
  CHECKBOX_SEPARATOR,
  CONFIRMED_VALUE,
  MULTI_UPLOAD_CONFIRMED_SUFFIX,
  UPLOAD_REFERENCE_SUFFIX,
  fieldKey,
  formBasePath,
  isAnswered,
  isFutureIsoDate,
  isQuestionAnswered,
  isQuestionVisible,
  isTaskComplete,
  isValidIsoDate,
  nextPageHref,
  NOT_PROVIDED_ANSWER,
  optionDisplayLabel,
  optionFollowUp,
  otherDetailsKey,
  parseUploadedDocuments,
  prevPageHref,
  knownProductName,
  questionDisplayHint,
  questionDisplayLabel,
  questionDisplayPageTitle,
  questionHasConditionalInput,
  questionKeys,
  substituteProductName,
  serializeUploadedDocuments,
  type UploadedDocument,
  type OnboardingQuestion,
  type OnboardingSection,
  type OnboardingTask,
  type TaskAnswers,
} from '@/lib/supplierOnboarding'
import { sampleAnswerFor } from '@/lib/supplierOnboardingSampleAnswers'
import { useOnboardingProgress } from './useOnboardingProgress'

/**
 * One question page of an onboarding task. [Provenance: NHS / GOV.UK gap-fill]
 *
 * Follows "one thing per page": the question is the page heading (fieldset
 * legend for grouped controls, label for a single control) with the guidance as
 * NHS hint text.
 *  - radios / checkboxes / textarea: official NHS components
 *  - date: NHS Date input (https://service-manual.nhs.uk/design-system/components/date-input)
 *  - upload: NHS File upload (https://service-manual.nhs.uk/design-system/components/file-upload,
 *    v10 component — see components/nhs/NhsFileUpload.tsx), plus a reference-name input
 *  - multi-upload: several documents added one at a time with a "Mark as complete"
 *    gate (MoJ Multi file upload pattern rebuilt from NHS components — see MultiUploadField)
 *
 * Routing: the questionnaire branches on earlier answers (see `showIf` in
 * lib/supplierOnboarding.ts). Next / back targets are computed from the saved
 * answers merged with this page's draft, so they follow the answer being given.
 * A page whose question is not on the current route redirects to the next one
 * that is.
 *
 * Actions:
 *  - Save and Next  — saves, then goes to the next page in journey order: the next
 *                     visible question in this task, or the first page of the next
 *                     task (across sections). Absent only on the final page of the
 *                     final task.
 *  - Save and Exit  — saves and returns to the task list; the task is marked
 *                     Completed once every visible required question has an answer
 *  - Cancel         — discards unsaved changes on this page and returns to the task list
 */
export default function TaskQuestionPage({
  formId,
  task,
  section,
  step,
}: {
  formId: string
  task: OnboardingTask
  section: OnboardingSection
  step: number
}) {
  const router = useRouter()
  const { hydrated, getAnswers, saveTask } = useOnboardingProgress(formId)
  const taskListHref = formBasePath(formId)

  const question = task.questions[step - 1]
  const blocked = question.type === 'blocked'
  const info = question.type === 'info'

  /** Unsaved answers for this page only, keyed like TaskAnswers. */
  const [draft, setDraft] = useState<TaskAnswers>({})
  const [error, setError] = useState<string | undefined>()

  const saved = getAnswers(task.id)
  /** Saved answers with this page's draft applied — the basis for routing. */
  const merged = useMemo(() => ({ ...saved, ...draft }), [saved, draft])

  /** Next page anywhere in the journey; null only on the final page of the final task. */
  const nextHref = nextPageHref(formId, task, step, merged)
  const isLast = nextHref === null
  const backHref = prevPageHref(formId, task, step, (taskId) =>
    taskId === task.id ? merged : getAnswers(taskId),
  )

  // Prefill from saved answers once storage has been read.
  useEffect(() => {
    if (!hydrated) return
    const stored = getAnswers(task.id)
    const initial: TaskAnswers = {}
    for (const key of questionKeys(question)) initial[key] = stored[key] ?? ''
    setDraft(initial)
  }, [hydrated, getAnswers, task.id, question])

  // A question that is not on the supplier's route (e.g. reached via a stale
  // link or the browser history) is skipped to the next one that is.
  const offRoute = hydrated && !isQuestionVisible(question, task, saved)
  useEffect(() => {
    if (!offRoute) return
    router.replace(nextPageHref(formId, task, step, saved) ?? taskListHref)
  }, [offRoute, router, formId, task, step, saved, taskListHref])

  const patch = (changes: TaskAnswers) => {
    setDraft((d) => ({ ...d, ...changes }))
    if (error) setError(undefined)
  }

  function save() {
    const next = { ...getAnswers(task.id), ...draft }
    saveTask(task.id, draft, isTaskComplete(task, next))
  }

  /**
   * Apply changes to the draft AND persist the page immediately. Used for
   * explicit in-page actions (uploading / removing a document) whose result
   * should survive leaving the page without pressing Save.
   */
  function commit(changes: TaskAnswers) {
    const nextDraft = { ...draft, ...changes }
    setDraft(nextDraft)
    const next = { ...getAnswers(task.id), ...nextDraft }
    saveTask(task.id, nextDraft, isTaskComplete(task, next))
  }

  function validate(): boolean {
    if (question.type === 'date' && question.mustBeFuture) {
      const value = merged[question.id]
      if (!isValidIsoDate(value)) {
        setError('Enter a valid date')
        return false
      }
      if (!isFutureIsoDate(value)) {
        setError('The expiry date must be in the future')
        return false
      }
      return true
    }
    if (
      (question.type === 'radios' || question.type === 'checkboxes') &&
      isAnswered(merged[question.id]) &&
      optionFollowUp(question, merged[question.id]) &&
      !isAnswered(merged[otherDetailsKey(question.id)])
    ) {
      const followUp = optionFollowUp(question, merged[question.id])
      setError(followUp?.inputType === 'url' ? 'Enter a URL' : 'Enter details')
      return false
    }
    if (question.optional || question.type === 'blocked' || question.type === 'info' || isQuestionAnswered(question, merged)) {
      return true
    }
    if (question.type === 'upload') {
      setError(question.noReference ? 'Select a file' : 'Select a file and enter a reference name')
      return false
    }
    if (question.type === 'date') {
      setError('Enter a valid date')
      return false
    }
    setError('Enter an answer')
    return false
  }

  function saveAndNext() {
    if (!validate()) return
    save()
    if (nextHref) router.push(nextHref)
  }

  /** Persist an answer that changes the route, then open the next question on that route. */
  function continueWith(changes: TaskAnswers) {
    const nextDraft = { ...draft, ...changes }
    setDraft(nextDraft)
    const mergedNext = { ...getAnswers(task.id), ...nextDraft }
    saveTask(task.id, nextDraft, isTaskComplete(task, mergedNext))
    const href = nextPageHref(formId, task, step, mergedNext)
    if (href) router.push(href)
  }

  function saveAndExit() {
    if (!validate()) return
    save()
    router.push(taskListHref)
  }

  function cancel() {
    router.push(taskListHref)
  }

  function fillWithSample() {
    setDraft((d) => ({ ...d, ...sampleAnswerFor(question) }))
  }

  if (offRoute) return null

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={backHref} />
          <ErrorSummary
            errors={
              error
                ? [
                    {
                      field:
                        question.type === 'date'
                          ? `${question.id}-day`
                          : question.type === 'upload'
                            ? `${question.id}-file`
                            : (question.type === 'radios' || question.type === 'checkboxes') &&
                                optionFollowUp(question, merged[question.id]) &&
                                !isAnswered(merged[otherDetailsKey(question.id)])
                              ? otherDetailsKey(question.id)
                              : question.id,
                      message: error,
                    },
                  ]
                : []
            }
          />
          <span className="nhsuk-caption-l">{section.title}</span>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (isLast) saveAndExit()
              else saveAndNext()
            }}
          >
            <QuestionField
              question={(() => {
                const answersFor = (taskId: string) => (taskId === task.id ? merged : getAnswers(taskId))
                const productName = knownProductName(answersFor)
                const display = {
                  ...question,
                  label: questionDisplayLabel(question, answersFor),
                  pageTitle: questionDisplayPageTitle(question, answersFor),
                  hint: questionDisplayHint(question, answersFor),
                  fieldHint: question.fieldHint
                    ? substituteProductName(question.fieldHint, productName)
                    : question.fieldHint,
                  details: question.details?.map((item) => ({
                    ...item,
                    summary: substituteProductName(item.summary, productName),
                    text: substituteProductName(item.text, productName),
                  })),
                }
                if (display.type === 'radios' || display.type === 'checkboxes') {
                  return {
                    ...display,
                    options: display.options.map((o) => ({
                      ...o,
                      label: optionDisplayLabel(question, o, answersFor),
                      hint: o.hint ? substituteProductName(o.hint, productName) : o.hint,
                    })),
                  }
                }
                return display
              })()}
              draft={draft}
              patch={patch}
              commit={commit}
              error={error}
              onDecline={
                question.type === 'upload' && question.declineLabel
                  ? () => continueWith({ [question.id]: NOT_PROVIDED_ANSWER })
                  : undefined
              }
            />

            {!blocked && !info && (
              <p className="nhsuk-body-m nhsuk-u-margin-top-4 nhsuk-u-margin-bottom-0">
                <button
                  type="button"
                  className="nhsuk-link"
                  onClick={fillWithSample}
                  style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
                >
                  Fill with sample
                </button>
              </p>
            )}

            {blocked && (
              <p className="nhsuk-body">
                <Link className="nhsuk-link" href={backHref}>
                  You can change your answer
                </Link>
                {' or, if you need help you can '}
                <a className="nhsuk-link" href="#get-support" onClick={(e) => e.preventDefault()}>
                  Get support
                </a>
                {' from the HealthStore team.'}
              </p>
            )}

            {/* 96px above the actions (collapses with the field's form-group margin) — matches
                the gap above "Mark as complete" on the DTAC page. */}
            {!blocked && (
            <div className="nhsuk-u-margin-top-6 flex flex-wrap items-center gap-4">
              {!isLast && <Button type="submit">{info ? 'Continue' : 'Save and Next'}</Button>}
              {!info && (
                <Button
                  type={isLast ? 'submit' : 'button'}
                  variant={isLast ? 'primary' : 'secondary'}
                  onClick={isLast ? undefined : saveAndExit}
                >
                  Save and Exit
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={cancel}>
                Cancel
              </Button>
            </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */

export type QuestionFieldProps = {
  question: OnboardingQuestion
  draft: TaskAnswers
  patch: (changes: TaskAnswers) => void
  /** Patch and persist immediately (see TaskQuestionPage.commit). */
  commit: (changes: TaskAnswers) => void
  /** Records "Not provided" for an upload and moves to the next question. */
  onDecline?: () => void
  /** Inline validation message for the current question. */
  error?: string
}

type FieldProps = QuestionFieldProps

/**
 * Hint body (guidance text plus, for single uploads, the list of expected
 * documents); null when empty. Multi-upload lists its documents in a Details
 * component instead (see MultiUploadField).
 */
function linkedText(text: string, link?: { text: string; href: string } | { text: string; href: string }[]) {
  const links = !link ? [] : Array.isArray(link) ? link : [link]
  const found = links
    .map((item) => ({ ...item, at: text.indexOf(item.text) }))
    .filter((item) => item.at >= 0)
    .sort((a, b) => a.at - b.at)
  if (found.length === 0) return text
  const nodes: ReactNode[] = []
  let cursor = 0
  found.forEach((item, index) => {
    if (item.at < cursor) return
    if (item.at > cursor) nodes.push(text.slice(cursor, item.at))
    nodes.push(
      <a key={`${item.href}-${index}`} className="nhsuk-link" href={item.href} target="_blank" rel="noopener noreferrer">
        {item.text}
        <span className="nhsuk-u-visually-hidden"> (opens in a new tab)</span>
      </a>,
    )
    cursor = item.at + item.text.length
  })
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return <>{nodes}</>
}

function richText(text: string, link?: OnboardingQuestion['hintLink']) {
  const parts = text.split('\n\n').map((part) => part.trim()).filter(Boolean)
  const remaining = !link ? [] : Array.isArray(link) ? [...link] : [link]
  const takeLinks = (part: string) => {
    const used: typeof remaining = []
    for (const item of remaining) {
      if (part.includes(item.text)) used.push(item)
    }
    for (const item of used) {
      const at = remaining.indexOf(item)
      if (at >= 0) remaining.splice(at, 1)
    }
    return used
  }
  const blocks: ReactNode[] = []
  let index = 0
  while (index < parts.length) {
    if (parts[index].startsWith('●')) {
      const items: string[] = []
      while (index < parts.length && parts[index].startsWith('●')) {
        items.push(parts[index].replace(/^●\s*/, ''))
        index += 1
      }
      blocks.push(
        <ul key={`bullets-${index}`} className="nhsuk-list nhsuk-list--bullet">
          {items.map((item) => (
            <li key={item}>{linkedText(item, takeLinks(item))}</li>
          ))}
        </ul>,
      )
    } else {
      const part = parts[index]
      blocks.push(
        <span key={`text-${index}`}>
          {blocks.length > 0 && (
            <>
              <br />
              <br />
            </>
          )}
          {linkedText(part, takeLinks(part))}
        </span>,
      )
      index += 1
    }
  }
  return <>{blocks}</>
}

function hintContent(question: OnboardingQuestion, includeDocuments = true) {
  const documents = includeDocuments && question.type === 'upload' ? question.documents : undefined
  if (!question.hint && !documents?.length) return null
  return (
    <>
      {question.hint ? richText(question.hint, question.hintLink) : null}
      {documents && documents.length > 0 && (
        <ul className="nhsuk-list nhsuk-list--bullet nhsuk-u-margin-top-2 nhsuk-u-margin-bottom-0">
          {documents.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </>
  )
}

function Hint({ question, id }: { question: OnboardingQuestion; id: string }) {
  const content = hintContent(question)
  if (!content && !question.inset) return null
  return (
    <>
      {content && (
        <div className="nhsuk-hint" id={id}>
          {content}
        </div>
      )}
      {question.inset && (
        <div className="nhsuk-inset-text">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p>{question.inset}</p>
        </div>
      )}
    </>
  )
}

function detailBody(item: NonNullable<OnboardingQuestion['details']>[number]) {
  return richText(item.text, item.link)
}

function Disclosure({ item }: { item: NonNullable<OnboardingQuestion['details']>[number] }) {
  const expander = item.variant === 'expander'
  return (
    <details className={expander ? 'nhsuk-details nhsuk-expander' : 'nhsuk-details'}>
      <summary className="nhsuk-details__summary">
        <span className="nhsuk-details__summary-text">{item.summary}</span>
      </summary>
      <div className="nhsuk-details__text">{detailBody(item)}</div>
    </details>
  )
}

/** NHS Details and Expanders authored on the question, shown under the hint. */
function QuestionDisclosures({ question }: { question: OnboardingQuestion }) {
  const items = question.details
  if (!items?.length) return null
  const blocks: ReactNode[] = []
  let index = 0
  while (index < items.length) {
    if (items[index].variant === 'expander') {
      const group: typeof items = []
      while (index < items.length && items[index].variant === 'expander') {
        group.push(items[index])
        index += 1
      }
      blocks.push(
        <div key={group[0].summary} className="nhsuk-expander-group">
          {group.map((item) => (
            <Disclosure key={item.summary} item={item} />
          ))}
        </div>,
      )
    } else {
      blocks.push(<Disclosure key={items[index].summary} item={items[index]} />)
      index += 1
    }
  }
  return <>{blocks}</>
}

/**
 * The NHS control(s) for one question, with the question as the page heading.
 * Exported so other one-question-per-page journeys (Company information) render
 * identically.
 */
export function QuestionField({ question, draft, patch, commit, onDecline, error }: FieldProps) {
  const hintId = `${question.id}-hint`
  const errorId = error ? `${question.id}-error` : undefined
  const hasHint = !!hintContent(question)
  const describedBy = [hasHint ? hintId : undefined, errorId].filter(Boolean).join(' ') || undefined
  const optionalSuffix = question.optional ? ' (optional)' : ''

  switch (question.type) {
    case 'radios':
    case 'checkboxes': {
      const isCheckbox = question.type === 'checkboxes'
      const options = question.options.filter((o) => !o.hidden)
      const hasConditional = questionHasConditionalInput(question)
      const detailsKey = otherDetailsKey(question.id)
      const selected = isCheckbox
        ? (draft[question.id] ?? '').split(CHECKBOX_SEPARATOR).filter(Boolean)
        : []
      const exclusiveValues = options.filter((o) => o.exclusive).map((o) => o.value)
      const toggle = (value: string) => {
        let next: string[]
        if (selected.includes(value)) next = selected.filter((v) => v !== value)
        else if (exclusiveValues.includes(value)) next = [value] // "None of the above" clears the rest
        else next = [...selected.filter((v) => !exclusiveValues.includes(v)), value]
        patch({ [question.id]: next.join(CHECKBOX_SEPARATOR) })
      }
      const pageTitle = question.pageTitle
      const fieldHintId = question.fieldHint ? `${question.id}-field-hint` : undefined
      const fieldsetDescribedBy = pageTitle ? fieldHintId : describedBy
      return (
        <>
          {pageTitle && <h1 className="nhsuk-heading-l">{pageTitle}</h1>}
          {pageTitle && <Hint question={question} id={hintId} />}
          {pageTitle && <QuestionDisclosures question={question} />}
        <div className="nhsuk-form-group">
          <fieldset className="nhsuk-fieldset" aria-describedby={fieldsetDescribedBy}>
            {pageTitle ? (
              <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--m">
                <h2 className="nhsuk-fieldset__heading">
                  {question.label}
                  {optionalSuffix}
                </h2>
              </legend>
            ) : (
              <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
                <h1 className="nhsuk-fieldset__heading">
                  {question.label}
                  {optionalSuffix}
                </h1>
              </legend>
            )}
            {pageTitle && question.fieldHint && (
              <div className="nhsuk-hint" id={fieldHintId}>
                {question.fieldHint}
              </div>
            )}
            {!pageTitle && <Hint question={question} id={hintId} />}
            {!pageTitle && <QuestionDisclosures question={question} />}
            <div
              className={
                isCheckbox
                  ? `nhsuk-checkboxes${hasConditional ? ' nhsuk-checkboxes--conditional' : ''}`
                  : `nhsuk-radios${hasConditional ? ' nhsuk-radios--conditional' : ''}`
              }
            >
              {options.map((o) => {
                const id = `${question.id}-${o.value}`
                const followUp = optionFollowUp(question, o.value)
                const reveals = !!followUp
                const open = isCheckbox ? selected.includes(o.value) : draft[question.id] === o.value
                const conditionalId = `conditional-${question.id}-${o.value}`
                const optionHintId = o.hint ? `${id}-hint` : undefined
                const followUpHintId = followUp?.hint ? `${detailsKey}-hint` : undefined
                const followUpType = followUp?.inputType ?? 'text'
                return (
                  <Fragment key={o.value}>
                    {o.dividerBefore && (
                      <div className={isCheckbox ? 'nhsuk-checkboxes__divider' : 'nhsuk-radios__divider'}>or</div>
                    )}
                    <div className={isCheckbox ? 'nhsuk-checkboxes__item' : 'nhsuk-radios__item'}>
                      <input
                        className={isCheckbox ? 'nhsuk-checkboxes__input' : 'nhsuk-radios__input'}
                        id={id}
                        name={question.id}
                        type={isCheckbox ? 'checkbox' : 'radio'}
                        value={o.value}
                        checked={open}
                        aria-controls={reveals ? conditionalId : undefined}
                        aria-describedby={optionHintId}
                        aria-expanded={reveals ? open : undefined}
                        onChange={() => (isCheckbox ? toggle(o.value) : patch({ [question.id]: o.value }))}
                      />
                      <label
                        className={`nhsuk-label ${isCheckbox ? 'nhsuk-checkboxes__label' : 'nhsuk-radios__label'}`}
                        htmlFor={id}
                      >
                        {o.label}
                      </label>
                      {o.hint && (
                        <div className={`nhsuk-hint ${isCheckbox ? 'nhsuk-checkboxes__hint' : 'nhsuk-radios__hint'}`} id={optionHintId}>
                          {o.hint}
                        </div>
                      )}
                    </div>
                    {reveals && open && followUp && (
                      <div
                        className={isCheckbox ? 'nhsuk-checkboxes__conditional' : 'nhsuk-radios__conditional'}
                        id={conditionalId}
                      >
                        <div className="nhsuk-form-group">
                          <label className="nhsuk-label" htmlFor={detailsKey}>
                            {followUp.label}
                          </label>
                          {followUp.hint && (
                            <div className="nhsuk-hint" id={followUpHintId}>
                              {followUp.hint}
                            </div>
                          )}
                          <TextInput
                            id={detailsKey}
                            name={detailsKey}
                            type={followUpType}
                            inputMode={followUpType === 'text' ? undefined : followUpType}
                            autoComplete={followUpType === 'url' ? 'url' : undefined}
                            spellCheck={followUpType === 'url' || followUpType === 'email' ? false : undefined}
                            aria-describedby={followUpHintId}
                            value={draft[detailsKey] ?? ''}
                            onChange={(e) => patch({ [detailsKey]: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </fieldset>
        </div>
        </>
      )
    }

    case 'textarea': {
      const pageTitle = question.pageTitle
      return (
        <>
          {pageTitle && <h1 className="nhsuk-heading-l">{pageTitle}</h1>}
          {pageTitle && <Hint question={question} id={hintId} />}
          {pageTitle && <QuestionDisclosures question={question} />}
          <div className="nhsuk-form-group">
            {pageTitle ? (
              <label className="nhsuk-label" htmlFor={question.id}>
                {question.label}
                {optionalSuffix}
              </label>
            ) : (
              <h1 className="nhsuk-label-wrapper">
                <label className="nhsuk-label nhsuk-label--l" htmlFor={question.id}>
                  {question.label}
                  {optionalSuffix}
                </label>
              </h1>
            )}
            {!pageTitle && <Hint question={question} id={hintId} />}
            {!pageTitle && <QuestionDisclosures question={question} />}
            <Textarea
              id={question.id}
              name={question.id}
              rows={5}
              aria-describedby={pageTitle ? undefined : describedBy}
              value={draft[question.id] ?? ''}
              onChange={(e) => patch({ [question.id]: e.target.value })}
            />
          </div>
        </>
      )
    }

    case 'text': {
      const inputType = question.inputType ?? 'text'
      const noSpellCheck = inputType === 'url' || inputType === 'email'
      const suffix = question.type === 'text' ? question.suffix : undefined
      const width =
        question.type === 'text' && question.inputWidth
          ? question.inputWidth
          : inputType === 'url'
            ? undefined
            : inputType === 'tel'
              ? 'nhsuk-input--width-10'
              : 'nhsuk-input--width-20'
      const pageTitle = question.pageTitle
      const fieldHintId = question.fieldHint ? `${question.id}-field-hint` : undefined
      const inputDescribedBy = pageTitle
        ? [fieldHintId].filter(Boolean).join(' ') || undefined
        : describedBy
      const input = (
        <TextInput
          id={question.id}
          name={question.id}
          type={inputType}
          inputMode={inputType === 'text' ? undefined : inputType}
          autoComplete={inputType === 'email' ? 'email' : inputType === 'tel' ? 'tel' : inputType === 'url' ? 'url' : undefined}
          spellCheck={noSpellCheck ? false : undefined}
          className={width}
          aria-describedby={inputDescribedBy}
          value={draft[question.id] ?? ''}
          onChange={(e) => patch({ [question.id]: e.target.value })}
        />
      )
      return (
        <>
          {pageTitle && <h1 className="nhsuk-heading-l">{pageTitle}</h1>}
          {pageTitle && <Hint question={question} id={hintId} />}
          {pageTitle && <QuestionDisclosures question={question} />}
          <div className="nhsuk-form-group">
            {pageTitle ? (
              <label className="nhsuk-label nhsuk-u-visually-hidden" htmlFor={question.id}>
                {question.label}
                {optionalSuffix}
              </label>
            ) : (
              <h1 className="nhsuk-label-wrapper">
                <label className="nhsuk-label nhsuk-label--l" htmlFor={question.id}>
                  {question.label}
                  {optionalSuffix}
                </label>
              </h1>
            )}
            {!pageTitle && <Hint question={question} id={hintId} />}
            {!pageTitle && <QuestionDisclosures question={question} />}
            {pageTitle && question.fieldHint && (
              <div className="nhsuk-hint" id={fieldHintId}>
                {question.fieldHint}
              </div>
            )}
            {suffix ? (
              <div className="nhsuk-input__wrapper">
                {input}
                <div className="nhsuk-input__suffix" aria-hidden="true">
                  {suffix}
                </div>
              </div>
            ) : (
              input
            )}
          </div>
        </>
      )
    }

    case 'fields': {
      const pageTitle = question.pageTitle
      return (
        <>
          {pageTitle && <h1 className="nhsuk-heading-l">{pageTitle}</h1>}
          {pageTitle && <Hint question={question} id={hintId} />}
          {pageTitle && <QuestionDisclosures question={question} />}
          <div className="nhsuk-form-group">
            <fieldset className="nhsuk-fieldset" aria-describedby={pageTitle ? undefined : describedBy}>
              {pageTitle ? (
                <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--m">
                  <h2 className="nhsuk-fieldset__heading">
                    {question.label}
                    {optionalSuffix}
                  </h2>
                </legend>
              ) : (
                <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
                  <h1 className="nhsuk-fieldset__heading">
                    {question.label}
                    {optionalSuffix}
                  </h1>
                </legend>
              )}
              {!pageTitle && <Hint question={question} id={hintId} />}
              {!pageTitle && <QuestionDisclosures question={question} />}
              {question.fields.map((field) => {
                const key = fieldKey(question.id, field)
                const id = `${question.id}-${field.key}`
                const inputType = field.inputType ?? 'text'
                return (
                  <div key={field.key} className="nhsuk-form-group">
                    <label className="nhsuk-label" htmlFor={id}>
                      {field.label}
                      {field.optional ? ' (optional)' : ''}
                    </label>
                    <TextInput
                      id={id}
                      name={key}
                      type={inputType}
                      inputMode={inputType === 'text' ? undefined : inputType}
                      autoComplete={field.autoComplete}
                      spellCheck={inputType === 'url' || inputType === 'email' ? false : undefined}
                      className={field.width}
                      value={draft[key] ?? ''}
                      onChange={(e) => patch({ [key]: e.target.value })}
                    />
                  </div>
                )
              })}
            </fieldset>
          </div>
        </>
      )
    }

    case 'date':
      return (
        <DateField
          question={question}
          draft={draft}
          patch={patch}
          commit={commit}
          describedBy={describedBy}
          hintId={hintId}
          optionalSuffix={optionalSuffix}
          error={error}
        />
      )

    case 'upload':
      return question.multiple ? (
        <MultipleFileUpload question={question} draft={draft} patch={patch} commit={commit} onDecline={onDecline} describedBy={describedBy} hintId={hintId} optionalSuffix={optionalSuffix} error={error} />
      ) : (
        <UploadField question={question} draft={draft} patch={patch} commit={commit} onDecline={onDecline} describedBy={describedBy} hintId={hintId} optionalSuffix={optionalSuffix} error={error} />
      )

    case 'multi-upload':
      return <MultiUploadField question={question} draft={draft} patch={patch} commit={commit} describedBy={describedBy} hintId={hintId} optionalSuffix={optionalSuffix} />

    case 'blocked':
      return (
        <>
          <h1 className="nhsuk-heading-l">{question.label}</h1>
          <Hint question={question} id={hintId} />
        </>
      )

    case 'info':
      return (
        <>
          <h1 className="nhsuk-heading-l">{question.label}</h1>
          {question.hint ? (
            <div className="nhsuk-body" id={hintId}>
              {richText(question.hint, question.hintLink)}
            </div>
          ) : null}
        </>
      )
  }
}

type SubFieldProps = FieldProps & { describedBy?: string; hintId: string; optionalSuffix: string; error?: string }

/** NHS Date input — three fields, stored as a single YYYY-MM-DD string. */
function DateField({ question, draft, patch, describedBy, hintId, optionalSuffix, error }: SubFieldProps) {
  const [year = '', month = '', day = ''] = (draft[question.id] ?? '').split('-')
  const set = (part: 'day' | 'month' | 'year', raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, part === 'year' ? 4 : 2)
    const next = { day, month, year, [part]: v }
    const empty = !next.day && !next.month && !next.year
    patch({ [question.id]: empty ? '' : `${next.year}-${next.month}-${next.day}` })
  }
  const parts: Array<{ part: 'day' | 'month' | 'year'; label: string; value: string; width: string }> = [
    { part: 'day', label: 'Day', value: day, width: 'nhsuk-input--width-2' },
    { part: 'month', label: 'Month', value: month, width: 'nhsuk-input--width-2' },
    { part: 'year', label: 'Year', value: year, width: 'nhsuk-input--width-4' },
  ]
  const errorId = error ? `${question.id}-error` : undefined
  return (
    <div className={`nhsuk-form-group${error ? ' nhsuk-form-group--error' : ''}`}>
      <fieldset className="nhsuk-fieldset" aria-describedby={describedBy} role="group">
        <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
          <h1 className="nhsuk-fieldset__heading">
            {question.label}
            {optionalSuffix}
          </h1>
        </legend>
        <Hint question={question} id={hintId} />
        {error && (
          <span className="nhsuk-error-message" id={errorId}>
            <span className="nhsuk-u-visually-hidden">Error:</span> {error}
          </span>
        )}
        <div className="nhsuk-date-input" id={question.id}>
          {parts.map(({ part, label, value, width }) => {
            const id = `${question.id}-${part}`
            return (
              <div key={part} className="nhsuk-date-input__item">
                <div className="nhsuk-form-group">
                  <label className="nhsuk-label nhsuk-date-input__label" htmlFor={id}>
                    {label}
                  </label>
                  <TextInput
                    className={`nhsuk-date-input__input ${width}${error ? ' nhsuk-input--error' : ''}`}
                    id={id}
                    name={id}
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => set(part, e.target.value)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

/** File size in the compact form used beside an added file, for example 2MB. */
function formatCompactSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  const mb = bytes / (1024 * 1024)
  const rounded = mb >= 10 ? String(Math.round(mb)) : mb.toFixed(1).replace(/\.0$/, '')
  return `${rounded}MB`
}

/**
 * Several files, chosen together or one after another. Each added file is listed
 * under the control with its size, an Uploaded tag and a Remove action.
 */
function MultipleFileUpload({ question, draft, commit, onDecline, optionalSuffix }: SubFieldProps) {
  const fileId = `${question.id}-file`
  const declined = draft[question.id] === NOT_PROVIDED_ANSWER
  const documents = declined ? [] : parseUploadedDocuments(draft[question.id])
  const declineLabel = question.type === 'upload' ? question.declineLabel : undefined
  const footnote = question.type === 'upload' ? question.footnote : undefined
  const guide = question.type === 'upload' ? question.documents : undefined
  const hintSeparately = !!question.details?.length && !!guide?.length
  const [inputKey, setInputKey] = useState(0)

  function addFiles(files: File[]) {
    if (files.length === 0) return
    const added: UploadedDocument[] = files.map((file) => ({
      name: file.name,
      size: file.size,
      reference: '',
      uploadedAt: new Date().toISOString(),
    }))
    commit({ [question.id]: serializeUploadedDocuments([...documents, ...added]) })
    setInputKey((k) => k + 1)
  }

  function remove(index: number) {
    commit({ [question.id]: serializeUploadedDocuments(documents.filter((_, i) => i !== index)) })
  }

  return (
    <>
      <NhsFileUpload
        key={inputKey}
        id={fileId}
        multiple
        labelAsPageHeading
        label={
          <>
            {question.label}
            {optionalSuffix}
          </>
        }
        hint={hintContent(question, !hintSeparately)}
        afterHint={
          <>
            <QuestionDisclosures question={question} />
            {hintSeparately && (
              <div className="nhsuk-hint">
                <ul className="nhsuk-list nhsuk-list--bullet nhsuk-u-margin-bottom-0">
                  {guide.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        }
        onFileChange={() => {}}
        onFilesChange={addFiles}
      />
      {documents.length > 0 && (
        <ul className="nhsuk-list nhsuk-u-margin-top-4 nhsuk-u-margin-bottom-0" style={{ padding: 0 }}>
          {documents.map((doc, index) => (
            <li
              key={`${doc.uploadedAt}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto auto auto',
                columnGap: '1.5rem',
                alignItems: 'start',
                marginBottom: index === documents.length - 1 ? 0 : '1rem',
              }}
            >
              <span style={{ overflowWrap: 'anywhere' }}>{doc.name}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{formatCompactSize(doc.size)}</span>
              <strong className="nhsuk-tag nhsuk-tag--green">Uploaded</strong>
              <button
                type="button"
                className="hs-link-button"
                onClick={() => remove(index)}
                style={{ justifySelf: 'end' }}
              >
                Remove<span className="nhsuk-u-visually-hidden"> {doc.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {footnote && <p className="nhsuk-body">{footnote}</p>}
      {declineLabel && onDecline && (
        <p className="nhsuk-body">
          <a
            className="nhsuk-link"
            href="#cant-provide"
            onClick={(e) => {
              e.preventDefault()
              onDecline()
            }}
          >
            {declineLabel}
          </a>
        </p>
      )}
    </>
  )
}

/** NHS File upload plus a required reference name (omitted when `noReference` is set). */
function UploadField({ question, draft, patch, onDecline, optionalSuffix, error }: SubFieldProps) {
  const fileId = `${question.id}-file`
  const referenceKey = `${question.id}${UPLOAD_REFERENCE_SUFFIX}`
  const withReference = !(question.type === 'upload' && question.noReference)
  const declineLabel = question.type === 'upload' ? question.declineLabel : undefined
  const storedFileName = draft[question.id] ?? ''
  const declined = storedFileName === NOT_PROVIDED_ANSWER
  // A file input cannot be re-populated from storage, so on return visits we
  // show the saved name until the user picks a file in this session.
  const [pickedThisSession, setPickedThisSession] = useState(false)
  return (
    <>
      {/* Prototype: only the file name is retained (no upload backend yet). */}
      <NhsFileUpload
        id={fileId}
        labelAsPageHeading
        label={
          <>
            {question.label}
            {optionalSuffix}
          </>
        }
        hint={hintContent(question)}
        afterHint={<QuestionDisclosures question={question} />}
        error={error}
        onFileChange={(file) => {
          setPickedThisSession(true)
          patch({ [question.id]: file?.name ?? '' })
        }}
        className="nhsuk-u-margin-bottom-3"
      />
      {storedFileName && !pickedThisSession && !declined && (
        <p className="nhsuk-body-m nhsuk-u-margin-bottom-5">
          Previously selected file: <strong>{storedFileName}</strong>
        </p>
      )}
      {declineLabel && onDecline && (
        <p className="nhsuk-body">
          <a
            className="nhsuk-link"
            href="#cant-provide"
            onClick={(e) => {
              e.preventDefault()
              onDecline()
            }}
          >
            {declineLabel}
          </a>
        </p>
      )}

      {withReference && (
        <div className="nhsuk-form-group">
          <label className="nhsuk-label" htmlFor={referenceKey}>
            Required reference name
          </label>
          <div className="nhsuk-hint" id={`${referenceKey}-hint`}>
            Label the document with your company name, the question number and the date of submission.
          </div>
          <TextInput
            className="nhsuk-input--width-20"
            id={referenceKey}
            name={referenceKey}
            aria-describedby={`${referenceKey}-hint`}
            value={draft[referenceKey] ?? ''}
            onChange={(e) => patch({ [referenceKey]: e.target.value })}
          />
        </div>
      )}
    </>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Multiple documents, one at a time. [Provenance: MoJ Multi file upload pattern,
 * rebuilt with NHS components]
 * https://design-patterns.service.justice.gov.uk/components/multi-file-upload/
 *
 *  - "Files added": NHS Summary list, one row per document (reference name /
 *    file name and size / Remove).
 *  - Add a document: NHS File upload + reference name + secondary "Upload file"
 *    button. Both fields are validated on press; the document is appended and
 *    persisted straight away (so it survives leaving without Save), then the
 *    fields reset for the next one.
 *  - "Mark as complete" NHS checkbox: the task only counts as Completed when at
 *    least one document is listed and this is ticked.
 *
 * Prototype: no upload backend — file metadata only, "upload" is instantaneous.
 */
function MultiUploadField({ question, draft, patch, commit, hintId, optionalSuffix }: SubFieldProps) {
  const fileId = `${question.id}-file`
  const referenceId = `${question.id}-reference`
  const confirmedKey = `${question.id}${MULTI_UPLOAD_CONFIRMED_SUFFIX}`
  const expectedDocuments = question.type === 'multi-upload' ? question.documents ?? [] : []
  const documents = parseUploadedDocuments(draft[question.id])
  const confirmed = draft[confirmedKey] === CONFIRMED_VALUE

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [reference, setReference] = useState('')
  const [errors, setErrors] = useState<{ file?: string; reference?: string }>({})
  /** Bumped after each upload to remount (and so clear) the file input. */
  const [inputKey, setInputKey] = useState(0)

  function upload() {
    const next: typeof errors = {}
    if (!pendingFile) next.file = 'Select a file to upload'
    if (!reference.trim()) next.reference = 'Enter a reference name for this document'
    setErrors(next)
    if (!pendingFile || next.reference) return

    const doc: UploadedDocument = {
      name: pendingFile.name,
      size: pendingFile.size,
      reference: reference.trim(),
      uploadedAt: new Date().toISOString(),
    }
    commit({ [question.id]: serializeUploadedDocuments([...documents, doc]) })
    setPendingFile(null)
    setReference('')
    setInputKey((k) => k + 1)
  }

  function remove(index: number) {
    commit({ [question.id]: serializeUploadedDocuments(documents.filter((_, i) => i !== index)) })
  }

  return (
    <>
      <h1 className="nhsuk-heading-l">
        {question.label}
        {optionalSuffix}
      </h1>
      <Hint question={question} id={hintId} />

      {/* NHS Details — https://service-manual.nhs.uk/design-system/components/details */}
      {expectedDocuments.length > 0 && (
        <details className="nhsuk-details">
          <summary className="nhsuk-details__summary">
            <span className="nhsuk-details__summary-text">Documents you can provide</span>
          </summary>
          <div className="nhsuk-details__text">
            <p>Possible documents to be provided are:</p>
            <ul className="nhsuk-list nhsuk-list--bullet">
              {expectedDocuments.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {documents.length > 0 && (
        <section aria-labelledby={`${question.id}-files-heading`} className="nhsuk-u-margin-top-5">
          <h2 id={`${question.id}-files-heading`} className="nhsuk-heading-m">
            Files added
          </h2>
          <dl className="nhsuk-summary-list">
            {documents.map((doc, index) => (
              <div key={`${doc.uploadedAt}-${index}`} className="nhsuk-summary-list__row">
                <dt className="nhsuk-summary-list__key">{doc.reference}</dt>
                <dd className="nhsuk-summary-list__value">
                  {doc.name}
                  <br />
                  <span className="nhsuk-u-secondary-text-color nhsuk-body-s">{formatFileSize(doc.size)}</span>
                </dd>
                <dd className="nhsuk-summary-list__actions">
                  <button
                    type="button"
                    className="nhsuk-link"
                    onClick={() => remove(index)}
                    style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
                  >
                    Remove<span className="nhsuk-u-visually-hidden"> {doc.reference}</span>
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <h2 className="nhsuk-heading-m nhsuk-u-margin-top-5">
        {documents.length > 0 ? 'Add another document' : 'Add a document'}
      </h2>
      <NhsFileUpload
        key={inputKey}
        id={fileId}
        label="Upload a file"
        labelSize="s"
        error={errors.file}
        onFileChange={(file) => {
          setPendingFile(file)
          if (file) setErrors((e) => ({ ...e, file: undefined }))
        }}
        className="nhsuk-u-margin-bottom-3"
      />
      <FormField
        id={referenceId}
        label="Required reference name"
        hint="Label the document with your company name, the question number and the date of submission."
        error={errors.reference}
      >
        {(field) => (
          <TextInput
            {...field}
            name={referenceId}
            className="nhsuk-input--width-20"
            value={reference}
            onChange={(e) => {
              setReference(e.target.value)
              if (e.target.value.trim()) setErrors((er) => ({ ...er, reference: undefined }))
            }}
          />
        )}
      </FormField>
      <Button type="button" variant="secondary" onClick={upload}>
        Upload file
      </Button>

      {/* Deliberately wide gap (96px) to separate the completion gate from the upload controls. */}
      <div className="nhsuk-form-group nhsuk-u-margin-top-6">
        <div className="nhsuk-checkboxes">
          <div className="nhsuk-checkboxes__item">
            <input
              className="nhsuk-checkboxes__input"
              id={confirmedKey}
              name={confirmedKey}
              type="checkbox"
              checked={confirmed}
              onChange={(e) => patch({ [confirmedKey]: e.target.checked ? CONFIRMED_VALUE : '' })}
            />
            <label className="nhsuk-label nhsuk-checkboxes__label" htmlFor={confirmedKey}>
              Mark as complete
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
