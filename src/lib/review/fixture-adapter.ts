import type { GamePresentation, SceneView } from '../presentation/types';
import { cellKey } from '../presentation/types';
import { dominoCells } from '../presentation/geometry';
import {
  enabled,
  unavailable,
  rewardKey,
  selectionCommand,
  type Availability,
  type InteractionAdapter,
  type InteractionState,
  type Command,
  type ControlState
} from '../presentation/controller';
import { domino, tile } from './fixtures';
/** Explicit simulated outcomes only: no ranking, action generation, hidden deck, or rules engine. */
export function createFixtureAdapter(options: { latency?: number; failOnce?: boolean } = {}) {
  let fail = options.failOnce ?? false;
  const adapter: InteractionAdapter & { rejectNext: () => void } = {
    rejectNext() {
      fail = true;
    },
    availability(p, i) {
      const v = p.view,
        viewer = v.players.find((player) => player.owner === v.viewer)!;
      const turn = v.active === v.viewer ? enabled : unavailable('Waiting for the active player.');
      const hand = v.hand.length < 5 ? turn : unavailable('The fixture hand is full (5 dominos).');
      const selected = i.selection;
      const person =
        selected?.kind === 'person'
          ? v.players
              .find((player) => player.owner === selected.owner)
              ?.[selected.group].find((person) => person.id === selected.id)
          : undefined;
      const upgrade =
        person?.value === 1 && selected?.kind === 'person' && selected.group !== 'reserve'
          ? turn
          : unavailable('Choose a ready meeple showing 1.');
      const deploy =
        selected?.kind === 'person' && selected.group !== 'reserve'
          ? turn
          : unavailable('Choose a ready Soldier or Engineer.');
      const areas = Object.fromEntries(
        v.areas.map((area) => [
          area.id,
          selected?.kind === 'person' && selected.operation === 'deploy'
            ? area.kind === (selected.group === 'soldiers' ? 'battle' : 'invention')
              ? turn
              : unavailable('This area requires the other profession.')
            : area.rewards.length
              ? turn
              : unavailable('There are no rewards in this area.')
        ])
      );
      const a: Availability = {
        turn: {
          place: v.hand.length ? turn : unavailable('No dominos in hand.'),
          'arch-line': viewer.arches ? turn : unavailable('No Arches remaining.'),
          resolve: v.areas.some((a) => a.rewards.length)
            ? turn
            : unavailable('There are no rewards to claim.'),
          draw:
            v.market.length || v.supplies[0] > 0 ? hand : unavailable('No dominos are available.')
        },
        queue: Object.fromEntries(
          (p.actions ?? []).map((action) => [
            action.id,
            action.available && action.count > 0
              ? turn
              : unavailable(action.reason ?? 'This action is unavailable.')
          ])
        ),
        market: Object.fromEntries(v.market.map((d) => [d.id, hand])),
        hands: Object.fromEntries(v.hand.map((d) => [d.id, turn])),
        areas,
        rewards: Object.fromEntries(
          v.areas.flatMap((area) => area.rewards.map((r) => [rewardKey(area.id, r.id), turn]))
        ),
        people: Object.fromEntries(
          v.players.flatMap((player) =>
            [...player.reserve, ...player.soldiers, ...player.engineers].map((person) => [
              person.id,
              player.owner === v.viewer
                ? turn
                : unavailable('This meeple belongs to another player.')
            ])
          )
        ),
        rebuilds: Object.fromEntries((v.rebuilds ?? []).map((t) => [t.id, turn])),
        draw: v.supplies[0] > 0 ? hand : unavailable('The domino supply is empty.'),
        skip: p.actions?.some((a) => a.count > 0)
          ? turn
          : unavailable('No actions remain to skip.'),
        confirm: unavailable('Complete your selection.'),
        upgrade,
        deploy,
        place:
          selected?.kind === 'place' || selected?.kind === 'arch'
            ? turn
            : unavailable('Select a domino or Arch first.'),
        starting: v.startingDominos ? turn : unavailable('No starting choice is pending.'),
        startingValue: (v.startingDominos ?? [])
          .filter((d) => i.startingIds.includes(d.id))
          .reduce((n, d) => n + (d.double ? 2 : 1), 0),
        startingKeep: unavailable('Select a value of exactly 4.')
      };
      if (a.startingValue === 4) a.startingKeep = a.starting;
      const command = selectionCommand(selected);
      if (command) {
        let reason = validate(command, p, i, a);
        a.confirm = reason ? unavailable(reason) : turn;
      }
      return a;
    },
    async execute(command, p, signal) {
      await new Promise<void>((resolve, reject) => {
        const id = setTimeout(resolve, options.latency ?? 450);
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(id);
            reject(new Error('Cancelled'));
          },
          { once: true }
        );
      });
      if (fail) {
        fail = false;
        throw new Error('Simulated rejection. Your selection is preserved; retry or cancel.');
      }
      const next = structuredClone(p),
        v = next.view,
        player = v.players.find((player) => player.owner === v.viewer)!;
      // Reject stale commands at the adapter boundary as well as through supplied UI availability.
      const fake: InteractionState = {
        startingIds: [],
        selectedAction: null,
        selection: commandSelection(command),
        inspector: null,
        scoring: false
      };
      const check = adapter.availability(p, fake).confirm;
      if (!check.enabled) throw new Error(check.reason);
      let summary = '';
      switch (command.type) {
        case 'take-market': {
          const d = v.market.find((d) => d.id === command.id)!;
          v.market = v.market.filter((d) => d.id !== command.id);
          v.hand.push(d);
          summary = `Took market domino ${d.id}.`;
          break;
        }
        case 'draw': {
          const id = `blind-${v.supplies[0]}`;
          v.hand.push(domino('library', 'market', id));
          v.supplies[0]--;
          summary = 'Drew one private domino.';
          break;
        }
        case 'place-domino': {
          const d = v.hand.find((d) => d.id === command.id)!;
          v.city.push(...dominoCells(d, command.at, command.rotation));
          v.hand = v.hand.filter((d) => d.id !== command.id);
          summary = `Placed ${d.id} at (${command.at.x}, ${command.at.y}).`;
          break;
        }
        case 'place-arch':
          v.city.push({
            ...command.at,
            tile: tile('arch', `single-arch-${player.arches}`, { arch: '222' })
          });
          player.arches--;
          summary = `Placed an Arch at (${command.at.x}, ${command.at.y}), direction ${command.rotation}.`;
          break;
        case 'resolve-area': {
          const area = v.areas.find((a) => a.id === command.area)!,
            reward = area.rewards.find((r) => r.id === command.reward)!;
          v.rebuilds = [...(v.rebuilds ?? []), ...reward.tiles];
          area.rewards = area.rewards.filter((r) => r.id !== reward.id);
          for (const person of area.people) {
            const owner = v.players.find((p) => p.owner === person.owner)!;
            if (person.owner === v.viewer) owner.reserve.push({ ...person, value: 1 });
            else
              owner[area.kind === 'battle' ? 'soldiers' : 'engineers'].push({
                ...person,
                value: 2
              });
          }
          area.people = [];
          summary = `Claimed ${reward.id} from ${area.label}; ${reward.tiles.length} rebuild tile(s) are ready.`;
          break;
        }
        case 'rebuild': {
          const cell = v.city.find((c) => c.x === command.at.x && c.y === command.at.y)!;
          cell.covered = cell.tile;
          cell.tile = v.rebuilds!.find((t) => t.id === command.id)!;
          v.rebuilds = v.rebuilds!.filter((t) => t.id !== command.id);
          summary = `Rebuilt (${command.at.x}, ${command.at.y}) with ${command.id}.`;
          break;
        }
        case 'upgrade-person': {
          const owner = v.players.find((p) => p.owner === command.owner)!;
          owner[command.group].find((p) => p.id === command.id)!.value = 2;
          summary = `Upgraded ${command.id} to 2.`;
          break;
        }
        case 'recruit-person': {
          const owner = v.players.find((p) => p.owner === command.owner)!,
            person = owner.reserve.find((p) => p.id === command.id)!;
          owner.reserve = owner.reserve.filter((p) => p.id !== command.id);
          owner[command.profession].push({ ...person, value: 1 });
          summary = `Created ${command.id} as ${command.profession}.`;
          break;
        }
        case 'deploy-person': {
          const owner = v.players.find((p) => p.owner === command.owner)!,
            person = owner[command.group].find((p) => p.id === command.id)!;
          owner[command.group] = owner[command.group].filter((p) => p.id !== command.id);
          v.areas.find((a) => a.id === command.area)!.people.push(person);
          summary = `Deployed ${command.id} to ${command.area}.`;
          break;
        }
        case 'skip-actions':
          next.actions = [];
          summary = 'Skipped remaining building actions.';
          break;
        case 'keep-starting':
          v.hand = v.startingDominos!.filter((d) => command.ids.includes(d.id));
          v.startingDominos = undefined;
          summary = `Kept starting dominos ${command.ids.join(', ')}.`;
          break;
      }
      const building =
        command.type === 'upgrade-person'
          ? 'temple'
          : command.type === 'recruit-person'
            ? 'market'
            : command.type === 'deploy-person'
              ? command.group === 'soldiers'
                ? 'barracks'
                : 'library'
              : null;
      const action = next.actions?.find(
        (action) => action.building === building && action.count > 0
      );
      if (action) {
        action.count--;
        action.available = action.count > 0;
      }
      player.handCount = v.hand.length;
      v.log.unshift(`Simulated: ${summary}`);
      next.label = summary;
      next.detail = 'Fixture outcome applied to the selected objects.';
      next.motions = [];
      return next;
    }
  };
  return adapter;
}
function commandSelection(c: Command): InteractionState['selection'] {
  switch (c.type) {
    case 'place-domino':
      return { kind: 'place', id: c.id, at: c.at, rotation: c.rotation };
    case 'place-arch':
      return { kind: 'arch', at: c.at, rotation: c.rotation };
    case 'take-market':
      return { kind: 'market', id: c.id };
    case 'draw':
      return { kind: 'draw' };
    case 'resolve-area':
      return { kind: 'resolve', area: c.area, reward: c.reward };
    case 'rebuild':
      return { kind: 'rebuild', id: c.id, at: c.at };
    case 'upgrade-person':
      return { kind: 'person', owner: c.owner, id: c.id, group: c.group, operation: 'upgrade' };
    case 'deploy-person':
      return {
        kind: 'person',
        owner: c.owner,
        id: c.id,
        group: c.group,
        operation: 'deploy',
        area: c.area
      };
    case 'recruit-person':
      return {
        kind: 'person',
        owner: c.owner,
        id: c.id,
        group: 'reserve',
        profession: c.profession
      };
    case 'skip-actions':
      return { kind: 'skip' };
    case 'keep-starting':
      return { kind: 'starting', ids: c.ids };
  }
}
function validate(
  c: Command,
  p: GamePresentation,
  i: InteractionState,
  a: Availability
): string | undefined {
  const v = p.view;
  const bad = (state: ControlState | undefined) =>
    state?.enabled ? undefined : (state?.reason ?? 'The selected object is no longer available.');
  switch (c.type) {
    case 'take-market':
      return bad(a.market[c.id]);
    case 'draw':
      return bad(a.draw);
    case 'place-domino': {
      const d = v.hand.find((d) => d.id === c.id);
      if (!d) return 'This domino is no longer in your hand.';
      if (
        dominoCells(d, c.at, c.rotation).some((pos) =>
          v.city.some((cell) => cellKey(cell.x, cell.y) === cellKey(pos.x, pos.y))
        )
      )
        return 'That placement overlaps a building. Choose another space or rotate.';
      return bad(a.hands[c.id]);
    }
    case 'place-arch':
      return v.city.some((cell) => cell.x === c.at.x && cell.y === c.at.y)
        ? 'That space is occupied.'
        : bad(a.turn['arch-line']);
    case 'resolve-area':
      return bad(a.rewards[rewardKey(c.area, c.reward)]);
    case 'rebuild': {
      const target = v.city.find((cell) => cell.x === c.at.x && cell.y === c.at.y);
      return !target
        ? 'Choose an existing building.'
        : target.tile.building === 'arch'
          ? 'Arches are permanent and cannot be covered.'
          : bad(a.rebuilds[c.id]);
    }
    case 'upgrade-person':
      return bad(a.people[c.id]) ?? bad(a.upgrade);
    case 'deploy-person':
      return bad(a.people[c.id]) ?? bad(a.deploy) ?? bad(a.areas[c.area]);
    case 'recruit-person':
      return bad(a.people[c.id]);
    case 'skip-actions':
      return bad(a.skip);
    case 'keep-starting': {
      const candidates = v.startingDominos ?? [];
      return new Set(c.ids).size !== c.ids.length ||
        c.ids.some((id) => !candidates.some((d) => d.id === id))
        ? 'Choose from the dealt starting dominos.'
        : candidates
              .filter((d) => c.ids.includes(d.id))
              .reduce((n, d) => n + (d.double ? 2 : 1), 0) !== 4
          ? 'Keep a value of exactly 4.'
          : bad(a.starting);
    }
  }
}
/** Fixture projection selects seats explicitly, rather than teaching renderers player-index rules. */
export function reviewPresentation(p: GamePresentation, count = 4): GamePresentation {
  const v = structuredClone(p.view),
    players = v.players.slice(0, count),
    allowed = new Set(players.map((p) => p.owner));
  v.players = players;
  v.areas = v.areas.map((a) => ({
    ...a,
    people: a.people.filter((person) => allowed.has(person.owner))
  }));
  v.scores = v.scores.filter((row) => allowed.has(row.owner));
  const positions =
    count === 2
      ? (['south', 'north'] as const)
      : count === 3
        ? (['south', 'east', 'north'] as const)
        : (['south', 'east', 'north', 'west'] as const);
  v.seats = players.map((player, i) => ({ owner: player.owner, position: positions[i] }));
  v.rebuilds ??= [];
  return {
    ...p,
    view: v,
    actions: p.actions ?? [
      { id: 'upgrade', building: 'temple', count: 2, available: true },
      { id: 'recruit', building: 'market', count: 1, available: true }
    ],
    motions: p.motions ?? []
  };
}
