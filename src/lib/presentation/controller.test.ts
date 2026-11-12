import { get } from 'svelte/store';
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createPresentationController, type Command, type InteractionAdapter } from './controller';
import { createFixtureAdapter, reviewPresentation } from '../review/fixture-adapter';
import { sample, getScenario } from '../review/scenarios';
const presentation = () => reviewPresentation(sample(getScenario('place'), 0));
const make = () =>
  createPresentationController(presentation(), createFixtureAdapter({ latency: 0 }));
describe('the production interaction controller with a simulated adapter', () => {
  it('keeps the exact market ID through cancel and confirmation', async () => {
    const c = make();
    await c.dispatch({ type: 'take-market', id: 'm4' });
    expect(get(c).interaction.selection).toEqual({ kind: 'market', id: 'm4' });
    await c.dispatch({ type: 'cancel' });
    expect(get(c).presentation.view.market.map((d) => d.id)).toContain('m4');
    await c.dispatch({ type: 'take-market', id: 'm1' });
    await c.dispatch({ type: 'commit' });
    expect(get(c).presentation.view.hand.map((d) => d.id)).toContain('m1');
    expect(get(c).presentation.view.market.map((d) => d.id)).toContain('m4');
    expect(get(c).presentation.view.market.map((d) => d.id)).not.toContain('m1');
  });
  it('keeps area/reward identity and stages the actual awarded rebuild', async () => {
    const c = make();
    const reward = get(c).presentation.view.areas[3].rewards[1];
    await c.dispatch({ type: 'resolve', area: 'invention-1' });
    expect(get(c).availability.confirm.enabled).toBe(false);
    await c.dispatch({ type: 'select-reward', area: 'invention-1', reward: reward.id });
    await c.dispatch({ type: 'commit' });
    expect(get(c).presentation.view.rebuilds?.map((t) => t.id)).toEqual(
      reward.tiles.map((t) => t.id)
    );
    expect(get(c).presentation.view.areas[0].rewards).toHaveLength(2);
    await c.dispatch({ type: 'select-rebuild', id: reward.tiles[0].id });
    await c.dispatch({ type: 'target-cell', x: 0, y: 0 });
    await c.dispatch({ type: 'commit' });
    expect(get(c).presentation.view.city.find((c) => c.x === 0 && c.y === 0)?.tile.id).toBe(
      reward.tiles[0].id
    );
  });
  it('upgrades/deploys the selected physical meeple, never an array index substitute', async () => {
    const c = make();
    await c.dispatch({ type: 'person', owner: 'teal', group: 'soldiers', id: 'teal-soldier-1' });
    await c.dispatch({ type: 'person-operation', operation: 'deploy' });
    await c.dispatch({ type: 'select-area', area: 'battle-1' });
    await c.dispatch({ type: 'commit' });
    expect(
      get(c).presentation.view.areas[1].people.some(
        (p) => p.id === 'teal-soldier-1' && p.value === 2
      )
    ).toBe(true);
    expect(get(c).presentation.view.players[0].soldiers.map((p) => p.id)).toEqual([
      'teal-soldier-0'
    ]);
  });
  it('uses shared signed geometry for commit and retains building identity on rotation', async () => {
    const c = make();
    await c.dispatch({ type: 'select-domino', id: 'h1' });
    await c.dispatch({ type: 'stage', x: -1, y: -1 });
    await c.dispatch({ type: 'rotate' });
    await c.dispatch({ type: 'rotate' });
    await c.dispatch({ type: 'commit' });
    expect(get(c).presentation.view.city.find((c) => c.x === -2 && c.y === -1)?.tile.id).toBe(
      'h1-b'
    );
  });
  it('carries selected actions, asks before skip, and cancels without changing the queue', async () => {
    const c = make();
    await c.dispatch({ type: 'choose-action', action: 'upgrade' });
    expect(get(c).interaction.selectedAction).toBe('upgrade');
    await c.dispatch({ type: 'skip-actions' });
    await c.dispatch({ type: 'cancel' });
    expect(get(c).presentation.actions).toHaveLength(2);
    await c.dispatch({ type: 'skip-actions' });
    await c.dispatch({ type: 'commit' });
    expect(get(c).presentation.actions).toEqual([]);
  });
  it('exposes pending and retryable rejection without losing the chosen ID', async () => {
    const adapter = createFixtureAdapter({ latency: 1, failOnce: true }),
      c = createPresentationController(presentation(), adapter);
    await c.dispatch({ type: 'take-market', id: 'm3' });
    const pending = c.dispatch({ type: 'commit' });
    expect(get(c).pending).toBe(true);
    await pending;
    expect(get(c).error).toContain('Simulated rejection');
    expect(get(c).interaction.selection).toEqual({ kind: 'market', id: 'm3' });
    await c.dispatch({ type: 'commit' });
    expect(get(c).error).toBeNull();
    expect(get(c).presentation.view.hand.map((d) => d.id)).toContain('m3');
  });
  it('uses adapter-provided availability rather than embedding game legality in UI', async () => {
    const adapter = createFixtureAdapter({ latency: 0 });
    const c = createPresentationController(presentation(), {
      ...adapter,
      availability(p, i) {
        const a = adapter.availability(p, i);
        return {
          ...a,
          market: { ...a.market, m4: { enabled: false, reason: 'Authoritative refusal' } }
        };
      }
    });
    await c.dispatch({ type: 'take-market', id: 'm4' });
    expect(get(c).interaction.selection).toBeNull();
    expect(get(c).error).toBe('Authoritative refusal');
  });
  it('keeps inspector state shared and dismissible independently of a review host', async () => {
    const c = make();
    await c.dispatch({ type: 'inspect-cell', owner: 'teal', x: 1, y: 1 });
    expect(get(c).interaction.inspector).toEqual({ owner: 'teal', x: 1, y: 1 });
    await c.dispatch({ type: 'close-inspector' });
    expect(get(c).interaction.inspector).toBeNull();
  });
  it('does not allow stale async results to overwrite a replacement projection', async () => {
    let release!: (p: ReturnType<typeof presentation>) => void;
    const adapter = createFixtureAdapter();
    const c = createPresentationController(presentation(), {
      ...adapter,
      execute: () =>
        new Promise((resolve) => {
          release = resolve;
        })
    });
    await c.dispatch({ type: 'draw' });
    const task = c.dispatch({ type: 'commit' });
    const next = presentation();
    next.label = 'New authoritative state';
    c.replace(next);
    release(presentation());
    await task;
    expect(get(c).presentation.label).toBe('New authoritative state');
    expect(get(c).pending).toBe(false);
  });
  it('keeps production contracts/components independent of fixtures, clocks and studies', () => {
    for (const folder of ['src/lib/components', 'src/lib/presentation'])
      for (const file of readdirSync(folder).filter((f) => !f.endsWith('.test.ts'))) {
        const source = readFileSync(`${folder}/${file}`, 'utf8');
        expect(source).not.toMatch(/from ['"][^'"]*(review|scenarios|fixtures|timeline-types)/);
        if (file.endsWith('.svelte')) expect(source).not.toMatch(/sceneId|data-beat|Frame\[/);
      }
  });
});
it('recruits an exact reserve ID and upgrades a non-first ready ID with supplied queue updates', async () => {
  const p = presentation();
  p.view.players[0].soldiers[1].value = 1;
  const c = createPresentationController(p, createFixtureAdapter({ latency: 0 }));
  await c.dispatch({ type: 'person', owner: 'teal', group: 'reserve', id: 'teal-reserve-3' });
  await c.dispatch({ type: 'profession', profession: 'engineers' });
  await c.dispatch({ type: 'commit' });
  expect(get(c).presentation.view.players[0].engineers.map((p) => p.id)).toContain(
    'teal-reserve-3'
  );
  expect(get(c).presentation.view.players[0].reserve.map((p) => p.id)).toContain('teal-reserve-0');
  await c.dispatch({ type: 'person', owner: 'teal', group: 'soldiers', id: 'teal-soldier-1' });
  await c.dispatch({ type: 'person-operation', operation: 'upgrade' });
  await c.dispatch({ type: 'commit' });
  expect(get(c).presentation.view.players[0].soldiers.map((p) => p.value)).toEqual([1, 2]);
  expect(get(c).presentation.actions?.find((a) => a.id === 'upgrade')?.count).toBe(1);
});
it('supplies starting-hand validity through the same adapter, and retains chosen IDs through confirmation', async () => {
  const p = presentation();
  p.view.startingDominos = [...p.view.hand, ...p.view.market.slice(0, 2)];
  const c = createPresentationController(p, createFixtureAdapter({ latency: 0 }));
  expect(get(c).availability.startingKeep.enabled).toBe(false);
  for (const id of ['h0', 'h1', 'h2']) await c.dispatch({ type: 'toggle-starting', id });
  expect(get(c).availability.startingValue).toBe(4);
  expect(get(c).availability.startingKeep.enabled).toBe(true);
  await c.dispatch({ type: 'keep-starting', ids: get(c).interaction.startingIds });
  await c.dispatch({ type: 'commit' });
  expect(get(c).presentation.view.hand.map((d) => d.id)).toEqual(['h0', 'h1', 'h2']);
  expect(get(c).presentation.view.startingDominos).toBeUndefined();
});
