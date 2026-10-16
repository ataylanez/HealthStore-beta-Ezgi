import { Suspense } from 'react'
import { getAllApps } from '@/lib/data'
import CompareClient from './CompareClient'

export const metadata = { title: 'Comparison tool — NHS HealthStore' }

function CompareSkeleton() {
  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="mb-4 flex flex-wrap items-center gap-2 hs-text-label" style={{ color: 'var(--text-muted)' }} aria-hidden>
        <div style={{ height: 14, width: 48, background: 'var(--border)', borderRadius: 4 }} />
        <span>/</span>
        <div style={{ height: 14, width: 120, background: 'var(--border)', borderRadius: 4 }} />
      </div>
      <div className="mb-8">
        <div style={{ height: 36, width: 280, background: 'var(--border)', borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 18, width: 360, background: 'var(--border)', borderRadius: 4 }} />
      </div>
      <div className="hs-surface-card rounded-xl border p-6 mb-8 bg-white" style={{ borderColor: 'var(--border)' }}>
        <div style={{ height: 16, width: 200, background: 'var(--border)', borderRadius: 4, marginBottom: 16 }} />
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: 36, width: 100, background: 'var(--border)', borderRadius: 8, opacity: 0.5 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const allApps = getAllApps()
  return (
    <Suspense fallback={<CompareSkeleton />}>
      <CompareClient allApps={allApps} />
    </Suspense>
  )
}
