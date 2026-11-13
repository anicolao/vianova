<script lang="ts">
  let { entries }: { entries: string[] } = $props();
</script>

<details class="game-log" data-component="GameLog">
  <summary>Chronicle <span>{entries.length} entries</span></summary>
  <ol>
    {#each entries as entry}<li>{entry}</li>{/each}
  </ol>
</details>

<style>
  .game-log {
    border-top: 1px solid #536961;
    color: #c4cbb5;
    font-size: 10px;
  }
  .game-log summary {
    min-height: 44px;
    padding: 14px 4px;
    cursor: pointer;
  }
  .game-log summary span {
    float: right;
    color: #92a99a;
    font-size: 9px;
  }
  .game-log ol {
    margin: 0;
    padding: 0 10px 10px 22px;
    max-height: 130px;
    overflow: auto;
  }
  .game-log li {
    padding: 5px 0;
    line-height: 1.4;
  }
</style>
