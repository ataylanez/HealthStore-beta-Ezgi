/**
 * Representative sample answers for the supplier onboarding prototype.
 *
 * Used by the "Mark all as complete" shortcut so that Check your answers shows
 * realistic content rather than "Not provided". Written for a fictional
 * supplier ("Aurora Health") and product ("Respira CBT"); nothing here is real.
 *
 * The choices deliberately take the fuller routes through the questionnaire
 * (medical device, direct care, data outside the UK, Charter not signed, APIs
 * exposed, data shared with care systems, no NHS login, WCAG plan in place) so
 * that every conditional follow-up page gets exercised.
 *
 * Any question without an entry gets a type-appropriate fallback from
 * `sampleAnswerFor`. Existing real answers are never overwritten.
 */
import {
  ALL_TASKS,
  CHECKBOX_SEPARATOR,
  CONFIRMED_VALUE,
  MULTI_UPLOAD_CONFIRMED_SUFFIX,
  UPLOAD_REFERENCE_SUFFIX,
  fieldKey,
  isQuestionAnswered,
  isQuestionVisible,
  serializeUploadedDocuments,
  type OnboardingQuestion,
  type OnboardingTask,
  type TaskAnswers,
  type UploadedDocument,
} from './supplierOnboarding'

const SUPPLIER = 'Aurora Health'
const SUBMISSION_DATE = '2026-09-22'

const TEXT: Record<string, string> = {
  // Product details
  'a2-product-name': 'Respira CBT',
  'a3-product-version': '3.2.0',
  // Section B
  'b2-description':
    'Respira CBT is a clinician-supported digital cognitive behavioural therapy programme for adults with generalised anxiety disorder. It delivers 8 structured modules over 12 weeks with weekly asynchronous therapist review. Patients are referred by NHS Talking Therapies services and use the app on their own device between sessions.',
  'b3-users-benefits':
    'Intended users: adults (18+) referred to NHS Talking Therapies with mild to moderate anxiety, and the psychological wellbeing practitioners who supervise them. Benefits: 61% reliable recovery vs 44% treatment as usual in a UK randomised controlled trial (n=412, Lancet Digital Health 2025;7:e112), and time-to-first-treatment reduced from 9.4 to 2.1 weeks in pilot services. Benefits were validated through the RCT and a service evaluation across 3 NHS services (n=1,870).',
  // C1
  'c1-2-3-crm-system-details':
    'Clinical risk management is run under our Clinical Risk Management System (CRMS-02, v4.1) which follows DCB 0129. Hazards are identified at design review, logged in the Hazard Log with initial and residual risk ratings, and reviewed monthly by the Clinical Safety Officer. Release gates require CSO sign-off of the Safety Case Report for each product version.',
  'c1-2-5-cso':
    'Dr Hannah Okafor, Clinical Psychologist, HCPC registration PYL04471. Trained in DCB 0129/0160 (NHS Digital Clinical Safety Officer course, 2023).',
  // C2
  'c2-2-6-outside-uk':
    'Anonymised analytics events are processed in the Republic of Ireland (AWS eu-west-1) by our analytics sub-processor. No identifiable patient data leaves the UK. Transfers rely on the UK adequacy regulations for the EEA, with an International Data Transfer Addendum in place as a fallback.',
  // C4
  'c4-1-1-standards':
    'Our APIs use HL7 FHIR R4 (UK Core profiles) for referrals and outcome measures, and OAuth 2.0 / OpenID Connect for authorisation. FHIR was chosen so that NHS Talking Therapies systems can consume outcome data (PHQ-9, GAD-7) as coded observations without bespoke mapping.',
  'c4-1-3-documentation':
    'API documentation is published as an OpenAPI 3.1 specification on our developer portal, available to integration partners on request. We plan to make it openly available once the authentication onboarding guide is complete (expected Q1 2027).',
  'c4-2-3-identification':
    'Referrals arrive with the NHS number from the referring system. Where PDS validation is not yet available, the NHS number is checked against the modulus 11 algorithm and matched to the referral record using name, date of birth and postcode. Unmatched records are held for manual review by the service.',
  'c4-2-6-authentication':
    'Patients authenticate with email and password plus a one-time code (SMS or authenticator app). Passwords are hashed with Argon2id, sessions expire after 30 minutes of inactivity, and all traffic is TLS 1.2+. Integration of NHS login is on the roadmap for 2027.',
  // Section D
  'd1-4-2-timescale': 'March 2027',
  'd1-4-3-accessibility-statement': 'https://www.aurora-health.example/respira/accessibility',
  'c2-2-3-privacy-notice-link': 'https://www.aurora-health.example/respira/privacy',
  'd1-5-availability': '99.96%',
}

const UPLOADS: Record<string, { name: string; reference: string }> = {
  'b4-data-flow-upload': {
    name: 'Aurora-Health-B4-Data-Flow-User-Journey.pdf',
    reference: `${SUPPLIER} — B4 Data flow and user journey map — ${SUBMISSION_DATE}`,
  },
  'c1-1-1-paq-upload': {
    name: 'Aurora-Health-C1.1.1-PAQ-Form.pdf',
    reference: `${SUPPLIER} — C1.1.1 Pre-acquisition questionnaire — ${SUBMISSION_DATE}`,
  },
  'c1-2-4-safety-case-report-upload': {
    name: 'Aurora-Health-C1.2.4-Clinical-Safety-Case-Report.pdf',
    reference: `${SUPPLIER} — C1.2.4 Clinical Safety Case Report — ${SUBMISSION_DATE}`,
  },
  'c1-2-4-hazard-log-upload': {
    name: 'Aurora-Health-C1.2.4-Hazard-Log.xlsx',
    reference: `${SUPPLIER} — C1.2.4 Hazard Log — ${SUBMISSION_DATE}`,
  },
  'c2-2-1-ico-upload': {
    name: 'Aurora-Health-C2.2.1-ICO-Registration.pdf',
    reference: `${SUPPLIER} — C2.2.1 ICO registration certificate — ${SUBMISSION_DATE}`,
  },
  'c2-2-2-dpia-upload': {
    name: 'Aurora-Health-C2.2.2-DPIA.pdf',
    reference: `${SUPPLIER} — C2.2.2 DPIA — ${SUBMISSION_DATE}`,
  },
  'c2-2-4-terms-upload': {
    name: 'Aurora-Health-C2.2.4-Terms-and-EULA.pdf',
    reference: `${SUPPLIER} — C2.2.4 Terms and conditions and EULA — ${SUBMISSION_DATE}`,
  },
  'c3-1-cyber-essentials-upload': {
    name: 'Aurora-Health-C3.1-Cyber-Essentials-Plus.pdf',
    reference: `${SUPPLIER} — C3.1 Cyber Essentials Plus certificate — ${SUBMISSION_DATE}`,
  },
  'c3-3-pen-test-upload': {
    name: 'Aurora-Health-C3.3-Pen-Test-Summary.pdf',
    reference: `${SUPPLIER} — C3.3 External penetration test summary — ${SUBMISSION_DATE}`,
  },
  'd1-1-pathways-upload': {
    name: 'Aurora-Health-D1.1-Pathway-and-Instructions-for-Use.pdf',
    reference: `${SUPPLIER} — D1.1 Care pathway and instructions for use — ${SUBMISSION_DATE}`,
  },
}

/** Fallback for any multi-upload question (none in the current questionnaire). */
const GENERIC_DOCUMENTS: Array<Pick<UploadedDocument, 'name' | 'reference' | 'size'>> = [
  { name: 'Aurora-Health-Supporting-Evidence.pdf', reference: `${SUPPLIER} — Supporting evidence — ${SUBMISSION_DATE}`, size: 1_284_000 },
]

const CHOICES: Record<string, string> = {
  // Product details
  'a4-product-type': 'standalone-application',
  // Section B
  'b1-intended-use': 'patient-care-support',
  'b4-data-flow': 'provided',
  // C1
  'c1-1-1-samd': 'yes',
  'c1-1-2-standalone': 'yes',
  'c1-2-direct-care': 'yes',
  'c1-2-2-crm-activities': 'yes',
  'c1-2-3-crm-system': 'provided',
  'c1-2-4-safety-case': 'provided',
  // C2
  'c2-1-dspt': 'confirmed',
  'c2-2-personal-data': 'yes',
  'c2-2-1-ico': 'provided',
  'c2-2-2-dpia': 'provided',
  'c2-2-3-privacy-notice': 'provided',
  'c2-2-4-terms': 'provided',
  'c2-2-5-data-location': 'outside-uk',
  // C3
  'c3-1-cyber-essentials': 'provided',
  'c3-2-charter': 'no',
  'c3-3-pen-test': 'provided',
  'c3-4-code-of-practice': 'confirmed',
  'c3-5-mfa-plan': 'yes',
  'c3-5-1-privileged-mfa': 'yes',
  'c3-6-logging': 'yes',
  // C4
  'c4-1-apis': 'yes',
  'c4-1-2-open-api': 'cannot-confirm',
  'c4-2-data-sharing': 'yes',
  'c4-2-1-nhs-number': 'yes',
  'c4-2-2-pds': 'no',
  'c4-2-4-nhs-login': 'no',
  'c4-2-5-dapb3051': 'not-applicable',
  // Section D
  'd1-1-pathways': 'provided',
  'd1-2-user-testing': 'yes',
  'd1-3-ais': 'confirm',
  'd1-4-platforms': ['ios', 'android', 'web'].join(CHECKBOX_SEPARATOR),
  'd1-4-1-wcag': 'no-plan-in-place',
}

/** Sample answer(s) for one question — the keys a question writes, filled. */
export function sampleAnswerFor(question: OnboardingQuestion): TaskAnswers {
  switch (question.type) {
    case 'radios':
      return { [question.id]: CHOICES[question.id] ?? question.options.find((o) => !o.hidden)?.value ?? '' }
    case 'checkboxes':
      return { [question.id]: CHOICES[question.id] ?? question.options.find((o) => !o.hidden)?.value ?? '' }
    case 'date':
      return { [question.id]: CHOICES[question.id] ?? SUBMISSION_DATE }
    case 'textarea':
      return { [question.id]: TEXT[question.id] ?? `Sample response for "${question.label}" (prototype).` }
    case 'text':
      return {
        [question.id]:
          TEXT[question.id] ?? (question.inputType === 'url' ? 'https://www.aurora-health.example/respira' : 'Sample response (prototype)'),
      }
    case 'fields':
      return Object.fromEntries(
        question.fields.map((f) => [fieldKey(question.id, f), TEXT[fieldKey(question.id, f)] ?? `Sample ${f.label.toLowerCase()}`]),
      )
    case 'upload': {
      const u = UPLOADS[question.id] ?? {
        name: `${question.id}.pdf`,
        reference: `${SUPPLIER} — ${question.code ?? question.label} — ${SUBMISSION_DATE}`,
      }
      if (question.noReference) return { [question.id]: u.name }
      return { [question.id]: u.name, [`${question.id}${UPLOAD_REFERENCE_SUFFIX}`]: u.reference }
    }
    case 'multi-upload': {
      const uploadedAt = new Date().toISOString()
      const docs: UploadedDocument[] = GENERIC_DOCUMENTS.map((d) => ({ ...d, uploadedAt }))
      return {
        [question.id]: serializeUploadedDocuments(docs),
        [`${question.id}${MULTI_UPLOAD_CONFIRMED_SUFFIX}`]: CONFIRMED_VALUE,
      }
    }
  }
}

/**
 * Answers for a task with every unanswered question on the route filled from
 * the samples. Questions are filled in page order, so each follow-up is only
 * filled when the answers so far (real or sample) put it on the route.
 * Questions the supplier has already answered are left exactly as they are.
 */
export function fillTaskWithSamples(task: OnboardingTask, existing: TaskAnswers): TaskAnswers {
  let filled = { ...existing }
  for (const q of task.questions) {
    if (!isQuestionVisible(q, task, filled)) continue
    if (!isQuestionAnswered(q, filled)) filled = { ...filled, ...sampleAnswerFor(q) }
  }
  return filled
}

/** taskId -> filled answers, for every task in the journey. */
export function fillAllWithSamples(existing: Record<string, TaskAnswers>): Record<string, TaskAnswers> {
  return Object.fromEntries(ALL_TASKS.map((t) => [t.id, fillTaskWithSamples(t, existing[t.id] ?? {})]))
}
