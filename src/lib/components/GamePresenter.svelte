<script lang="ts">
  import type { PresentationController } from '../presentation/controller';
  import GameSurface from './GameSurface.svelte';
  import BuildingInspector from './BuildingInspector.svelte';
  let { controller, tabletop = false }: { controller: PresentationController; tabletop?: boolean } =
    $props();
  const snapshot = $derived($controller);
  const inspected = $derived(snapshot.interaction.inspector);
  const cells = $derived(
    inspected?.owner === snapshot.presentation.view.viewer
      ? snapshot.presentation.view.city
      : inspected
        ? (snapshot.presentation.view.opponentCities[inspected.owner] ?? [])
        : []
  );
  const cell = $derived(
    inspected ? (cells.find((c) => c.x === inspected.x && c.y === inspected.y) ?? null) : null
  );
</script>

<GameSurface {snapshot} {tabletop} onIntent={(intent) => controller.dispatch(intent)} />
<BuildingInspector {cell} onClose={() => controller.dispatch({ type: 'close-inspector' })} />
