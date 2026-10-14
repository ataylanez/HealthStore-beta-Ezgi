'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
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
  isQuestionVisible,
  isTaskComplete,
  nextPageHref,
  parseUploadedDocuments,
  prevPageHref,
  questionKeys,
  serializeUploadedDocuments,
  visibleQuestions,
  type UploadedDocument,
  type OnboardingQuestion,
  type OnboardingTask,
  type TaskAnswers,
} from '@/lib/supplierOnboarding'
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
 * lib/supplierOnboarding.ts). Next / back targets and the "question x of y"
 * caption are computed from the saved answers merged with this page's draft, so
 * they follow the answer being given. A page whose question is not on the
 * current route redirects to the next one that is.
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
  step,
}: {
  formId: string
  task: OnboardingTask
  step: number
}) {
  const router = useRouter()
  const { hydrated, getAnswers, saveTask } = useOnboardingProgress(formId)
  const taskListHref = formBasePath(formId)

  const question = task.questions[step - 1]

  /** Unsaved answers for this page only, keyed like TaskAnswers. */
  const [draft, setDraft] = useState<TaskAnswers>({})

  const saved = getAnswers(task.id)
  /** Saved answers with this page's draft applied — the basis for routing. */
  const merged = useMemo(() => ({ ...saved, ...draft }), [saved, draft])

  const visible = visibleQuestions(task, merged)
  const position = visible.findIndex((v) => v.step === step) + 1
  const total = visible.length
  const multiPage = total > 1
  /** Next page anywhere in the journey; null only on the final page of the final task. */
  const nextHref = nextPageHref(formId, task, step, merged)
  const isLast = nextHref === null
  const backHref = prevPageHref(formId, task, step, merged)

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

  const patch = (changes: TaskAnswers) => setDraft((d) => ({ ...d, ...changes }))

  function save() {
    const merged = { ...getAnswers(task.id), ...draft }
    saveTask(task.id, draft, isTaskComplete(task, merged))
  }

  /**
   * Apply changes to the draft AND persist the page immediately. Used for
   * explicit in-page actions (uploading / removing a document) whose result
   * should survive leaving the page without pressing Save.
   */
  function commit(changes: TaskAnswers) {
    const nextDraft = { ...draft, ...changes }
    setDraft(nextDraft)
    const merged = { ...getAnswers(task.id), ...nextDraft }
    saveTask(task.id, nextDraft, isTaskComplete(task, merged))
  }

  function saveAndNext() {
    save()
    if (nextHref) router.push(nextHref)
  }

  function saveAndExit() {
    save()
    router.push(taskListHref)
  }

  function cancel() {
    router.push(taskListHref)
  }

  if (offRoute) return null

  return (
    <div className="hs-page">
      <div className="max-w-2xl">
        <BackLink href={backHref} />
        {/* Caption gives task context (and the questionnaire reference, e.g. C1.1.1). */}
        {(multiPage || question.code || question.label !== task.title) && (
          <span className="nhsuk-caption-l">
            {task.title}
            {question.code ? ` — ${question.code}` : ''}
            {multiPage && position > 0 ? ` — question ${position} of ${total}` : ''}
          </span>
        )}

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            if (isLast) saveAndExit()
            else saveAndNext()
          }}
        >
          <QuestionField question={question} draft={draft} patch={patch} commit={commit} />

          {/* 96px above the actions (collapses with the field's form-group margin) — matches
              the gap above "Mark as complete" on the DTAC page. */}
          <div className="mt-24 flex flex-wrap items-center gap-4">
            {!isLast && <Button type="submit">Save and Next</Button>}
            <Button
              type={isLast ? 'submit' : 'button'}
              variant={isLast ? 'primary' : 'secondary'}
              onClick={isLast ? undefined : saveAndExit}
            >
              Save and Exit
            </Button>
            <Button type="button" variant="secondary" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
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
}

type FieldProps = QuestionFieldProps

/**
 * Hint body (guidance text plus, for single uploads, the list of expected
 * documents); null when empty. Multi-upload lists its documents in a Details
 * component instead (see MultiUploadField).
 */
function hintContent(question: OnboardingQuestion) {
  const documents = question.type === 'upload' ? question.documents : undefined
  if (!question.hint && !documents?.length) return null
  return (
    <>
      {question.hint}
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
  if (!content) return null
  return (
    <div className="nhsuk-hint" id={id}>
      {content}
    </div>
  )
}

/**
 * The NHS control(s) for one question, with the question as the page heading.
 * Exported so other one-question-per-page journeys (Company information) render
 * identically.
 */
export function QuestionField({ question, draft, patch, commit }: FieldProps) {
  const hintId = `${question.id}-hint`
  const hasHint = !!hintContent(question)
  const describedBy = hasHint ? hintId : undefined
  const optionalSuffix = question.optional ? ' (optional)' : ''

  switch (question.type) {
    case 'radios':
    case 'checkboxes': {
      const isCheckbox = question.type === 'checkboxes'
      const options = question.options.filter((o) => !o.hidden)
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
      return (
        <div className="nhsuk-form-group">
          <fieldset className="nhsuk-fieldset" aria-describedby={describedBy}>
            <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
              <h1 className="nhsuk-fieldset__heading">
                {question.label}
                {optionalSuffix}
              </h1>
            </legend>
            <Hint question={question} id={hintId} />
            <div className={isCheckbox ? 'nhsuk-checkboxes' : 'nhsuk-radios'}>
              {options.map((o) => {
                const id = `${question.id}-${o.value}`
                return (
                  <div key={o.value} className={isCheckbox ? 'nhsuk-checkboxes__item' : 'nhsuk-radios__item'}>
                    <input
                      className={isCheckbox ? 'nhsuk-checkboxes__input' : 'nhsuk-radios__input'}
                      id={id}
                      name={question.id}
                      type={isCheckbox ? 'checkbox' : 'radio'}
                      value={o.value}
                      checked={isCheckbox ? selected.includes(o.value) : draft[question.id] === o.value}
                      onChange={() => (isCheckbox ? toggle(o.value) : patch({ [question.id]: o.value }))}
                    />
                    <label
                      className={`nhsuk-label ${isCheckbox ? 'nhsuk-checkboxes__label' : 'nhsuk-radios__label'}`}
                      htmlFor={id}
                    >
                      {o.label}
                    </label>
                  </div>
                )
              })}
            </div>
          </fieldset>
        </div>
      )
    }

    case 'textarea':
      return (
        <div className="nhsuk-form-group">
          <h1 className="nhsuk-label-wrapper">
            <label className="nhsuk-label nhsuk-label--l" htmlFor={question.id}>
              {question.label}
              {optionalSuffix}
            </label>
          </h1>
          <Hint question={question} id={hintId} />
          <Textarea
            id={question.id}
            name={question.id}
            rows={5}
            aria-describedby={describedBy}
            value={draft[question.id] ?? ''}
            onChange={(e) => patch({ [question.id]: e.target.value })}
          />
        </div>
      )

    case 'text': {
      const inputType = question.inputType ?? 'text'
      const noSpellCheck = inputType === 'url' || inputType === 'email'
      const width = inputType === 'url' ? undefined : inputType === 'tel' ? 'nhsuk-input--width-10' : 'nhsuk-input--width-20'
      return (
        <div className="nhsuk-form-group">
          <h1 className="nhsuk-label-wrapper">
            <label className="nhsuk-label nhsuk-label--l" htmlFor={question.id}>
              {question.label}
              {optionalSuffix}
            </label>
          </h1>
          <Hint question={question} id={hintId} />
          <TextInput
            id={question.id}
            name={question.id}
            type={inputType}
            inputMode={inputType === 'text' ? undefined : inputType}
            autoComplete={inputType === 'email' ? 'email' : inputType === 'tel' ? 'tel' : inputType === 'url' ? 'url' : undefined}
            spellCheck={noSpellCheck ? false : undefined}
            className={width}
            aria-describedby={describedBy}
            value={draft[question.id] ?? ''}
            onChange={(e) => patch({ [question.id]: e.target.value })}
          />
        </div>
      )
    }

    case 'fields':
      return (
        <div className="nhsuk-form-group">
          <fieldset className="nhsuk-fieldset" aria-describedby={describedBy}>
            <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
              <h1 className="nhsuk-fieldset__heading">
                {question.label}
                {optionalSuffix}
              </h1>
            </legend>
            <Hint question={question} id={hintId} />
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
      )

    case 'date':
      return <DateField question={question} draft={draft} patch={patch} commit={commit} describedBy={describedBy} hintId={hintId} optionalSuffix={optionalSuffix} />

    case 'upload':
      return <UploadField question={question} draft={draft} patch={patch} commit={commit} describedBy={describedBy} hintId={hintId} optionalSuffix={optionalSuffix} />

    case 'multi-upload':
      return <MultiUploadField question={question} draft={draft} patch={patch} commit={commit} describedBy={describedBy} hintId={hintId} optionalSuffix={optionalSuffix} />
  }
}

type SubFieldProps = FieldProps & { describedBy?: string; hintId: string; optionalSuffix: string }

/** NHS Date input — three fields, stored as a single YYYY-MM-DD string. */
function DateField({ question, draft, patch, describedBy, hintId, optionalSuffix }: SubFieldProps) {
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
  return (
    <div className="nhsuk-form-group">
      <fieldset className="nhsuk-fieldset" aria-describedby={describedBy} role="group">
        <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
          <h1 className="nhsuk-fieldset__heading">
            {question.label}
            {optionalSuffix}
          </h1>
        </legend>
        <Hint question={question} id={hintId} />
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
                    className={`nhsuk-date-input__input ${width}`}
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

/** NHS File upload plus a required reference name (omitted when `noReference` is set). */
function UploadField({ question, draft, patch, optionalSuffix }: SubFieldProps) {
  const fileId = `${question.id}-file`
  const referenceKey = `${question.id}${UPLOAD_REFERENCE_SUFFIX}`
  const withReference = !(question.type === 'upload' && question.noReference)
  const storedFileName = draft[question.id] ?? ''
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
        onFileChange={(file) => {
          setPickedThisSession(true)
          patch({ [question.id]: file?.name ?? '' })
        }}
        className="nhsuk-u-margin-bottom-3"
      />
      {storedFileName && !pickedThisSession && (
        <p className="nhsuk-body-s nhsuk-u-margin-bottom-5">
          Previously selected file: <strong>{storedFileName}</strong>
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
      <div className="nhsuk-form-group mt-24">
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
