import copdRef from '@/content/local/copd-reference.json'
import type { IcbReferenceData } from '@/lib/content/productModel'
import type { CommissionerContext } from '@/lib/context/types'

export function getLocalReferenceData(ctx: CommissionerContext): IcbReferenceData | null {
  const national = copdRef.national as Omit<IcbReferenceData, 'icb_id' | 'icb_name'>
  if (ctx.geography_type === 'national' || !ctx.geography_id) {
    return {
      icb_id: 'E92000001',
      icb_name: 'England (illustrative baseline)',
      ...national,
    }
  }
  const icb = (copdRef.icbs as IcbReferenceData[]).find((i) => i.icb_id === ctx.geography_id)
  return icb ?? null
}
