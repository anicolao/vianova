import type { Readable } from 'svelte/store';
import type { RegistrationBook } from '../presentation/tile-registration';
export const reviewRegistrationContext = Symbol('Review registration session');
export type RegistrationSession = Readable<RegistrationBook> & {
  apply: (book: RegistrationBook) => void;
  reset: () => void;
};
