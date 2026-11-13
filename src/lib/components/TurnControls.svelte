<script lang="ts">
  import BuildingSymbol from './BuildingSymbol.svelte';
  import type { ControlState } from '../presentation/controller';
  import type { TurnAction } from '../presentation/intents';
  let {
    selected,
    availability,
    disabled = false,
    onAction
  }: {
    selected?: string | null;
    availability?: Record<TurnAction, ControlState>;
    disabled?: boolean;
    onAction?: (action: TurnAction) => void;
  } = $props();
  const actions: { id: TurnAction; icon: string; label: string }[] = [
    { id: 'place', icon: '▦', label: 'Place domino' },
    { id: 'arch-line', icon: '∩', label: 'Place Arch' },
    { id: 'resolve', icon: '⚑', label: 'Resolve areas' },
    { id: 'draw', icon: 'Ⅱ', label: 'Take dominos' }
  ];
</script>

<section class="turn-controls" data-component="TurnControls" aria-label="Turn actions">
  <div class="action-options">
    {#each actions as action}<button
        class:chosen={selected === action.id}
        aria-pressed={selected === action.id}
        disabled={disabled || !onAction || !availability?.[action.id]?.enabled}
        title={availability?.[action.id]?.reason}
        onclick={() => onAction?.(action.id)}
        ><span
          >{#if action.id === 'arch-line'}<BuildingSymbol
              building="arch"
            />{:else}{action.icon}{/if}</span
        ><strong>{action.label}</strong></button
      >{/each}
  </div>
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
    display: block;
    width: 26px;
    height: 26px;
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
  }

  .action-options strong {
    font-size: 14px;
  }
</style>
