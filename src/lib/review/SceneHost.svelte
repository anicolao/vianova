<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import GamePresenter from '../components/GamePresenter.svelte';
  import { createPresentationController } from '../presentation/controller';
  import { getScenario, sample, scenarios } from './scenarios';
  import { createFixtureAdapter, reviewPresentation } from './fixture-adapter';
  let { forceTabletop = false }: { forceTabletop?: boolean } = $props();
  let hydrated = $state(false),
    embedded = $state(false),
    tabletopFlag = $state(false),
    scenarioId = $state('place'),
    time = $state(0),
    reduced = $state(false),
    playerCount = $state(4),
    playing = $state(false),
    direct = $state(false);
  let interactionLocked = false;
  let cityMode = 'standard';
  let rejectionArmed = $state(false);
  const tabletop = $derived(forceTabletop || tabletopFlag),
    scenario = $derived(getScenario(scenarioId));
  const adapter = createFixtureAdapter();
  const controller = createPresentationController(
    reviewPresentation(sample(getScenario('place'), 0)),
    adapter
  );
  function present() {
    const p = reviewPresentation(sample(getScenario(scenarioId), time, reduced), playerCount);
    if (cityMode === 'empty') p.view.city = [];
    else if (cityMode === 'signed')
      p.view.city = p.view.city.map((cell) => ({ ...cell, x: cell.x - 2, y: cell.y - 1 }));
    controller.replace(p);
  }
  function reset() {
    playing = false;
    direct = false;
    interactionLocked = false;
    time = 0;
    present();
  }
  function interact() {
    playing = false;
    direct = true;
    interactionLocked = true;
    if (embedded) window.parent.postMessage({ type: 'vianova-interaction' }, location.origin);
  }
  // The exact shared controller/presenter handles direct input; observing it only pauses the review clock.

  const forward = {
    subscribe: controller.subscribe,
    replace: controller.replace,
    destroy: controller.destroy,
    dispatch: async (intent: import('../presentation/intents').ViewIntent) => {
      interact();
      if (intent.type === 'commit') rejectionArmed = false;
      await controller.dispatch(intent);
    }
  };
  onMount(() => {
    const q = new URLSearchParams(location.search);
    cityMode = q.get('city') ?? 'standard';
    scenarioId = getScenario(q.get('scenario')).id;
    const count = Number(q.get('players'));
    if ([2, 3, 4].includes(count)) playerCount = count;
    time = Math.max(0, Number(q.get('time')) || 0);
    tabletopFlag = q.get('mode') === 'tabletop';
    embedded = q.get('embedded') === '1' && window.parent !== window;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = q.get('reduced') === '1' || media.matches;
    const update = () => {
      reduced = media.matches;
      if (!direct) present();
    };
    media.addEventListener('change', update);
    present();
    hydrated = true;
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
      if (e.data.reset === true) {
        interactionLocked = false;
        direct = false;
      }
      if (interactionLocked) return;
      scenarioId = e.data.scenario;
      time = Math.max(0, Math.min(scenario.duration, e.data.time));
      reduced = e.data.reduced;
      if ([2, 3, 4].includes(e.data.players)) playerCount = e.data.players;
      playing = false;
      present();
    };
    window.addEventListener('message', receive);
    if (embedded) window.parent.postMessage({ type: 'vianova-ready' }, location.origin);
    let raf = 0,
      last = 0;
    function advance(now: number) {
      if (playing) {
        time = Math.min(scenario.duration, time + (last ? (now - last) / 1000 : 0));
        present();
        if (time === scenario.duration) playing = false;
      }
      last = now;
      raf = requestAnimationFrame(advance);
    }
    raf = requestAnimationFrame(advance);
    return () => {
      cancelAnimationFrame(raf);
      controller.destroy();
      window.removeEventListener('message', receive);
      media.removeEventListener('change', update);
    };
  });
</script>

<svelte:head
  ><title>{tabletop ? 'Tabletop' : 'Personal screen'} review · Via Nova</title></svelte:head
>
{#if !embedded}<div class="review-bar">
    <a href="{base}/dev/animations/">← Animation lab</a><span
      >{direct
        ? 'Direct interaction · simulated outcomes'
        : 'Prepared study · simulated outcomes'}</span
    ><button onclick={reset}>Reset fixture</button><button
      onclick={() => {
        reset();
        playing = true;
      }}>Play prepared study ↻</button
    ><button
      disabled={$controller.pending}
      onclick={() => {
        adapter.rejectNext();
        rejectionArmed = true;
      }}>{rejectionArmed ? 'Next confirmation rejects once' : 'Simulate next rejection'}</button
    >
  </div>{/if}
<div
  class="scene-root"
  inert={!hydrated}
  data-review-ready={hydrated}
  data-study-beat={sample(scenario, time, reduced).beat}
  data-interaction-mode={direct ? 'direct' : 'study'}
  style:--surface-height={embedded ? '100svh' : 'calc(100svh - 54px)'}
>
  <GamePresenter controller={forward} {tabletop} />
</div>

<style>
  .scene-root {
    display: contents;
  }
  .review-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
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
  @media (max-width: 600px) {
    .review-bar > span {
      display: none;
    }
  }
</style>
