'use client'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { App } from '@/lib/data'
import { useCompareBasket } from '@/components/CompareBasketProvider'
import {
  formatConditionLabels,
  sharedConditionTags,
} from '@/lib/compareConditions'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import CompareNarrativeTables from '@/components/compare/CompareNarrativeTables'

type Props = { allApps: App[] }

export default function CompareClient({ allApps }: Props) {
  const searchParams = useSearchParams()
  const { ids: selectedIds, remove, clear, setFromUrlIds } = useCompareBasket()

  const idsParam = searchParams?.get('ids') ?? ''
  useEffect(() => {
    if (!idsParam) return
    const urlIds = idsParam.split(',').map((s) => s.trim()).filter(Boolean)
    if (urlIds.length > 0) setFromUrlIds(urlIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam])

  const selected = selectedIds.map((id) => allApps.find((a) => a.id === id)).filter(Boolean) as App[]

  const sharedTags = useMemo(() => sharedConditionTags(selected), [selected])

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PageBreadcrumb items={[{ label: 'Comparison tool' }]} />

      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
        <h1 className="nhsuk-heading-xl">Comparison tool</h1>
        <p className="nhsuk-body-l">
          Select up to four digital therapeutics from the same condition area in the catalogue, then choose ‘add to compare’. The NHS HealthStore compares your selection side by side — what each product is, the evidence behind it, assurance, what it takes to work locally, NHS experience, and cost.
        </p>
        </div>
      </div>

      <div className="hs-compare-toolbar flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-6">
        <h2 className="nhsuk-heading-xs nhsuk-u-margin-bottom-0 nhsuk-u-margin-top-0">
          Compared condition{sharedTags.length > 1 ? 's' : ''}:{' '}
          {sharedTags.length > 0 ? formatConditionLabels(sharedTags) : 'None'}
        </h2>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => clear()}
            className="hs-compare-clear-all shrink-0 min-h-[44px]"
          >
            Clear all
          </button>
        )}
      </div>

      {selected.length === 0 ? (
        <div className="mt-8 border-t pt-8" style={{ borderColor: 'var(--border)' }}>
          <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
            No products selected for the comparison tool. Browse the catalogue and add products to compare them side by side.
          </p>
          <Link
            href="/catalogue"
            className="nhsuk-link nhsuk-link--no-visited-state hs-text-body hs-font-bold"
          >
            Go to product catalogue
          </Link>
        </div>
      ) : (
        <CompareNarrativeTables selected={selected} onRemove={remove} />
      )}
    </div>
  )
}
