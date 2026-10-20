import { getAppBySlug } from '@/lib/data'
import {
  PRODUCT_DOCUMENT_FIELDS,
  SAMPLE_SUPPLIER,
  UPLOADED_ON_SUFFIX,
  type ManagedProduct,
  type ReadOnlyRow,
} from '@/lib/supplierPortal'

/**
 * Server-only starting values for the Supplier portal, drawn from the catalogue
 * app data (content/apps). Kept apart from lib/supplierPortal.ts so client
 * components do not bundle every app JSON file.
 *
 * Fictional prototype products (e.g. Respira CBT) have no catalogue JSON; the
 * portal supplies believable defaults instead.
 */

const DEVICE_CLASS_FALLBACK = 'To be confirmed'

/** Catalogue-shaped defaults for portal-only fictional products. */
const PORTAL_FICTIONAL_APPS: Record<
  string,
  {
    app_name: string
    supplier_name: string
    device_class: string
    one_line_value_proposition: string
    target_patients: string
    why_it_matters_locally: string
    supplier_contact_name: string
    supplier_contact_email: string
    dtac_status: string
    nice_guidance_refs: { ref: string }[]
  }
> = {
  'respira-cbt': {
    app_name: 'Respira CBT',
    supplier_name: SAMPLE_SUPPLIER.name,
    device_class: 'Class IIa',
    one_line_value_proposition:
      'Clinician-supported digital CBT for adults with generalised anxiety disorder, delivered over 12 weeks with weekly asynchronous therapist review.',
    target_patients:
      'Adults (18+) referred to NHS Talking Therapies with mild to moderate generalised anxiety disorder.',
    why_it_matters_locally:
      'Supports local Talking Therapies pathway goals for faster access to treatment and higher reliable recovery rates for adults with mild to moderate anxiety.',
    supplier_contact_name: SAMPLE_SUPPLIER.contactName,
    supplier_contact_email: SAMPLE_SUPPLIER.email,
    dtac_status: 'passed',
    nice_guidance_refs: [{ ref: 'NG222' }],
  },
}

function portalApp(product: ManagedProduct) {
  return getAppBySlug(product.appSlug) ?? PORTAL_FICTIONAL_APPS[product.appSlug]
}

/** Product information and documents as last submitted (before supplier edits). */
export function productDefaults(product: ManagedProduct): Record<string, string> {
  const app = portalApp(product)
  const values: Record<string, string> = {
    summary: app?.one_line_value_proposition ?? '',
    target_patients: typeof app?.target_patients === 'string' ? app.target_patients : '',
    support_email: app?.supplier_contact_email ?? '',
  }
  for (const doc of PRODUCT_DOCUMENT_FIELDS) {
    const held = product.documents[doc.id]
    if (!held) continue
    values[doc.id] = held.fileName
    values[`${doc.id}${UPLOADED_ON_SUFFIX}`] = held.uploadedOn
  }
  return values
}

/** Editable product page content as currently published. */
export function productPageDefaults(product: ManagedProduct): Record<string, string> {
  const app = portalApp(product)
  return {
    overview: app?.one_line_value_proposition ?? '',
    why_it_matters: app?.why_it_matters_locally ?? '',
    contact_name: app?.supplier_contact_name ?? '',
    contact_email: app?.supplier_contact_email ?? '',
  }
}

const DTAC_LABELS: Record<string, string> = {
  passed: 'Complete',
  passed_refresh_required: 'Complete — refreshed form required',
  required_not_confirmed: 'Not complete',
}

/** Product page content that comes from product onboarding and cannot be edited here. */
export function productPageReadOnly(product: ManagedProduct): ReadOnlyRow[] {
  const app = portalApp(product)
  const nice = (app?.nice_guidance_refs ?? []).map((r: { ref: string }) => r.ref).join(', ')
  return [
    { label: 'Product name', value: app?.app_name ?? product.name },
    { label: 'Supplier', value: app?.supplier_name ?? SAMPLE_SUPPLIER.name },
    { label: 'Medical device classification', value: app?.device_class ?? DEVICE_CLASS_FALLBACK },
    { label: 'NICE guidance', value: nice || 'None recorded' },
    { label: 'DTAC status', value: DTAC_LABELS[app?.dtac_status ?? ''] ?? 'To be confirmed' },
  ]
}

/** Supplier page content that comes from supplier onboarding and cannot be edited here. */
export function supplierPageReadOnly(productNames: string[]): ReadOnlyRow[] {
  return [
    { label: 'Company name', value: SAMPLE_SUPPLIER.name },
    { label: 'Registered address', value: SAMPLE_SUPPLIER.registeredAddress },
    { label: 'Company number', value: SAMPLE_SUPPLIER.companyNumber },
    { label: 'Products on the HealthStore', value: productNames.join(', ') },
  ]
}
