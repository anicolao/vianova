<script lang="ts">
  import { getContext } from 'svelte';
  import { readable, type Readable } from 'svelte/store';
  import BuildingSymbol from './BuildingSymbol.svelte';
  import ScoreGlyph from './ScoreGlyph.svelte';
  import RegisteredLayer from './RegisteredLayer.svelte';
  import { gameArt } from '../presentation/art';
  import {
    registrationContext,
    shippedRegistration,
    type RegistrationBook,
    type LayerPlacement,
    type LayerPresentation,
    type TileRegistration
  } from '../presentation/tile-registration';
  import { scoreLabel, buildings, type Building, type ScoreMark } from '../presentation/types';
  let {
    mark,
    registration,
    canvas = false,
    layerPresentation
  }: {
    mark: ScoreMark;
    registration?: Pick<TileRegistration, 'score-material' | 'score-ink'>;
    canvas?: boolean;
    layerPresentation?: LayerPresentation;
  } = $props();
  const book =
    getContext<Readable<RegistrationBook>>(registrationContext) ?? readable(shippedRegistration);
  const targetBuilding = $derived(
    buildings.includes(mark.target as Building) ? (mark.target as Building) : null
  );
  const materialAsset = $derived(
    gameArt(mark.shape === 'banner' ? 'score-banner-v2' : 'score-scroll')
  );
  const source = $derived(
    registration ?? {
      'score-material': $book.scores[mark.shape].material,
      'score-ink': $book.scores[mark.shape].ink
    }
  );
  // Standalone plaques crop the same registered assembly to its material bounds.
  const normalize = (p: LayerPlacement, base: LayerPlacement): LayerPlacement => ({
    ...p,
    x: ((p.x - base.x) / base.width) * 100,
    y: ((p.y - base.y) / base.height) * 100,
    width: (p.width / base.width) * 100,
    height: (p.height / base.height) * 100
  });
  const material = $derived(
    canvas
      ? source['score-material']
      : { ...source['score-material'], x: 0, y: 0, width: 100, height: 100 }
  );
  const ink = $derived(
    canvas ? source['score-ink'] : normalize(source['score-ink'], source['score-material'])
  );
</script>

<span
  class="score-symbol {mark.shape}"
  class:tile-canvas={canvas}
  data-component="ScoreSymbol"
  aria-label="{mark.shape}: {scoreLabel(mark)}"
  title="{mark.shape}: {scoreLabel(mark)}"
>
  <RegisteredLayer id="score-material" placement={material} presentation={layerPresentation}>
    {#if mark.shape === 'banner'}{#if canvas}<span
          class="banner-ground"
          data-layer="banner-recess"
          aria-hidden="true"
        ></span>{/if}<img
        class="cloth-banner"
        data-layer="score-material"
        data-asset={materialAsset}
        src={materialAsset}
        alt=""
        draggable="false"
      />
    {:else}<span
        class="plaque"
        data-layer="score-material"
        data-asset={materialAsset}
        style:border-image-source={`url("${materialAsset}")`}
        aria-hidden="true"
      ></span>{/if}
  </RegisteredLayer>
  <RegisteredLayer id="score-ink" placement={ink} presentation={layerPresentation}>
    <svg class="score-ink" data-layer="score-ink" viewBox="0 0 76 28" aria-hidden="true">
      <text
        x={mark.target === 'fixed' ? 38 : 6}
        y="14.5"
        dominant-baseline="central"
        text-anchor="middle">{mark.multiplier}</text
      >
      {#if mark.target !== 'fixed'}<text
          class="divider"
          x="17"
          y="14.5"
          dominant-baseline="central"
          text-anchor="middle">/</text
        >
        <svg class="target" x="22" y="0" width="24" height="24" viewBox="0 0 32 32">
          {#if targetBuilding}<BuildingSymbol
              building={targetBuilding}
              colored
            />{:else if mark.target === 'scroll' || mark.target === 'banner' || mark.target === 'pairs'}<ScoreGlyph
              shape={mark.target}
            />{/if}
        </svg>
        <svg
          class="range"
          x="56"
          y="5"
          width="18"
          height="18"
          viewBox="0 0 30 30"
          data-scoring-range={mark.shape}
        >
          {#each [0, 1, 2] as y}{#each [0, 1, 2] as x}<rect
                x={x * 10 + 1}
                y={y * 10 + 1}
                width="8"
                height="8"
                fill={mark.shape === 'scroll' || x === 1 || y === 1 ? 'currentColor' : 'none'}
              />{/each}{/each}
        </svg>
      {/if}
    </svg>
  </RegisteredLayer>
</span>

<style>
  .score-symbol {
    position: relative;
    display: inline-block;
    width: 94px;
    height: 36px;
    color: #30251a;
    flex-shrink: 0;
    container-type: inline-size;
    transform-style: preserve-3d;
  }
  .tile-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .tile-canvas :global(.registered-layer) {
    pointer-events: auto;
  }
  .plaque {
    display: block;
    width: 100%;
    height: 100%;
    border: solid transparent;
    border-width: max(2px, 3cqw) max(6px, 8cqw);
    border-image-slice: 40 80 40 80 fill;
    border-image-repeat: stretch;
  }
  .banner-ground {
    position: absolute;
    inset: 0;
    background: #293e47;
    box-shadow: inset 0 1px 3px #0005;
  }
  .cloth-banner {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
  .score-ink {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    fill: currentColor;
  }
  text {
    font:
      700 18px 'Atkinson Hyperlegible',
      sans-serif;
  }
  .divider {
    font-size: 14px;
    font-weight: 400;
  }
</style>
