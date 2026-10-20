/**
 * Limited catalogue view for a product that is visible in the wider market
 * but is not available to commission through the NHS HealthStore.
 */
export function isMarketPreview(app: { market_preview?: boolean } | null | undefined): boolean {
  return app?.market_preview === true
}
