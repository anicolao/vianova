<script lang="ts">
  import ScoreSheet from './ScoreSheet.svelte';
  import CityBoard from './CityBoard.svelte';
  import type { Cell, ScoreRow, Focus } from '../presentation/types';
  let {
    rows,
    cells,
    open,
    focus = {},
    onToggle,
    onSelect
  }: {
    rows: ScoreRow[];
    cells: Cell[];
    open: boolean;
    focus?: Focus;
    onToggle: () => void;
    onSelect: (cell: Cell) => void;
  } = $props();
</script>

<section data-component="ScoringReview">
  {#if open}<p class="hint">Select a scoring tile to inspect its symbol and covered layer.</p>
    <CityBoard {cells} {focus} {onSelect} /><button class="control" onclick={onToggle}
      >Return to scores</button
    >{:else}<ScoreSheet {rows} onInspect={onToggle} />{/if}
</section>

<style>
  .hint {
    font-size: 12px;
    color: #9d9c7f;
    margin-bottom: 12px;
  }
  .control {
    margin-top: 10px;
    font-size: 11px;
  }
</style>
