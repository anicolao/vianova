<script lang="ts">
  import { gameArt } from '../presentation/art';
  import Domino from './Domino.svelte';
  import type { DominoData } from '../presentation/types';
  let {
    dominos,
    onKeep,
    onToggle,
    selectedIds = [],
    selectionValue = 0,
    canKeep = false,
    disabled = false
  }: {
    dominos: DominoData[];
    selectedIds?: string[];
    selectionValue?: number;
    canKeep?: boolean;
    disabled?: boolean;
    onToggle?: (id: string) => void;
    onKeep?: (ids: string[]) => void;
  } = $props();
</script>

<section
  class="starting-choice"
  style:--tray-art={`url("${gameArt('piece-tray')}")`}
  data-component="StartingChoice"
>
  <h3>Choose your starting hand</h3>
  <p>Keep a value of exactly 4. A marked domino counts as 2.</p>
  <div>
    {#each dominos as domino}<Domino
        {domino}
        {disabled}
        selected={selectedIds.includes(domino.id)}
        onclick={onToggle ? () => onToggle(domino.id) : undefined}
      />{/each}
  </div>
  <footer>
    <span aria-live="polite">Selection value <b>{selectionValue} / 4</b></span><button
      class="control primary"
      disabled={disabled || !onKeep || !canKeep}
      onclick={() => onKeep?.(selectedIds)}>Keep selection</button
    >
  </footer>
</section>

<style>
  .starting-choice {
    --tile-size: 96px;
    background: #fff4d7;
    border: 1px solid #ccb77f;
    border-radius: 8px;
    padding: 18px;
    color: #2b4541;
    min-width: 0;
    width: 100%;
  }
  .starting-choice h3 {
    font-size: 25px;
  }
  .starting-choice p {
    font-size: 11px;
    color: #707762;
    margin-top: 5px;
  }
  .starting-choice > div {
    display: flex;
    gap: 14px;
    overflow: auto;
    padding: 18px 5px;
  }
  .starting-choice footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
  }
  .starting-choice footer b {
    margin-left: 5px;
  }
  .starting-choice .control {
    font-size: 11px;
  }

  .starting-choice {
    background: var(--tray-art) center/100% 100% no-repeat;
    border: 0;
    padding: 30px 24px 22px;
    color: #2d3b32;
    border-radius: 7px;
    box-shadow:
      0 4px 0 #605139,
      0 7px 12px #0004;
  }
</style>
