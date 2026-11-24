'use client'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { type App } from '@/lib/data'
import { MaturityBadge, SupervisionBadge, ConditionTag } from '@/components/Badges'
import { CompareToggleButton } from '@/components/CompareToggleButton'
import { buildBrowseSearchParams, parseBrowseConditionParam } from '@/lib/catalogueSearch'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { getProductNarrative } from '@/lib/content/productNarratives'
import { catalogueSummary } from '@/lib/pdpSummary'
import { isMarketPreview } from '@/lib/marketPreview'
import {
  activeFilterGroups,
  emptySelection,
  filterApps,
  hasActiveSelection,
  selectedTags,
  withToggledValue,
  type FilterGroup,
  type FilterSelection,
  type SelectedTag,
} from '@/lib/catalogueFilters'

function ProductCard({ app }: { app: App }) {
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
            {app.maturity_level ? <MaturityBadge level={app.maturity_level} hideEstablished /> : null}
            {isMarketPreview(app) && (
              <span className="badge badge-grey">Not available to commission</span>
            )}
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
}

/**
 * Nested facet accordion — mirrors GOV.UK `.app-c-filter-section` (details/summary
 * with a chevron that flips when open).
 */
function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <details
      className="hs-filter-section group"
      open={open}
      onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="hs-filter-section__summary">
        <span className="hs-filter-section__heading">{title}</span>
      </summary>
      <div className="hs-filter-section__content">{children}</div>
    </details>
  )
}

/** One filter group as an NHS radios (single) or checkboxes (multi) fieldset. */
function FilterGroupFieldset({
  group,
  selection,
  onChange,
}: {
  group: FilterGroup
  selection: FilterSelection
  onChange: (group: FilterGroup, value: string) => void
}) {
  const kind = group.type === 'single' ? 'radios' : 'checkboxes'
  const values = selection[group.id] ?? []
  const isChecked = (id: string) =>
    group.type === 'single' ? (values[0] ?? group.defaultValue) === id : values.includes(id)

  return (
    <fieldset className="nhsuk-fieldset">
      <legend className="nhsuk-u-visually-hidden">{group.legend}</legend>
      <div className={`nhsuk-${kind} nhsuk-${kind}--small`}>
        {group.options.map(o => {
          const inputId = `filter-${group.id}-${o.id}`
          return (
            <div key={o.id} className={`nhsuk-${kind}__item`}>
              <input
                id={inputId}
                className={`nhsuk-${kind}__input`}
                name={`filter-${group.id}`}
                type={group.type === 'single' ? 'radio' : 'checkbox'}
                value={o.id}
                checked={isChecked(o.id)}
                onChange={() => onChange(group, o.id)}
              />
              <label className={`nhsuk-${kind}__label`} htmlFor={inputId}>
                {o.label}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

const resultsPhrase = (n: number) => `${n.toLocaleString()} ${n === 1 ? 'result' : 'results'}`

/** "'A'", "'A' and 'B'", "'A', 'B' and 'C'" */
function quotedList(labels: string[]): string {
  const q = labels.map(l => `‘${l}’`)
  return q.length > 1 ? `${q.slice(0, -1).join(', ')} and ${q[q.length - 1]}` : q[0] ?? ''
}

/** Result count line, e.g. "Filters applied: 3 results shown for 'COPD and pulmonary rehab'". */
function resultsSummary(count: number, tags: SelectedTag[]): string {
  if (tags.length === 0) return resultsPhrase(count)
  return `Filters applied: ${resultsPhrase(count)} shown for ${quotedList(tags.map(t => t.label))}`
}

export default function CatalogueClient({ apps }: { apps: App[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterPanelId = useId()

  /** Applied filters drive the result list. */
  const [applied, setApplied] = useState<FilterSelection>(() => emptySelection())
  /**
   * Draft filters are edited inside the panel and applied only when the user
   * clicks Apply, matching GOV.UK's filter-panel submit interaction.
   */
  const [draft, setDraft] = useState<FilterSelection>(() => emptySelection())

  /** Panel starts collapsed on small screens (`aria-expanded=false`), same as GOV.UK. */
  const [filtersOpen, setFiltersOpen] = useState(false)

  /** Text for the polite live region. Empty on first render so nothing is announced on load. */
  const [announcement, setAnnouncement] = useState('')

  const countRef = useRef<HTMLParagraphElement>(null)
  /** Set when the focused control is about to disappear; focus moves to the result count. */
  const focusCountNext = useRef(false)

  const replaceBrowseUrl = useCallback(
    (selection: FilterSelection) => {
      const suffix = buildBrowseSearchParams(selection.condition?.[0] ?? 'all', '')
      router.replace(`/catalogue/digital-therapeutics${suffix}`, { scroll: false })
    },
    [router],
  )

  // Condition is the only group mirrored in the URL (?condition=). Others are client-only.
  useEffect(() => {
    const c = parseBrowseConditionParam(searchParams.get('condition'))
    const values = c === 'all' ? [] : [c]
    setApplied(prev => ({ ...prev, condition: values }))
    setDraft(prev => ({ ...prev, condition: values }))
  }, [searchParams])

  const filtered = useMemo(
    () => filterApps(apps, applied).sort((a, b) => a.app_name.localeCompare(b.app_name)),
    [apps, applied],
  )
  const tags = useMemo(() => selectedTags(applied), [applied])

  // After filters are cleared the "Clear filters" link that had focus is gone,
  // so move focus to the result count rather than losing it to <body>.
  useEffect(() => {
    if (!focusCountNext.current) return
    focusCountNext.current = false
    countRef.current?.focus()
  })

  /** Apply a selection to the results, the URL and the live region. */
  const commit = (next: FilterSelection, cleared = false) => {
    setApplied(next)
    setDraft(next)
    replaceBrowseUrl(next)
    const count = filterApps(apps, next).length
    setAnnouncement(
      cleared ? `Filters cleared: ${resultsPhrase(count)} shown.` : `${resultsSummary(count, selectedTags(next))}.`,
    )
  }

  const openFilters = () => {
    // Sync draft from applied so reopening shows the current selection.
    setDraft(applied)
    setFiltersOpen(true)
  }

  const toggleFilters = () => {
    if (filtersOpen) setFiltersOpen(false)
    else openFilters()
  }

  const applyFilters = (e?: FormEvent) => {
    e?.preventDefault()
    commit(draft)
    setFiltersOpen(false)
  }

  const clearAllFilters = () => {
    commit(emptySelection(), true)
    focusCountNext.current = true
  }

  const onStore = filtered.filter(app => !isMarketPreview(app))
  const notOnStore = filtered.filter(app => isMarketPreview(app))

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
              panel is always open in the sidebar. Groups come from
              lib/catalogueFilters.ts — add or re-enable a group there.
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
                <form onSubmit={applyFilters} aria-label="Filter products">
                  {activeFilterGroups.map((group, i) => (
                    <FilterSection key={group.id} title={group.legend} defaultOpen={i === 0}>
                      <FilterGroupFieldset
                        group={group}
                        selection={draft}
                        onChange={(g, v) => setDraft(prev => withToggledValue(prev, g, v))}
                      />
                    </FilterSection>
                  ))}

                  <div className="hs-filter-panel__actions">
                    <button type="submit" className="nhsuk-button nhsuk-u-margin-bottom-0">
                      Apply filters
                    </button>
                    {hasActiveSelection(draft) && (
                      <button type="button" className="hs-filter-panel__clear" onClick={clearAllFilters}>
                        Clear filters
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="nhsuk-grid-column-two-thirds">
            <p
              className="nhsuk-body-m hs-results-count"
              id={`${filterPanelId}-count`}
              ref={countRef}
              tabIndex={-1}
            >
              <strong>{resultsSummary(filtered.length, tags)}</strong>
            </p>

            {tags.length > 0 && (
              <p className="nhsuk-u-margin-bottom-4">
                <button type="button" className="hs-filter-panel__clear" onClick={clearAllFilters}>
                  Clear filters
                </button>
              </p>
            )}

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {announcement}
            </div>

            {filtered.length === 0 ? (
              // [Provenance: NHS] Inset text for the empty state.
              <div className="nhsuk-inset-text">
                <span className="nhsuk-u-visually-hidden">Information: </span>
                <p className="nhsuk-u-font-weight-bold nhsuk-u-margin-bottom-1">No apps match your filters</p>
                <p className="nhsuk-u-margin-bottom-0">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <>
                {onStore.length > 0 && (
                  <ul className="nhsuk-list">
                    {onStore.map(app => (
                      <ProductCard key={app.id} app={app} />
                    ))}
                  </ul>
                )}
                {notOnStore.length > 0 && (
                  <section aria-labelledby="not-on-store-heading" className="nhsuk-u-margin-top-7">
                    <h2 id="not-on-store-heading" className="nhsuk-heading-l">
                      Not on the Commissioning Store
                    </h2>
                    <ul className="nhsuk-list">
                      {notOnStore.map(app => (
                        <ProductCard key={app.id} app={app} />
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
