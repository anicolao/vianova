<script lang="ts">
  import Tile from './Tile.svelte';
  import type { DominoData } from '../presentation/types';
  let {
    domino,
    back = false,
    vertical = false,
    selected = false,
    onclick
  }: {
    domino?: DominoData;
    back?: boolean;
    vertical?: boolean;
    selected?: boolean;
    onclick?: () => void;
  } = $props();
</script>

{#snippet faces()}<Tile tile={domino?.tiles[0]} {back} /><Tile
    tile={domino?.tiles[1]}
    {back}
  />{#if domino?.double && !back}<span
      class="double"
      title="Costs 2 actions from the market"
      aria-label="Double-domino marked">Ⅱ</span
    >{/if}{/snippet}
{#if onclick}<button
    class="domino"
    class:vertical
    class:selected
    aria-label={back
      ? 'Face-down domino'
      : `${domino?.tiles[0].building} / ${domino?.tiles[1].building}${domino?.double ? ' · costs 2 market actions' : ''}`}
    aria-pressed={selected}
    {onclick}
    data-component="Domino">{@render faces()}</button
  >{:else}<div class="domino" class:vertical class:selected data-component="Domino">
    {@render faces()}
  </div>{/if}

<style>
  .domino {
    position: relative;
    display: inline-flex;
    gap: 1px;
    padding: 3px;
    background: #edd8a1;
    border: 2px solid #a58550;
    border-radius: 10px;
    box-shadow: 0 3px 0 #6d634e;
    color: inherit;
    flex-shrink: 0;
  }
  .domino :global(.tile) {
    border-width: 1px;
    box-shadow: none;
    border-radius: 4px;
  }
  .vertical {
    flex-direction: column;
  }
  .selected {
    outline: 3px solid #e6bf63;
    outline-offset: 3px;
  }
  .double {
    position: absolute;
    z-index: 1;
    top: -8px;
    left: calc(50% - 11px);
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
    border: 2px solid #41545a;
    background: #fff4ce;
    border-radius: 50%;
    color: #263f4a;
  }
  button.domino:hover {
    border-color: #295e68;
  }
</style>
