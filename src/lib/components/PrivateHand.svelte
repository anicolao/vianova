<script lang="ts">
  import { gameArt } from '../presentation/art';
  import Domino from './Domino.svelte';
  import type { ControlState } from '../presentation/controller';
  import type { DominoData } from '../presentation/types';
  let {
    dominos,
    privateView = true,
    selected,
    onSelect,
    availability,
    disabled = false
  }: {
    dominos: DominoData[];
    privateView?: boolean;
    availability?: Record<string, ControlState>;
    disabled?: boolean;
    selected?: string | null;
    onSelect?: (id: string) => void;
  } = $props();
</script>

<section
  class="private-hand"
  style:--tray-art={`url("${gameArt('piece-tray')}")`}
  class:concealed={!privateView}
  data-component="PrivateHand"
  data-anchor="hand"
  aria-label={privateView ? 'Your private domino hand' : 'Private hand on companion device'}
>
  <header>
    <span>{privateView ? '◈ Your hand' : '◈ Private hand'}</span><small
      >{privateView ? `${dominos.length} / 5 dominos` : 'Open on your paired phone'}</small
    >
  </header>
  {#if privateView}<div class="hand-dominos">
      {#each dominos as domino}<Domino
          {domino}
          disabled={disabled || (!!availability && !availability[domino.id]?.enabled)}
          reason={availability?.[domino.id]?.reason}
          selected={selected === domino.id}
          onclick={onSelect ? () => onSelect(domino.id) : undefined}
        />{/each}
    </div>{:else}<div class="privacy-note">
      <span class="phone-icon">▯</span>
      <p>Your dominos stay private.<small>Choose a tile on your phone to stage it here.</small></p>
    </div>{/if}
</section>

<style>
  .private-hand {
    --tile-size: 96px;
    background: #f0e4c9;
    border: 1px solid #c6af7b;
    border-radius: 8px;
    color: #2c4243;
    padding: 10px 12px;
    min-width: 0;
  }
  .private-hand header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 9px;
    font-size: 11px;
    font-weight: 700;
  }
  .private-hand header small {
    font-size: 9px;
    font-weight: 400;
    color: #6d735f;
  }
  .hand-dominos {
    display: flex;
    gap: 13px;
    overflow: auto;
    padding: 6px 4px 10px;
    scrollbar-width: thin;
  }
  .concealed {
    background: #1b3640;
    border-color: #47615f;
    color: #e6ddc2;
  }
  .concealed header small {
    color: #abbcb0;
  }
  .privacy-note {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 45px;
    color: #e0d2af;
  }
  .phone-icon {
    font-size: 38px;
    line-height: 1;
    color: #bdab79;
  }
  .privacy-note p {
    font-size: 11px;
    line-height: 1.4;
  }
  .privacy-note small {
    display: block;
    font-size: 9px;
    color: #9fb2a5;
    margin-top: 3px;
  }
  @media (max-width: 600px) {
    .private-hand {
      --tile-size: 96px;
    }
    .hand-dominos {
      gap: 10px;
    }
  }

  .private-hand {
    background: var(--tray-art) center/100% 100% no-repeat;
    border: 0;
    padding: 30px 24px 22px;
    color: #2d3b32;
    border-radius: 7px;
    box-shadow:
      0 4px 0 #605139,
      0 7px 12px #0004;
  }
  .private-hand.concealed {
    background: #19363d;
    border: 1px solid #8b865b;
    color: #e7dbbb;
    box-shadow: none;
  }

  .private-hand header,
  .private-hand header small {
    font-size: 14px;
  }
</style>
