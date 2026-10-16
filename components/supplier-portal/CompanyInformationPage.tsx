'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatAnswer } from '@/components/supplier-onboard/CheckAnswersPage'
import {
  COMPANY_SAMPLE_ANSWERS,
  COMPANY_SECTIONS,
  COMPANY_TASK,
  COMPANY_TITLE,
  companyCheckAnswersHref,
  companyQuestionChanged,
  companyQuestionHref,
  companySectionChanged,
  companySectionFirstStep,
  companySectionResumeStep,
  companySectionSubmitted,
  companySectionSummaryRows,
  type CompanySection,
} from '@/lib/supplierCompany'
import { SAMPLE_SUPPLIER } from '@/lib/supplierPortal'
import type { TaskAnswers } from '@/lib/supplierOnboarding'
import { PortalBreadcrumb } from './PortalBreadcrumb'
import { PortalStatusTag } from './PortalStatusTag'
import { ReviewStatusSummary } from './ReviewStatusSummary'
import { companyStatus } from './portalStatus'
import { useSupplierPortal } from './useSupplierPortal'

const LINK_BUTTON_STYLE = {
  background: 'none',
  border: 0,
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
  font: 'inherit',
} as const

/**
 * Company information. [Provenance: NHS Complete multiple tasks / Summary list]
 *
 * Three chapters (Company details, Relationship manager, Care Quality
 * Commission), each submitted on its own. On this page a chapter is:
 *  - still to submit: a row in an NHS Task list (Incomplete). Opening it runs
 *    through its questions one per page, then the chapter's Check your answers
 *    and Confirm and submit. https://service-manual.nhs.uk/design-system/patterns/complete-multiple-tasks
 *  - submitted: a read-only NHS Summary list under the chapter title, with one
 *    Change text link next to the title that walks through the chapter's
 *    questions again and back through Check your answers.
 * There is no page-level Submit. Once every chapter is submitted the status and
 * last-updated date are shown on top.
 */
export default function CompanyInformationPage() {
  const router = useRouter()
  const { hydrated, company, saveCompanyDraft, discardCompanyDraft } = useSupplierPortal()

  const values = company.values ?? {}
  const draft = company.draft ?? {}
  const merged = { ...values, ...draft }
  const status = companyStatus(company)
  const hasDraft = Object.keys(draft).length > 0
  const companyName = merged['a1-company-name']?.trim() || SAMPLE_SUPPLIER.name

  const outstanding = COMPANY_SECTIONS.filter((s) => !companySectionSubmitted(s.id, values))
  const submitted = COMPANY_SECTIONS.filter((s) => companySectionSubmitted(s.id, values))

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb items={[{ label: COMPANY_TITLE }]} />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="hs-section">
            <span className="nhsuk-caption-l">{companyName}</span>
            <h1 className="nhsuk-heading-xl">{COMPANY_TITLE}</h1>
            <p className="nhsuk-body-l hs-measure">
              {outstanding.length === 0
                ? 'The company and key contact details we hold for your organisation.'
                : 'Tell us about your company and the key contact for your organisation. Complete and submit each section below in any order. We use this to verify your organisation and to contact you about your products.'}
            </p>
          </div>

          {!hydrated ? null : (
            <>
              {outstanding.length === 0 && (
                <ReviewStatusSummary
                  status={status}
                  lastUpdated={company.lastUpdated}
                  draftMessage="You have changes that have not been submitted. They are marked below. Submit them from the section's Check your answers, or discard them."
                  onSimulateApproval={() => undefined}
                />
              )}

              {outstanding.length > 0 && (
                <OutstandingSections
                  sections={outstanding}
                  answers={merged}
                  showHeading={submitted.length > 0}
                  hasDraft={hasDraft}
                  onFillSamples={() => saveCompanyDraft(COMPANY_SAMPLE_ANSWERS)}
                  onClear={() => discardCompanyDraft()}
                />
              )}

              {submitted.map((section) => (
                <SubmittedSection
                  key={section.id}
                  section={section}
                  values={values}
                  draft={draft}
                  onChange={() => router.push(companyQuestionHref(companySectionFirstStep(section.id, merged)))}
                  onDiscard={() => discardCompanyDraft(section.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Task list of the chapters still to submit. A row opens the first unanswered
 * question in the chapter, or its Check your answers once every question has
 * an answer.
 */
function OutstandingSections({
  sections,
  answers,
  showHeading,
  hasDraft,
  onFillSamples,
  onClear,
}: {
  sections: CompanySection[]
  answers: TaskAnswers
  showHeading: boolean
  hasDraft: boolean
  onFillSamples: () => void
  onClear: () => void
}) {
  return (
    <section aria-labelledby={showHeading ? 'company-outstanding-heading' : undefined} className="nhsuk-u-margin-bottom-7">
      {showHeading && (
        <h2 id="company-outstanding-heading" className="nhsuk-heading-m">
          Still to complete
        </h2>
      )}
      <ul className="nhsuk-task-list">
        {sections.map((section, index) => {
          const statusId = `company-task-${index + 1}-status`
          const hintId = `company-task-${index + 1}-hint`
          const resume = companySectionResumeStep(section.id, answers)
          const href = resume ? companyQuestionHref(resume) : companyCheckAnswersHref(section.id)
          return (
            <li key={section.id} className="nhsuk-task-list__item nhsuk-task-list__item--with-link">
              <div className="nhsuk-task-list__name-and-hint">
                <Link className="nhsuk-task-list__link nhsuk-link" href={href} aria-describedby={`${hintId} ${statusId}`}>
                  {section.title}
                </Link>
                <div id={hintId} className="nhsuk-task-list__hint">
                  {section.description}
                </div>
              </div>
              <div className="nhsuk-task-list__status" id={statusId}>
                <PortalStatusTag status="incomplete" />
              </div>
            </li>
          )
        })}
      </ul>

      {/* Prototype shortcuts, same treatment as "Mark all as complete" on the onboarding form. */}
      <p className="nhsuk-body-s nhsuk-u-margin-top-4 nhsuk-u-margin-bottom-0">
        <button type="button" className="nhsuk-link" onClick={onFillSamples} style={LINK_BUTTON_STYLE}>
          Fill with sample answers
        </button>
        {hasDraft && (
          <>
            {' · '}
            <button type="button" className="nhsuk-link" onClick={onClear} style={LINK_BUTTON_STYLE}>
              Clear unsubmitted answers
            </button>
          </>
        )}
      </p>
    </section>
  )
}

/**
 * A submitted chapter: title with one Change link, then its answers as a
 * read-only Summary list. Saved edits that have not been submitted yet are
 * shown in place, marked "Not yet submitted", with links to review or discard.
 */
function SubmittedSection({
  section,
  values,
  draft,
  onChange,
  onDiscard,
}: {
  section: CompanySection
  values: TaskAnswers
  draft: TaskAnswers
  onChange: () => void
  onDiscard: () => void
}) {
  const merged = { ...values, ...draft }
  const rows = companySectionSummaryRows(section.id, merged)
  const changed = companySectionChanged(section.id, draft, values)
  const questionById = (id: string) => COMPANY_TASK.questions.find((q) => q.id === id)
  /** Check your answers when the edited chapter is complete, otherwise the first gap. */
  const resume = companySectionResumeStep(section.id, merged)
  const reviewHref = resume ? companyQuestionHref(resume) : companyCheckAnswersHref(section.id)
  const headingId = `company-${section.id}-heading`

  return (
    <section aria-labelledby={headingId} className="nhsuk-u-margin-bottom-7">
      <div className="flex flex-wrap items-baseline justify-between gap-4 nhsuk-u-margin-bottom-3">
        <h2 id={headingId} className="nhsuk-heading-m nhsuk-u-margin-bottom-0">
          {section.title}
        </h2>
        {/* Text link button, same style as the Change links on a summary list. */}
        <button type="button" className="hs-link-button nhsuk-body-m nhsuk-u-margin-bottom-0" onClick={onChange}>
          Change<span className="nhsuk-u-visually-hidden"> {section.title.toLowerCase()}</span>
        </button>
      </div>

      {changed && (
        <p className="nhsuk-body-s nhsuk-u-secondary-text-color">
          Changes to this section have not been submitted.{' '}
          <Link className="nhsuk-link" href={reviewHref}>
            Review and submit
          </Link>
          {' · '}
          <button type="button" className="nhsuk-link" onClick={onDiscard} style={LINK_BUTTON_STYLE}>
            Discard changes
          </button>
        </p>
      )}

      <dl className="nhsuk-summary-list">
        {rows.map((row) => {
          const rowChanged = row.questionIds.some((id) => {
            const q = questionById(id)
            return q ? companyQuestionChanged(q, draft, values) : false
          })
          return (
            <div key={row.id} className="nhsuk-summary-list__row nhsuk-summary-list__row--no-actions" id={`company-${section.id}-${row.id}`}>
              <dt className="nhsuk-summary-list__key">
                {row.kind === 'question' ? (row.question.summaryLabel ?? row.question.label) : row.label}
              </dt>
              <dd className="nhsuk-summary-list__value">
                {row.kind === 'question' ? (
                  formatAnswer(row.question, merged)
                ) : row.lines.length === 0 ? (
                  <span className="nhsuk-u-secondary-text-color">Not provided</span>
                ) : (
                  row.lines.map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))
                )}
                {rowChanged && (
                  <>
                    <br />
                    <span className="nhsuk-u-secondary-text-color nhsuk-body-s">Not yet submitted</span>
                  </>
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
