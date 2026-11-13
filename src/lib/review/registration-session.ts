import type { Readable } from 'svelte/store';
import { shippedRegistration, type RegistrationBook } from '../presentation/tile-registration';
export const reviewRegistrationContext = Symbol('Review registration session');
export type RegistrationSession = Readable<RegistrationBook> & {
  apply: (book: RegistrationBook) => void;
  reset: () => void;
};

// Appearance caches belong to the shipped calibration they were authored against.
// Keep older entries intact, but never let them mask newly published defaults.
let hash = 2166136261;
for (const char of JSON.stringify(shippedRegistration))
  hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
export const registrationRevision = (hash >>> 0).toString(16);
export const registrationCacheKey = (base: string) =>
  `vianova:${base}:tile-registration:v1:${registrationRevision}`;
export const registrationDraftKey = (base: string) =>
  `vianova:${base}:tile-registration-draft:v1:${registrationRevision}`;
