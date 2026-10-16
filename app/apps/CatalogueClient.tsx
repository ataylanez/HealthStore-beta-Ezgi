'use client'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { getConditionAreas, supervisionLabels, type App } from '@/lib/data'
import { MaturityBadge, SupervisionBadge, ConditionTag } from '@/components/Badges'
import { CompareToggleButton } from '@/components/CompareToggleButton'
import { X } from 'lucide-react'
import { buildBrowseSearchParams, parseBrowseConditionParam } from '@/lib/catalogueSearch'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { getProductNarrative } from '@/lib/content/productNarratives'
import { catalogueSummary } from '@/lib/pdpSummary'

const supervisionOptions = Object.entries(supervisionLabels).map(([id, label]) => ({ id, label }))

const conditionAreas = getConditionAreas()
const conditionOptions = [
  { id: 'all', label: 'All conditions' },
  ...conditionAreas
    .filter(c => c.id !== 'pulmonary_rehab')
    .map(c => ({
      id: c.id,
      label: c.id === 'copd' ? 'COPD and pulmonary rehab' : c.label,
    })),
]
function appMatchesCondition(app: App, conditionId: string): boolean {
  if (conditionId === 'all') return true
  if (conditionId === 'copd') {
    return app.condition_tags.includes('copd') || app.condition_tags.includes('pulmonary_rehab')
  }
  return app.condition_tags.includes(conditionId)
}

/**
 * Nested facet accordion — mirrors GOV.UK `.app-c-filter-section` (details/summary
 * with a chevron that flips when open). Collapsed by default, like the live
 * gov.uk/search/all panel.
 */
function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="hs-filter-section group">
      <summary className="hs-filter-section__summary">
        <span className="hs-filter-section__heading">{title}</span>
      </summary>
      <div className="hs-filter-section__content">{children}</div>
    </details>
  )
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="pill hs-text-caption"
      style={{
        background: '#E6F0FB',
        color: 'var(--nhs-dark)',
        border: '1px solid var(--nhs-dark)',
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-sm p-1 transition-colors hover:bg-[#E6F0FB] hover:opacity-90"
        aria-label={`Remove ${label} filter`}
        style={{ color: 'var(--nhs-dark)' }}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

export default function CatalogueClient({ apps }: { apps: App[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterPanelId = useId()

  /** Applied filters — drive the result list. */
  const [condition, setCondition] = useState('all')
  const [supervision, setSupervision] = useState<string[]>([])

  /**
   * Draft filters — edited inside the panel. Applied only when the user clicks
   * Apply, matching GOV.UK's filter-panel submit interaction.
   */
  const [draftCondition, setDraftCondition] = useState('all')
  const [draftSupervision, setDraftSupervision] = useState<string[]>([])

  /** Panel starts collapsed (`aria-expanded=false`), same as GOV.UK. */
  const [filtersOpen, setFiltersOpen] = useState(false)

  const liveRegion = useRef<HTMLDivElement>(null)

  const replaceBrowseUrl = useCallback(
    (nextCondition: string) => {
      const suffix = buildBrowseSearchParams(nextCondition, '')
      router.replace(`/catalogue/digital-therapeutics${suffix}`, { scroll: false })
    },
    [router],
  )

  useEffect(() => {
    const c = parseBrowseConditionParam(searchParams.get('condition'))
    setCondition(c)
    setDraftCondition(c)
  }, [searchParams])

  const toggleDraftSupervision = (id: string) => {
    setDraftSupervision(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]))
  }

  const openFilters = () => {
    // Sync draft from applied so reopening shows the current selection.
    setDraftCondition(condition)
    setDraftSupervision(supervision)
    setFiltersOpen(true)
  }

  const closeFilters = () => setFiltersOpen(false)

  const toggleFilters = () => {
    if (filtersOpen) closeFilters()
    else openFilters()
  }

  const applyFilters = (e?: FormEvent) => {
    e?.preventDefault()
    setCondition(draftCondition)
    setSupervision(draftSupervision)
    replaceBrowseUrl(draftCondition)
    setFiltersOpen(false)
  }

  const clearAllFilters = () => {
    setSupervision([])
    setDraftSupervision([])
    setCondition('all')
    setDraftCondition('all')
    router.replace('/catalogue/digital-therapeutics', { scroll: false })
  }

  const activeFilters: { label: string; clear: () => void }[] = []
  if (condition !== 'all') {
    activeFilters.push({
      label: conditionOptions.find(o => o.id === condition)!.label,
      clear: () => {
        setCondition('all')
        setDraftCondition('all')
        replaceBrowseUrl('all')
      },
    })
  }
  for (const s of supervision) {
    activeFilters.push({
      label: supervisionLabels[s] ?? s,
      clear: () => {
        const next = supervision.filter(id => id !== s)
        setSupervision(next)
        setDraftSupervision(next)
      },
    })
  }

  const filteredSorted = useMemo(() => {
    return apps
      .filter((app: App) => {
        if (supervision.length > 0 && !supervision.includes(app.supervision_model)) return false
        if (condition !== 'all' && !appMatchesCondition(app, condition)) return false
        return true
      })
      .sort((a, b) => a.app_name.localeCompare(b.app_name))
  }, [apps, supervision, condition])

  const resultCount = filteredSorted.length
  const resultText = `${resultCount.toLocaleString()} ${resultCount === 1 ? 'result' : 'results'}`
  const resultSummary = `Showing ${resultCount} of ${apps.length} apps`

  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb
        items={[
          { label: 'Product catalogue', href: '/catalogue' },
          { label: 'Digital therapeutics' },
        ]}
      />

      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
        <h1 className="nhsuk-heading-xl">Digital therapeutics</h1>

        {/* NHS layout: filters in a one-third column, results in a two-thirds column. */}
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-one-third">
            {/*
              Filter panel. On small screens it collapses behind a "Filter" toggle
              (GOV.UK finder interaction); from tablet the toggle is hidden and the
              panel is always open in the sidebar. Form controls are nhsuk-radios /
              nhsuk-checkboxes; sections use the NHS Details disclosure.
            */}
            <div className="hs-filter-panel">
              <div className="hs-filter-panel__header">
                <button
                  type="button"
                  id={`${filterPanelId}-button`}
                  className="hs-filter-panel__button"
                  aria-expanded={filtersOpen}
                  aria-controls={`${filterPanelId}-content`}
                  onClick={toggleFilters}
                >
                  <span className="hs-filter-panel__button-inner">Filter</span>
                </button>
                <h2 className="nhsuk-heading-s hs-filter-panel__title">Filter</h2>
              </div>

              <div
                id={`${filterPanelId}-content`}
                className={`hs-filter-panel__content${filtersOpen ? ' hs-filter-panel__content--open' : ''}`}
              >
                <form onSubmit={applyFilters}>
                  <FilterSection title="Condition">
                    <fieldset className="nhsuk-fieldset">
                      <legend className="nhsuk-u-visually-hidden">Condition</legend>
                      <div className="nhsuk-radios nhsuk-radios--small">
                        {conditionOptions.map(o => (
                          <div key={o.id} className="nhsuk-radios__item">
                            <input
                              id={`filter-condition-${o.id}`}
                              className="nhsuk-radios__input"
                              name="filter-condition"
                              type="radio"
                              checked={draftCondition === o.id}
                              onChange={() => setDraftCondition(o.id)}
                            />
                            <label className="nhsuk-radios__label" htmlFor={`filter-condition-${o.id}`}>
                              {o.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </FilterSection>

                  <FilterSection title="Supervision model">
                    <fieldset className="nhsuk-fieldset">
                      <legend className="nhsuk-u-visually-hidden">Supervision model</legend>
                      <div className="nhsuk-checkboxes nhsuk-checkboxes--small">
                        {supervisionOptions.map(o => (
                          <div key={o.id} className="nhsuk-checkboxes__item">
                            <input
                              id={`filter-supervision-${o.id}`}
                              className="nhsuk-checkboxes__input"
                              type="checkbox"
                              checked={draftSupervision.includes(o.id)}
                              onChange={() => toggleDraftSupervision(o.id)}
                            />
                            <label className="nhsuk-checkboxes__label" htmlFor={`filter-supervision-${o.id}`}>
                              {o.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </FilterSection>

                  <div className="hs-filter-panel__actions">
                    <button type="submit" className="nhsuk-button nhsuk-u-margin-bottom-0">
                      Apply filters
                    </button>
                    {(draftCondition !== 'all' || draftSupervision.length > 0) && (
                      <button
                        type="button"
                        className="hs-filter-panel__clear"
                        onClick={clearAllFilters}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="nhsuk-grid-column-two-thirds">
            <p className="nhsuk-body-m" id={`${filterPanelId}-count`}>
              <strong>{resultText}</strong>
            </p>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 nhsuk-u-margin-bottom-4">
                {activeFilters.map((f, i) => (
                  <FilterPill key={`${i}-${f.label}`} label={f.label} onRemove={f.clear} />
                ))}
              </div>
            )}

            <div ref={liveRegion} aria-live="polite" aria-atomic="true" className="sr-only">
              {resultSummary}
            </div>

            {filteredSorted.length === 0 ? (
              // [Provenance: NHS] Inset text for the empty state.
              <div className="nhsuk-inset-text">
                <span className="nhsuk-u-visually-hidden">Information: </span>
                <p className="nhsuk-u-font-weight-bold nhsuk-u-margin-bottom-1">No apps match your filters</p>
                <p className="nhsuk-u-margin-bottom-0">Try adjusting your filter criteria</p>
              </div>
            ) : (
              // [Provenance: NHS] One NHS card per result, stacked in the two-thirds column.
              <ul className="nhsuk-list">
                {filteredSorted.map((app: App) => {
                  const narrative = getProductNarrative(app.slug)
                  const cardDescription = catalogueSummary(app, narrative)
                  return (
                    <li key={app.id}>
                      <article className="nhsuk-card" aria-labelledby={`app-card-${app.id}`}>
                        <div className="nhsuk-card__content">
                          <div className="flex items-start gap-3">
                            {app.logo_path && (
                              <Image src={app.logo_path} alt="" width={40} height={40} className="flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 id={`app-card-${app.id}`} className="nhsuk-card__heading nhsuk-heading-m nhsuk-u-margin-bottom-1">
                                <Link className="nhsuk-card__link" href={`/apps/${app.slug}`}>{app.app_name}</Link>
                              </h3>
                              <p className="nhsuk-body-s" style={{ color: 'var(--text-secondary)' }}>{app.supplier_name}</p>
                            </div>
                            {app.nhse_125k_eligible && app.slug !== 'clinitouch' && (
                              <span className="badge badge-green" style={{ flexShrink: 0 }}>
                                ★ NHSE £125k
                              </span>
                            )}
                          </div>

                          <p className="nhsuk-card__description nhsuk-body-m" style={{ color: 'var(--text-secondary)' }}>
                            {cardDescription}
                          </p>

                          <div className="flex flex-wrap gap-1 nhsuk-u-margin-bottom-4">
                            {app.condition_tags.map((t: string) => (
                              <ConditionTag key={t} tag={t} />
                            ))}
                            <SupervisionBadge model={app.supervision_model} />
                            <MaturityBadge level={app.maturity_level} hideEstablished />
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Link
                              href={`/apps/${app.slug}`}
                              className="nhsuk-button nhsuk-u-margin-bottom-0 inline-flex items-center justify-center gap-2 align-top no-underline max-sm:w-full"
                            >
                              View product details
                            </Link>
                            <CompareToggleButton appId={app.id} solid />
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )

}
