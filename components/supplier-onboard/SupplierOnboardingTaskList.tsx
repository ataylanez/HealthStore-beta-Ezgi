'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PortalStatusTag } from '@/components/supplier-portal/PortalStatusTag'
import { SECTIONS, checkAnswersPath, taskHref } from '@/lib/supplierOnboarding'
import { useOnboardingProgress } from './useOnboardingProgress'

/**
 * Supplier onboarding task list. [Provenance: NHS]
 *
 * Renders the NHS "Complete multiple tasks" pattern: one numbered
 * `nhsuk-heading-m` per section with a short description, each followed by an
 * official NHS Task list (`.nhsuk-task-list`).
 * https://service-manual.nhs.uk/design-system/patterns/complete-multiple-tasks
 *
 * Statuses:
 *  - Incomplete -> white NHS Tag (same as portal Incomplete status)
 *  - Completed  -> plain black text (`.nhsuk-task-list__status--completed`), no tag,
 *                  so attention stays on tasks that still need action.
 *
 * Footer row: Submit (NHS button, disabled until every task is Completed) and a
 * prototype "Mark all as complete" shortcut on the far right.
 */
export default function SupplierOnboardingTaskList({ formId }: { formId: string }) {
  const router = useRouter()
  const { isComplete, allComplete, markAllComplete } = useOnboardingProgress(formId)

  return (
    <>
      {SECTIONS.map((section, sectionIndex) => (
        <section key={section.id} aria-labelledby={`${section.id}-heading`}>
          <h2 id={`${section.id}-heading`} className="nhsuk-heading-m">
            {sectionIndex + 1}. {section.title}
          </h2>
          <p className="nhsuk-body-m nhsuk-u-secondary-text-color">{section.description}</p>
          <ul className="nhsuk-task-list">
            {section.tasks.map((task, taskIndex) => {
              const statusId = `task-${sectionIndex + 1}-${taskIndex + 1}-status`
              const complete = isComplete(task.id)
              return (
                <li key={task.id} className="nhsuk-task-list__item nhsuk-task-list__item--with-link">
                  <div className="nhsuk-task-list__name-and-hint">
                    <Link
                      className="nhsuk-task-list__link nhsuk-link"
                      href={taskHref(formId, task)}
                      aria-describedby={statusId}
                    >
                      {task.title}
                    </Link>
                  </div>
                  {complete ? (
                    <div className="nhsuk-task-list__status nhsuk-task-list__status--completed" id={statusId}>
                      Completed
                    </div>
                  ) : (
                    <div className="nhsuk-task-list__status" id={statusId}>
                      <PortalStatusTag status="incomplete" />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {/* Submit is enabled only once every task in every section is Completed and
            leads to Check your answers before the final confirmation. */}
        <Button
          type="button"
          disabled={!allComplete}
          title={allComplete ? undefined : 'Complete every task before submitting'}
          onClick={() => router.push(checkAnswersPath(formId))}
        >
          Submit
        </Button>

        {/* Prototype shortcut: marks every task Completed so Submit can be exercised. */}
        <button
          type="button"
          className="nhsuk-link"
          onClick={markAllComplete}
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
        >
          Mark all as complete
        </button>
      </div>
    </>
  )
}
