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
 */

const DEVICE_CLASS_FALLBACK = 'To be confirmed'

/** Product information and documents as last approved (before supplier edits). */
export function productDefaults(product: ManagedProduct): Record<string, string> {
  const app = getAppBySlug(product.appSlug)
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
  const app = getAppBySlug(product.appSlug)
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
  const app = getAppBySlug(product.appSlug)
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
