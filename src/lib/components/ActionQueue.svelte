<script lang="ts">
  import { gameArt } from '../presentation/art';
  import BuildingSymbol from './BuildingSymbol.svelte';
  import { buildingInfo, type Building } from '../presentation/types';
  let {
    actions,
    ordered = false,
    onChoose,
    onSkip,
    selected,
    disabled = false,
    skipAvailable = true
  }: {
    actions: {
      id: string;
      building: Building;
      count: number;
      available: boolean;
      reason?: string;
    }[];
    ordered?: boolean;
    onChoose?: (id: string) => void;
    onSkip?: () => void;
    selected?: string | null;
    disabled?: boolean;
    skipAvailable?: boolean;
  } = $props();
</script>

<section
  class="action-queue"
  style:--tray-art={`url("${gameArt('piece-tray')}")`}
  data-component="ActionQueue"
  aria-label="Generated building actions"
>
  <header>
    <span>{ordered ? 'Resolve in this order' : 'Your matching actions'}</span><small
      >Optional · use this turn</small
    >
  </header>
  <div>
    {#each actions as action, i}<button
        disabled={disabled || !onChoose || !action.available}
        title={action.reason}
        aria-pressed={selected === action.id}
        onclick={() => onChoose?.(action.id)}
        aria-label="{action.count} {buildingInfo[action.building].name} actions: {buildingInfo[
          action.building
        ].action}"
        ><span class="action-emblem"><BuildingSymbol building={action.building} /></span><span
          class="action-number">{action.count}</span
        ><span
          ><strong>{buildingInfo[action.building].name}</strong><small
            >{buildingInfo[action.building].action}</small
          ></span
        >{#if ordered}<b>{i + 1}</b>{/if}</button
      >{/each}
  </div>
  {#if onSkip}<button class="skip" disabled={disabled || !skipAvailable} onclick={onSkip}
      >Skip remaining actions →</button
    >{/if}
</section>

<style>
  .action-queue {
    background: #f3e4ba;
    border: 1px solid #d1ad5c;
    color: #28433e;
    padding: 12px;
    border-radius: 7px;
  }
  .action-queue header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .action-queue header small {
    font-size: 9px;
    color: #827b5a;
    font-weight: 400;
  }
  .action-queue > div {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
  }
  .action-queue > div > button {
    border: 1px solid #b9a671;
    background: #fff6db;
    border-radius: 5px;
    color: #2c4b40;
    display: flex;
    gap: 9px;
    align-items: center;
    text-align: left;
    min-height: 48px;
    padding: 7px 10px;
    flex: 1;
  }
  .action-number {
    font-size: 22px;
    font-weight: 700;
    color: #937532;
  }
  .action-queue strong {
    font-size: 11px;
  }
  .action-queue small {
    display: block;
    font-size: 9px;
    margin-top: 2px;
    color: #7e7c60;
  }
  .action-queue b {
    font-size: 11px;
    margin-left: auto;
  }
  .skip {
    border: 0;
    background: transparent;
    color: #7c795e;
    min-height: 38px;
    padding: 7px 0 0;
    font-size: 10px;
    text-decoration: underline;
  }
  .action-emblem {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .action-queue {
    background: var(--tray-art) center/100% 100% no-repeat;
    border: 0;
    padding: 30px 24px 22px;
    color: #2d3b32;
    border-radius: 7px;
    box-shadow:
      0 4px 0 #605139,
      0 7px 12px #0004;
  }
  .action-queue > div > button {
    background: #fff5d6b3;
  }

  .action-queue strong,
  .action-queue small,
  .skip {
    font-size: 14px;
  }
</style>
