<script lang="ts">
  import { tick } from 'svelte';
  import Tile from './Tile.svelte';
  import Population from './Population.svelte';
  import type { GamePresentation } from '../presentation/types';
  let {
    motions,
    surface
  }: { motions: GamePresentation['motions']; surface: HTMLElement | undefined } = $props();
  let positions = $state<{ id: string; x: number; y: number; scale: number; opacity: number }[]>(
    []
  );
  $effect(() => {
    const cues = motions;
    const root = surface;
    if (!root) {
      positions = [];
      return;
    }
    let cancelled = false;
    void tick().then(() => {
      if (cancelled) return;
      const box = root.getBoundingClientRect();
      positions = cues.flatMap((cue) => {
        const find = (anchor: string) =>
          Array.from(root.querySelectorAll<HTMLElement>('[data-anchor]'))
            .find((el) => el.dataset.anchor === anchor && el.getBoundingClientRect().width > 0)
            ?.getBoundingClientRect();
        const a = find(cue.from),
          b = find(cue.to);
        if (!a || !b) return [];
        const t = cue.progress,
          ease = t * t * (3 - 2 * t);
        return [
          {
            id: cue.id,
            x:
              a.left +
              a.width / 2 +
              (b.left + b.width / 2 - a.left - a.width / 2) * ease -
              box.left,
            y:
              a.top +
              a.height / 2 +
              (b.top + b.height / 2 - a.top - a.height / 2) * ease -
              box.top -
              Math.sin(t * Math.PI) * 48,
            scale: 1 + Math.sin(t * Math.PI) * 0.12,
            opacity: Math.min(1, t * 8, (1 - t) * 8)
          }
        ];
      });
    });
    return () => {
      cancelled = true;
    };
  });
</script>

<div class="motion-layer" aria-hidden="true" data-component="MotionLayer">
  {#each motions as cue}{@const pos = positions.find((p) => p.id === cue.id)}{#if pos}<div
        class="traveler"
        data-motion={cue.id}
        style:left="{pos.x}px"
        style:top="{pos.y}px"
        style:opacity={pos.opacity}
        style:transform="translate(-50%,-50%) scale({pos.scale})"
      >
        {#if cue.kind === 'person' && cue.person}<Population person={cue.person} />{:else}<Tile
            tile={cue.tile}
            back={!cue.tile}
          />{/if}<span>{cue.label}</span>
      </div>{/if}{/each}
</div>

<style>
  .motion-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    overflow: hidden;
    --tile-size: 96px;
  }
  .traveler {
    position: absolute;
    filter: drop-shadow(0 9px 9px #0005);
  }
  .traveler > span {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 7px;
    white-space: nowrap;
    font-size: 10px;
    background: #fff0c8;
    color: #233d3d;
    border: 1px solid #ad985c;
    border-radius: 4px;
    padding: 3px 7px;
  }
  .traveler :global(.person) {
    width: 45px;
    height: 53px;
  }
</style>
