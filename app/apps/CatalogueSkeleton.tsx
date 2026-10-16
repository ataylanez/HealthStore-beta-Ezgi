// [Provenance: Bespoke — no NHS/GOV.UK equivalent.] Loading skeleton built to NHS
// principles: NHS grey placeholders, decorative (aria-hidden) with a visually
// hidden status, and animation suppressed under prefers-reduced-motion (globals).
// Mirrors the NHS layout of CatalogueClient: one-third filters, two-thirds results.
export default function CatalogueSkeleton() {
  return (
    <div className="nhsuk-width-container" role="status" aria-busy="true">
      <span className="nhsuk-u-visually-hidden">Loading apps…</span>
      <div className="nhsuk-main-wrapper" aria-hidden>
        <div style={{ height: 48, width: 320, background: 'var(--border)', borderRadius: 4, marginBottom: 40 }} />
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-one-third">
            <div style={{ height: 24, width: 80, background: 'var(--border)', borderRadius: 4, marginBottom: 16 }} />
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 44, background: 'var(--border)', borderRadius: 4, opacity: 0.45, marginBottom: 8 }} />
            ))}
          </div>
          <div className="nhsuk-grid-column-two-thirds">
            <div style={{ height: 20, width: 100, background: 'var(--border)', borderRadius: 4, marginBottom: 24 }} />
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 220, background: 'var(--border)', borderRadius: 4, opacity: 0.4, marginBottom: 32 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
