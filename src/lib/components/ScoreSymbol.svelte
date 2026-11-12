<script lang="ts">
  import BuildingArt from './BuildingArt.svelte';
  import { scoreLabel, buildings, type Building, type ScoreMark } from '../presentation/types';
  let { mark }: { mark: ScoreMark } = $props();
  const targetBuilding = $derived(
    buildings.includes(mark.target as Building) ? (mark.target as Building) : null
  );
  const icons: Record<string, string> = {
    quarry: '⚒',
    market: '▤',
    temple: '▥',
    barracks: '⚔',
    library: '▧',
    arch: '∩',
    scroll: '▱',
    banner: '⚑',
    pairs: '▱⚑'
  };
</script>

<span
  class="score-symbol {mark.shape}"
  aria-label="{mark.shape}: {scoreLabel(mark)}"
  title="{mark.shape}: {scoreLabel(mark)}"
  ><b>{mark.multiplier}</b>{#if mark.target !== 'fixed'}<span class="divider">/</span
    >{#if targetBuilding}<span class="target-building"
        ><BuildingArt building={targetBuilding} /></span
      >{:else}<span class="target">{icons[mark.target]}</span>{/if}{/if}<span class="shape-mark"
    >{mark.shape === 'scroll' ? '▦' : '↔'}</span
  ></span
>

<style>
  .score-symbol {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: #fff6db;
    border: 1.5px solid #7b5d3e;
    color: #3d342a;
    height: 23px;
    padding: 0 5px;
    min-width: 30px;
    box-shadow: 0 1px 1px #0002;
    white-space: nowrap;
    font-family: 'Atkinson Hyperlegible', sans-serif;
    font-size: 13px;
    line-height: 1;
  }
  .scroll {
    border-inline: 4px double #9c7856;
    border-radius: 3px;
  }
  .banner {
    border-color: #475d66;
    border-bottom: 4px double #475d66;
    border-radius: 0 0 5px 5px;
  }
  .target {
    font-size: 13px;
  }
  .target-building {
    width: 14px;
    height: 13px;
    display: block;
    border: 1px solid #60614a;
    border-radius: 1px;
    overflow: hidden;
  }
  .divider {
    color: #998569;
    font-size: 10px;
  }
  .shape-mark {
    font-size: 10px;
    color: #6e7566;
    margin-left: 1px;
  }
</style>
