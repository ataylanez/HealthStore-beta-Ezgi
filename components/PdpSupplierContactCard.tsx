import { NOT_STATED } from '@/lib/compareFieldFormat'

export default function PdpSupplierContactCard({ email }: { email?: string | null }) {
  const trimmed = (email ?? '').trim()
  const showEmailLink = trimmed.length > 0

  return (
    <div className="hs-surface-card-sm bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: 'var(--border)' }}>
      <div className="hs-text-label hs-font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
        Supplier contact information
      </div>
      <div className="hs-text-label">
        <div className="hs-text-label hs-font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
          Email
        </div>
        {showEmailLink ? (
          <a href={`mailto:${trimmed}`} className="hs-font-normal break-all underline hover:no-underline" style={{ color: 'var(--nhs-blue)' }}>
            {trimmed}
          </a>
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>{NOT_STATED}</span>
        )}
      </div>
    </div>
  )
}
