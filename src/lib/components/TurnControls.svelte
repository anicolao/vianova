<script lang="ts">
  let {
    selected,
    staged = false,
    onAction,
    onRotate,
    onCancel,
    onCommit
  }: {
    selected?: string;
    staged?: boolean;
    onAction?: (action: string) => void;
    onRotate?: () => void;
    onCancel?: () => void;
    onCommit?: () => void;
  } = $props();
  const actions = [
    ['place', '▦', 'Place domino'],
    ['arch-line', '∩', 'Place Arch'],
    ['resolve', '⚑', 'Resolve areas'],
    ['draw', 'Ⅱ', 'Take dominos']
  ];
</script>

<section class="turn-controls" data-component="TurnControls" aria-label="Turn actions">
  {#if staged}<div class="placement-actions">
      <button class="control" onclick={onRotate}>↻ Rotate</button><button
        class="control"
        onclick={onCancel}>Cancel</button
      ><button class="control primary" onclick={onCommit}>Place here ✓</button>
    </div>{:else}<div class="action-options">
      {#each actions as [id, icon, label]}<button
          class:chosen={selected === id}
          onclick={() => onAction?.(id)}><span>{icon}</span><strong>{label}</strong></button
        >{/each}
    </div>{/if}
</section>

<style>
  .action-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  .action-options button {
    border: 1px solid #67705c;
    border-radius: 6px;
    background: #203e46;
    color: #e6dcc0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 49px;
    padding: 9px 7px;
  }
  .action-options button > span {
    color: #d3b974;
    font-size: 20px;
  }
  .action-options strong {
    font-size: 10px;
  }
  .action-options .chosen {
    background: #e6d3a0;
    color: #213e45;
    border-color: #e6d3a0;
  }
  .action-options .chosen > span {
    color: #725d31;
  }
  .placement-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 3px;
  }
  .placement-actions .control {
    font-size: 11px;
  }
  @media (max-width: 600px) {
    .action-options button {
      flex-direction: column;
      gap: 2px;
      padding: 5px 2px;
    }
    .action-options strong {
      font-size: 9px;
    }
    .action-options button > span {
      font-size: 18px;
    }
    .placement-actions {
      gap: 5px;
    }
  }
</style>
