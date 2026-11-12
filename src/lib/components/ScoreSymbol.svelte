<script lang="ts">
  import BuildingSymbol from './BuildingSymbol.svelte';
  import ScoreGlyph from './ScoreGlyph.svelte';
  import { gameArt } from '../presentation/art';
  import { scoreLabel, buildings, type Building, type ScoreMark } from '../presentation/types';
  let { mark }: { mark: ScoreMark } = $props();
  const targetBuilding = $derived(
    buildings.includes(mark.target as Building) ? (mark.target as Building) : null
  );
</script>

<span
  class="score-symbol {mark.shape}"
  data-component="ScoreSymbol"
  aria-label="{mark.shape}: {scoreLabel(mark)}"
  title="{mark.shape}: {scoreLabel(mark)}"
>
  <img
    class="plaque"
    data-layer="score-material"
    src={gameArt(`score-${mark.shape}`)}
    alt=""
    draggable="false"
  />
  <span class="score-ink"
    ><b>{mark.multiplier}</b>{#if mark.target !== 'fixed'}<span class="divider">/</span><span
        class="target"
      >
        {#if targetBuilding}<BuildingSymbol
            building={targetBuilding}
          />{:else if mark.target === 'scroll' || mark.target === 'banner' || mark.target === 'pairs'}<ScoreGlyph
            shape={mark.target}
          />{/if}
      </span><svg
        class="range"
        viewBox="0 0 30 30"
        aria-hidden="true"
        data-scoring-range={mark.shape}
      >
        {#each [0, 1, 2] as y}{#each [0, 1, 2] as x}<rect
              x={x * 10 + 1}
              y={y * 10 + 1}
              width="8"
              height="8"
              fill={mark.shape === 'scroll' || x === 1 || y === 1 ? 'currentColor' : 'none'}
            />{/each}{/each}
      </svg>{/if}</span
  >
</span>

<style>
  .score-symbol {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 94px;
    height: 36px;
    color: #30251a;
    flex-shrink: 0;
    isolation: isolate;
  }
  .plaque {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  .score-ink {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 2px 9px 5px;
  }
  b {
    font:
      700 19px/1 'Atkinson Hyperlegible',
      sans-serif;
  }
  .target {
    display: block;
    width: 24px;
    height: 24px;
  }
  .divider {
    font-size: 15px;
  }
  .range {
    width: 18px;
    height: 18px;
    margin-left: 1px;
  }
</style>
