import { get, writable, type Readable } from 'svelte/store';
import type { GamePresentation, Owner } from './types';
import type { PersonGroup, TurnAction, ViewIntent } from './intents';
import type { Point } from './geometry';
export type ControlState = { enabled: boolean; reason?: string };
export const enabled: ControlState = { enabled: true };
export const unavailable = (reason = 'Unavailable'): ControlState => ({ enabled: false, reason });
export type Selection =
  | { kind: 'place'; id: string; at: Point | null; rotation: number }
  | { kind: 'arch'; at: Point | null; rotation: number }
  | { kind: 'market'; id: string }
  | { kind: 'draw' }
  | { kind: 'resolve'; area: string; reward?: string }
  | { kind: 'rebuild'; id: string; at: Point | null }
  | {
      kind: 'person';
      owner: Owner;
      id: string;
      group: PersonGroup;
      operation?: 'upgrade' | 'deploy';
      profession?: 'soldiers' | 'engineers';
      area?: string;
    }
  | { kind: 'skip' }
  | { kind: 'starting'; ids: string[] };
export type InteractionState = {
  startingIds: string[];
  selectedAction: string | null;
  selection: Selection | null;
  inspector: { owner: Owner; x: number; y: number } | null;
  scoring: boolean;
};
export type Availability = {
  turn: Record<TurnAction, ControlState>;
  queue: Record<string, ControlState>;
  market: Record<string, ControlState>;
  hands: Record<string, ControlState>;
  areas: Record<string, ControlState>;
  rewards: Record<string, ControlState>;
  people: Record<string, ControlState>;
  rebuilds: Record<string, ControlState>;
  draw: ControlState;
  skip: ControlState;
  confirm: ControlState;
  upgrade: ControlState;
  deploy: ControlState;
  place: ControlState;
  starting: ControlState;
  startingKeep: ControlState;
  startingValue: number;
};
export type Command =
  | { type: 'place-domino'; id: string; at: Point; rotation: number }
  | { type: 'place-arch'; at: Point; rotation: number }
  | { type: 'take-market'; id: string }
  | { type: 'draw' }
  | { type: 'resolve-area'; area: string; reward: string }
  | { type: 'rebuild'; id: string; at: Point }
  | { type: 'upgrade-person'; owner: Owner; id: string; group: 'soldiers' | 'engineers' }
  | {
      type: 'deploy-person';
      owner: Owner;
      id: string;
      group: 'soldiers' | 'engineers';
      area: string;
    }
  | { type: 'recruit-person'; owner: Owner; id: string; profession: 'soldiers' | 'engineers' }
  | { type: 'skip-actions' }
  | { type: 'keep-starting'; ids: string[] };
/** The future authoritative game adapter implements exactly this boundary. */
export interface InteractionAdapter {
  availability(presentation: GamePresentation, interaction: InteractionState): Availability;
  execute(
    command: Command,
    presentation: GamePresentation,
    signal: AbortSignal
  ): Promise<GamePresentation>;
}
export type ControllerSnapshot = {
  presentation: GamePresentation;
  interaction: InteractionState;
  availability: Availability;
  pending: boolean;
  error: string | null;
};
export interface PresentationController extends Readable<ControllerSnapshot> {
  dispatch(intent: ViewIntent): Promise<void>;
  replace(presentation: GamePresentation): void;
  destroy(): void;
}
const initial = (): InteractionState => ({
  startingIds: [],
  selectedAction: null,
  selection: null,
  inspector: null,
  scoring: false
});
export const rewardKey = (area: string, reward: string) => `${area}/${reward}`;
export function selectionCommand(selection: Selection | null): Command | null {
  if (!selection) return null;
  switch (selection.kind) {
    case 'place':
      return selection.at
        ? { type: 'place-domino', id: selection.id, at: selection.at, rotation: selection.rotation }
        : null;
    case 'arch':
      return selection.at
        ? { type: 'place-arch', at: selection.at, rotation: selection.rotation }
        : null;
    case 'market':
      return { type: 'take-market', id: selection.id };
    case 'draw':
      return { type: 'draw' };
    case 'resolve':
      return selection.reward
        ? { type: 'resolve-area', area: selection.area, reward: selection.reward }
        : null;
    case 'rebuild':
      return selection.at ? { type: 'rebuild', id: selection.id, at: selection.at } : null;
    case 'skip':
      return { type: 'skip-actions' };
    case 'starting':
      return { type: 'keep-starting', ids: selection.ids };
    case 'person':
      if (selection.group === 'reserve')
        return selection.profession
          ? {
              type: 'recruit-person',
              owner: selection.owner,
              id: selection.id,
              profession: selection.profession
            }
          : null;
      if (selection.operation === 'upgrade')
        return {
          type: 'upgrade-person',
          owner: selection.owner,
          id: selection.id,
          group: selection.group
        };
      return selection.operation === 'deploy' && selection.area
        ? {
            type: 'deploy-person',
            owner: selection.owner,
            id: selection.id,
            group: selection.group,
            area: selection.area
          }
        : null;
  }
}
/** Shared UI state machine only. Availability and every game outcome come from the adapter. */
export function createPresentationController(
  presentation: GamePresentation,
  adapter: InteractionAdapter
): PresentationController {
  let interaction = initial(),
    pending = false,
    error: string | null = null,
    revision = 0,
    abort: AbortController | undefined;
  const snapshot = (): ControllerSnapshot => ({
    presentation,
    interaction,
    availability: adapter.availability(presentation, interaction),
    pending,
    error
  });
  const state = writable(snapshot());
  const publish = () => state.set(snapshot());
  function check(control: ControlState | undefined) {
    if (!control?.enabled) {
      error = control?.reason ?? 'This choice is unavailable.';
      publish();
      return false;
    }
    return true;
  }
  return {
    subscribe: state.subscribe,
    replace(next) {
      revision++;
      abort?.abort();
      presentation = next;
      interaction = initial();
      pending = false;
      error = null;
      publish();
    },
    destroy() {
      revision++;
      abort?.abort();
    },
    async dispatch(intent) {
      if (intent.type === 'close-inspector') {
        interaction = { ...interaction, inspector: null };
        publish();
        return;
      }
      if (intent.type === 'inspect-cell') {
        interaction = {
          ...interaction,
          inspector: { owner: intent.owner, x: intent.x, y: intent.y }
        };
        publish();
        return;
      }
      if (intent.type === 'inspect-score') {
        interaction = { ...interaction, scoring: !interaction.scoring };
        publish();
        return;
      }
      if (pending) return;
      const a = get(state).availability;
      error = null;
      if (intent.type === 'cancel') {
        interaction = { ...initial(), inspector: interaction.inspector };
        publish();
        return;
      }
      if (intent.type === 'commit') {
        if (!check(a.confirm)) return;
        const command = selectionCommand(interaction.selection);
        if (!command) {
          error = 'Complete the selection first.';
          publish();
          return;
        }
        const token = ++revision;
        abort = new AbortController();
        pending = true;
        publish();
        try {
          const next = await adapter.execute(command, presentation, abort.signal);
          if (token !== revision) return;
          presentation = next;
          interaction = { ...initial(), inspector: interaction.inspector };
        } catch (e) {
          if (token !== revision) return;
          error = e instanceof Error ? e.message : 'The action could not be completed.';
        } finally {
          if (token === revision) {
            pending = false;
            publish();
          }
        }
        return;
      }
      let selection = interaction.selection;
      switch (intent.type) {
        case 'choose-action':
          if (
            !check(
              intent.action in a.turn ? a.turn[intent.action as TurnAction] : a.queue[intent.action]
            )
          )
            return;
          interaction.selectedAction = intent.action;
          selection =
            intent.action === 'arch-line' ? { kind: 'arch', at: null, rotation: 0 } : null;
          break;
        case 'select-domino':
          if (!check(a.hands[intent.id])) return;
          interaction.selectedAction = 'place';
          selection = { kind: 'place', id: intent.id, at: null, rotation: 0 };
          break;
        case 'stage':
          if (!check(a.place)) return;
          if (selection?.kind === 'place' || selection?.kind === 'arch')
            selection = { ...selection, at: { x: intent.x, y: intent.y } };
          break;
        case 'rotate':
          if (selection?.kind === 'place' || selection?.kind === 'arch')
            selection = { ...selection, rotation: (selection.rotation + 1) % 4 };
          break;
        case 'take-market':
          if (!check(a.market[intent.id])) return;
          interaction.selectedAction = 'draw';
          selection = { kind: 'market', id: intent.id };
          break;
        case 'draw':
          if (!check(a.draw)) return;
          interaction.selectedAction = 'draw';
          selection = { kind: 'draw' };
          break;
        case 'resolve':
          if (!check(a.areas[intent.area])) return;
          interaction.selectedAction = 'resolve';
          selection = { kind: 'resolve', area: intent.area };
          break;
        case 'select-reward':
          if (!check(a.rewards[rewardKey(intent.area, intent.reward)])) return;
          interaction.selectedAction = 'resolve';
          selection = { kind: 'resolve', area: intent.area, reward: intent.reward };
          break;
        case 'person':
          if (!check(a.people[intent.id])) return;
          selection = { kind: 'person', owner: intent.owner, id: intent.id, group: intent.group };
          break;
        case 'profession':
          if (selection?.kind === 'person' && selection.group === 'reserve')
            selection = { ...selection, profession: intent.profession };
          break;
        case 'person-operation':
          if (!check(intent.operation === 'upgrade' ? a.upgrade : a.deploy)) return;
          if (selection?.kind === 'person')
            selection = { ...selection, operation: intent.operation, area: undefined };
          break;
        case 'select-area':
          if (!check(a.areas[intent.area])) return;
          if (selection?.kind === 'person' && selection.operation === 'deploy')
            selection = { ...selection, area: intent.area };
          break;
        case 'select-rebuild':
          if (!check(a.rebuilds[intent.id])) return;
          selection = { kind: 'rebuild', id: intent.id, at: null };
          break;
        case 'target-cell':
          if (selection?.kind === 'rebuild')
            selection = { ...selection, at: { x: intent.x, y: intent.y } };
          break;
        case 'skip-actions':
          if (!check(a.skip)) return;
          selection = { kind: 'skip' };
          break;
        case 'toggle-starting':
          if (!check(a.starting)) return;
          interaction = {
            ...interaction,
            startingIds: interaction.startingIds.includes(intent.id)
              ? interaction.startingIds.filter((id) => id !== intent.id)
              : [...interaction.startingIds, intent.id]
          };
          break;
        case 'keep-starting':
          if (!check(a.starting)) return;
          selection = { kind: 'starting', ids: [...intent.ids] };
          break;
      }
      interaction = { ...interaction, selection };
      publish();
    }
  };
}
