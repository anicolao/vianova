<script lang="ts">
  import { gameArt } from '../presentation/art';
  import Domino from './Domino.svelte';
  import type { ControlState } from '../presentation/controller';
  import type { DominoData } from '../presentation/types';
  let {
    dominos,
    onTake,
    selected,
    availability,
    disabled = false
  }: {
    dominos: DominoData[];
    onTake?: (id: string) => void;
    availability?: Record<string, ControlState>;
    disabled?: boolean;
    selected?: string | null;
  } = $props();
</script>

<section
  class="domino-market"
  style:--tray-art={`url("${gameArt('piece-tray')}")`}
  data-component="DominoMarket"
  aria-label="Domino market"
>
  <header>
    <span class="eyebrow">The market</span><span
      >Ⅱ = 2 actions <span class="dot">·</span> Refill at turn end</span
    >
  </header>
  <div class="market-scroll">
    {#each dominos as domino}<div data-anchor="market-{domino.id}">
        <Domino
          {domino}
          disabled={disabled || (!!availability && !availability[domino.id]?.enabled)}
          reason={availability?.[domino.id]?.reason}
          selected={selected === domino.id}
          onclick={onTake ? () => onTake(domino.id) : undefined}
        />
      </div>{/each}{#if dominos.length < 5}<div class="market-vacancy">
        Refill<br />at turn end
      </div>{/if}
  </div>
</section>

<style>
  .domino-market {
    --tile-size: 96px;
    min-width: 0;
    color: #d9e0ce;
  }
  .domino-market header {
    display: flex;
    gap: 15px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-inline: 5px;
  }
  .domino-market .eyebrow {
    color: #d8c28e;
    font-size: 9px;
  }
  .domino-market header > span:last-child {
    font-size: 9px;
    color: #99aca3;
  }
  .dot {
    margin: 0 7px;
  }
  .market-scroll {
    display: flex;
    gap: 14px;
    overflow: auto;
    padding: 8px 7px 12px;
    scrollbar-width: thin;
    scrollbar-color: #9f9d7b transparent;
  }
  .market-scroll > div {
    flex-shrink: 0;
  }
  .market-vacancy {
    width: 110px;
    min-height: 62px;
    border: 1px dashed #73867d;
    border-radius: 6px;
    display: grid;
    place-content: center;
    text-align: center;
    font-size: 9px;
    color: #99aca3;
  }
  @media (max-width: 600px) {
    .domino-market {
      --tile-size: 96px;
    }
    .domino-market header {
      gap: 8px;
    }
    .domino-market header > span:last-child {
      font-size: 8px;
    }
    .dot {
      margin: 0 2px;
    }
  }

  .domino-market {
    background: var(--tray-art) center/100% 100% no-repeat;
    border: 0;
    padding: 30px 24px 22px;
    color: #2d3b32;
    border-radius: 7px;
    box-shadow:
      0 4px 0 #605139,
      0 7px 12px #0004;
  }
  .domino-market .eyebrow,
  .domino-market header > span:last-child {
    color: #3e4b3c;
  }
  .domino-market .eyebrow,
  .domino-market header > span:last-child {
    font-size: 14px;
  }
  .domino-market header {
    flex-wrap: wrap;
  }
</style>
