<script lang="ts">
  import BuildingSymbol from './BuildingSymbol.svelte';
  import { gameArt } from '../presentation/art';
  import BuildingArt from './BuildingArt.svelte';
  import ScoreSymbol from './ScoreSymbol.svelte';
  import { buildingInfo, scoreLabel, type TileData } from '../presentation/types';
  let {
    tile,
    back = false,
    backKind = 'domino',
    selected = false,
    highlight = false,
    protectedArch = false,
    disabled = false,
    reason,
    onclick
  }: {
    tile?: TileData;
    back?: boolean;
    backKind?: string;
    selected?: boolean;
    highlight?: boolean;
    protectedArch?: boolean;
    disabled?: boolean;
    reason?: string;
    onclick?: () => void;
  } = $props();
  const label = $derived(
    back
      ? `Face-down ${backKind} tile`
      : tile
        ? `${buildingInfo[tile.building].name}${tile.start ? `, start ${tile.start}` : ''}${tile.arch ? `, ${tile.arch === '3' ? '3 actions' : '2 2 2 activation'}` : ''}${tile.score ? `, ${tile.score.shape}: ${scoreLabel(tile.score)}` : ''}${tile.plus ? ', stacked reward +' : ''}`
        : 'Empty reward space'
  );
</script>

{#snippet face()}
  {#if back}<span class="tile-back"
      ><img src={gameArt('tile-back')} alt="" draggable="false" />{#if backKind !== 'domino'}<span
          class="back-mark"
          >{#if backKind.startsWith('start-')}{backKind.slice(-1)}{:else}<BuildingSymbol
              building={backKind === 'battle' ? 'barracks' : 'library'}
            />{/if}</span
        >{/if}</span
    >
  {:else if tile}<BuildingArt building={tile.building} /><span
      class="building-emblem"
      data-layer="building-symbol"><BuildingSymbol building={tile.building} /></span
    ><span class="tile-name">{buildingInfo[tile.building].name}</span>{#if tile.start}<span
        class="start">{tile.start}</span
      >{/if}{#if tile.startCorner}<span class="start-arrow {tile.startCorner}" aria-hidden="true"
        >◀</span
      >{/if}{#if tile.score}<span class="tile-score"><ScoreSymbol mark={tile.score} /></span
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
    {disabled}
    title={reason}
    {onclick}
    data-tile-id={tile?.id}
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
    data-tile-id={tile?.id}
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
    padding: 0;
    background: #e5d2a3;
    border: 0;
    border-radius: 4%;
    box-shadow:
      0 3px 0 #66513a,
      0 5px 7px #0006;
    overflow: hidden;
    container-type: inline-size;
    color: #30251a;
  }
  .tile :global(.building-art) {
    border-radius: inherit;
  }
  .building-emblem {
    position: absolute;
    top: 5%;
    left: 5%;
    width: 26%;
    height: 26%;
    padding: 1%;
    color: #2b231b;
  }
  .tile.selected {
    outline: 3px solid #f5cc66;
    outline-offset: 3px;
    box-shadow:
      0 0 0 6px #173d47,
      0 5px 8px #0005;
  }
  .tile.highlight {
    outline: 3px dashed #fff0a5;
    outline-offset: 1px;
  }
  .tile-name {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .tile-score {
    position: absolute;
    bottom: 1%;
    left: 50%;
    transform: translateX(-50%);
  }
  .tile-score :global(.score-symbol) {
    width: 94cqw;
    height: 34cqw;
    min-height: 30px;
  }
  .tile-score :global(.target) {
    width: max(24px, 24cqw);
    height: max(24px, 24cqw);
  }
  .tile-score :global(b) {
    font-size: max(16px, 19cqw);
  }
  .tile-score :global(.range) {
    width: max(18px, 18cqw);
    height: max(18px, 18cqw);
  }
  .arch-actions {
    position: absolute;
    bottom: 4%;
    left: 50%;
    transform: translateX(-50%);
    font:
      700 max(16px, 19cqw) / 1.2 'Atkinson Hyperlegible',
      sans-serif;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }
  .plus {
    position: absolute;
    top: 4%;
    right: 5%;
    background: #fff4ce;
    color: #261e15;
    border: 2px solid #3d3021;
    width: 25%;
    height: 25%;
    display: grid;
    place-items: center;
    font: bold max(18px, 24cqw) / 1 sans-serif;
  }
  .start {
    position: absolute;
    bottom: 5%;
    left: 42%;
    font-size: max(16px, 18cqw);
    font-weight: 700;
  }
  .start-arrow {
    position: absolute;
    font-size: 19px;
    color: #201c18;
  }
  .top-right {
    top: 2%;
    right: 2%;
    transform: rotate(135deg);
  }
  .bottom-left {
    bottom: 2%;
    left: 2%;
    transform: rotate(-45deg);
  }
  .protected {
    position: absolute;
    top: 36%;
    left: 6%;
    right: 6%;
    text-align: center;
    background: #eee3c9e8;
    color: #302731;
    font-size: 12px;
    font-weight: 700;
  }
  .tile-back,
  .tile-back img {
    display: block;
    width: 100%;
    height: 100%;
  }
  .back-mark {
    position: absolute;
    inset: 24%;
    background: #f3e5c3;
    border: 2px solid #9d793d;
    display: grid;
    place-items: center;
    font:
      700 28cqw/1 Georgia,
      serif;
  }
  .empty-tile {
    display: grid;
    place-items: center;
    height: 100%;
    background: #dfd6c0;
    color: #7b776b;
  }
  button.tile:hover {
    filter: brightness(1.08);
  }
</style>
