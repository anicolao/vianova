<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    placementCSS,
    tileLayers,
    type LayerPlacement,
    type LayerPresentation,
    type TileLayer
  } from '../presentation/tile-registration';
  let {
    id,
    placement,
    presentation,
    children
  }: {
    id: TileLayer;
    placement: LayerPlacement;
    presentation?: LayerPresentation;
    children: Snippet;
  } = $props();
</script>

<span
  class="registered-layer"
  data-registration-layer={id}
  class:layer-guide={presentation?.guides}
  class:active-layer={presentation?.active === id}
  style={`${placementCSS(placement)};--layer-z:${(presentation?.order ?? tileLayers).indexOf(id)};--layer-separation:${presentation?.separation ?? 0}px;visibility:${presentation?.hidden?.includes(id) ? 'hidden' : 'visible'}`}
>
  {@render children()}
</span>

<style>
  .registered-layer {
    position: absolute;
    display: grid;
    place-items: center;
    transform: translateZ(calc(var(--layer-z) * var(--layer-separation)))
      rotate(var(--layer-rotation));
    transform-origin: center;
    transform-style: preserve-3d;
  }
  .layer-guide {
    outline: 1px dashed #49e8e0;
    outline-offset: 1px;
  }
  .active-layer {
    outline: 2px solid #f38938;
    outline-offset: 2px;
  }
</style>
