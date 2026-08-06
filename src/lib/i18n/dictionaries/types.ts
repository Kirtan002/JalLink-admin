import type { en } from './en';

/**
 * The shape every locale must provide, derived from the English dictionary rather than
 * hand-written. A new key in en.ts becomes a type error in every translation file until it
 * is filled in — the point being that a half-translated locale can never ship silently.
 */
export type Dictionary = typeof en;
