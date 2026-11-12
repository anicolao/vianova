<script lang="ts">
  import { tick } from 'svelte';
  import Tile from './Tile.svelte';
  import { buildingInfo, scoreLabel, type Cell } from '../presentation/types';
  let { cell, onClose }: { cell: Cell | null; onClose: () => void } = $props();
  let dialog: HTMLDialogElement;
  let trigger: HTMLElement | null = null;
  $effect(() => {
    if (!dialog) return;
    if (cell && !dialog.open) {
      trigger = document.activeElement as HTMLElement;
      dialog.showModal();
    } else if (!cell && dialog.open) dialog.close();
  });
  function close() {
    onClose();
    void tick().then(() => trigger?.isConnected && trigger.focus());
  }
</script>

<dialog
  bind:this={dialog}
  data-component="BuildingInspector"
  aria-label="Building inspector"
  oncancel={(event) => {
    event.preventDefault();
    close();
  }}
>
  {#if cell}<div class="cell-inspector">
      <div class="inspector-title">
        <div>
          <span class="eyebrow">City building · ({cell.x}, {cell.y})</span>
          <h2>{buildingInfo[cell.tile.building].name}</h2>
        </div>
        <button class="control" aria-label="Close building inspector" onclick={close}
          >Close ×</button
        >
      </div>
      <div class="inspected-art"><Tile tile={cell.tile} /></div>
      <p>{buildingInfo[cell.tile.building].action}</p>
      {#if cell.tile.score}<p>
          {cell.tile.score.shape}: {scoreLabel(cell.tile.score)}.<br />{cell.tile.score.shape ===
          'scroll'
            ? 'Centered 3×3 neighborhood.'
            : 'Entire row and column, across gaps.'}
        </p>{/if}{#if cell.covered}<p>
          Covered building: {buildingInfo[cell.covered.building].name}. Only the top layer counts.
        </p>{/if}{#if cell.tile.building === 'arch'}<p>
          Permanent: this building can never be covered.
        </p>{/if}
    </div>{/if}
</dialog>

<style>
  .cell-inspector {
    padding: 24px;
  }
  .inspector-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }
  .inspector-title h2 {
    font-size: 33px;
    margin-top: 6px;
  }
  .inspected-art {
    --tile-size: 180px;
    display: flex;
    justify-content: center;
    padding: 30px;
    background: #23414b;
    border-radius: 8px;
    margin: 20px 0;
  }
  .cell-inspector > p {
    font-size: 14px;
    color: #6d745f;
    padding-block: 5px;
  }
</style>
