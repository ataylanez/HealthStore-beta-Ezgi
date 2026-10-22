import Link from 'next/link'

/** White CTA in the coloured express-interest callout (PDP). Links to the v2 "Get in touch" journey. */
export function ExpressInterestWhiteButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/apps/${slug}/get-in-touch`}
      className="nhsuk-button nhsuk-button--reverse mb-0 inline-flex items-center justify-center gap-2 align-top w-full sm:w-auto min-w-[200px] max-sm:mb-2 px-6 py-4 text-[var(--text-label)] no-underline"
      style={{ color: 'var(--text-primary)' }}
    >
      Get in touch
    </Link>
  )
}
