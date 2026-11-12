<script lang="ts">
  import { gameArt } from '../presentation/art';
  import type { Building } from '../presentation/types';
  let { building }: { building: Building } = $props();
</script>

<img
  class="building-art"
  data-layer="building-art"
  src={gameArt(building)}
  alt=""
  aria-hidden="true"
  draggable="false"
/>

<style>
  .building-art {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
