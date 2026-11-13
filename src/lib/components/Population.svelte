<script lang="ts">
  import { gameArt } from '../presentation/art';
  import { ownerSymbols } from '../presentation/types';
  import { type Person } from '../presentation/types';
  let {
    person,
    small = false,
    selected = false,
    disabled = false,
    reason,
    onclick
  }: {
    person: Person;
    small?: boolean;
    selected?: boolean;
    disabled?: boolean;
    reason?: string;
    onclick?: () => void;
  } = $props();
</script>

{#snippet figure()}<img
    src={gameArt('population')}
    alt=""
    draggable="false"
    data-layer="carved-wood"
  /><span class="ownership" aria-hidden="true">{ownerSymbols[person.owner]}</span><b
    aria-hidden="true">{person.value}</b
  >{/snippet}
{#if onclick}<button
    class="person {person.owner}"
    class:small
    class:selected
    aria-label="{person.ownerLabel ?? person.owner} population {person.value}"
    aria-pressed={selected}
    {disabled}
    title={reason}
    {onclick}
    data-person-id={person.id}
    data-component="Population">{@render figure()}</button
  >{:else}<span
    class="person {person.owner}"
    class:small
    class:selected
    role="img"
    aria-label="{person.ownerLabel ?? person.owner} population {person.value}"
    data-person-id={person.id}
    data-component="Population">{@render figure()}</span
  >{/if}

<style>
  .person {
    --person-color: #277b7a;
    width: 44px;
    height: 52px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    filter: drop-shadow(0 3px 2px #0004);
  }
  .person img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .ownership {
    position: absolute;
    top: 8%;
    left: 34%;
    width: 32%;
    text-align: center;
    font: 700 16px/1 sans-serif;
    color: var(--person-color);
    text-shadow: 0 1px #fff9;
  }
  b {
    position: absolute;
    top: 43%;
    left: 25%;
    width: 50%;
    color: #29231b;
    text-align: center;
    font:
      700 19px/1 'Atkinson Hyperlegible',
      sans-serif;
  }
  .selected {
    outline: 3px solid #f2cc72;
    outline-offset: 2px;
    border-radius: 6px;
  }
  .person.coral {
    --person-color: #b85f53;
  }
  .person.gold {
    --person-color: #806011;
  }
  .person.lilac {
    --person-color: #85649d;
  }
  .person.small {
    width: 36px;
    height: 44px;
  }
  button.person {
    width: 44px;
    height: 52px;
  }
</style>
