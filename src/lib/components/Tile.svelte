<script lang="ts">
  import { getContext } from 'svelte';
  import { readable, type Readable } from 'svelte/store';
  import BuildingSymbol from './BuildingSymbol.svelte';
  import ActionValue from './ActionValue.svelte';
  import { gameArt } from '../presentation/art';
  import BuildingArt from './BuildingArt.svelte';
  import ScoreSymbol from './ScoreSymbol.svelte';
  import RegisteredLayer from './RegisteredLayer.svelte';
  import {
    presentLayers,
    registrationContext,
    shippedRegistration,
    tileRegistration,
    type RegistrationBook,
    type TileRegistration,
    type LayerPresentation
  } from '../presentation/tile-registration';
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
    onclick,
    registration,
    layerPresentation
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
    registration?: TileRegistration;
    layerPresentation?: LayerPresentation;
  } = $props();
  const book =
    getContext<Readable<RegistrationBook>>(registrationContext) ?? readable(shippedRegistration);
  const layout = $derived(registration ?? tileRegistration($book, tile, back));
  const faceLayers = $derived(presentLayers(tile, back, backKind, protectedArch));
  const inspection = $derived(
    layerPresentation ? { ...layerPresentation, order: faceLayers } : undefined
  );
  const label = $derived(
    back
      ? `Face-down ${backKind} tile`
      : tile
        ? `${buildingInfo[tile.building].name}${tile.start ? `, start ${tile.start}` : ''}${tile.arch ? `, ${tile.arch === '3' ? '3 actions' : '2 2 2 activation'}` : ''}${tile.score ? `, ${tile.score.shape}: ${scoreLabel(tile.score)}` : ''}${tile.plus ? ', stacked reward +' : ''}`
        : 'Empty reward space'
  );
</script>

{#snippet layer(id: keyof TileRegistration)}
  {#if id === 'artwork'}
    {#if back}<img
        class="back-art"
        src={gameArt('tile-back')}
        alt=""
        draggable="false"
      />{:else if tile}<BuildingArt building={tile.building} />{/if}
  {:else if id === 'building-symbol' && tile}<span
      class="building-emblem"
      data-layer="building-symbol"><BuildingSymbol building={tile.building} colored /></span
    >
  {:else if id === 'arch-value' && tile}<svg
      class="arch-actions"
      viewBox="0 0 76 22"
      aria-hidden="true"
      >{#each tile.arch === '3' ? [3] : [2, 2, 2] as value, i}
        <svg
          x={tile.arch === '3' ? 27 : 1 + i * 26}
          y="0"
          width="22"
          height="22"
          viewBox="0 0 24 24"
        >
          <ActionValue {value} />
        </svg>
      {/each}</svg
    >
  {:else if id === 'start-letter' && tile}<svg class="start" viewBox="0 0 22 18" aria-hidden="true"
      ><text x="11" y="9.5" dominant-baseline="central" text-anchor="middle">{tile.start}</text
      ></svg
    >
  {:else if id === 'start-arrow-top-right' || id === 'start-arrow-bottom-left'}<svg
      class="start-arrow"
      viewBox="0 0 18 18"
      aria-hidden="true"><path d="M1 9L17 1V17Z" fill="currentColor" /></svg
    >
  {:else if id === 'plus'}<span class="plus"
      ><svg viewBox="0 0 24 24" aria-hidden="true"
        ><text x="12" y="12.5" dominant-baseline="central" text-anchor="middle">+</text></svg
      ></span
    >
  {:else if id === 'protected'}<svg class="protected" viewBox="0 0 88 18" aria-hidden="true"
      ><text x="44" y="9.5" dominant-baseline="central" text-anchor="middle">Permanent</text></svg
    >
  {:else if id === 'back-mark'}<span class="back-mark"
      >{#if backKind.startsWith('start-')}<svg viewBox="0 0 50 50" aria-hidden="true"
          ><text x="25" y="25.5" dominant-baseline="central" text-anchor="middle"
            >{backKind.slice(-1)}</text
          ></svg
        >{:else}<BuildingSymbol
          building={backKind === 'battle' ? 'barracks' : 'library'}
        />{/if}</span
    >{/if}
{/snippet}
{#snippet registered(id: keyof TileRegistration)}<RegisteredLayer
    {id}
    placement={layout[id]}
    presentation={inspection}>{@render layer(id)}</RegisteredLayer
  >{/snippet}
{#snippet face()}
  {#if back || tile}{#each faceLayers as id}
      {#if id === 'score-material' && tile?.score}<ScoreSymbol
          mark={tile.score}
          registration={layout}
          canvas
          layerPresentation={inspection}
        />
      {:else if id !== 'score-ink'}{@render registered(id)}{/if}
    {/each}{:else}<span class="empty-tile">—</span>{/if}
{/snippet}
{#if onclick}<button
    class="tile"
    class:selected
    class:highlight
    class:starting={!!tile?.start}
    class:separated={!!layerPresentation?.separation}
    aria-label={label}
    aria-pressed={selected}
    {disabled}
    title={reason}
    {onclick}
    data-tile-id={tile?.id}
    data-component="Tile"
    data-building={back ? 'hidden' : tile?.building}>{@render face()}</button
  >
{:else}<div
    class="tile"
    class:selected
    class:highlight
    class:starting={!!tile?.start}
    class:separated={!!layerPresentation?.separation}
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
    transform-style: preserve-3d;
  }
  .tile.separated {
    overflow: visible;
  }
  .tile :global(.building-art),
  .back-art {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 4%;
  }
  .building-emblem {
    width: 100%;
    height: 100%;
    display: block;
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
  .arch-actions,
  .start,
  .start-arrow {
    display: block;
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
  .start text {
    font:
      700 18px 'Atkinson Hyperlegible',
      sans-serif;
  }
  .plus {
    background: #fff4ce;
    border: 2px solid #3d3021;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    font: bold max(18px, 24cqw) / 1 sans-serif;
  }
  .protected {
    width: 100%;
    text-align: center;
    background: #eee3c9e8;
    color: #302731;
    font-size: 12px;
    font-weight: 700;
  }
  .back-mark {
    width: 100%;
    height: 100%;
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
  .plus svg,
  .back-mark svg {
    width: 100%;
    height: 100%;
    display: block;
    fill: currentColor;
  }
  .plus text {
    font:
      700 24px 'Atkinson Hyperlegible',
      sans-serif;
  }
  .back-mark text {
    font:
      700 28px Georgia,
      serif;
  }
  .protected {
    height: 100%;
    display: block;
    fill: currentColor;
  }
  .protected text {
    font:
      700 14px 'Atkinson Hyperlegible',
      sans-serif;
  }
</style>
