<script lang="ts">
  import Tile from './Tile.svelte';
  let {
    kind,
    count,
    onclick
  }: { kind: 'dominos' | 'battle' | 'invention'; count: number; onclick?: () => void } = $props();
</script>

<div class="supply" data-component="SupplyDeck" data-anchor="supply-{kind}">
  <div class="deck">
    <Tile back {onclick} /><span class="deck-count" class:empty={count === 0}>{count}</span>
  </div>
  <span class="deck-label"
    >{kind === 'dominos'
      ? 'Domino stack'
      : kind === 'battle'
        ? 'Battle rebuilds'
        : 'Invention rebuilds'}</span
  >
</div>

<style>
  .supply {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    --tile-size: 51px;
  }
  .deck {
    position: relative;
    box-shadow:
      3px -3px 0 #d0b98e,
      5px -5px 0 #5b6258;
    border-radius: 7px;
  }
  .deck-count {
    position: absolute;
    bottom: -6px;
    right: -8px;
    border-radius: 12px;
    background: #f3dfaa;
    border: 1px solid #727659;
    min-width: 27px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: #31483e;
    padding: 2px 5px;
  }
  .deck-count.empty {
    background: #b45b4b;
    color: #fff9e7;
  }
  .deck-label {
    font-size: 9px;
    color: inherit;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
</style>
