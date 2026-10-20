import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import { PdpSection } from '@/components/PdpSection'
import { pdpSectionTitle } from '@/lib/pdpSections'

/** "The problem" section — the pathway problem the product addresses and why it is relevant. */
export default function PdpProblem({ app, narrative }: { app: App; narrative: ProductNarrative }) {
  const problem = narrative.decision_summary?.pathway_problem
  if (!problem) return null

  return (
    <PdpSection
      id="the-problem"
      shareKey="narrative-problem"
      title={pdpSectionTitle('the-problem', { appName: app.app_name })}
    >
      <p className="nhsuk-body-m">{problem}</p>
      {narrative.decision_summary?.why_relevant && (
        <p className="nhsuk-body-m">{narrative.decision_summary.why_relevant}</p>
      )}
    </PdpSection>
  )
}
