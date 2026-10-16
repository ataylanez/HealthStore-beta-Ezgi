/**
 * Illustrative "What it could be worth" model shared by the local-value section
 * (PdpLocalValue) and the product overview teaser. All figures are prototype
 * data labelled as illustrative; no verified price is published.
 *
 * R2-3 / R2-4 (see /DS/Audits/Luscii-Content-Mig-3): ROI runs on a fixed
 * 500-patient cohort and the net position spans an unreconciled price band.
 */

export const ROI_COHORT = 500
const ROI_ADM_RATE = 0.2
const ROI_AE_RATE = 0.25
const ROI_ADM_EFFECT = 0.4 // central
const ROI_AE_EFFECT = 0.25 // central
const ADMISSION_COST = 2655
const AE_COST = 273
const CAPACITY_TO_CASH = 0.4

/** Price band (per patient / year) — spans the two unreconciled Round 1 figures. */
export const PRICE_LOW = 110
export const PRICE_HIGH = 360

export type IllustrativeWorth = {
  capacity: number
  cash: number
  netLow: number
  netHigh: number
  breakEvenPrice: number
}

export function computeIllustrativeWorth(): IllustrativeWorth {
  const admAvoided = Math.round(ROI_COHORT * ROI_ADM_RATE * ROI_ADM_EFFECT)
  const aeAvoided = Math.round(ROI_COHORT * ROI_AE_RATE * ROI_AE_EFFECT)
  const capacity = admAvoided * ADMISSION_COST + aeAvoided * AE_COST
  const cash = Math.round(capacity * CAPACITY_TO_CASH)
  const costLow = ROI_COHORT * PRICE_LOW
  const costHigh = ROI_COHORT * PRICE_HIGH
  return {
    capacity,
    cash,
    netLow: capacity - costHigh,
    netHigh: capacity - costLow,
    breakEvenPrice: Math.round(capacity / ROI_COHORT),
  }
}

export function formatGbp(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}m`
  if (abs >= 1_000) return `${sign}£${Math.round(abs / 1_000)}k`
  return `${sign}£${abs.toLocaleString()}`
}
