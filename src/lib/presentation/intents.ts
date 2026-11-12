import type { Owner } from './types';
export type PersonGroup = 'soldiers' | 'engineers' | 'reserve';
export type TurnAction = 'place' | 'arch-line' | 'resolve' | 'draw';
/** UI choices preserve object identity; only confirmation submits an outcome command. */
export type ViewIntent =
  | { type: 'choose-action'; action: string }
  | { type: 'select-domino'; id: string }
  | { type: 'stage'; x: number; y: number }
  | { type: 'rotate' }
  | { type: 'cancel' }
  | { type: 'commit' }
  | { type: 'skip-actions' }
  | { type: 'inspect-cell'; owner: Owner; x: number; y: number }
  | { type: 'close-inspector' }
  | { type: 'target-cell'; x: number; y: number }
  | { type: 'select-reward'; area: string; reward: string }
  | { type: 'resolve'; area: string }
  | { type: 'select-area'; area: string }
  | { type: 'select-rebuild'; id: string }
  | { type: 'take-market'; id: string }
  | { type: 'draw' }
  | { type: 'person'; owner: Owner; group: PersonGroup; id: string }
  | { type: 'person-operation'; operation: 'upgrade' | 'deploy' }
  | { type: 'profession'; profession: 'soldiers' | 'engineers' }
  | { type: 'toggle-starting'; id: string }
  | { type: 'keep-starting'; ids: string[] }
  | { type: 'inspect-score' };
