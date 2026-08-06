import type { Locale } from '../config';
import type { Dictionary } from './types';
import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';

/** The dictionaries are plain objects, so they are imported directly rather than lazily —
 * a few KB each, and the alternative (dynamic import) would make every consumer async for no
 * measurable gain. Only the active one is serialized to the client. */
export const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, gu };

export type { Dictionary };
