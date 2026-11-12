<script lang="ts">
  import Population from './Population.svelte';
  import { type PlayerView } from '../presentation/types';
  let {
    player,
    active = false,
    compact = false,
    onPerson
  }: {
    player: PlayerView;
    active?: boolean;
    compact?: boolean;
    onPerson?: (group: 'soldiers' | 'engineers' | 'reserve', id: string) => void;
  } = $props();
  const symbols = { teal: '◆', coral: '●', gold: '▲', lilac: '✦' };
</script>

<section
  class="player-mat {player.owner}"
  class:active
  class:compact
  data-component="PlayerMat"
  aria-label="{player.name} player board"
>
  <header>
    <span class="owner-mark">{symbols[player.owner]}</span>
    <div><strong>{player.name}</strong><span>{active ? 'Playing now' : 'City of Rome'}</span></div>
    <div class="personal-count">
      <b>{player.arches} ∩</b><small>{player.handCount} in hand</small>
    </div>
  </header>
  <div class="mat-wells">
    {#each ['soldiers', 'engineers'] as const as group}<div
        class="well {group}"
        data-anchor="{group}-{player.owner}"
      >
        <span class="well-label">{group === 'soldiers' ? '⚔ Soldiers' : '▧ Engineers'}</span>
        <div class="people">
          {#each player[group] as person, i}<Population
              {person}
              small={compact}
              onclick={onPerson ? () => onPerson(group, String(i)) : undefined}
            />{/each}{#if !player[group].length}<span class="none">None ready</span>{/if}
        </div>
        <span class="population-total"
          >{player[group].reduce((n, p) => n + p.value, 0)} population</span
        >
      </div>{/each}
  </div>
  <div class="reserve" data-anchor="reserve-{player.owner}">
    <span class="well-label">Reserve</span>
    <div class="reserve-people">
      {#each player.reserve as person}<Population {person} small />{/each}
    </div>
    <span>{player.reserve.length}</span>
  </div>
</section>

<style>
  .player-mat {
    --owner: #277b7a;
    background: #fff5dc;
    border: 1px solid #d1bc88;
    border-radius: 8px;
    overflow: hidden;
    color: #253d3d;
    min-width: 0;
  }
  .coral {
    --owner: #b85f53;
  }
  .gold {
    --owner: #947222;
  }
  .lilac {
    --owner: #85649d;
  }
  .active {
    box-shadow: 0 0 0 2px var(--owner);
  }
  header {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 12px;
    border-bottom: 1px solid #d9ca9f;
    background: #f5e7c8;
  }
  .owner-mark {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--owner);
    color: #fff1d5;
    font-size: 14px;
  }
  header strong {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    line-height: 1;
  }
  header div > span {
    display: block;
    font-size: 9px;
    color: #70715d;
    margin-top: 3px;
  }
  .personal-count {
    margin-left: auto;
    text-align: right;
    font-size: 12px;
    white-space: nowrap;
  }
  .personal-count small {
    display: block;
    font-size: 9px;
    color: #74745f;
    margin-top: 2px;
  }
  .mat-wells {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 10px;
  }
  .well {
    background: #eddccc66;
    border: 1px solid #d8bba3;
    border-radius: 5px;
    padding: 7px;
    min-width: 0;
  }
  .well.engineers {
    background: #e1e6ca88;
    border-color: #b8c4a1;
  }
  .well-label {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 9px;
    font-weight: 700;
  }
  .people {
    display: flex;
    gap: 1px;
    flex-wrap: wrap;
    min-height: 42px;
    align-items: center;
  }
  .population-total {
    display: block;
    font-size: 9px;
    color: #78775f;
  }
  .reserve {
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid #dfd1ad;
    padding: 5px 12px;
    background: #f2e9d1;
  }
  .reserve-people {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
  }
  .reserve-people :global(.person) {
    width: 22px;
    height: 25px;
  }
  .reserve > span:last-child {
    font-size: 11px;
  }
  .none {
    font-size: 10px;
    color: #868675;
  }
  .compact header {
    padding: 6px 9px;
  }
  .compact header strong {
    font-size: 17px;
  }
  .compact .mat-wells {
    padding: 6px;
    gap: 5px;
  }
  .compact .well {
    padding: 5px;
  }
  .compact .people {
    min-height: 32px;
  }
  .compact .reserve {
    padding: 3px 9px;
  }
  .compact .reserve-people :global(.person) {
    width: 18px;
    height: 22px;
  }
  .compact .owner-mark {
    width: 26px;
    height: 26px;
  }
  .compact .population-total {
    font-size: 8px;
  }
</style>
