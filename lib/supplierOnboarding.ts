/**
 * Supplier onboarding task list — single source of truth for the structure of
 * the product onboarding form in the Supplier portal.
 *
 * Follows the NHS "Complete multiple tasks" pattern:
 * https://service-manual.nhs.uk/design-system/patterns/complete-multiple-tasks
 *
 * Each product awaiting onboarding has its own copy of the form at
 * `/supplier-portal/products/onboard/[formId]`. Sections group related tasks;
 * each task has its own page at `.../[formId]/[slug]` and its own Completed /
 * Incomplete status.
 *
 * The questionnaire is multi-routed: a question may declare `showIf` conditions
 * on earlier answers in the same task. Hidden questions are skipped by
 * Save and Next, ignored by the Completed check and omitted from Check your
 * answers. See `isQuestionVisible`. The routes are documented in
 * docs/SUPPLIER_PORTAL_FLOWS.md ("Product onboarding question routes").
 */

import { PORTAL_PATHS } from '@/lib/supplierPortal'

export const SERVICE_NAME = 'HealthStore Onboarding'

/** localStorage key prefix; one entry per form (client-side prototype). */
export const STORAGE_KEY_PREFIX = 'hs-supplier-portal:onboarding:'

export function storageKey(formId: string): string {
  return `${STORAGE_KEY_PREFIX}${formId}`
}

/** Task list page for one product's form. */
export function formBasePath(formId: string): string {
  return `${PORTAL_PATHS.onboard}/${formId}`
}

export type QuestionOption = {
  value: string
  label: string
  /** Not rendered (kept in the model so a route can be switched on later). */
  hidden?: boolean
  /** Checkboxes only: selecting this clears every other option, and vice versa ("None of the above"). */
  exclusive?: boolean
}

/**
 * Routing condition on an earlier answer in the same task. `in` holds when any
 * selected value is listed; `notIn` holds when none is. An unanswered (or
 * hidden) referenced question never satisfies a condition, so follow-up
 * questions only appear once their parent has been answered.
 */
export type AnswerCondition =
  | { questionId: string; in?: string[]; notIn?: string[] }
  | { anyOf: AnswerCondition[] }

/**
 * One question = one page (NHS/GOV.UK "one thing per page"). The question
 * `label` is rendered as the page heading, `hint` beneath it.
 */
type QuestionBase = {
  id: string
  /** Questionnaire reference (e.g. "C1.1.1"), shown in the page caption and on Check your answers. */
  code?: string
  label: string
  hint?: string
  /** Optional questions (e.g. "if applicable") do not block the task from being Completed. */
  optional?: boolean
  /** Shown only when every condition holds (see `isQuestionVisible`). Absent = always shown. */
  showIf?: AnswerCondition | AnswerCondition[]
  /** Short row key for read-only summaries (e.g. "Company name"); the question `label` is used when omitted. */
  summaryLabel?: string
  /** Leave the row out of read-only summaries (e.g. a Yes/No gate whose answer is implied by the next row). */
  hideInSummary?: boolean
}

export type TextInputType = 'text' | 'url' | 'email' | 'tel'

/** One input in a `fields` question (e.g. Address line 1, First name). */
export type FieldSpec = {
  key: string
  label: string
  optional?: boolean
  inputType?: TextInputType
  autoComplete?: string
  /** NHS input width modifier, e.g. 'nhsuk-input--width-10'. Full width when omitted. */
  width?: string
  /** On Check your answers, show on the same line as the previous field (e.g. first and last name). */
  inline?: boolean
}

export type OnboardingQuestion =
  | (QuestionBase & { type: 'radios'; options: QuestionOption[] })
  | (QuestionBase & { type: 'checkboxes'; options: QuestionOption[] })
  | (QuestionBase & { type: 'textarea' })
  /** Single-line NHS Text input (links, email addresses, phone numbers, percentages, short dates). */
  | (QuestionBase & { type: 'text'; inputType?: TextInputType })
  /**
   * Several short text inputs under one heading (NHS Addresses pattern, a
   * person's name, contact details). Each field is stored under
   * `${id}${FIELD_SEPARATOR}${field.key}` — see `fieldKey`.
   */
  | (QuestionBase & { type: 'fields'; fields: FieldSpec[] })
  /** NHS Date input (day / month / year). Stored as YYYY-MM-DD. */
  | (QuestionBase & { type: 'date' })
  /**
   * File upload plus a required reference name (GOV.UK File upload — the NHS
   * design system has no equivalent). `documents` lists the evidence that may be
   * supplied. The file name is stored under `id`; the reference name under
   * `${id}${UPLOAD_REFERENCE_SUFFIX}`. Set `noReference` to ask for the file only.
   */
  | (QuestionBase & { type: 'upload'; documents?: string[]; noReference?: boolean })
  /**
   * Several documents, added one at a time (file + reference name, then
   * "Upload file"), listed with a Remove action. Adapted from the MoJ Multi file
   * upload pattern using NHS components. The list is stored JSON-encoded under
   * `id` (see `UploadedDocument`); the "Mark as complete" checkbox under
   * `${id}${MULTI_UPLOAD_CONFIRMED_SUFFIX}` — the question only counts as
   * answered once at least one document is listed AND the box is ticked.
   * `documents` is shown in an NHS Details component ("Documents you can provide").
   */
  | (QuestionBase & { type: 'multi-upload'; documents?: string[] })

export const UPLOAD_REFERENCE_SUFFIX = '__reference'
export const MULTI_UPLOAD_CONFIRMED_SUFFIX = '__confirmed'
export const CONFIRMED_VALUE = 'yes'
export const FIELD_SEPARATOR = '__'

/** Answer key for one input of a `fields` question. */
export function fieldKey(questionId: string, field: Pick<FieldSpec, 'key'>): string {
  return `${questionId}${FIELD_SEPARATOR}${field.key}`
}

/** One entry in a multi-upload list. Prototype: metadata only, no file bytes. */
export type UploadedDocument = {
  name: string
  size: number
  reference: string
  uploadedAt: string
}

export function parseUploadedDocuments(value: string | undefined): UploadedDocument[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as UploadedDocument[]) : []
  } catch {
    return []
  }
}

export function serializeUploadedDocuments(docs: UploadedDocument[]): string {
  return docs.length === 0 ? '' : JSON.stringify(docs)
}

export type OnboardingTask = {
  /** Stable identifier used as the completion-state key. */
  id: string
  /** URL segment under /supplier-onboard. */
  slug: string
  title: string
  /** Question pages for this task. Empty until the content is authored. */
  questions: OnboardingQuestion[]
}

export type OnboardingSection = {
  id: string
  title: string
  /** Short explanation shown under the numbered section heading. */
  description: string
  tasks: OnboardingTask[]
}

/** Regulatory notice shown in the blue panel under the task list introduction. */
export const ONBOARDING_NOTICE =
  'Use this form to onboard your Digital Therapeutic (DTx) into the NHS HealthStore. The HealthStore is an information and signposting platform only; NHS England is not a distributor or part of the medical device supply chain. Under UK MDR, manufacturers are solely liable for all clinical, efficacy and regulatory claims. Answers must be objective, evidence-based and aligned with NHS clinical guidelines.'

/** Declaration shown above "Confirm and submit" on the Check your answers page. */
export const SUBMISSION_DECLARATION =
  'By submitting you confirm you understand that under UK MDR, manufacturers are solely liable for all clinical, efficacy and regulatory claims. All answers are objective, evidence-based and aligned with NHS clinical guidelines.'

export function checkAnswersPath(formId: string): string {
  return `${formBasePath(formId)}/check-answers`
}

export function confirmationPath(formId: string): string {
  return `${formBasePath(formId)}/confirmation`
}

function task(slug: string, title: string, questions: OnboardingQuestion[] = []): OnboardingTask {
  return { id: slug, slug, title, questions }
}

/* ----------------------------- option sets ------------------------------ */

const YES_NO: QuestionOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const YES_NO_NA: QuestionOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-applicable', label: 'Not applicable' },
]

const PROVIDED_NOT_PROVIDED: QuestionOption[] = [
  { value: 'provided', label: 'Provided' },
  { value: 'not-provided', label: 'Not provided' },
]

const CONFIRM_CANNOT_CONFIRM: QuestionOption[] = [
  { value: 'confirm', label: 'Confirm' },
  { value: 'cannot-confirm', label: 'Cannot confirm' },
]

const CONFIRMED_UNABLE: QuestionOption[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'unable-to-confirm', label: 'Unable to confirm' },
]

const UPLOAD_HINT = 'Label the document with your company name, the question number and the date of submission.'

/* -------------------------------- content ------------------------------- */

export const SECTIONS: OnboardingSection[] = [
  {
    id: 'product-details',
    title: 'Product details',
    description: 'Tell us which product, and which version of it, this form is for.',
    tasks: [
      task('product-details', 'Product details', [
        {
          id: 'a2-product-name',
          code: 'A2',
          type: 'text',
          label: 'What is the name of your product?',
        },
        {
          id: 'a3-product-version',
          code: 'A3',
          type: 'text',
          label: 'Which version number of your product does this form correspond to?',
          hint: 'For example, 3.2.0.',
        },
        {
          id: 'a4-product-type',
          code: 'A4',
          type: 'radios',
          label: 'What type of product is it?',
          options: [
            { value: 'standalone-application', label: 'Standalone application' },
            { value: 'wearable', label: 'Wearable' },
            { value: 'saas', label: 'Software as a service (SaaS)' },
            { value: 'other', label: 'Other' },
          ],
        },
        {
          id: 'a4-product-type-other',
          code: 'A4',
          type: 'textarea',
          label: 'Describe the type of product',
          showIf: { questionId: 'a4-product-type', in: ['other'] },
        },
      ]),
    ],
  },
  {
    id: 'value-proposition',
    title: 'Value proposition',
    description:
      'Set out the clinical, economic or behavioural benefits of your product to support the review of your technology. This section is not scored but provides the context of the product undergoing assessment. Where possible, give details relating to the specific technology and not generally to your organisation.',
    tasks: [
      task('value-proposition', 'Value proposition', [
        {
          id: 'b1-intended-use',
          code: 'B1',
          type: 'radios',
          label: 'What is the intended use of the product?',
          options: [
            { value: 'patient-care-support', label: 'Patient care or support' },
            { value: 'diagnostics', label: 'Diagnostics' },
            { value: 'clinical-support', label: 'Clinical support' },
            { value: 'workforce-support', label: 'Workforce support' },
            { value: 'other', label: 'Other' },
          ],
        },
        {
          id: 'b2-description',
          code: 'B2',
          type: 'textarea',
          label: 'Describe what the product is designed to do and how it is expected to be used',
          hint: 'A clear, high-level summary.',
        },
        {
          id: 'b3-users-benefits',
          code: 'B3',
          type: 'textarea',
          label: 'Describe the intended users and proven benefits, and confirm if and how the benefits have been validated',
          hint: 'A high-level summary, including any trial details.',
        },
        {
          id: 'b4-data-flow',
          code: 'B4',
          type: 'radios',
          label: 'Can you provide information about the data flow between the product and the health IT system?',
          hint: 'Attach a user journey map where applicable.',
          options: [
            { value: 'provided', label: 'Provided' },
            { value: 'not-available', label: 'Not available' },
          ],
        },
        {
          id: 'b4-data-flow-upload',
          code: 'B4',
          type: 'upload',
          label: 'Upload your data flow or user journey map',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'b4-data-flow', in: ['provided'] },
        },
      ]),
    ],
  },
  {
    id: 'technical-questions',
    title: 'Technical questions (assessed standards)',
    description:
      'Suppliers must provide responses and documentation relating to the specific version of the product that is subject to assessment.',
    tasks: [
      task('clinical-safety', 'Clinical safety (DCB 0129)', [
        {
          id: 'c1-1-1-samd',
          code: 'C1.1.1',
          type: 'radios',
          label: 'Does your product qualify as software or AI as a medical device under UK MDR 2002?',
          hint: 'If yes, you will be asked to upload a completed Pre-acquisition questionnaire (PAQ) form for medical devices in respect of the product or its component.',
          options: YES_NO,
        },
        {
          id: 'c1-1-1-paq-upload',
          code: 'C1.1.1',
          type: 'upload',
          label: 'Upload your completed Pre-acquisition questionnaire (PAQ) form',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c1-1-1-samd', in: ['yes'] },
        },
        {
          id: 'c1-1-2-standalone',
          code: 'C1.1.2',
          type: 'radios',
          label: 'Is your product classified as a standalone medical device?',
          options: YES_NO,
          showIf: { questionId: 'c1-1-1-samd', in: ['yes'] },
        },
        {
          id: 'c1-2-direct-care',
          code: 'C1.2',
          type: 'radios',
          label: 'Is your product designed to support or manage real-time or direct care?',
          options: YES_NO,
        },
        {
          id: 'c1-2-1-justification',
          code: 'C1.2.1',
          type: 'textarea',
          label: 'Explain why the product is out of scope of DCB 0129',
          hint: 'You answered No to C1.2. Provide your justification.',
          showIf: { questionId: 'c1-2-direct-care', in: ['no'] },
        },
        {
          id: 'c1-2-2-crm-activities',
          code: 'C1.2.2',
          type: 'radios',
          label: 'Have you undertaken clinical risk management activities complying with DCB 0129?',
          options: YES_NO,
        },
        {
          id: 'c1-2-3-crm-system',
          code: 'C1.2.3',
          type: 'radios',
          label: 'Can you detail your clinical risk management system?',
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'c1-2-3-crm-system-details',
          code: 'C1.2.3',
          type: 'textarea',
          label: 'Describe your clinical risk management system',
          showIf: { questionId: 'c1-2-3-crm-system', in: ['provided'] },
        },
        {
          id: 'c1-2-4-safety-case',
          code: 'C1.2.4',
          type: 'radios',
          label: 'Can you supply your Clinical Safety Case Report and Hazard Log?',
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'c1-2-4-safety-case-report-upload',
          code: 'C1.2.4',
          type: 'upload',
          label: 'Upload your Clinical Safety Case Report',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c1-2-4-safety-case', in: ['provided'] },
        },
        {
          id: 'c1-2-4-hazard-log-upload',
          code: 'C1.2.4',
          type: 'upload',
          label: 'Upload your Hazard Log',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c1-2-4-safety-case', in: ['provided'] },
        },
        {
          id: 'c1-2-5-cso',
          code: 'C1.2.5',
          type: 'textarea',
          label: 'Provide the details of your Clinical Safety Officer (CSO)',
          hint: 'Name, profession and professional registration number.',
        },
      ]),
      task('data-protection', 'Data protection (UK GDPR)', [
        {
          id: 'c2-1-dspt',
          code: 'C2.1',
          type: 'radios',
          label: 'Confirm compliance with the annual Data Security and Protection Toolkit (DSPT) assessment',
          hint: 'Standards met or exceeded.',
          options: [
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'unable-to-confirm', label: 'Unable to confirm' },
            { value: 'no-patient-data', label: 'No access to patient data' },
          ],
        },
        {
          id: 'c2-2-personal-data',
          code: 'C2.2',
          type: 'radios',
          label: 'Does the product process personal data or data about deceased individuals?',
          options: YES_NO,
        },
        {
          id: 'c2-2-1-ico',
          code: 'C2.2.1',
          type: 'radios',
          label: "Can you provide evidence of current registration with the Information Commissioner's Office (ICO)?",
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'c2-2-1-ico-upload',
          code: 'C2.2.1',
          type: 'upload',
          label: 'Upload your ICO registration certificate',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c2-2-1-ico', in: ['provided'] },
        },
        {
          id: 'c2-2-2-dpia',
          code: 'C2.2.2',
          type: 'radios',
          label: 'Can you provide the Data Protection Impact Assessment (DPIA) relating to the product?',
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'c2-2-2-dpia-upload',
          code: 'C2.2.2',
          type: 'upload',
          label: 'Upload your Data Protection Impact Assessment (DPIA)',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c2-2-2-dpia', in: ['provided'] },
        },
        {
          id: 'c2-2-3-privacy-notice',
          code: 'C2.2.3',
          type: 'radios',
          label: "Can you provide a link to your product's transparency information (privacy notice)?",
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'c2-2-3-privacy-notice-link',
          code: 'C2.2.3',
          type: 'text',
          inputType: 'url',
          label: 'Link to your privacy notice',
          hint: 'For example, https://www.example.com/privacy',
          showIf: { questionId: 'c2-2-3-privacy-notice', in: ['provided'] },
        },
        {
          id: 'c2-2-4-terms',
          code: 'C2.2.4',
          type: 'radios',
          label: 'Can you provide product terms and conditions regarding user data, an end user licence agreement (EULA) or equivalent?',
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'c2-2-4-terms-upload',
          code: 'C2.2.4',
          type: 'upload',
          label: 'Upload your terms and conditions, EULA or equivalent',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c2-2-4-terms', in: ['provided'] },
        },
        {
          id: 'c2-2-4-terms-reason',
          code: 'C2.2.4',
          type: 'textarea',
          label: 'Explain why terms and conditions, an EULA or equivalent cannot be provided',
          showIf: { questionId: 'c2-2-4-terms', in: ['not-provided'] },
        },
        {
          id: 'c2-2-5-data-location',
          code: 'C2.2.5',
          type: 'radios',
          label: 'Where does your product store and process data?',
          options: [
            { value: 'uk-only', label: 'UK only' },
            { value: 'outside-uk', label: 'Outside of the UK' },
          ],
        },
        {
          id: 'c2-2-6-outside-uk',
          code: 'C2.2.6',
          type: 'textarea',
          label: 'Name the country where data is stored or processed and set out your compliance safeguards',
          hint: 'For example, an International Data Transfer Agreement (IDTA) or adequacy regulations.',
          showIf: { questionId: 'c2-2-5-data-location', in: ['outside-uk'] },
        },
      ]),
      task('technical-security', 'Technical security', [
        {
          id: 'c3-1-cyber-essentials',
          code: 'C3.1',
          type: 'radios',
          label: 'Can you provide a valid Cyber Essentials certificate?',
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'c3-1-cyber-essentials-upload',
          code: 'C3.1',
          type: 'upload',
          label: 'Upload your Cyber Essentials certificate',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c3-1-cyber-essentials', in: ['provided'] },
        },
        {
          id: 'c3-2-charter',
          code: 'C3.2',
          type: 'radios',
          label: 'Have you signed the Cyber Security Charter for Suppliers to the NHS?',
          hint: 'If yes, the remaining technical security questions are skipped.',
          options: YES_NO,
        },
        {
          id: 'c3-3-pen-test',
          code: 'C3.3',
          type: 'radios',
          label: 'Can you provide an external penetration test summary report from the last 12 months?',
          hint: 'Including the OWASP Top 10.',
          options: PROVIDED_NOT_PROVIDED,
          showIf: { questionId: 'c3-2-charter', in: ['no'] },
        },
        {
          id: 'c3-3-pen-test-upload',
          code: 'C3.3',
          type: 'upload',
          label: 'Upload your penetration test summary report',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'c3-3-pen-test', in: ['provided'] },
        },
        {
          id: 'c3-4-code-of-practice',
          code: 'C3.4',
          type: 'radios',
          label: 'Confirm your software adheres to the DSIT and NCSC Software Security Code of Practice',
          options: CONFIRMED_UNABLE,
          showIf: { questionId: 'c3-2-charter', in: ['no'] },
        },
        {
          id: 'c3-5-mfa-plan',
          code: 'C3.5',
          type: 'radios',
          label: 'Do you have a plan for implementing multi-factor authentication (MFA) across all accounts?',
          options: YES_NO,
          showIf: { questionId: 'c3-2-charter', in: ['no'] },
        },
        {
          id: 'c3-5-1-privileged-mfa',
          code: 'C3.5.1',
          type: 'radios',
          label: 'Do privileged supplier access accounts have MFA enabled, or equivalent MFA applied at the remote end when accessing the product?',
          options: YES_NO_NA,
          showIf: { questionId: 'c3-2-charter', in: ['no'] },
        },
        {
          id: 'c3-6-logging',
          code: 'C3.6',
          type: 'radios',
          label: 'Have logging and reporting requirements been defined?',
          options: YES_NO,
          showIf: { questionId: 'c3-2-charter', in: ['no'] },
        },
      ]),
      task('interoperability', 'Interoperability', [
        {
          id: 'c4-1-apis',
          code: 'C4.1',
          type: 'radios',
          label: 'Does your product expose any APIs or integration channels for other health products?',
          options: YES_NO,
        },
        {
          id: 'c4-1-1-standards',
          code: 'C4.1.1',
          type: 'textarea',
          label: 'Confirm your APIs use international or industry standards',
          hint: 'List the standards used and your justification.',
          showIf: { questionId: 'c4-1-apis', in: ['yes'] },
        },
        {
          id: 'c4-1-2-open-api',
          code: 'C4.1.2',
          type: 'radios',
          label: 'Confirm your APIs follow GDS Open API guidance and are openly documented',
          options: CONFIRM_CANNOT_CONFIRM,
          showIf: { questionId: 'c4-1-apis', in: ['yes'] },
        },
        {
          id: 'c4-1-3-documentation',
          code: 'C4.1.3',
          type: 'textarea',
          label: 'Set out the basis on which your APIs are documented',
          hint: 'You could not confirm C4.1.2.',
          showIf: { questionId: 'c4-1-2-open-api', in: ['cannot-confirm'] },
        },
        {
          id: 'c4-2-data-sharing',
          code: 'C4.2',
          type: 'radios',
          label: 'Is your product intended to share or receive data from national or local care systems?',
          options: YES_NO,
        },
        {
          id: 'c4-2-1-nhs-number',
          code: 'C4.2.1',
          type: 'radios',
          label: 'Is your product capable of using the NHS number to identify patient data during exchange?',
          options: YES_NO,
          showIf: { questionId: 'c4-2-data-sharing', in: ['yes'] },
        },
        {
          id: 'c4-2-2-pds',
          code: 'C4.2.2',
          type: 'radios',
          label: 'Does your product integrate with the NHS Personal Demographics Service (PDS) or local systems to validate NHS numbers?',
          options: YES_NO,
          showIf: { questionId: 'c4-2-data-sharing', in: ['yes'] },
        },
        {
          id: 'c4-2-3-identification',
          code: 'C4.2.3',
          type: 'textarea',
          label: 'Set out the approach taken to correctly identify patient records',
          hint: 'You answered No to C4.2.1 or C4.2.2.',
          showIf: {
            anyOf: [
              { questionId: 'c4-2-1-nhs-number', in: ['no'] },
              { questionId: 'c4-2-2-pds', in: ['no'] },
            ],
          },
        },
        {
          id: 'c4-2-4-nhs-login',
          code: 'C4.2.4',
          type: 'radios',
          label: 'If used directly by patients, do you use NHS login to verify identity and authenticate users?',
          options: YES_NO_NA,
          showIf: { questionId: 'c4-2-data-sharing', in: ['yes'] },
        },
        {
          id: 'c4-2-5-dapb3051',
          code: 'C4.2.5',
          type: 'radios',
          label: 'If used by public health or social care, does the product support the DAPB3051 identity standard?',
          options: YES_NO_NA,
          showIf: { questionId: 'c4-2-data-sharing', in: ['yes'] },
        },
        {
          id: 'c4-2-6-authentication',
          code: 'C4.2.6',
          type: 'textarea',
          label: 'Set out your authentication approach and data protection measures',
          hint: 'You are not using NHS login.',
          showIf: { questionId: 'c4-2-4-nhs-login', in: ['no', 'not-applicable'] },
        },
      ]),
    ],
  },
  {
    id: 'usability-accessibility',
    title: 'Key principles for success (usability and accessibility)',
    description: 'Establishing that your product has followed best practice.',
    tasks: [
      task('usability-accessibility', 'Usability and accessibility', [
        {
          id: 'd1-1-pathways',
          code: 'D1.1',
          type: 'radios',
          label: 'Can you provide information about how the product fits into existing systems such as care pathways or staff journeys?',
          hint: 'For example, instructions for use.',
          options: PROVIDED_NOT_PROVIDED,
        },
        {
          id: 'd1-1-pathways-upload',
          code: 'D1.1',
          type: 'upload',
          label: 'Upload your pathway or journey document',
          hint: UPLOAD_HINT,
          showIf: { questionId: 'd1-1-pathways', in: ['provided'] },
        },
        {
          id: 'd1-2-user-testing',
          code: 'D1.2',
          type: 'radios',
          label: 'Do you undertake testing with intended users to validate product usability?',
          options: YES_NO,
        },
        {
          id: 'd1-3-ais',
          code: 'D1.3',
          type: 'radios',
          label: 'Confirm you have read the Accessible Information Standard and considered its design requirements',
          options: CONFIRM_CANNOT_CONFIRM,
        },
        {
          id: 'd1-4-platforms',
          code: 'D1.4',
          type: 'checkboxes',
          label: 'Which digital platforms does your product support?',
          hint: 'Select all that apply.',
          options: [
            { value: 'ios', label: 'iOS' },
            { value: 'android', label: 'Android' },
            { value: 'web', label: 'Web' },
            // Hidden for now. When shown and selected, the rest of this section is skipped.
            { value: 'none', label: 'None of the above', hidden: true, exclusive: true },
          ],
        },
        {
          id: 'd1-4-1-wcag',
          code: 'D1.4.1',
          type: 'radios',
          label: 'Does your product comply with WCAG 2.2 at level AA or higher?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no-plan-in-place', label: 'No, but a plan is in place' },
            { value: 'no', label: 'No' },
            { value: 'not-applicable', label: 'Not applicable' },
          ],
          showIf: { questionId: 'd1-4-platforms', notIn: ['none'] },
        },
        {
          id: 'd1-4-2-timescale',
          code: 'D1.4.2',
          type: 'text',
          label: 'Set out the timescale by which you plan to be WCAG 2.2 AA compliant',
          hint: 'For example, March 2027.',
          showIf: { questionId: 'd1-4-1-wcag', in: ['no-plan-in-place', 'no'] },
        },
        {
          id: 'd1-4-3-accessibility-statement',
          code: 'D1.4.3',
          type: 'text',
          inputType: 'url',
          label: 'Link to your published accessibility statement',
          hint: 'For example, https://www.example.com/accessibility',
          showIf: { questionId: 'd1-4-platforms', notIn: ['none'] },
        },
        {
          id: 'd1-5-availability',
          code: 'D1.5',
          type: 'text',
          label: 'What was your average service availability over the past 12 months?',
          hint: 'Percentage to 2 decimal places, for example 99.95%.',
          showIf: { questionId: 'd1-4-platforms', notIn: ['none'] },
        },
      ]),
    ],
  },
]

export const ALL_TASKS: OnboardingTask[] = SECTIONS.flatMap((s) => s.tasks)

/** Resolve a task (and its parent section) from a URL slug. */
export function findTask(slug: string): { task: OnboardingTask; section: OnboardingSection } | null {
  for (const section of SECTIONS) {
    const found = section.tasks.find((t) => t.slug === slug)
    if (found) return { task: found, section }
  }
  return null
}

export function taskHref(formId: string, task: OnboardingTask): string {
  return `${formBasePath(formId)}/${task.slug}`
}

/** URL for question page `step` (1-based). Step 1 is the bare task URL. */
export function taskStepHref(formId: string, task: OnboardingTask, step: number): string {
  return step <= 1 ? taskHref(formId, task) : `${taskHref(formId, task)}/${step}`
}

/**
 * Answers are flat string values keyed by question id. Composite questions use
 * extra keys: upload -> `${id}${UPLOAD_REFERENCE_SUFFIX}`; checkboxes store the
 * selected values joined with `CHECKBOX_SEPARATOR`; dates store `YYYY-MM-DD`.
 */
export type TaskAnswers = Record<string, string>

export const CHECKBOX_SEPARATOR = ','

export function isAnswered(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim() !== ''
}

/** All answer keys a question writes (used to scope a page's draft). */
export function questionKeys(q: OnboardingQuestion): string[] {
  switch (q.type) {
    case 'upload':
      return q.noReference ? [q.id] : [q.id, `${q.id}${UPLOAD_REFERENCE_SUFFIX}`]
    case 'multi-upload':
      return [q.id, `${q.id}${MULTI_UPLOAD_CONFIRMED_SUFFIX}`]
    case 'fields':
      return q.fields.map((f) => fieldKey(q.id, f))
    default:
      return [q.id]
  }
}

/** Loose YYYY-MM-DD check: all three parts present and in plausible ranges. */
export function isValidIsoDate(value: string | undefined): boolean {
  if (!value) return false
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value)
  if (!m) return false
  const [, y, mo, d] = m.map(Number)
  return y >= 1900 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31
}

export function isQuestionAnswered(q: OnboardingQuestion, answers: TaskAnswers): boolean {
  switch (q.type) {
    case 'upload':
      return isAnswered(answers[q.id]) && (q.noReference || isAnswered(answers[`${q.id}${UPLOAD_REFERENCE_SUFFIX}`]))
    case 'fields':
      return q.fields.every((f) => f.optional || isAnswered(answers[fieldKey(q.id, f)]))
    case 'multi-upload':
      return (
        parseUploadedDocuments(answers[q.id]).length > 0 &&
        answers[`${q.id}${MULTI_UPLOAD_CONFIRMED_SUFFIX}`] === CONFIRMED_VALUE
      )
    case 'date':
      return isValidIsoDate(answers[q.id])
    default:
      return isAnswered(answers[q.id])
  }
}

/* -------------------------------- routing ------------------------------- */

/** Selected value(s) of a question: checkboxes split on the separator; others a single value. */
export function selectedValues(q: OnboardingQuestion, answers: TaskAnswers): string[] {
  const raw = answers[q.id]
  if (!isAnswered(raw)) return []
  return q.type === 'checkboxes' ? raw!.split(CHECKBOX_SEPARATOR).filter(Boolean) : [raw!.trim()]
}

function conditionHolds(cond: AnswerCondition, task: OnboardingTask, answers: TaskAnswers): boolean {
  if ('anyOf' in cond) return cond.anyOf.some((c) => conditionHolds(c, task, answers))
  const parent = task.questions.find((q) => q.id === cond.questionId)
  // A hidden parent can hold a stale answer; it must never reveal its children.
  if (!parent || !isQuestionVisible(parent, task, answers)) return false
  const values = selectedValues(parent, answers)
  if (values.length === 0) return false
  if (cond.in && !values.some((v) => cond.in!.includes(v))) return false
  if (cond.notIn && values.some((v) => cond.notIn!.includes(v))) return false
  return true
}

/**
 * True when the question is on the supplier's current route: it has no
 * `showIf`, or every condition holds against answers in the same task
 * (transitively — the referenced question must itself be visible).
 */
export function isQuestionVisible(q: OnboardingQuestion, task: OnboardingTask, answers: TaskAnswers): boolean {
  if (!q.showIf) return true
  const conditions = Array.isArray(q.showIf) ? q.showIf : [q.showIf]
  return conditions.every((c) => conditionHolds(c, task, answers))
}

/** Questions on the current route, in page order, each with its physical 1-based step. */
export function visibleQuestions(
  task: OnboardingTask,
  answers: TaskAnswers,
): Array<{ question: OnboardingQuestion; step: number }> {
  return task.questions
    .map((question, i) => ({ question, step: i + 1 }))
    .filter(({ question }) => isQuestionVisible(question, task, answers))
}

/**
 * "Save and Next" target: the next visible question in this task, else the
 * first page of the next task in journey order (crossing section boundaries),
 * else `null` on the final page of the final task.
 */
export function nextPageHref(formId: string, task: OnboardingTask, step: number, answers: TaskAnswers): string | null {
  const next = visibleQuestions(task, answers).find((v) => v.step > step)
  if (next) return taskStepHref(formId, task, next.step)
  const index = ALL_TASKS.findIndex((t) => t.id === task.id)
  const nextTask = ALL_TASKS.slice(index + 1).find((t) => t.questions.length > 0)
  return nextTask ? taskHref(formId, nextTask) : null
}

/** Back-link target: the previous visible question in this task, else the task list. */
export function prevPageHref(formId: string, task: OnboardingTask, step: number, answers: TaskAnswers): string {
  const before = visibleQuestions(task, answers).filter((v) => v.step < step)
  const prev = before[before.length - 1]
  return prev ? taskStepHref(formId, task, prev.step) : formBasePath(formId)
}

/** True when every visible required question in the task has an answer. */
export function isTaskComplete(task: OnboardingTask, answers: TaskAnswers): boolean {
  const visible = visibleQuestions(task, answers)
  return visible.length > 0 && visible.every(({ question }) => question.optional || isQuestionAnswered(question, answers))
}
