<script lang="ts">
  import Domino from './Domino.svelte';
  import type { DominoData } from '../presentation/types';
  let { dominos, onKeep }: { dominos: DominoData[]; onKeep?: (ids: string[]) => void } = $props();
  let chosen = $state<string[]>([]);
  const value = $derived(
    dominos.filter((d) => chosen.includes(d.id)).reduce((n, d) => n + (d.double ? 2 : 1), 0)
  );
</script>

<section class="starting-choice" data-component="StartingChoice">
  <h3>Choose your starting hand</h3>
  <p>Keep a value of exactly 4. A marked domino counts as 2.</p>
  <div>
    {#each dominos as domino}<Domino
        {domino}
        selected={chosen.includes(domino.id)}
        onclick={() =>
          (chosen = chosen.includes(domino.id)
            ? chosen.filter((id) => id !== domino.id)
            : [...chosen, domino.id])}
      />{/each}
  </div>
  <footer>
    <span aria-live="polite">Selection value <b>{value} / 4</b></span><button
      class="control primary"
      disabled={value !== 4}
      onclick={() => onKeep?.(chosen)}>Keep selection</button
    >
  </footer>
</section>

<style>
  .starting-choice {
    --tile-size: 48px;
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
</style>
