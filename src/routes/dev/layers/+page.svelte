<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { base } from '$app/paths';
  import WorkshopHeader from '$lib/review/WorkshopHeader.svelte';
  import Tile from '$lib/components/Tile.svelte';
  import { gameDominos, singleTiles, startingDominos } from '$lib/manifest';
  import { buildings, buildingInfo, type TileData } from '$lib/presentation/types';
  import {
    cloneRegistration,
    layerNames,
    limits,
    parseRegistration,
    presentLayers,
    setPlacement,
    shippedRegistration,
    tileRegistration,
    type LayerPlacement,
    type RegistrationBook,
    type TileLayer
  } from '$lib/presentation/tile-registration';
  import {
    registrationDraftKey,
    reviewRegistrationContext,
    type RegistrationSession
  } from '$lib/review/registration-session';

  const draftKey = registrationDraftKey(base);
  const session = getContext<RegistrationSession>(reviewRegistrationContext);
  const specimens: {
    id: string;
    label: string;
    tile: TileData;
    back?: boolean;
    backKind?: string;
  }[] = [
    ...singleTiles.map((tile) => ({
      id: tile.id,
      label: `${tile.id} · ${tile.building}${tile.score ? ` · ${tile.score.shape}/${tile.score.target}` : ' · Arch 2·2·2'}${tile.plus ? ' +' : ''}`,
      tile
    })),
    ...[...gameDominos, ...startingDominos].flatMap((d) =>
      d.tiles.map((tile) => ({
        id: tile.id,
        label: `${tile.id} · ${tile.building}${tile.score ? ` · ${tile.score.shape}` : ''}${tile.start ? ` · starting ${tile.start}` : ''}`,
        tile
      }))
    ),
    ...['domino', 'battle', 'invention', 'start-A', 'start-B', 'start-C'].map((backKind) => ({
      id: `reverse-${backKind}`,
      label: `Reverse · ${backKind}`,
      tile: { id: `reverse-${backKind}`, building: 'arch' as const },
      back: true,
      backKind
    }))
  ];
  let ready = $state(false),
    selected = $state('invention-02'),
    active = $state<TileLayer>('score-ink');
  let draft = $state<RegistrationBook>(cloneRegistration(get(session))),
    edited = $state(false);
  let hidden = $state<TileLayer[]>([]),
    guides = $state(true),
    separation = $state(0),
    size = $state(320),
    monochrome = $state(false);
  let protectedPreview = $state(false);
  let message = $state(''),
    error = $state(''),
    jsonText = $state('');
  let undoStack = $state<RegistrationBook[]>([]),
    redoStack = $state<RegistrationBook[]>([]);
  const specimen = $derived(specimens.find((p) => p.id === selected) ?? specimens[0]);
  const tile = $derived(specimen.tile);
  const layout = $derived(tileRegistration(draft, tile, specimen.back));
  const layers = $derived(presentLayers(tile, specimen.back, specimen.backKind, protectedPreview));
  const placement = $derived(layout[active]);
  const dirty = $derived(JSON.stringify(draft) !== JSON.stringify($session));
  const scope = $derived(
    active === 'artwork' && specimen.back
      ? 'All reverses'
      : active === 'artwork' || active === 'building-symbol'
        ? `All ${buildingInfo[tile.building].name} faces`
        : active === 'score-material' || active === 'score-ink'
          ? `All ${tile.score?.shape ?? 'scroll'} plaques`
          : 'All tile families'
  );
  let drag: {
    pointer: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
    layer: TileLayer;
    placement: LayerPlacement;
    saved: boolean;
  } | null = null;
  let stage: HTMLDivElement;
  $effect(() => {
    const applied = $session;
    if (!edited) draft = cloneRegistration(applied);
  });
  $effect(() => {
    if (!layers.includes(active))
      active = layers.includes('building-symbol') ? 'building-symbol' : 'artwork';
  });
  $effect(() => {
    const changed = dirty,
      book = draft;
    if (!ready) return;
    try {
      if (changed) sessionStorage.setItem(draftKey, JSON.stringify(book));
      else sessionStorage.removeItem(draftKey);
    } catch {
      /* Download and Apply remain explicit alternatives if tab storage is unavailable. */
    }
  });
  onMount(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) {
        draft = parseRegistration(JSON.parse(saved));
        edited = true;
        message = 'Restored this tab’s unapplied draft.';
      }
    } catch {
      error = 'The previous draft could not be restored. Applied settings are in use.';
    }

    const q = new URLSearchParams(location.search),
      id = q.get('piece'),
      building = q.get('building');
    if (id && specimens.some((p) => p.id === id)) selected = id;
    else if (buildings.includes(building as (typeof buildings)[number])) chooseFamily(building!);
    if (window.innerWidth < 600) size = 256;
    ready = true;
  });
  function chooseFamily(building: string) {
    selected = (specimens.find(
      (p) => p.tile.building === building && !p.back && p.tile.score?.shape === tile.score?.shape
    ) ?? specimens.find((p) => p.tile.building === building && !p.back))!.id;
    hidden = [];
  }
  function remember() {
    undoStack = [...undoStack.slice(-79), cloneRegistration(draft)];
    redoStack = [];
  }
  function change(key: keyof LayerPlacement, value: number) {
    if (!Number.isFinite(value)) return;
    const [min, max] = limits[key];
    if (value < min || value > max) {
      error = `${key} must be ${min}–${max}.`;
      return;
    }
    const next = setPlacement(draft, tile, active, { ...placement, [key]: value }, specimen.back);
    remember();
    draft = next;
    edited = true;
    message = '';
    error = '';
  }
  function undo() {
    const prior = undoStack.at(-1);
    if (!prior) return;
    redoStack = [...redoStack, cloneRegistration(draft)];
    undoStack = undoStack.slice(0, -1);
    draft = prior;
    message = '';
    edited = true;
    error = '';
  }
  function redo() {
    const next = redoStack.at(-1);
    if (!next) return;
    undoStack = [...undoStack, cloneRegistration(draft)];
    redoStack = redoStack.slice(0, -1);
    draft = next;
    message = '';
    edited = true;
    error = '';
  }
  function toggle(layer: TileLayer) {
    hidden = hidden.includes(layer) ? hidden.filter((l) => l !== layer) : [...hidden, layer];
  }
  function isolate() {
    hidden = layers.filter((l) => l !== active);
  }
  function resetLayer() {
    remember();
    draft = setPlacement(
      draft,
      tile,
      active,
      tileRegistration(shippedRegistration, tile, specimen.back)[active],
      specimen.back
    );
    edited = true;
    message = 'Selected layer restored to shipped placement.';
    error = '';
  }
  function resetDraft() {
    remember();
    draft = cloneRegistration();
    edited = true;
    message = 'Draft reset to shipped settings. Apply to change other views.';
    error = '';
  }
  function discard() {
    draft = cloneRegistration(get(session));
    edited = false;
    undoStack = [];
    redoStack = [];
    message = 'Loaded the settings currently applied to review views.';
    error = '';
  }
  function apply() {
    try {
      session.apply(draft);
      edited = false;
      message =
        'Applied and saved in this browser. Gallery, personal review, tabletop and lab use these settings.';
      error = '';
    } catch {
      error = 'Settings could not be saved in this browser. Download JSON to keep your draft.';
    }
  }
  function restoreShipped() {
    try {
      session.reset();
      draft = cloneRegistration();
      edited = false;
      undoStack = [];
      redoStack = [];
      message = 'Removed local overrides. All views use shipped settings.';
      error = '';
    } catch {
      error = 'Local settings could not be removed.';
    }
  }
  function loadJSON() {
    try {
      const next = parseRegistration(JSON.parse(jsonText));
      remember();
      draft = next;
      edited = true;
      message = 'JSON loaded into draft. Apply to update the review views.';
      error = '';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Invalid JSON';
    }
  }
  function download() {
    jsonText = JSON.stringify(draft, null, 2) + '\n';
    const url = URL.createObjectURL(new Blob([jsonText], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tile-registration.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message = 'Downloaded tile-registration.json. This is the exact shared configuration format.';
  }
  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || separation > 0) return;
    const target = event.target as Element;
    if (!target.closest('[data-component="Tile"]')) return;
    const layer = target.closest<HTMLElement>('[data-registration-layer]')?.dataset
      .registrationLayer as TileLayer | undefined;
    if (layer && layers.includes(layer)) active = layer;
    const rect = stage.querySelector('[data-component="Tile"]')!.getBoundingClientRect();
    drag = {
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      layer: active,
      placement: { ...layout[active] },
      saved: false
    };
    stage.setPointerCapture(event.pointerId);
    stage.focus();
    event.preventDefault();
  }
  function pointerMove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const dx = event.clientX - drag.startX,
      dy = event.clientY - drag.startY;
    if (!drag.saved && Math.abs(dx) + Math.abs(dy) < 2) return;
    if (!drag.saved) {
      remember();
      drag.saved = true;
    }
    const clamp = (n: number) => Math.round(Math.min(150, Math.max(-50, n)) * 10) / 10;
    draft = setPlacement(
      draft,
      tile,
      drag.layer,
      {
        ...drag.placement,
        x: clamp(drag.placement.x + (dx / drag.width) * 100),
        y: clamp(drag.placement.y + (dy / drag.height) * 100)
      },
      specimen.back
    );
    edited = true;
    message = '';
    error = '';
  }
  function pointerEnd(event: PointerEvent) {
    if (drag?.pointer === event.pointerId) {
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      drag = null;
    }
  }
  function nudge(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 2 : 0.5;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
      change('x', placement.x + (event.key === 'ArrowLeft' ? -step : step));
    else change('y', placement.y + (event.key === 'ArrowUp' ? -step : step));
  }
</script>

<svelte:head
  ><title>Tile layer registration · Via Nova</title><meta
    name="description"
    content="Inspect and align the actual shared Via Nova tile artwork, emblems and scoring layers."
  /></svelte:head
>
<WorkshopHeader active="layers" />
<main class="registration-main">
  <header class="intro">
    <div>
      <span class="eyebrow">Production tile assembly</span>
      <h1>Register the layers.</h1>
      <p>Move the actual layers, inspect the stack, then check the same piece at game size.</p>
    </div>
    <a class="control" href="{base}/gallery/">Return to gallery</a>
  </header>
  <fieldset class="specimen-picker" disabled={!ready}>
    <legend>Reference piece</legend>
    <label
      >Manifest piece<select
        bind:value={selected}
        onchange={() => {
          hidden = [];
          drag = null;
        }}
        >{#each specimens as p}<option value={p.id}>{p.label}</option>{/each}</select
      ></label
    >
    <div class="families">
      {#each buildings as b}<button
          type="button"
          class:current={!specimen.back && tile.building === b}
          onclick={() => chooseFamily(b)}>{buildingInfo[b].name}</button
        >{/each}
    </div>
  </fieldset>
  <div class="editor-grid">
    <section class="visuals" aria-label="Shared tile preview">
      <div class="preview-controls">
        <label
          >Preview size <select bind:value={size}
            ><option value={192}>192 px</option><option value={256}>256 px</option><option
              value={320}>320 px</option
            ><option value={384}>384 px</option></select
          ></label
        >
        <label><input type="checkbox" bind:checked={guides} /> Layer bounds</label>
        <label><input type="checkbox" bind:checked={monochrome} /> Grayscale</label>
        <label
          >Exploded stack <input
            aria-label="Layer separation"
            type="range"
            min="0"
            max="48"
            step="1"
            bind:value={separation}
          /><output>{separation} px</output></label
        >
      </div>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (The labelled editor supports pointer drag and keyboard nudges; numeric alternatives are provided.) -->
      <div
        class="canvas-bed"
        class:monochrome
        bind:this={stage}
        tabindex="0"
        role="application"
        aria-label="Tile registration canvas. Drag a layer or use arrow keys to move the selected layer."
        onpointerdown={pointerDown}
        onpointermove={pointerMove}
        onpointerup={pointerEnd}
        onpointercancel={pointerEnd}
        onlostpointercapture={() => {
          drag = null;
        }}
        onkeydown={nudge}
      >
        <div class="tile-angle" class:exploded={separation > 0} style:--tile-size={`${size}px`}>
          <Tile
            {tile}
            protectedArch={protectedPreview}
            back={specimen.back}
            backKind={specimen.backKind}
            registration={layout}
            layerPresentation={{ active, guides, hidden, separation }}
          />
        </div>
      </div>
      {#if tile.building === 'arch' && !specimen.back}<label
          ><input type="checkbox" bind:checked={protectedPreview} /> Show permanent placement label</label
        >{/if}
      <p class="canvas-help">
        {separation > 0
          ? 'Exploded view shows assembly order. Reassemble to drag accurately; numeric controls still work.'
          : 'Touch a layer to select it, then drag. Focus the canvas and use arrow keys for 0.5% nudges; Shift moves 2%.'}
      </p>
      <section class="actual-sizes" aria-label="Actual game sizes">
        <h2>Check at actual size</h2>
        <p>
          Unscaled, assembled production tiles. The smallest version still needs to communicate
          clearly.
        </p>
        <div class="size-comparison">
          {#each [96, 104, 128] as n}<figure style:--tile-size={`${n}px`}>
              <Tile
                {tile}
                protectedArch={protectedPreview}
                back={specimen.back}
                backKind={specimen.backKind}
                registration={layout}
              />
              <figcaption>{n} × {n} CSS px</figcaption>
            </figure>{/each}
        </div>
      </section>
      <details class="layer-proof">
        <summary>Inspect each layer separately</summary>
        <div class="layer-thumbnails">
          {#each layers as layer}<figure style:--tile-size="128px">
              <Tile
                {tile}
                protectedArch={protectedPreview}
                back={specimen.back}
                backKind={specimen.backKind}
                registration={layout}
                layerPresentation={{ hidden: layers.filter((l) => l !== layer), guides: true }}
              />
              <figcaption>{layerNames[layer]}</figcaption>
            </figure>{/each}
        </div>
      </details>
    </section>
    <aside class="controls" aria-label="Layer registration controls">
      <fieldset disabled={!ready}>
        <legend>Assembly order · back to front</legend>
        <div class="layer-list">
          {#each layers as layer}<div>
              <input
                type="checkbox"
                checked={!hidden.includes(layer)}
                aria-label={`Show ${layerNames[layer]}`}
                onchange={() => toggle(layer)}
              /><button
                class:current={active === layer}
                aria-pressed={active === layer}
                onclick={() => {
                  active = layer;
                }}>{layerNames[layer]}<small>{layer}</small></button
              >
            </div>{/each}
        </div>
        <div class="button-row">
          <button class="control" onclick={isolate}>Isolate selected</button><button
            class="control"
            onclick={() => (hidden = [])}>Show all layers</button
          >
        </div>
      </fieldset>
      <fieldset class="placement-controls" disabled={!ready}>
        <legend>{layerNames[active]}</legend>
        <p class="scope">{scope}. Coordinates are percentages of the full tile.</p>
        {#each Object.keys(limits) as field}{@const key = field as keyof LayerPlacement}<label
            class="coordinate"
            ><span
              >{key === 'rotation' ? 'Rotation' : key[0].toUpperCase() + key.slice(1)}{key ===
              'rotation'
                ? ' °'
                : key === 'opacity'
                  ? ''
                  : ' %'}</span
            ><input
              type="range"
              aria-label={`${layerNames[active]} ${key} slider`}
              min={limits[key][0]}
              max={limits[key][1]}
              step={key === 'opacity' ? 0.01 : 0.1}
              value={placement[key]}
              oninput={(e) => change(key, Number(e.currentTarget.value))}
            /><input
              type="number"
              aria-label={`${layerNames[active]} ${key}`}
              min={limits[key][0]}
              max={limits[key][1]}
              step={key === 'opacity' ? 0.01 : 0.1}
              value={placement[key]}
              oninput={(e) => change(key, e.currentTarget.valueAsNumber)}
            /></label
          >{/each}
        <p class="scope">
          At {size} px: x {((placement.x * size) / 100).toFixed(1)}, y {(
            (placement.y * size) /
            100
          ).toFixed(1)}, width {((placement.width * size) / 100).toFixed(1)}, height {(
            (placement.height * size) /
            100
          ).toFixed(1)} px.
        </p>
        <div class="button-row">
          <button class="control" disabled={!undoStack.length} onclick={undo}>Undo</button><button
            class="control"
            disabled={!redoStack.length}
            onclick={redo}>Redo</button
          ><button class="control" onclick={resetLayer}>Reset this layer</button>
        </div>
      </fieldset>
      <div class="apply-box">
        <strong>{dirty ? 'Unapplied draft changes' : 'Draft matches applied settings'}</strong
        ><button class="control primary" disabled={!ready || !dirty} onclick={apply}
          >Apply to gallery and lab</button
        >
        <p>
          Apply saves in this browser for every review route, including the lab iframe. Unapplied
          drafts are recovered in this tab. Download JSON to keep or share the settings; this page
          does not write repository files.
        </p>
        <div class="button-row">
          <button class="control" onclick={discard} disabled={!ready}>Discard draft</button><button
            class="control"
            onclick={resetDraft}
            disabled={!ready}>Reset draft</button
          >
        </div>
        <button class="text-button" onclick={restoreShipped} disabled={!ready}
          >Remove browser overrides</button
        >
      </div>
      <p class="feedback" role="status">{message}</p>
      {#if error}<p class="error" role="alert">{error}</p>{/if}
      <details class="json-controls">
        <summary>Import or export settings</summary>
        <p>
          Export uses the exact format of <code>src/lib/presentation/tile-registration.json</code>.
          Loading changes only this draft until you apply it.
        </p>
        <div class="button-row">
          <button class="control" onclick={download} disabled={!ready}>Download JSON</button><button
            class="control"
            onclick={() => (jsonText = JSON.stringify(draft, null, 2))}>Show draft JSON</button
          >
        </div>
        <label
          >Registration JSON<textarea
            aria-label="Registration JSON"
            rows="12"
            spellcheck="false"
            bind:value={jsonText}></textarea></label
        ><button class="control" onclick={loadJSON} disabled={!ready}>Load JSON into draft</button>
      </details>
    </aside>
  </div>
  <aside class="boundary-note">
    This is the shared <code>Tile</code>, <code>RegisteredLayer</code> and <code>ScoreSymbol</code> assembly,
    including its real images and live ink. The face image includes the building, stone rim and reserved
    areas; they cannot be moved independently within that bitmap. Emblems are calibrated per building,
    plaques and ink per scoring shape, and other marks across all tiles. Layer visibility and explosion
    are inspection settings and are never saved into game artwork.
  </aside>
</main>

<style>
  .registration-main {
    max-width: 1560px;
    margin: auto;
    padding: 30px;
  }
  .intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin: 0 0 28px;
  }
  .intro h1 {
    margin: 8px 0 12px;
  }
  .intro p {
    color: #59675b;
    font-size: 15px;
  }
  fieldset {
    border: 1px solid #cbbd9c;
    border-radius: 6px;
    padding: 16px;
    min-width: 0;
  }
  legend {
    font-weight: 700;
    font-size: 14px;
    padding: 0 6px;
  }
  label {
    font-size: 14px;
  }
  select,
  textarea,
  input[type='number'] {
    padding: 8px;
    border: 1px solid #bcae8d;
    border-radius: 4px;
    background: #fffaf0;
    color: #273d37;
    min-height: 44px;
    max-width: 100%;
  }
  .specimen-picker {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    margin-bottom: 22px;
  }
  .specimen-picker label {
    display: grid;
    gap: 7px;
  }
  .families {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    align-content: end;
  }
  .families button {
    background: #ede4cf;
    color: #34453a;
    border: 1px solid #c6b794;
    border-radius: 5px;
    min-height: 44px;
    padding: 8px 12px;
  }
  .families .current,
  .layer-list button.current {
    background: #243f45;
    color: #fff1cb;
  }
  .editor-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 390px;
    gap: 26px;
    align-items: start;
  }
  .visuals,
  .controls {
    min-width: 0;
  }
  .preview-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 15px;
    padding: 0 0 16px;
  }
  .preview-controls label {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .preview-controls input[type='range'] {
    width: 100px;
  }
  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    accent-color: #2a6168;
  }
  .canvas-bed {
    perspective: 1200px;
    min-height: 500px;
    display: grid;
    place-items: center;
    padding: 110px 40px;
    overflow: auto;
    background: radial-gradient(ellipse at center, #3a5657, #122e38);
    border-radius: 6px;
    touch-action: none;
  }
  .canvas-bed.monochrome {
    filter: grayscale(1);
  }
  .tile-angle {
    transform-style: preserve-3d;
  }
  .tile-angle.exploded {
    transform: rotateX(48deg) rotateZ(-22deg);
  }
  .canvas-help {
    font-size: 14px;
    color: #5d675a;
    margin: 14px 0 24px;
  }
  .actual-sizes {
    padding: 20px 0;
    border-top: 1px solid #cfc3a9;
  }
  .actual-sizes p {
    font-size: 14px;
    color: #5d675a;
    margin: 8px 0 15px;
  }
  .size-comparison,
  .layer-thumbnails {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    background: #1d3a43;
    border-radius: 5px;
  }
  figure {
    margin: 0;
  }
  figcaption {
    color: #e0d6b7;
    margin-top: 12px;
    font-size: 12px;
    max-width: 128px;
  }
  .layer-thumbnails {
    margin-top: 12px;
    align-items: start;
  }
  .controls {
    display: grid;
    gap: 16px;
  }
  .layer-list {
    display: grid;
    gap: 5px;
  }
  .layer-list > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .layer-list button {
    flex: 1;
    min-height: 49px;
    border: 1px solid #d1c5ad;
    padding: 8px 12px;
    background: #fff8e6;
    color: #34473b;
    text-align: left;
    font-size: 14px;
    border-radius: 4px;
  }
  .layer-list small {
    display: block;
    font-size: 11px;
    opacity: 0.7;
    margin-top: 2px;
  }
  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 12px;
  }
  .control {
    font-size: 13px;
    padding: 8px 10px;
  }
  .scope {
    font-size: 13px;
    color: #65705f;
    margin-bottom: 14px;
  }
  .coordinate {
    display: grid;
    grid-template-columns: 75px minmax(45px, 1fr) 82px;
    align-items: center;
    gap: 8px;
    margin-bottom: 7px;
  }
  .coordinate input {
    min-width: 0;
    width: 100%;
  }
  .coordinate input[type='range'] {
    accent-color: #2c696a;
  }
  .coordinate input[type='number'] {
    font-variant-numeric: tabular-nums;
  }
  .apply-box {
    display: grid;
    gap: 12px;
    background: #e9dfc8;
    padding: 18px;
    border: 1px solid #d4c3a0;
    border-radius: 6px;
  }
  .apply-box p,
  .json-controls p {
    font-size: 13px;
    line-height: 1.5;
    color: #5b6659;
  }
  .text-button {
    border: 0;
    background: none;
    min-height: 44px;
    text-decoration: underline;
    color: #4b5e50;
  }
  .feedback {
    font-size: 14px;
    color: #325f52;
  }
  .feedback:empty {
    display: none;
  }
  .error {
    font-size: 14px;
    color: #8a3424;
    padding: 12px;
    background: #f9e5d6;
  }
  details {
    border-top: 1px solid #cec1a4;
    padding-top: 16px;
  }
  summary {
    min-height: 44px;
    cursor: pointer;
    font-weight: 700;
    font-size: 15px;
  }
  textarea {
    width: 100%;
    font: 12px/1.5 monospace;
    margin: 8px 0;
    resize: vertical;
  }
  .json-controls label {
    display: block;
    margin-top: 16px;
  }
  .boundary-note {
    margin-top: 30px;
    padding: 20px;
    background: #e9e1cf;
    color: #5b675b;
    font-size: 13px;
    line-height: 1.6;
    border-radius: 6px;
  }
  @media (max-width: 1100px) {
    .specimen-picker {
      grid-template-columns: 1fr;
    }
    .editor-grid {
      grid-template-columns: minmax(0, 1fr) 350px;
      gap: 18px;
    }
  }
  @media (max-width: 900px) {
    .registration-main {
      padding: 20px 16px;
    }
    .intro {
      align-items: start;
      flex-direction: column;
    }
    .editor-grid {
      grid-template-columns: 1fr;
    }
    .canvas-bed {
      min-height: 460px;
      padding-inline: 24px;
    }
    .controls {
      grid-row: auto;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .tile-angle {
      transition: none;
    }
  }
</style>
