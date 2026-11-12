<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { base } from '$app/paths';
  import GameSurface from '../components/GameSurface.svelte';
  import Tile from '../components/Tile.svelte';
  import { getScenario, sample, scenarios } from '../presentation/scenarios';
  import {
    buildingInfo,
    scoreLabel,
    type Cell,
    type Frame,
    type SceneView
  } from '../presentation/types';
  import type { ViewIntent } from '../presentation/intents';
  let { forceTabletop = false }: { forceTabletop?: boolean } = $props();
  let hydrated = $state(false);
  let interactionLocked = false;
  let playerCount = $state(4);
  let scenarioId = $state('place'),
    time = $state(0),
    reduced = $state(false),
    tabletopFlag = $state(false),
    embedded = $state(false),
    playing = $state(false);
  let selectedDomino = $state<string | null>(null),
    selectedCell = $state<string | null>(null),
    staged = $state<{ x: number; y: number } | null>(null),
    rotation = $state(0);
  let local = $state<SceneView | null>(null),
    notice = $state(''),
    inspected = $state<Cell | null>(null);
  let inspector: HTMLDialogElement;
  const tabletop = $derived(forceTabletop || tabletopFlag);
  const scenario = $derived(getScenario(scenarioId));
  const sampled = $derived(sample(scenario, time, reduced));
  const frame = $derived<Frame>({
    ...sampled,
    view: local ?? {
      ...sampled.view,
      players: sampled.view.players.slice(0, playerCount),
      areas: sampled.view.areas.map((a) => ({
        ...a,
        people: a.people.filter((p) =>
          sampled.view.players.slice(0, playerCount).some((player) => player.owner === p.owner)
        )
      })),
      scores: sampled.view.scores.slice(0, playerCount)
    },
    label: notice || sampled.label,
    detail: notice ? 'This selection is local to the component review.' : sampled.detail
  });
  function reset() {
    local = null;
    selectedDomino = null;
    selectedCell = null;
    staged = null;
    rotation = 0;
    notice = '';
    inspected = null;
  }
  function go(id: string) {
    scenarioId = getScenario(id).id;
    time = 0;
    reset();
    playing = true;
    window.parent !== window &&
      window.parent.postMessage({ type: 'vianova-scenario', id: scenarioId }, location.origin);
  }
  async function intent(i: ViewIntent) {
    if (window.parent !== window) {
      interactionLocked = true;
      window.parent.postMessage({ type: 'vianova-interaction' }, location.origin);
    }
    if (i.type === 'select-domino') {
      playing = false;
      selectedDomino = selectedDomino === i.id ? null : i.id;
      staged = null;
      notice = selectedDomino ? 'Choose a city space for this domino.' : '';
    } else if (i.type === 'stage') {
      if (!selectedDomino) {
        notice = 'Choose a domino in your hand first.';
        return;
      }
      staged = { x: i.x, y: i.y };
      notice = 'Review your placement';
    } else if (i.type === 'rotate') {
      rotation = (rotation + 1) % 4;
    } else if (i.type === 'cancel') {
      staged = null;
      selectedDomino = null;
      notice = 'Placement cancelled.';
    } else if (i.type === 'commit' && staged && selectedDomino) {
      const d = frame.view.hand.find((d) => d.id === selectedDomino);
      if (!d) return;
      const coords = [
        { x: staged.x, y: staged.y },
        { x: staged.x + (rotation % 2 === 0 ? 1 : 0), y: staged.y + (rotation % 2 ? 1 : 0) }
      ];
      if (coords.some((pos) => frame.view.city.some((c) => c.x === pos.x && c.y === pos.y))) {
        notice = 'That preview overlaps a building. Choose another space or rotate.';
        return;
      }
      local = structuredClone($state.snapshot(frame.view));
      coords.forEach((pos, j) =>
        local!.city.push({ ...pos, tile: d.tiles[rotation >= 2 ? 1 - j : j] })
      );
      local.hand = local.hand.filter((d) => d.id !== selectedDomino);
      local.players[0].handCount = local.hand.length;
      local.log.unshift('Aurelia placed the staged domino in this review.');
      notice = 'Domino placed. Matching actions will be supplied by the rules engine.';
      staged = null;
      selectedDomino = null;
    } else if (i.type === 'inspect-cell') {
      selectedCell = `${i.cell.x},${i.cell.y}`;
      inspected = i.cell;
      await tick();
      inspector.showModal();
    } else if (i.type === 'choose-action') {
      go(i.action);
    } else if (i.type === 'resolve' || i.type === 'select-reward') {
      go('resolve');
    } else if (i.type === 'take-market') {
      go('draw');
    } else if (i.type === 'draw') {
      go('blind-draw');
    } else if (i.type === 'person') {
      go(i.group === 'reserve' ? 'recruit' : 'upgrade');
    } else if (i.type === 'inspect-score') {
      go('scoring');
    }
  }
  onMount(() => {
    hydrated = true;
    const q = new URLSearchParams(location.search);
    const count = Number(q.get('players'));
    if ([2, 3, 4].includes(count)) playerCount = count;
    scenarioId = getScenario(q.get('scenario')).id;
    const t = Number(q.get('time'));
    time = Number.isFinite(t) ? Math.max(0, t) : 0;
    tabletopFlag = q.get('mode') === 'tabletop';
    embedded = q.get('embedded') === '1' && window.parent !== window;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = q.get('reduced') === '1' || media.matches;
    const updateMedia = () => {
      reduced = media.matches;
    };
    media.addEventListener('change', updateMedia);
    const receive = (e: MessageEvent) => {
      if (
        !embedded ||
        e.origin !== location.origin ||
        e.source !== window.parent ||
        e.data?.type !== 'vianova-frame'
      )
        return;
      if (
        !scenarios.some((s) => s.id === e.data.scenario) ||
        typeof e.data.time !== 'number' ||
        !Number.isFinite(e.data.time) ||
        typeof e.data.reduced !== 'boolean'
      )
        return;
      if (e.data.reset === true) interactionLocked = false;
      if (interactionLocked) return;
      if ([2, 3, 4].includes(e.data.players)) playerCount = e.data.players;
      scenarioId = e.data.scenario;
      time = Math.max(0, Math.min(scenario.duration, e.data.time));
      reduced = e.data.reduced;
      playing = false;
      reset();
    };
    window.addEventListener('message', receive);
    window.parent !== window &&
      window.parent.postMessage({ type: 'vianova-ready' }, location.origin);
    let raf = 0,
      last = 0;
    function advance(now: number) {
      if (playing) {
        time = Math.min(scenario.duration, time + (last ? (now - last) / 1000 : 0));
        if (time === scenario.duration) playing = false;
      }
      last = now;
      raf = requestAnimationFrame(advance);
    }
    raf = requestAnimationFrame(advance);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('message', receive);
      media.removeEventListener('change', updateMedia);
    };
  });
</script>

<svelte:head
  ><title>{tabletop ? 'Tabletop' : 'Personal screen'} review · Via Nova</title></svelte:head
>
{#if !embedded}<div class="review-bar">
    <a href="{base}/dev/animations/">← Animation lab</a><span>Review fixture · no rules engine</span
    ><button
      onclick={() => {
        reset();
        time = 0;
        playing = true;
      }}>Replay scene ↻</button
    >
  </div>{/if}
<div
  class="scene-root"
  inert={!hydrated}
  data-review-ready={hydrated}
  style:--surface-height={embedded ? '100svh' : 'calc(100svh - 54px)'}
>
  <GameSurface
    {frame}
    {tabletop}
    {selectedDomino}
    {selectedCell}
    {staged}
    {rotation}
    onIntent={intent}
  />
</div>
<dialog bind:this={inspector} onclose={() => (inspected = null)}>
  {#if inspected}<div class="cell-inspector">
      <div class="inspector-title">
        <div>
          <span class="eyebrow">City building · {inspected.x + 1}, {inspected.y + 1}</span>
          <h2>{buildingInfo[inspected.tile.building].name}</h2>
        </div>
        <button
          class="control"
          aria-label="Close building inspector"
          onclick={() => inspector.close()}>Close ×</button
        >
      </div>
      <div class="inspected-art"><Tile tile={inspected.tile} /></div>
      <p>{buildingInfo[inspected.tile.building].action}</p>
      {#if inspected.tile.score}<p>
          {inspected.tile.score.shape}: {scoreLabel(inspected.tile.score)}.<br />{inspected.tile
            .score.shape === 'scroll'
            ? 'Centered 3×3 neighborhood.'
            : 'Entire row and column, across gaps.'}
        </p>{/if}{#if inspected.covered}<p>
          Covered building: {buildingInfo[inspected.covered.building].name}. Only the top layer
          counts.
        </p>{/if}{#if inspected.tile.building === 'arch'}<p>
          Permanent: this building can never be covered.
        </p>{/if}
    </div>{/if}
</dialog>

<style>
  .scene-root {
    display: contents;
  }
  .review-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #efe1bf;
    color: #4b5c4d;
    padding: 9px 18px;
    font-size: 11px;
  }
  .review-bar a {
    font-weight: 700;
    text-decoration: none;
    min-height: 36px;
    display: flex;
    align-items: center;
  }
  .review-bar > span {
    font-size: 10px;
    color: #847c62;
  }
  .review-bar button {
    background: transparent;
    border: 1px solid #b9a66e;
    border-radius: 5px;
    min-height: 36px;
    padding: 5px 12px;
    font-size: 10px;
    color: #4b5c4d;
  }
  .cell-inspector {
    padding: 24px;
  }
  .inspector-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }
  .inspector-title h2 {
    font-size: 33px;
    margin-top: 6px;
  }
  .inspected-art {
    --tile-size: 180px;
    display: flex;
    justify-content: center;
    padding: 30px;
    background: #23414b;
    border-radius: 8px;
    margin: 20px 0;
  }
  .cell-inspector > p {
    font-size: 14px;
    color: #6d745f;
    padding-block: 5px;
  }
  @media (max-width: 600px) {
    .review-bar > span {
      display: none;
    }
  }
</style>
