'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { ClickableChevronCard } from '@/components/ui/ClickableChevronCard'

type ConditionArea = { id: string; label: string; colour: string; count: number; icon: string }

type CatalogueApp = { condition_tags?: string[] }

/** COPD and pulmonary rehab share one catalogue card (same as home storytelling). */
const COPD_PATHWAY_IDS = new Set(['copd', 'pulmonary_rehab'])

function mergeCopdAndPulmonaryRehab(
  areas: ConditionArea[],
  apps: CatalogueApp[] | undefined,
): ConditionArea[] {
  const withoutPr = areas.filter(c => c.id !== 'pulmonary_rehab')
  const unionCount = Array.isArray(apps)
    ? apps.filter(
        a => Array.isArray(a.condition_tags) && a.condition_tags.some(t => COPD_PATHWAY_IDS.has(t)),
      ).length
    : undefined

  return withoutPr.map(c => {
    if (c.id !== 'copd') return c
    return {
      ...c,
      label: 'COPD and pulmonary rehab',
      count: unionCount ?? c.count,
    }
  })
}

export default function AppsDiscoveryClient({
  conditionAreas,
  totalAppCount,
  apps,
}: {
  conditionAreas: ConditionArea[]
  /** Used to compute the combined COPD / pulmonary rehab card count. */
  apps?: CatalogueApp[]
  totalAppCount: number
}) {
  const mergedAreas = useMemo(
    () => mergeCopdAndPulmonaryRehab(conditionAreas, apps),
    [conditionAreas, apps],
  )
  const availableConditions = useMemo(
    () => mergedAreas.filter(c => c.count > 0),
    [mergedAreas],
  )
  const roadmapConditions = useMemo(
    () => mergedAreas.filter(c => c.count === 0),
    [mergedAreas],
  )

  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb items={[{ label: 'Product catalogue' }]} />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h1 className="nhsuk-heading-xl">Product catalogue</h1>
            <p className="nhsuk-lede-text">Browse digital therapeutics by pathway and condition.</p>
          </div>
        </div>

        <section aria-labelledby="digital-therapeutics-heading" className="nhsuk-u-margin-bottom-7">
          <h2 id="digital-therapeutics-heading" className="nhsuk-heading-l">
            Care pathways
          </h2>
          {/* [Provenance: NHS] Card group of clickable chevron cards, one-third columns. */}
          <ul className="nhsuk-grid-row nhsuk-card-group">
            {availableConditions.map(c => (
              <li key={c.id} className="nhsuk-grid-column-one-third nhsuk-card-group__item">
                <ClickableChevronCard
                  variant="primary"
                  href={`/catalogue/digital-therapeutics?condition=${encodeURIComponent(c.id)}`}
                  title={c.label}
                  description={`${c.count} ${c.count === 1 ? 'product' : 'products'}`}
                  headingLevel={3}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
          <p className="nhsuk-body-m">
            <Link href="/catalogue/digital-therapeutics">See all products in the catalogue</Link>
            <span className="hs-text-label" style={{ color: 'var(--text-secondary)' }}>
              {' '}
              · {totalAppCount} {totalAppCount === 1 ? 'product' : 'products'}
            </span>
          </p>
        </section>

        {roadmapConditions.length > 0 ? (
          <section aria-labelledby="coming-soon-heading">
            <div className="nhsuk-grid-row">
              <div className="nhsuk-grid-column-two-thirds">
                <h2 id="coming-soon-heading" className="nhsuk-heading-m">
                  Pathways and conditions coming to the NHS HealthStore soon
                </h2>
                <p className="nhsuk-body-m">
                  The NHS HealthStore is growing. Additional pathways are on our roadmap and will be available as evidence and supplier readiness are confirmed.
                </p>
              </div>
            </div>
            {/* [Provenance: NHS] Non-clickable cards in a card group. */}
            <ul className="nhsuk-grid-row nhsuk-card-group">
              {roadmapConditions.map(c => (
                <li key={c.id} className="nhsuk-grid-column-one-third nhsuk-card-group__item">
                  <div className="nhsuk-card nhsuk-card--secondary">
                    <div className="nhsuk-card__content nhsuk-card__content--secondary">
                      <h3 className="nhsuk-card__heading nhsuk-heading-s">{c.label}</h3>
                      <p className="nhsuk-card__description nhsuk-body-s">Coming soon</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}
