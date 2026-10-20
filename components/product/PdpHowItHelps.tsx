import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import { PdpSection } from '@/components/PdpSection'
import { pdpSectionTitle } from '@/lib/pdpSections'

/** "How it helps" section — what the product does and how it changes the pathway. */
export default function PdpHowItHelps({ app, narrative }: { app: App; narrative: ProductNarrative }) {
  const bullets = narrative.what_it_does_bullets ?? []
  const pathway = narrative.pathway_model
  if (bullets.length === 0 && !pathway) return null

  return (
    <PdpSection
      id="how-it-helps"
      shareKey="narrative-how-it-helps"
      title={pdpSectionTitle('how-it-helps', { appName: app.app_name })}
    >
      {bullets.length > 0 && (
        <ul className="nhsuk-list nhsuk-list--bullet">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}

      {pathway && (
        <div>
          <h3 className="nhsuk-heading-s hs-pdp-subheading">
            How it changes the pathway
          </h3>
          <div className="hs-pathway-visual">
            <div className="hs-pathway-col hs-pathway-current">
              <h3 className="hs-pathway-heading">Current pathway</h3>
              {pathway.current_steps.map((step, i) => (
                <div key={step.id}>
                  <div className="hs-pathway-step">{step.label}</div>
                  {i < pathway.current_steps.length - 1 && <div className="hs-pathway-arrow">↓</div>}
                </div>
              ))}
            </div>
            <div className="hs-pathway-divider">→</div>
            <div className="hs-pathway-col hs-pathway-future">
              <h3 className="hs-pathway-heading">With {app.app_name}</h3>
              {pathway.future_steps.map((step, i) => (
                <div key={step.id}>
                  <div className={`hs-pathway-step ${step.change === 'added' ? 'hs-pathway-added' : step.change === 'changed' ? 'hs-pathway-changed' : ''}`}>
                    {step.label}
                  </div>
                  {i < pathway.future_steps.length - 1 && <div className="hs-pathway-arrow">↓</div>}
                </div>
              ))}
            </div>
          </div>
          <details className="mt-4">
            <summary className="nhsuk-body-m" style={{ cursor: 'pointer' }}>
              Text-only pathway description
            </summary>
            <div className="nhsuk-body-m nhsuk-u-margin-top-2">
              <p><strong>Current:</strong> {pathway.current_steps.map((s) => s.label).join(' → ')}</p>
              <p className="mt-1"><strong>With {app.app_name}:</strong> {pathway.future_steps.map((s) => `${s.label}${s.change && s.change !== 'unchanged' ? ` [${s.change}]` : ''}`).join(' → ')}</p>
            </div>
          </details>
        </div>
      )}
    </PdpSection>
  )
}
