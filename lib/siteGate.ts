/**
 * Site-wide password gate (prototype protection).
 *
 * Sits in front of the whole prototype — including open-access mode — via
 * middleware. Not real security: a shared password for demo audiences.
 */

export const GATE_COOKIE = 'hs-gate'

/** Opaque token stored in the cookie once the correct password is entered. */
export const GATE_TOKEN = 'hs-gate-ok-9c4e2b71a8'

/** Accepted shared passwords (case-insensitive). */
export const GATE_PASSWORDS = ['y!pikayay']

export function isGatePasswordValid(input: unknown): boolean {
  return typeof input === 'string' && GATE_PASSWORDS.includes(input.trim().toLowerCase())
}
