import type { Cell } from './types';
/** Components emit user choices; a future rules/controller layer accepts or rejects them. */
export type ViewIntent =
  | { type: 'choose-action'; action: string }
  | { type: 'select-domino'; id: string }
  | { type: 'stage'; x: number; y: number }
  | { type: 'rotate' }
  | { type: 'cancel' }
  | { type: 'commit' }
  | { type: 'inspect-cell'; cell: Cell }
  | { type: 'select-reward'; area: string; reward: string }
  | { type: 'resolve'; area: string }
  | { type: 'take-market'; id: string }
  | { type: 'draw' }
  | { type: 'person'; group: string; id: string }
  | { type: 'inspect-score' };
