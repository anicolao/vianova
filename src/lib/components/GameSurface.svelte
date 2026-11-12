<script lang="ts">
  import CityBoard from './CityBoard.svelte';
  import ActionQueue from './ActionQueue.svelte';
  import PlayerMat from './PlayerMat.svelte';
  import ContestBoard from './ContestBoard.svelte';
  import DominoMarket from './DominoMarket.svelte';
  import PrivateHand from './PrivateHand.svelte';
  import TurnControls from './TurnControls.svelte';
  import SupplyDeck from './SupplyDeck.svelte';
  import GameLog from './GameLog.svelte';
  import ScoreSheet from './ScoreSheet.svelte';
  import MotionLayer from './MotionLayer.svelte';
  import { type Frame } from '../presentation/types';
  import type { ViewIntent } from '../presentation/intents';
  let {
    frame,
    tabletop = false,
    selectedDomino = null,
    selectedCell = null,
    staged = null,
    rotation = 0,
    onIntent
  }: {
    frame: Frame;
    tabletop?: boolean;
    selectedDomino?: string | null;
    selectedCell?: string | null;
    staged?: { x: number; y: number } | null;
    rotation?: number;
    onIntent?: (intent: ViewIntent) => void;
  } = $props();
  let surface = $state<HTMLElement>();
  let tab = $state('city');
  let details = $state(false);
  const view = $derived(frame.view);
  const active = $derived(view.players.find((p) => p.owner === view.active)!);
  const viewer = $derived(view.players.find((p) => p.owner === view.viewer)!);
  $effect(() => {
    tab = frame.context === 'contests' ? 'contests' : 'city';
  });
  const chosen = $derived(view.hand.find((d) => d.id === selectedDomino));
  const stage = $derived(chosen && staged ? { ...staged, domino: chosen } : null);
  const send = (intent: ViewIntent) => onIntent?.(intent);
  const northPlayer = $derived(view.players.length === 2 ? view.players[1] : view.players[2]);
  const eastPlayer = $derived(view.players.length > 2 ? view.players[1] : undefined);
  const westPlayer = $derived(view.players[3]);
</script>

<section
  class="game-surface"
  class:tabletop
  bind:this={surface}
  data-component="GameSurface"
  data-active={view.active}
  data-beat={frame.beat}
>
  <header class="surface-heading">
    <button class="game-wordmark" onclick={() => (tab = 'city')}>VIA NOVA</button><span
      class="turn-indicator"
      ><i class={view.active}></i>{active.name}<span class="turn-word">’s turn</span></span
    ><button class="table-menu" aria-expanded={details} onclick={() => (details = !details)}
      >Table details ☰</button
    >
  </header>
  {#if details}<div class="table-details">
      <p>2–4 players · Rules v56 · Stefan Alexander</p>
      <p>Public cities and contests stay on the table. Unplayed dominos stay private.</p>
      <button class="control" onclick={() => (details = false)}>Close details</button>
    </div>{/if}
  {#if tabletop}
    <div class="tabletop-layout">
      {#if northPlayer}<div class="seated-city north">
          <PlayerMat
            player={northPlayer}
            active={view.active === northPlayer.owner}
            compact
          /><CityBoard
            cells={view.opponentCities[northPlayer.owner] ?? []}
            anchorPrefix="city-{northPlayer.owner}"
            compact
          />
        </div>
      {/if}
      {#if westPlayer}<div class="seated-city west">
          <PlayerMat
            player={westPlayer}
            active={view.active === westPlayer.owner}
            compact
          /><CityBoard
            cells={view.opponentCities[westPlayer.owner] ?? []}
            anchorPrefix="city-{westPlayer.owner}"
            compact
          />
        </div>
      {/if}
      <div class="shared-center">
        <div class="table-contests">
          <ContestBoard
            kind="battle"
            areas={view.areas.filter((a) => a.kind === 'battle')}
            compact
            onResolve={(area) => send({ type: 'resolve', area })}
            onReward={(area, reward) => send({ type: 'select-reward', area, reward })}
          /><ContestBoard
            kind="invention"
            areas={view.areas.filter((a) => a.kind === 'invention')}
            compact
            onResolve={(area) => send({ type: 'resolve', area })}
            onReward={(area, reward) => send({ type: 'select-reward', area, reward })}
          />
        </div>
        <div class="table-resources">
          <DominoMarket dominos={view.market} onTake={(id) => send({ type: 'take-market', id })} />
          <div class="table-supplies">
            {#each ['dominos', 'battle', 'invention'] as const as kind, i}<SupplyDeck
                {kind}
                count={view.supplies[i]}
                onclick={kind === 'dominos' ? () => send({ type: 'draw' }) : undefined}
              />{/each}
          </div>
        </div>
        <div class="turn-message" aria-live="polite">
          <strong>{frame.label}</strong>
          <p>{frame.detail}</p>
        </div>
        {#if frame.actions}<ActionQueue
            actions={frame.actions}
            ordered={frame.ordered}
            onChoose={(action) => send({ type: 'choose-action', action })}
          />{/if}
        <div
          class="shared-actions"
          class:face-north={view.active === northPlayer?.owner}
          class:face-east={view.active === 'coral'}
          class:face-west={view.active === 'lilac'}
        >
          <TurnControls
            selected={undefined}
            staged={!!stage}
            onAction={(action) => send({ type: 'choose-action', action })}
            onRotate={() => send({ type: 'rotate' })}
            onCancel={() => send({ type: 'cancel' })}
            onCommit={() => send({ type: 'commit' })}
          />
        </div>
        <PrivateHand dominos={view.hand} privateView={false} />
      </div>
      {#if eastPlayer}<div class="seated-city east">
          <PlayerMat
            player={eastPlayer}
            active={view.active === eastPlayer.owner}
            compact
          /><CityBoard
            cells={view.opponentCities[eastPlayer.owner] ?? []}
            anchorPrefix="city-{eastPlayer.owner}"
            compact
          />
        </div>
      {/if}
      <div class="seated-city south">
        <PlayerMat
          player={viewer}
          active={view.active === viewer.owner}
          compact
          onPerson={(group, id) => send({ type: 'person', group, id })}
        /><CityBoard
          cells={view.city}
          compact
          focus={frame.focus}
          selected={selectedCell}
          staged={stage}
          {rotation}
          onSelect={(cell) => send({ type: 'inspect-cell', cell })}
          onPlace={(x, y) => send({ type: 'stage', x, y })}
        />
      </div>
    </div>
  {:else}
    <nav class="mobile-tabs" aria-label="Game views">
      {#each [['city', 'Your city'], ['contests', 'Contests'], ['players', 'Players']] as [id, label]}<button
          class:current={tab === id}
          aria-pressed={tab === id}
          onclick={() => (tab = id)}
          >{label}{#if id === 'contests'}<small>4</small>{/if}</button
        >{/each}
    </nav>
    <div class="personal-layout">
      <aside class="player-column" class:mobile-visible={tab === 'players'}>
        <div class="column-title">
          <span class="eyebrow">Citizens of Rome</span><span>{view.players.length} cities</span>
        </div>
        {#each view.players as player}<PlayerMat
            {player}
            active={player.owner === view.active}
            compact={player.owner !== view.active}
            onPerson={player.owner === view.active
              ? (group, id) => send({ type: 'person', group, id })
              : undefined}
          />{/each}
      </aside>
      <main class="city-column" class:mobile-visible={tab === 'city'} id="city">
        <div class="city-title">
          <div>
            <span class="eyebrow">{viewer.name} · ◆</span>
            <h1>Your city, rising</h1>
          </div>
          <span class="city-seal">SPQR</span>
        </div>
        {#if frame.context === 'population'}<div class="mobile-context">
            <PlayerMat
              player={viewer}
              compact
              onPerson={(group, id) => send({ type: 'person', group, id })}
            />
          </div>{/if}
        {#if view.final}<ScoreSheet
            rows={view.scores}
            onInspect={() => send({ type: 'inspect-score' })}
          />{:else}<CityBoard
            cells={view.city}
            focus={frame.focus}
            selected={selectedCell}
            staged={stage}
            {rotation}
            onSelect={(cell) => send({ type: 'inspect-cell', cell })}
            onPlace={(x, y) => send({ type: 'stage', x, y })}
          />{/if}
        <div class="turn-message" aria-live="polite">
          <span class="message-icon">{stage ? '↻' : '◇'}</span>
          <div>
            <strong>{stage ? 'Review your placement' : frame.label}</strong>
            <p>{stage ? 'Rotate the staged domino or place it here.' : frame.detail}</p>
          </div>
        </div>
        {#if frame.actions}<ActionQueue
            actions={frame.actions}
            ordered={frame.ordered}
            onChoose={(action) => send({ type: 'choose-action', action })}
          />{/if}
        <TurnControls
          selected={undefined}
          staged={!!stage}
          onAction={(action) => send({ type: 'choose-action', action })}
          onRotate={() => send({ type: 'rotate' })}
          onCancel={() => send({ type: 'cancel' })}
          onCommit={() => send({ type: 'commit' })}
        />
        <PrivateHand
          dominos={view.hand}
          selected={selectedDomino}
          onSelect={(id) => send({ type: 'select-domino', id })}
        />
        <GameLog entries={view.log} />
      </main>
      <aside class="contest-column" class:mobile-visible={tab === 'contests'}>
        <div class="mobile-context">
          <PlayerMat
            player={viewer}
            compact
            onPerson={(group, id) => send({ type: 'person', group, id })}
          />
        </div>
        <div class="column-title">
          <span class="eyebrow">Shared opportunities</span><span>3+ to qualify</span>
        </div>
        <ContestBoard
          kind="battle"
          areas={view.areas.filter((a) => a.kind === 'battle')}
          onResolve={(area) => send({ type: 'resolve', area })}
          onReward={(area, reward) => send({ type: 'select-reward', area, reward })}
        /><ContestBoard
          kind="invention"
          areas={view.areas.filter((a) => a.kind === 'invention')}
          onResolve={(area) => send({ type: 'resolve', area })}
          onReward={(area, reward) => send({ type: 'select-reward', area, reward })}
        />
        <div class="supplies">
          {#each ['dominos', 'battle', 'invention'] as const as kind, i}<SupplyDeck
              {kind}
              count={view.supplies[i]}
              onclick={kind === 'dominos' ? () => send({ type: 'draw' }) : undefined}
            />{/each}
        </div>
      </aside>
      <div class="market-row">
        <DominoMarket dominos={view.market} onTake={(id) => send({ type: 'take-market', id })} />
      </div>
    </div>
  {/if}
  <MotionLayer motions={frame.motions} {surface} />
</section>

<style>
  .game-surface {
    min-height: var(--surface-height, 100svh);
    background: radial-gradient(ellipse at 50% 25%, #2a4748, #152f3b 75%);
    color: #f0e4c9;
    position: relative;
    isolation: isolate;
    overflow: clip;
  }
  .game-surface:before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.14;
    background: repeating-conic-gradient(#d7c59710 0 25%, #0b202b30 0 50%) 0 0/15px 15px;
    pointer-events: none;
  }
  .surface-heading {
    height: 62px;
    border-bottom: 1px solid #70806b55;
    padding: 10px 27px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    background: #112b36cc;
  }
  .game-wordmark {
    border: 0;
    padding: 0;
    background: transparent;
    min-height: 44px;
    font-family: 'Cormorant Garamond', serif;
    letter-spacing: 0.22em;
    font-size: 26px;
    color: #edd49b;
    text-decoration: none;
  }
  .turn-indicator {
    display: flex;
    align-items: center;
    font-size: 12px;
    gap: 5px;
    color: #eee3c7;
  }
  .turn-indicator i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: block;
    background: #4e9d93;
    margin-right: 4px;
  }
  .turn-indicator i.coral {
    background: #d07869;
  }
  .turn-indicator i.gold {
    background: #d5b96c;
  }
  .turn-indicator i.lilac {
    background: #ab8fc5;
  }
  .table-menu {
    background: transparent;
    border: 1px solid #75816d5c;
    border-radius: 5px;
    color: #c5cfb9;
    font-size: 10px;
    min-height: 38px;
    padding: 9px;
  }
  .table-details {
    margin: 12px 24px;
    background: #f8ebc9;
    color: #2e4540;
    padding: 16px;
    border-radius: 8px;
    font-size: 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }
  .table-details .control {
    font-size: 11px;
  }
  .personal-layout {
    display: grid;
    grid-template-columns: minmax(180px, 0.8fr) minmax(330px, 1.85fr) minmax(280px, 1.2fr);
    gap: 22px;
    max-width: 1700px;
    margin: auto;
    padding: 24px;
  }
  .player-column,
  .contest-column,
  .city-column {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }
  .column-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    min-height: 24px;
  }
  .column-title .eyebrow {
    color: #c0c8ad;
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  .column-title > span:last-child {
    font-size: 9px;
    color: #8fa895;
  }
  .city-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
    padding: 0 6px;
  }
  .city-title .eyebrow {
    font-size: 9px;
    color: #d2b779;
  }
  .city-title h1 {
    font-size: 33px;
    margin-top: 4px;
    letter-spacing: -0.01em;
  }
  .city-seal {
    font-family: Georgia, serif;
    border: 1px solid #bb9d6177;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    font-size: 10px;
    color: #d4b87b;
  }
  .turn-message {
    padding: 11px 13px;
    border: 1px solid #71826b66;
    background: #ffffff05;
    border-radius: 6px;
    display: flex;
    align-items: start;
    gap: 12px;
    min-height: 68px;
  }
  .turn-message strong {
    font-size: 12px;
    color: #f2dfb0;
  }
  .turn-message p {
    font-size: 10px;
    color: #adc0ae;
    margin-top: 4px;
    line-height: 1.4;
  }
  .message-icon {
    font-size: 28px;
    line-height: 1;
    color: #d0b36d;
  }
  .supplies {
    display: flex;
    justify-content: space-around;
    gap: 10px;
    padding: 14px 6px 0;
  }
  .market-row {
    grid-column: 2/4;
    border-top: 1px solid #6d7c6555;
    padding-top: 16px;
  }
  .mobile-tabs,
  .mobile-context {
    display: none;
  }
  .tabletop {
    min-height: var(--surface-height, 100svh);
  }
  .tabletop-layout {
    display: grid;
    grid-template-columns: 280px minmax(550px, 1fr) 280px;
    grid-template-rows: 170px minmax(490px, 1fr) 235px;
    gap: 14px;
    padding: 16px;
    min-width: 1250px;
    min-height: calc(var(--surface-height, 100svh) - 62px);
    max-width: 2100px;
    margin: auto;
  }
  .seated-city :global(.city-board) {
    --tile-size: 50px;
  }
  .seated-city {
    display: flex;
    flex-direction: column;
    gap: 9px;
    align-self: center;
    max-width: 360px;
    width: 100%;
  }
  .north {
    grid-column: 2;
    grid-row: 1;
    justify-self: center;
    transform: rotate(180deg);
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    max-width: 620px;
  }
  .south {
    grid-column: 2;
    grid-row: 3;
    justify-self: center;
    max-width: 620px;
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    align-items: center;
  }
  .west {
    grid-column: 1;
    grid-row: 2;
    transform: rotate(90deg) scale(0.86);
    max-width: 260px;
    justify-self: center;
  }
  .east {
    grid-column: 3;
    grid-row: 2;
    transform: rotate(-90deg) scale(0.86);
    max-width: 260px;
    justify-self: center;
  }
  .shared-center {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    align-self: center;
  }
  .table-contests {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .table-resources {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .table-resources :global(.domino-market) {
    flex: 1;
  }
  .table-supplies {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-shrink: 0;
  }
  .table-resources :global(.domino-market) {
    --tile-size: 40px;
  }
  .tabletop :global(.private-hand) {
    padding: 6px 12px;
  }
  .tabletop :global(.private-hand header) {
    margin-bottom: 0;
  }
  .tabletop :global(.privacy-note) {
    min-height: 30px;
  }
  .tabletop :global(.phone-icon) {
    font-size: 29px;
  }
  .tabletop :global(.privacy-note small) {
    display: none;
  }
  .player-column :global(.player-mat.compact .reserve) {
    display: none;
  }
  .tabletop .turn-message {
    display: block;
    min-height: auto;
    padding: 10px;
  }
  .tabletop .table-supplies :global(.supply) {
    --tile-size: 40px;
  }
  .shared-actions {
    max-width: 590px;
    width: 100%;
    align-self: center;
    transform-origin: center;
  }
  .shared-actions.face-north {
    transform: rotate(180deg);
  }
  .shared-actions.face-east,
  .shared-actions.face-west {
    transform: none;
  }
  @media (min-width: 1500px) {
    .personal-layout {
      gap: 30px;
      padding: 28px 36px;
    }
    .city-column {
      gap: 17px;
    }
  }
  @media (max-width: 1100px) {
    .personal-layout {
      grid-template-columns: minmax(320px, 1.3fr) minmax(280px, 1fr);
      gap: 18px;
      padding: 20px;
    }
    .player-column {
      grid-column: 1/-1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .player-column .column-title {
      display: none;
    }
    .player-column :global(.mat-wells),
    .player-column :global(.reserve) {
      display: none;
    }
    .player-column :global(header) {
      min-height: 56px;
    }
    .player-column :global(header strong) {
      font-size: 17px;
    }
    .player-column :global(.personal-count) {
      display: none;
    }
    .player-column :global(header div > span) {
      font-size: 8px;
    }
    .player-column :global(.owner-mark) {
      width: 23px;
      height: 23px;
      flex-shrink: 0;
    }
    .market-row {
      grid-column: 1/-1;
    }
    .city-column {
      grid-column: 1;
    }
    .contest-column {
      grid-column: 2;
    }
    .city-title h1 {
      font-size: 31px;
    }
    .contest-column .column-title {
      display: none;
    }
  }
  @media (max-width: 700px) {
    .mobile-context {
      display: block;
    }
    .surface-heading {
      padding: 8px 14px;
      height: 54px;
      gap: 8px;
    }
    .game-wordmark {
      font-size: 20px;
      letter-spacing: 0.15em;
    }
    .turn-indicator {
      font-size: 10px;
      gap: 0;
    }
    .turn-indicator i {
      margin-right: 5px;
    }
    .turn-word {
      display: none;
    }
    .table-menu {
      font-size: 9px;
      padding: 6px;
      min-height: 38px;
    }
    .mobile-tabs {
      display: flex;
      gap: 6px;
      padding: 12px 14px 2px;
    }
    .mobile-tabs button {
      flex: 1;
      min-height: 44px;
      background: transparent;
      border: 1px solid #647c6a77;
      color: #b8c8b5;
      border-radius: 5px;
      font-size: 11px;
    }
    .mobile-tabs button.current {
      background: #e1cc95;
      color: #263f40;
      border-color: #e1cc95;
    }
    .mobile-tabs small {
      font-size: 9px;
      margin-left: 5px;
    }
    .personal-layout {
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      gap: 16px;
    }
    .player-column,
    .contest-column,
    .city-column {
      display: none;
    }
    .player-column.mobile-visible {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .player-column :global(.mat-wells),
    .player-column :global(.reserve) {
      display: flex;
    }
    .player-column :global(.mat-wells) {
      display: grid;
    }
    .player-column :global(.personal-count) {
      display: block;
    }
    .player-column :global(.mat-wells) {
      grid-template-columns: 1fr;
    }
    .city-column.mobile-visible,
    .contest-column.mobile-visible {
      display: flex;
      gap: 13px;
    }
    .city-title {
      margin-bottom: 0;
    }
    .city-title h1 {
      font-size: 29px;
    }
    .city-title .eyebrow {
      font-size: 8px;
    }
    .city-seal {
      width: 35px;
      height: 35px;
      font-size: 8px;
    }
    .turn-message {
      padding: 9px 10px;
      min-height: 67px;
    }
    .turn-message p {
      font-size: 10px;
    }
    .market-row {
      padding-top: 12px;
    }
    .supplies {
      padding-bottom: 10px;
    }
    .tabletop {
      overflow: auto;
    }
    .tabletop .surface-heading {
      min-width: 1250px;
    }
  }
  @media (max-height: 550px) and (min-width: 701px) {
    .personal-layout {
      padding: 12px;
      gap: 12px;
    }
    .player-column {
      display: none;
    }
    .surface-heading {
      height: 48px;
    }
    .city-title {
      display: none;
    }
    .city-column {
      gap: 10px;
    }
  }
</style>
