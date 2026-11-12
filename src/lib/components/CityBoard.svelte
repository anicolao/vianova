<script lang="ts">
  import Tile from './Tile.svelte';
  import { cityGeometry, placementGhost } from '../presentation/geometry';
  import {
    cellKey,
    type Cell,
    type Focus,
    type DominoData,
    type TileData
  } from '../presentation/types';
  let {
    cells,
    focus = {},
    selected,
    staged,
    rotation = 0,
    onSelect,
    onPlace,
    compact = false,
    anchorPrefix = 'city',
    archTile,
    disabled = false
  }: {
    cells: Cell[];
    focus?: Focus;
    selected?: string | null;
    staged?: { x: number; y: number; domino?: DominoData } | null;
    rotation?: number;
    onSelect?: (cell: Cell) => void;
    onPlace?: (x: number, y: number) => void;
    compact?: boolean;
    anchorPrefix?: string;
    archTile?: TileData;
    disabled?: boolean;
  } = $props();
  let zoom = $state(1);
  const ghosts = $derived(placementGhost(staged?.domino, archTile, staged ?? null, rotation));
  const geometry = $derived(cityGeometry(cells, ghosts, !!onPlace));
  const width = $derived(geometry.width);
  const coords = $derived(geometry.coords);
  const map = $derived(new Map(cells.map((c) => [cellKey(c.x, c.y), c])));
  const previews = $derived(new Map(ghosts.map((c) => [cellKey(c.x, c.y), c.tile])));
</script>

<section class="city-board" class:compact data-component="CityBoard" aria-label="City grid">
  {#if !compact}<div class="city-tools">
      <span class="eyebrow">Your city <span class="city-size">{cells.length} buildings</span></span
      ><label
        >Zoom <input
          aria-label="City zoom"
          type="range"
          min="1"
          max="1.8"
          step="0.1"
          bind:value={zoom}
        /></label
      >
    </div>{/if}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable region must be reachable for keyboard panning.) -->
  <div class="city-scroll" role="region" tabindex="0" aria-label="Pan city grid">
    <div
      class="city-grid"
      style:grid-template-columns="repeat({width}, var(--city-tile))"
      style:--city-tile="calc(var(--tile-size) * {zoom})"
    >
      {#each coords as { x, y }}
        {@const key = cellKey(x, y)}{@const cell = map.get(key)}{@const preview = previews.get(key)}
        <div
          class="cell"
          class:focused={focus.cells?.includes(key)}
          class:matching={focus.matches?.includes(key)}
          class:origin={focus.origin === key}
          class:covered={!!cell?.covered}
          data-anchor="{anchorPrefix}-{key}"
          data-cell={key}
        >
          {#if cell}<Tile
              tile={cell.tile}
              selected={selected === key}
              highlight={focus.matches?.includes(key)}
              protectedArch={!!staged}
              {disabled}
              onclick={onSelect ? () => onSelect(cell) : undefined}
            />{#if cell.covered}<span class="layers" aria-label="One covered building"
                >2 layers</span
              >{/if}
          {:else if preview}<div class="ghost"><Tile tile={preview} /></div>
          {:else if onPlace}<button
              class="empty-cell"
              {disabled}
              aria-label="Stage tile at x {x}, y {y}"
              onclick={() => onPlace(x, y)}><span>+</span></button
            >
          {:else}<div class="empty-cell" aria-hidden="true"><span>·</span></div>{/if}
        </div>
      {/each}
    </div>
  </div>
  {#if focus.scoring}<p class="footprint">
      {focus.scoring === 'scroll' ? 'Scroll · centered 3 × 3' : 'Banner · complete row + column'}
      <span>Including this tile</span>
    </p>{/if}
</section>

<style>
  .city-board {
    min-width: 0;
    --tile-size: 104px;
  }
  .city-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 0 14px;
  }
  .city-size {
    letter-spacing: 0;
    text-transform: none;
    font-weight: 400;
    font-size: 10px;
    margin-left: 10px;
    color: #8b958c;
  }
  .city-tools label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #71837d;
  }
  .city-tools input {
    width: 70px;
    accent-color: #c5a65b;
    min-height: 32px;
  }
  .city-scroll {
    overflow: auto;
    max-width: 100%;
    padding: 6px 8px 12px;
    scrollbar-width: thin;
    scrollbar-color: #9e9c82 transparent;
  }
  .city-grid {
    display: grid;
    gap: 5px;
    width: max-content;
    padding: 9px;
    background: #122e35;
    border: 1px solid #63736b;
    border-radius: 6px;
    box-shadow: inset 0 0 0 4px #253f43;
  }
  .cell {
    --tile-size: var(--city-tile);
    position: relative;
    width: var(--city-tile);
    height: var(--city-tile);
    border-radius: 6px;
  }
  .empty-cell {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    background: #1b363c;
    border: 1px dashed #6d80734d;
    color: #778e8066;
    border-radius: 5px;
    padding: 0;
    font-size: 21px;
  }
  .empty-cell:is(button):hover {
    color: #f0d392;
    background: #375257;
    border-color: #c7b075;
  }
  .focused {
    box-shadow: 0 0 0 3px #e6c572;
    z-index: 1;
  }
  .focused:after {
    content: '';
    position: absolute;
    inset: 0;
    background: #f3cb5725;
    pointer-events: none;
    border-radius: 4px;
  }
  .origin {
    box-shadow: 0 0 0 4px #fff1ba;
    z-index: 2;
  }
  .matching {
    z-index: 2;
  }
  .layers {
    position: absolute;
    right: 1px;
    bottom: -6px;
    font-size: 8px;
    letter-spacing: 0.03em;
    background: #1d3c46;
    color: #ffe9b6;
    border: 1px solid #cfb16a;
    padding: 1px 4px;
    border-radius: 3px;
  }
  .ghost {
    opacity: 0.65;
    outline: 2px dashed #f0d289;
    outline-offset: 1px;
  }
  .footprint {
    font-size: 12px;
    color: #ecd395;
    padding: 8px;
  }
  .footprint span {
    font-size: 10px;
    color: #a8bab0;
    margin-left: 10px;
  }
  .compact {
    --tile-size: 104px;
  }
  .compact .city-grid {
    gap: 4px;
    padding: 6px;
  }
  .compact .city-scroll {
    padding: 4px;
  }
  .compact :global(.tile-name) {
    font-size: 6px;
  }
  @media (max-width: 600px) {
    .city-board {
      --tile-size: 104px;
    }
    .city-size {
      display: none;
    }
    .city-tools {
      padding: 0 4px 7px;
    }
    .city-tools label {
      font-size: 10px;
    }
    .compact {
      --tile-size: 104px;
    }
  }
  @media (min-width: 1800px) {
    .city-board:not(.compact) {
      --tile-size: 104px;
    }
  }
</style>
