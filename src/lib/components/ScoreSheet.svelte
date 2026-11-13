<script lang="ts">
  import type { ScoreRow } from '../presentation/types';
  let { rows, onInspect }: { rows: ScoreRow[]; onInspect?: () => void } = $props();
</script>

<section class="score-sheet" data-component="ScoreSheet">
  <span class="eyebrow">The city you built</span>
  <h2>A city worthy of Rome</h2>
  <p>Review every visible scroll and banner.</p>
  <table>
    <thead><tr><th>Player</th><th>Scrolls</th><th>Banners</th><th>Total</th></tr></thead><tbody
      >{#each rows as row}<tr
          ><th>{row.name}</th><td>{row.scrolls}</td><td>{row.banners}</td><td
            ><b>{row.scrolls + row.banners}</b></td
          ></tr
        >{/each}</tbody
    >
  </table>
  <p class="tie-note">Ties: population on the player board, then shared victory.</p>
  {#if onInspect}<button class="control" onclick={onInspect}>Inspect scoring tiles</button>{/if}
</section>

<style>
  .score-sheet {
    background: #fff2d1;
    border: 1px solid #c4a363;
    border-radius: 8px;
    padding: 24px;
    color: #29423c;
    text-align: center;
  }
  .score-sheet .eyebrow {
    color: #90713a;
  }
  .score-sheet h2 {
    font-size: 32px;
    margin: 8px 0;
  }
  .score-sheet > p {
    font-size: 12px;
    color: #707664;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    text-align: left;
  }
  th,
  td {
    padding: 11px 8px;
    border-bottom: 1px solid #d6c496;
    font-size: 13px;
  }
  thead th {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7e7c62;
  }
  td b {
    font-size: 20px;
  }
  .tie-note {
    font-size: 10px !important;
  }
  .control {
    margin-top: 16px;
    font-size: 11px;
  }
</style>
