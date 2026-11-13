<script lang="ts">
  import { gameArt } from '../presentation/art';
  import { rewardKey, type ControlState } from '../presentation/controller';
  import RewardStack from './RewardStack.svelte';
  import Population from './Population.svelte';
  import { owners, type Area } from '../presentation/types';
  let {
    kind,
    areas,
    onReward,
    onResolve,
    compact = false,
    availability,
    rewardAvailability,
    disabled = false,
    selectedArea,
    selectedReward,
    targeting = false
  }: {
    kind: 'battle' | 'invention';
    areas: Area[];
    onReward?: (area: string, reward: string) => void;
    onResolve?: (area: string) => void;
    compact?: boolean;
    availability?: Record<string, ControlState>;
    rewardAvailability?: Record<string, ControlState>;
    disabled?: boolean;
    selectedArea?: string;
    selectedReward?: string;
    targeting?: boolean;
  } = $props();
</script>

<section
  class="contest-board {kind}"
  class:compact
  style:--board-art={`url("${gameArt(`board-${kind}`)}")`}
  data-component="ContestBoard"
  aria-label="{kind === 'battle' ? 'Battle' : 'Invention'} board"
>
  <header>
    <div>
      <h3>{kind === 'battle' ? 'Battle' : 'Invention'}</h3>
      <p>{kind === 'battle' ? 'Soldiers' : 'Engineers'} compete here</p>
    </div>
    <span class="threshold">3+<small>qualify</small></span>
  </header>
  <div class="areas">
    {#each areas as area, i}<section class="area" data-anchor={area.id} aria-label={area.label}>
        <div class="area-top">
          <span class="eyebrow">Area {i + 1}</span>{#if onResolve}<button
              class="resolve"
              disabled={disabled || (!!availability && !availability[area.id]?.enabled)}
              title={availability?.[area.id]?.reason}
              aria-pressed={selectedArea === area.id}
              aria-label="{targeting ? 'Deploy to' : 'Resolve'} {area.label}"
              onclick={() => onResolve(area.id)}>{targeting ? 'Deploy here' : 'Resolve ↗'}</button
            >{/if}
        </div>
        <div class="rewards">
          {#each area.rewards as reward}<RewardStack
              {reward}
              selected={selectedReward === reward.id}
              disabled={disabled ||
                (!!rewardAvailability &&
                  !rewardAvailability[rewardKey(area.id, reward.id)]?.enabled)}
              reason={rewardAvailability?.[rewardKey(area.id, reward.id)]?.reason}
              onclick={onReward ? () => onReward(area.id, reward.id) : undefined}
            />{/each}{#if !area.rewards.length}<div class="no-rewards">Awaiting refill</div>{/if}
        </div>
        <div class="area-population">
          {#each owners as owner}{@const people = area.people.filter(
              (p) => p.owner === owner
            )}{@const total = people.reduce((n, p) => n + p.value, 0)}{#if total}<div
                class="contender"
                title="{people[0]?.ownerLabel ?? owner}: {total} population"
                aria-label="{people[0]?.ownerLabel ?? owner}: {total} population{total >= 3
                  ? ', qualifies'
                  : ''}"
              >
                <div class="contender-people">
                  {#each people as person}<Population {person} small />{/each}
                </div>
                <b class:qualifies={total >= 3}>{total}</b>
              </div>{/if}{/each}
        </div>
      </section>{/each}
  </div>
</section>

<style>
  .contest-board {
    --contest: #a34e40;
    --tint: #ecd6bf;
    --tile-size: 66px;
    background: var(--tint);
    border: 1px solid #c2ac81;
    border-radius: 8px;
    overflow: hidden;
    color: #30433a;
    min-width: 0;
  }
  .invention {
    --contest: #657e55;
    --tint: #e1e4ca;
  }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #bba781;
    background: linear-gradient(90deg, #fff1d28c, transparent);
  }

  h3 {
    font-size: 24px;
    line-height: 1;
    color: var(--contest);
  }
  header p {
    font-size: 9px;
    margin-top: 2px;
    color: #746d58;
  }
  .threshold {
    margin-left: auto;
    border: 1px solid #8f8662;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 700;
    text-align: center;
    padding: 2px 6px;
    background: #fff4d3;
  }
  .threshold small {
    display: block;
    font-size: 7px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 400;
  }
  .areas {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .area {
    padding: 9px;
    min-width: 0;
  }
  .area + .area {
    border-left: 1px dashed #aa9970;
  }
  .area-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    min-height: 24px;
  }
  .area-top .eyebrow {
    font-size: 8px;
    letter-spacing: 0.08em;
  }
  .resolve {
    border: 0;
    border-radius: 4px;
    background: #fff4d18c;
    color: var(--contest);
    font-size: 10px;
    font-weight: 700;
    min-height: 44px;
    padding: 5px;
  }
  .rewards {
    display: flex;
    justify-content: space-around;
    align-items: end;
    gap: 5px;
    padding: 8px 0 12px;
    min-height: 100px;
  }
  .area-population {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    min-height: 50px;
    border-top: 1px solid #b9ac875c;
    padding-top: 5px;
  }
  .contender {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .contender-people {
    display: flex;
    flex-wrap: wrap;
  }
  .contender b {
    font-size: 9px;
    color: #716b56;
    border: 1px solid #aaa180;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
  }
  .contender b.qualifies {
    background: #425a49;
    color: #fff2c9;
    border-color: #425a49;
  }
  .no-rewards {
    font-size: 11px;
    color: #767664;
  }
  .compact {
    --tile-size: 51px;
  }
  .compact header {
    padding: 7px 9px;
  }
  .compact h3 {
    font-size: 21px;
  }
  .compact .area {
    padding: 5px;
  }
  .compact .rewards {
    min-height: 76px;
  }
  .compact .area-population {
    gap: 1px;
  }
  .compact .area-population :global(.person) {
    width: 19px;
    height: 24px;
  }
  .compact .contender b {
    width: 15px;
    height: 15px;
    font-size: 8px;
  }
  @media (max-width: 480px) {
    .contest-board {
      --tile-size: 54px;
    }
    .area {
      padding: 7px;
    }
    .area-population :global(.person) {
      width: 22px;
      height: 27px;
    }
  }

  .contest-board {
    --tile-size: 96px;
    background: var(--board-art) center/100% 100% no-repeat;
    border: 0;
    border-radius: 9px;
    padding: 4% 4% 5%;
    box-shadow:
      0 5px 0 #66502d,
      0 9px 15px #0005;
  }
  header {
    background: transparent;
    border: 0;
    min-height: 64px;
    padding: 0 8px 12px 38%;
  }
  h3,
  .compact h3 {
    font-size: 26px;
  }
  header p {
    font-size: 12px;
  }
  .threshold {
    font-size: 18px;
    background: #f5e6bd;
    border: 0;
  }
  .threshold small {
    font-size: 10px;
  }
  .areas {
    grid-template-columns: repeat(2, minmax(214px, 1fr));
    overflow-x: auto;
    padding: 0 3px 8px;
  }
  .area,
  .compact .area {
    padding: 6px;
  }
  .area + .area {
    border: 0;
  }
  .area-top .eyebrow {
    font-size: 12px;
  }
  .resolve {
    font-size: 14px;
    background: #fff4dbb8;
  }
  .contender b,
  .compact .contender b {
    width: 23px;
    height: 23px;
    font-size: 16px;
  }
  .area-population :global(.person),
  .compact .area-population :global(.person) {
    width: 36px;
    height: 44px;
  }
  .compact,
  .invention {
    --tile-size: 96px;
  }
  @media (max-width: 480px) {
    .contest-board {
      --tile-size: 96px;
    }
  }

  .contest-board.compact header {
    padding: 8px 9px 14px 38%;
  }
  .contender {
    flex-direction: column;
    gap: 3px;
  }
  .contender-people {
    flex-wrap: nowrap;
  }
  .area-top .eyebrow {
    font-size: 14px;
  }
  .area-top {
    background: #f5e8cbe8;
    border-radius: 3px;
    padding-inline: 5px;
  }
</style>
