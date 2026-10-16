import { PdpSection } from '@/components/PdpSection'
import { DeploymentRegisterTable } from '@/components/DeploymentRegisterTable'
import { CaseStudyCards } from '@/components/AppDetailSections'
import { getDeploymentRegister } from '@/lib/deploymentRegister'
import { splitPdpEvidence } from '@/lib/pdpEvidence'

/**
 * "NHS experience" — curated spine section that surfaces real-world NHS use.
 *
 * Ports the matt_demo `#nhs-experience` idea onto the hybrid PDP, combining the
 * "where it's live" deployment register with case studies into one prominent
 * block. Reuses the richer DeploymentRegisterTable rather than matt_demo's
 * top-4 card summary. Rendered on its own page at /apps/[slug]/nhs-experience.
 *
 * Real-world programme write-ups from `clinical_evidence_detailed` are folded in
 * as additional case-study cards (Assurance-and-evidence migration); entries
 * flagged `superseded_by_case_study` are skipped because a richer curated case
 * study covers the same deployment. Peer-reviewed publications live in the
 * "Assurance and evidence" section.
 *
 * Server component — no client boundary.
 */

/** Map a real_world evidence record onto the case-study card shape. */
function evidenceToCaseStudy(s: any) {
  const caveats = [s.study_limitation, s.data_quality_note].filter(Boolean)
  return {
    title: s.ref,
    type_label: s.type_label ?? undefined,
    setting: s.setting,
    sample_size: s.n ?? undefined,
    outcome: s.key_results,
    caveat: caveats.length > 0 ? caveats.join(' ') : undefined,
    source: s.source_label ?? undefined,
  }
}

export default function PdpNhsExperience({ app }: { app: any }) {
  const rows = getDeploymentRegister(app)
  const curatedCases = Array.isArray(app.case_studies) ? app.case_studies : []
  const { experienceEvals } = splitPdpEvidence(app, {
    showNarrativeSpine: true,
    hasNhsExperience: true,
  })
  const caseStudies = [...curatedCases, ...experienceEvals.map(evidenceToCaseStudy)]
  const hasRegister = rows.length > 0
  const hasCases = caseStudies.length > 0

  if (!hasRegister && !hasCases) return null

  return (
    <PdpSection
      id="nhs-experience"
      shareKey="narrative-nhs-experience"
      title="NHS experience"
      description="Where this product is deployed across the NHS today, plus named case studies and evaluations."
    >
      {hasRegister && (
        <div className={hasCases ? 'mb-8' : ''}>
          <DeploymentRegisterTable rows={rows} />
        </div>
      )}

      {hasCases && (
        <div>
          <h3 className="hs-font-bold mb-1" style={{ fontSize: 'var(--text-card-title-sm)', color: 'var(--text-secondary)' }}>
            Case studies and evaluations
          </h3>
          <p className="hs-text-caption mb-0 p-2 rounded" style={{ background: '#E6F0FB', color: '#003087', lineHeight: 1.5 }}>
            <strong>Commissioner note:</strong>{' '}
            Case studies and service evaluations are illustrative local reports and may not meet the same
            standard as peer-reviewed trials. See the formal record in the{' '}
            <a href={`/apps/${app.slug}/assurance`} className="hs-font-bold underline" style={{ color: '#003087' }}>Assurance and evidence</a> page.
          </p>
          <CaseStudyCards caseStudies={caseStudies} />
        </div>
      )}
    </PdpSection>
  )
}
