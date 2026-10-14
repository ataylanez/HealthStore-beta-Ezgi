/**
 * Company information — the Section A supplier questions, split into chapters
 * (Company details, Relationship manager, Care Quality Commission). Each
 * chapter is submitted on its own: one question per page, then Check your
 * answers for that chapter, then Confirm and submit. On the Company
 * information page a chapter is a task-list row until it has been submitted,
 * and a read-only summary list with a Change button afterwards.
 *
 * Reuses the onboarding question model and routing helpers from
 * lib/supplierOnboarding.ts (one task, `showIf` for the CQC follow-ups). The
 * product questions from Section A (A2–A4) live at the start of each product
 * onboarding form instead, because they describe a product, not the company.
 *
 * Prototype: answers are kept in the browser (see useSupplierPortal).
 */

import {
  fieldKey,
  isQuestionAnswered,
  isTaskComplete,
  questionKeys,
  visibleQuestions,
  type OnboardingQuestion,
  type OnboardingTask,
  type QuestionOption,
  type TaskAnswers,
} from '@/lib/supplierOnboarding'
import { PORTAL_PATHS, formatPortalDate } from '@/lib/supplierPortal'

export const COMPANY_TITLE = 'Company information'

/* -------------------------------- routes -------------------------------- */

export const COMPANY_PATHS = {
  page: PORTAL_PATHS.company,
  questions: `${PORTAL_PATHS.company}/questions`,
  checkAnswers: `${PORTAL_PATHS.company}/check-answers`,
  confirmation: `${PORTAL_PATHS.company}/confirmation`,
} as const

/** Where a single-question edit returns to after Save / Cancel (a Change link on Check your answers). */
export type CompanyReturnTo = 'check-answers'

export function companyQuestionHref(step: number, options?: { returnTo?: CompanyReturnTo }): string {
  const href = `${COMPANY_PATHS.questions}/${step}`
  return options?.returnTo ? `${href}?return=${options.returnTo}` : href
}

/** Check your answers for one chapter. */
export function companyCheckAnswersHref(sectionId: string): string {
  return `${COMPANY_PATHS.checkAnswers}?section=${sectionId}`
}

/** Confirmation after one chapter has been submitted. */
export function companyConfirmationHref(sectionId: string): string {
  return `${COMPANY_PATHS.confirmation}?section=${sectionId}`
}

export function companyReturnHref(returnTo: CompanyReturnTo | null | undefined, sectionId: string): string {
  return returnTo === 'check-answers' ? companyCheckAnswersHref(sectionId) : COMPANY_PATHS.page
}

/**
 * sessionStorage key set by Check your answers just before submitting, so the
 * confirmation page is only reachable straight after a submission. Value is
 * the id of the chapter that was submitted.
 */
export const COMPANY_SUBMITTED_SESSION_KEY = 'hs-supplier-portal:company-submitted'

/* ------------------------------- questions ------------------------------ */

const NO_YES: QuestionOption[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
]

const YES_NO: QuestionOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const QUESTIONS: OnboardingQuestion[] = [
  // Company details
  {
    id: 'a1-company-name',
    code: 'A1',
    type: 'text',
    label: 'What is the name of your company?',
    summaryLabel: 'Company name',
    hint: 'The registered name of the organisation.',
  },
  {
    id: 'company-trades-differently',
    type: 'radios',
    label: 'Does the company trade under a different name?',
    // Implied by whether a Trading name row follows.
    hideInSummary: true,
    options: NO_YES,
  },
  {
    id: 'company-trading-name',
    type: 'text',
    label: 'What is your trading name?',
    summaryLabel: 'Trading name',
    showIf: { questionId: 'company-trades-differently', in: ['yes'] },
  },
  {
    id: 'company-organisation-type',
    type: 'radios',
    label: 'What type of organisation is it?',
    summaryLabel: 'Organisation type',
    options: [
      { value: 'private-company', label: 'Private company' },
      { value: 'charity', label: 'Charity or not-for-profit' },
      { value: 'nhs', label: 'NHS organisation' },
      { value: 'university', label: 'University or research body' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'a9-country',
    code: 'A9',
    type: 'text',
    label: 'In which country is your organisation registered?',
    summaryLabel: 'Registered country',
  },
  {
    id: 'a10-registration',
    code: 'A10',
    type: 'text',
    label: 'What is your UK Companies House registration, charity number or reference?',
    summaryLabel: 'Registration number',
  },
  {
    // NHS Addresses pattern: https://service-manual.nhs.uk/design-system/patterns/addresses
    id: 'a8-registered-address',
    code: 'A8',
    type: 'fields',
    label: 'What is the registered address of your company?',
    summaryLabel: 'Registered address',
    fields: [
      { key: 'line1', label: 'Address line 1', autoComplete: 'address-line1' },
      { key: 'line2', label: 'Address line 2', optional: true, autoComplete: 'address-line2' },
      { key: 'town', label: 'Town or city', autoComplete: 'address-level2', width: 'nhsuk-u-width-two-thirds' },
      { key: 'county', label: 'County', optional: true, width: 'nhsuk-u-width-two-thirds' },
      { key: 'postcode', label: 'Postcode', autoComplete: 'postal-code', width: 'nhsuk-input--width-10' },
    ],
  },
  {
    id: 'company-website',
    type: 'text',
    inputType: 'url',
    label: 'What is your company website?',
    summaryLabel: 'Website',
    hint: 'For example, www.example.com',
  },
  // Relationship manager
  {
    id: 'a5-relationship-manager',
    code: 'A5',
    type: 'fields',
    label: 'Who will be the relationship manager at your organisation?',
    fields: [
      { key: 'first-name', label: 'First name', autoComplete: 'given-name', width: 'nhsuk-u-width-two-thirds' },
      { key: 'last-name', label: 'Last name', autoComplete: 'family-name', width: 'nhsuk-u-width-two-thirds', inline: true },
      { key: 'job-title', label: 'Job title', autoComplete: 'organization-title' },
    ],
  },
  {
    id: 'a6-relationship-manager-contact',
    code: 'A6',
    type: 'fields',
    label: "Provide the relationship manager's contact information",
    fields: [
      { key: 'email', label: 'Email', inputType: 'email', autoComplete: 'email' },
      { key: 'phone', label: 'Phone number', inputType: 'tel', autoComplete: 'tel', width: 'nhsuk-input--width-10' },
    ],
  },
  // Care Quality Commission
  {
    id: 'a11-cqc-required',
    code: 'A11',
    type: 'radios',
    label: 'Is your organisation required to register with the Care Quality Commission (CQC)?',
    options: YES_NO,
  },
  {
    id: 'a11-cqc-assessment-date',
    code: 'A11',
    type: 'date',
    label: 'When was your last CQC assessment?',
    hint: 'For example, 15 3 2025.',
    showIf: { questionId: 'a11-cqc-required', in: ['yes'] },
  },
  {
    id: 'a12-cqc-report-upload',
    code: 'A12',
    type: 'upload',
    noReference: true,
    label: 'Upload your latest CQC report',
    showIf: { questionId: 'a11-cqc-required', in: ['yes'] },
  },
]

export const COMPANY_TASK: OnboardingTask = {
  id: 'company',
  slug: 'company',
  title: COMPANY_TITLE,
  questions: QUESTIONS,
}

/**
 * One row of a submitted chapter on the read-only Company information page:
 * either a question as answered (short `summaryLabel` where set), or a custom
 * row composed from several answers (e.g. first and last name as "Name").
 */
export type CompanySummaryRow =
  | { kind: 'question'; id: string; question: OnboardingQuestion; questionIds: string[] }
  | { kind: 'custom'; id: string; label: string; lines: string[]; questionIds: string[] }

export type CompanySection = {
  id: string
  title: string
  /** Shown as the task hint on the task list. */
  description: string
  questionIds: string[]
  /**
   * Read-only rows for the chapter. When omitted, one row per visible question
   * (minus `hideInSummary` ones) using `summaryLabel` or the question label.
   */
  summaryRows?: (answers: TaskAnswers) => CompanySummaryRow[]
}

function custom(id: string, label: string, lines: string[], questionIds: string[]): CompanySummaryRow {
  return { kind: 'custom', id, label, lines: lines.map((l) => l.trim()).filter(Boolean), questionIds }
}

const field = (answers: TaskAnswers, questionId: string, key: string) => answers[fieldKey(questionId, { key })] ?? ''

/**
 * Chapters. Each is a task on the Company information page until submitted, a
 * run of one-question-per-page screens ending in its own Check your answers,
 * and a read-only summary list once submitted.
 */
export const COMPANY_SECTIONS: CompanySection[] = [
  {
    id: 'company-details',
    title: 'Company details',
    description: 'Name, type of organisation, registration, address and website.',
    questionIds: [
      'a1-company-name',
      'company-trades-differently',
      'company-trading-name',
      'company-organisation-type',
      'a9-country',
      'a10-registration',
      'a8-registered-address',
      'company-website',
    ],
  },
  {
    id: 'relationship-manager',
    title: 'Relationship manager',
    description: 'Who we should contact at your organisation and how.',
    questionIds: ['a5-relationship-manager', 'a6-relationship-manager-contact'],
    // Name, Job title, Email, Phone number — one row each, from the two fields questions.
    summaryRows: (a) => [
      custom(
        'name',
        'Name',
        [`${field(a, 'a5-relationship-manager', 'first-name')} ${field(a, 'a5-relationship-manager', 'last-name')}`],
        ['a5-relationship-manager'],
      ),
      custom('job-title', 'Job title', [field(a, 'a5-relationship-manager', 'job-title')], ['a5-relationship-manager']),
      custom('email', 'Email', [field(a, 'a6-relationship-manager-contact', 'email')], ['a6-relationship-manager-contact']),
      custom('phone', 'Phone number', [field(a, 'a6-relationship-manager-contact', 'phone')], ['a6-relationship-manager-contact']),
    ],
  },
  {
    id: 'cqc',
    title: 'Care Quality Commission',
    description: 'Whether you register with the CQC and, if so, your latest assessment and report.',
    questionIds: ['a11-cqc-required', 'a11-cqc-assessment-date', 'a12-cqc-report-upload'],
    // One row: the report file and its date when CQC registration applies, otherwise "Not required".
    summaryRows: (a) =>
      a['a11-cqc-required'] === 'yes'
        ? [
            custom(
              'report',
              'CQC assessment report',
              [a['a12-cqc-report-upload'] ?? '', formatPortalDate(a['a11-cqc-assessment-date'])],
              ['a11-cqc-required', 'a11-cqc-assessment-date', 'a12-cqc-report-upload'],
            ),
          ]
        : [custom('report', 'CQC assessment report', ['Not required'], ['a11-cqc-required'])],
  },
]

/* -------------------------------- routing ------------------------------- */

export type CompanyVisibleQuestion = { question: OnboardingQuestion; step: number }

export function companyVisibleQuestions(answers: TaskAnswers): CompanyVisibleQuestion[] {
  return visibleQuestions(COMPANY_TASK, answers)
}

/** Chapter by id (e.g. from a `?section=` query parameter), or undefined. */
export function findCompanySection(id: string | null | undefined): CompanySection | undefined {
  return id ? COMPANY_SECTIONS.find((s) => s.id === id) : undefined
}

/** The chapter a question belongs to. Every question is in exactly one. */
export function companySectionFor(questionId: string): CompanySection {
  const section = COMPANY_SECTIONS.find((s) => s.questionIds.includes(questionId))
  if (!section) throw new Error(`Company question ${questionId} is not in any section`)
  return section
}

/** The chapter the question at a physical step belongs to. */
export function companySectionForStep(step: number): CompanySection {
  return companySectionFor(COMPANY_TASK.questions[step - 1].id)
}

/** Visible questions in a section, in page order. */
export function companySectionQuestions(sectionId: string, answers: TaskAnswers): CompanyVisibleQuestion[] {
  const ids = COMPANY_SECTIONS.find((s) => s.id === sectionId)?.questionIds ?? []
  return companyVisibleQuestions(answers).filter((v) => ids.includes(v.question.id))
}

/** Rows for a submitted chapter on the read-only Company information page. */
export function companySectionSummaryRows(sectionId: string, answers: TaskAnswers): CompanySummaryRow[] {
  const section = COMPANY_SECTIONS.find((s) => s.id === sectionId)
  if (!section) return []
  if (section.summaryRows) return section.summaryRows(answers)
  return companySectionQuestions(sectionId, answers)
    .filter(({ question }) => !question.hideInSummary)
    .map(({ question }) => ({ kind: 'question', id: question.id, question, questionIds: [question.id] }))
}

/** Physical step of the first visible question in a section (where its task link opens). */
export function companySectionFirstStep(sectionId: string, answers: TaskAnswers): number {
  const first = companySectionQuestions(sectionId, answers)[0]
  if (!first) throw new Error(`Company section ${sectionId} has no visible questions`)
  return first.step
}

/** Every answer key written by the chapter's questions (visible or not). */
export function companySectionKeys(sectionId: string): string[] {
  const ids = COMPANY_SECTIONS.find((s) => s.id === sectionId)?.questionIds ?? []
  return COMPANY_TASK.questions.filter((q) => ids.includes(q.id)).flatMap((q) => questionKeys(q))
}

/**
 * Physical 1-based step of the next visible question after `step` in the same
 * chapter, or null on the chapter's last page (Save and continue then goes to
 * the chapter's Check your answers).
 */
export function companyNextStep(step: number, answers: TaskAnswers): number | null {
  const section = companySectionForStep(step)
  return companySectionQuestions(section.id, answers).find((v) => v.step > step)?.step ?? null
}

/** Physical step of the previous visible question in the same chapter, or null on its first page. */
export function companyPrevStep(step: number, answers: TaskAnswers): number | null {
  const section = companySectionForStep(step)
  const before = companySectionQuestions(section.id, answers).filter((v) => v.step < step)
  return before.length ? before[before.length - 1].step : null
}

/** True when every visible required question in the section has an answer. */
export function companySectionComplete(sectionId: string, answers: TaskAnswers): boolean {
  return companySectionQuestions(sectionId, answers).every((v) => v.question.optional || isQuestionAnswered(v.question, answers))
}

/**
 * True once the chapter has been submitted: a chapter can only be submitted
 * when complete, so a complete set of current `values` means it has been.
 */
export function companySectionSubmitted(sectionId: string, values: TaskAnswers): boolean {
  return companySectionComplete(sectionId, values)
}

/**
 * Where a task-list row opens: the first visible required question in the
 * chapter without an answer, or null when every one is answered (the row
 * then opens Check your answers).
 */
export function companySectionResumeStep(sectionId: string, answers: TaskAnswers): number | null {
  return (
    companySectionQuestions(sectionId, answers).find((v) => !v.question.optional && !isQuestionAnswered(v.question, answers))
      ?.step ?? null
  )
}

/** True when every visible required question has an answer (every chapter submitted, for `values`). */
export function companyComplete(answers: TaskAnswers): boolean {
  return isTaskComplete(COMPANY_TASK, answers)
}

/** True when any key the question writes differs between `draft` and `values`. */
export function companyQuestionChanged(question: OnboardingQuestion, draft: TaskAnswers, values: TaskAnswers): boolean {
  return questionKeys(question).some((key) => key in draft && (draft[key] ?? '') !== (values[key] ?? ''))
}

/** True when the chapter has saved edits that differ from the current version. */
export function companySectionChanged(sectionId: string, draft: TaskAnswers, values: TaskAnswers): boolean {
  return companySectionKeys(sectionId).some((key) => key in draft && (draft[key] ?? '') !== (values[key] ?? ''))
}

/* --------------------------- prototype samples -------------------------- */

/** "Fill with sample answers" — my mhealth Limited, matching SAMPLE_SUPPLIER. */
export const COMPANY_SAMPLE_ANSWERS: TaskAnswers = {
  'a1-company-name': 'my mhealth Limited',
  'company-trades-differently': 'yes',
  'company-trading-name': 'my mhealth',
  'company-organisation-type': 'private-company',
  'a9-country': 'United Kingdom',
  'a10-registration': '07614236',
  [fieldKey('a8-registered-address', { key: 'line1' })]: 'Unit 4, Bournemouth Business Park',
  [fieldKey('a8-registered-address', { key: 'line2' })]: '',
  [fieldKey('a8-registered-address', { key: 'town' })]: 'Bournemouth',
  [fieldKey('a8-registered-address', { key: 'county' })]: 'Dorset',
  [fieldKey('a8-registered-address', { key: 'postcode' })]: 'BH8 8EZ',
  'company-website': 'www.mymhealth.com',
  [fieldKey('a5-relationship-manager', { key: 'first-name' })]: 'Brandson',
  [fieldKey('a5-relationship-manager', { key: 'last-name' })]: 'Sanderson',
  [fieldKey('a5-relationship-manager', { key: 'job-title' })]: 'Head of NHS Partnerships',
  [fieldKey('a6-relationship-manager-contact', { key: 'email' })]: 'sam.patel@mymhealth.example',
  [fieldKey('a6-relationship-manager-contact', { key: 'phone' })]: '+44 1202 496 000',
  'a11-cqc-required': 'yes',
  'a11-cqc-assessment-date': '2026-03-18',
  'a12-cqc-report-upload': 'my-mhealth-CQC-report-2026.pdf',
}
