import { PeerReviewedEvaluationCard } from '@/components/AppDetailSections'
import { STORE_ACCENT } from '@/lib/storeAccent'

/** "Clinical publications and evaluations" card grid — shared by Assurance and evidence (narrative) and the Evidence tab (non-narrative). */
export default function PdpClinicalPublications({
  publications,
  className = '',
  showHeading = true,
}: {
  publications: any[]
  className?: string
  showHeading?: boolean
}) {
  if (publications.length === 0) return null

  return (
    <div className={className || undefined}>
      {showHeading && (
        <h3 className="nhsuk-heading-s hs-pdp-subheading">
          Clinical publications and evaluations
        </h3>
      )}
      <div className="hs-case-grid" style={{ marginTop: 0 }}>
        {publications.map((s: any, i: number) => (
          <PeerReviewedEvaluationCard key={s.id ?? i} study={s} accent={STORE_ACCENT} />
        ))}
      </div>
    </div>
  )
}
