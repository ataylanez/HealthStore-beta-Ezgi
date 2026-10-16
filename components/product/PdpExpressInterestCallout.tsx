import { ExpressInterestWhiteButton } from '@/components/ExpressInterestWhiteButton'

/** Coloured express-interest callout — used inside How to buy locally (narrative) or below tabs. */
export default function PdpExpressInterestCallout({ accent, slug }: { accent: string; slug: string }) {
  return (
    <div className="mt-4 rounded-lg overflow-hidden" style={{ background: accent }}>
      <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-section-alt)', color: '#fff', marginBottom: 8 }}>
          Want to find out more?
        </div>
        <p style={{ fontSize: 'var(--text-body)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 640 }}>
          The NHS HealthStore can assess fit, build a business case, and support your local procurement route.
        </p>
        <ExpressInterestWhiteButton slug={slug} />
      </div>
    </div>
  )
}
