import { Mail } from 'lucide-react'
import { liveSiteContactEmail } from '@/lib/liveSiteContact'

export type NamedSiteRow = { name?: string; status?: string }

function normalizeNamedSiteStatus(status: string | undefined): 'active' | 'decommissioned' | 'unknown' {
  if (status === 'active') return 'active'
  if (status === 'decommissioned') return 'decommissioned'
  return 'unknown'
}

/** Structured Live sites rows with placeholder contact tooltip (see `liveSiteContactEmail`). */
export function NamedSitesStructuredList({ rows }: { rows: NamedSiteRow[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {rows.map((s, i) => {
        const st = normalizeNamedSiteStatus(s.status)
        const dot =
          st === 'decommissioned' ? 'bg-[#D5281B]' : st === 'active' ? 'bg-[#007F3B]' : 'bg-[#AEB7BD]'
        const siteName = typeof s.name === 'string' ? s.name : ''
        const email = liveSiteContactEmail(siteName, i)
        const srId = `live-site-contact-sr-${i}`

        return (
          <div key={i} className="flex items-start gap-2 min-w-0">
            <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${dot}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="inline-flex max-w-full min-w-0 flex-wrap items-baseline gap-x-[1ch] gap-y-1">
                <span
                  className="hs-font-normal hs-text-label break-words"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {s.name}
                </span>
                <span className="relative group inline-flex shrink-0 translate-y-px">
                  <span id={srId} className="sr-only">
                    {`Contact email ${email}`}
                  </span>
                  <button
                    type="button"
                    className="rounded p-1 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[color:var(--nhs-blue)] focus-visible:ring-offset-1"
                    style={{ color: 'var(--nhs-blue)' }}
                    aria-describedby={srId}
                    aria-label={`Contact email for ${siteName || 'this site'}`}
                  >
                    <Mail className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
                  </button>
                  <div
                    role="tooltip"
                    aria-hidden="true"
                    className="pointer-events-none invisible absolute right-0 top-full z-[60] max-w-[min(100vw-2rem,44rem)] min-w-[min(22rem,calc(100vw-2rem))] w-max -mt-2 pt-2 opacity-0 transition-opacity duration-150 focus-within:pointer-events-auto focus-within:visible focus-within:opacity-100 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                  >
                    <div
                      className="rounded-lg border p-4 overflow-x-auto"
                      style={{
                        background: 'var(--card)',
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    >
                      <div
                        className="mb-1 hs-text-label hs-font-bold"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Contact
                      </div>
                      <a
                        href={`mailto:${email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block whitespace-nowrap hs-text-caption leading-tight underline underline-offset-2 outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[color:var(--nhs-blue)] focus-visible:ring-offset-1 rounded-sm"
                        style={{ color: 'var(--nhs-blue)' }}
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
