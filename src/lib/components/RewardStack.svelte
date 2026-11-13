<script lang="ts">
  import Tile from './Tile.svelte';
  import type { Reward } from '../presentation/types';
  let {
    reward,
    selected = false,
    disabled = false,
    reason,
    onclick
  }: {
    reward: Reward;
    selected?: boolean;
    disabled?: boolean;
    reason?: string;
    onclick?: () => void;
  } = $props();
</script>

{#snippet stack()}<span class="stack-tiles"
    >{#each reward.tiles as tile, i}<span
        style:margin-top={i > 0 ? '-48%' : '0'}
        style:z-index={reward.tiles.length - i}><Tile {tile} /></span
      >{/each}</span
  >{#if reward.tiles.length > 1}<span class="stack-label">Take both</span>{/if}{/snippet}
{#if onclick}<button
    class="reward"
    class:selected
    aria-label="Reward: {reward.tiles.map((t) => t.building).join(' and ')}{reward.tiles.length > 1
      ? ', take both'
      : ''}"
    {disabled}
    title={reason}
    {onclick}
    data-reward-id={reward.id}
    data-component="RewardStack">{@render stack()}</button
  >{:else}<div
    class="reward"
    class:selected
    data-reward-id={reward.id}
    data-component="RewardStack"
  >
    {@render stack()}
  </div>{/if}

<style>
  .reward {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0 5px;
    border: 0;
    background: transparent;
    gap: 5px;
    color: #223e46;
  }
  .stack-tiles {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stack-tiles > span {
    display: block;
    position: relative;
  }
  .reward.selected {
    outline: 3px solid #dfb85c;
    outline-offset: 5px;
    border-radius: 5px;
  }
  .stack-label {
    font-size: 9px;
    letter-spacing: 0.04em;
    font-weight: 700;
    text-transform: uppercase;
    background: #f6e3ad;
    border-radius: 3px;
    padding: 2px 5px;
  }
</style>
