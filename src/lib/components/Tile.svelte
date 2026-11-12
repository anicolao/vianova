<script lang="ts">
  import BuildingArt from './BuildingArt.svelte';
  import ScoreSymbol from './ScoreSymbol.svelte';
  import { buildingInfo, scoreLabel, type TileData } from '../presentation/types';
  let {
    tile,
    back = false,
    selected = false,
    highlight = false,
    protectedArch = false,
    onclick
  }: {
    tile?: TileData;
    back?: boolean;
    selected?: boolean;
    highlight?: boolean;
    protectedArch?: boolean;
    onclick?: () => void;
  } = $props();
  const label = $derived(
    back
      ? 'Face-down tile'
      : tile
        ? `${buildingInfo[tile.building].name}${tile.start ? `, start ${tile.start}` : ''}${tile.arch ? `, ${tile.arch === '3' ? '3 actions' : '2 2 2 activation'}` : ''}${tile.score ? `, ${tile.score.shape}: ${scoreLabel(tile.score)}` : ''}${tile.plus ? ', stacked reward +' : ''}`
        : 'Empty reward space'
  );
</script>

{#snippet face()}
  {#if back}<span class="tile-back"><span>∩</span><small>VIA NOVA</small></span>
  {:else if tile}<BuildingArt building={tile.building} /><span class="tile-name"
      >{buildingInfo[tile.building].name}</span
    >{#if tile.start}<span class="start">{tile.start}</span>{/if}{#if tile.score}<span
        class="tile-score"><ScoreSymbol mark={tile.score} /></span
      >{/if}{#if tile.arch}<span class="arch-actions">{tile.arch === '3' ? '3' : '2 · 2 · 2'}</span
      >{/if}{#if tile.plus}<span class="plus">+</span
      >{/if}{#if protectedArch && tile.building === 'arch'}<span class="protected">Permanent</span
      >{/if}
  {:else}<span class="empty-tile">—</span>{/if}
{/snippet}
{#if onclick}<button
    class="tile"
    class:selected
    class:highlight
    class:starting={!!tile?.start}
    aria-label={label}
    aria-pressed={selected}
    {onclick}
    data-component="Tile"
    data-building={tile?.building}>{@render face()}</button
  >
{:else}<div
    class="tile"
    class:selected
    class:highlight
    class:starting={!!tile?.start}
    role="img"
    aria-label={label}
    data-component="Tile"
    data-building={back ? 'hidden' : tile?.building}
  >
    {@render face()}
  </div>{/if}

<style>
  .tile {
    width: var(--tile-size);
    height: var(--tile-size);
    flex-shrink: 0;
    position: relative;
    display: block;
    padding: 3px;
    background: #f9e9bc;
    border: 2px solid #323d38;
    border-radius: 7px;
    box-shadow:
      0 3px 0 #4b4b3f,
      0 4px 5px #0002;
    overflow: hidden;
    container-type: inline-size;
    color: #27382e;
  }
  .tile :global(svg) {
    border-radius: 2px;
  }
  .tile.selected {
    outline: 3px solid #f5cc66;
    outline-offset: 3px;
    box-shadow:
      0 0 0 6px #1b414c,
      0 5px 8px #0003;
  }
  .tile.highlight {
    outline: 3px solid #278f90;
    outline-offset: 1px;
    filter: brightness(1.12);
  }
  .starting {
    border-style: dotted;
  }
  .tile-name {
    position: absolute;
    top: 4px;
    left: 5px;
    right: 5px;
    text-align: center;
    text-transform: uppercase;
    font-size: clamp(6px, 10cqw, 10px);
    font-weight: 700;
    letter-spacing: 0.07em;
    text-shadow: 0 1px #fff9;
    background: #fff2ceaa;
    border-radius: 2px;
    line-height: 1.15;
    padding: 1px;
  }
  .tile-score {
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 96%;
  }
  .tile-score :global(.score-symbol) {
    height: clamp(16px, 25cqw, 23px);
    font-size: clamp(9px, 16cqw, 13px);
    gap: 2px;
    padding-inline: 3px;
  }
  .arch-actions {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    background: #eee4c7;
    border: 1px solid #403b42;
    border-radius: 2px;
    font-size: clamp(10px, 16cqw, 14px);
    font-weight: 700;
    padding: 1px 5px;
    white-space: nowrap;
  }
  .plus {
    position: absolute;
    top: 19px;
    right: 3px;
    background: #fff1c5;
    border: 1px solid #383f36;
    border-radius: 50%;
    width: 17px;
    height: 17px;
    font: bold 15px/15px sans-serif;
    text-align: center;
  }
  .start {
    position: absolute;
    bottom: 4px;
    left: 5px;
    font-size: 10px;
    background: #fff3c1;
    padding: 1px 3px;
    border-radius: 2px;
  }
  .protected {
    position: absolute;
    top: 20px;
    left: 4px;
    right: 4px;
    text-align: center;
    background: #382c4ed9;
    color: #fff2d7;
    font-size: 7px;
  }
  .tile-back {
    width: 100%;
    height: 100%;
    background: repeating-conic-gradient(#223e4a 0 25%, #2d4b57 0 50%) 0 0/12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #dfc078;
    border: 2px solid #cfb26e;
    gap: 3px;
  }
  .tile-back > span {
    font: 700 40px/0.8 Georgia;
  }
  .tile-back small {
    font-size: 7px;
    letter-spacing: 0.15em;
  }
  .empty-tile {
    display: grid;
    place-items: center;
    height: 100%;
    background: #dfd6c0;
    color: #7b776b;
  }
  .tile:hover:is(button) {
    filter: brightness(1.07);
  }
</style>
