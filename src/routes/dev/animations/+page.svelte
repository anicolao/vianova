<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { base } from '$app/paths';
  import WorkshopHeader from '$lib/review/WorkshopHeader.svelte';
  import { scenarios, getScenario } from '$lib/presentation/scenarios';
  import { devices, type DeviceId } from '$lib/review/devices';
  let scenarioId = $state('place'),
    deviceId = $state<DeviceId>('desktop'),
    landscape = $state(false),
    time = $state(0),
    playing = $state(false),
    speed = $state(1),
    loop = $state(false),
    reduced = $state(false);
  let fit = $state(true),
    available = $state(1000),
    iframe = $state<HTMLIFrameElement>(),
    stage = $state<HTMLDivElement>(),
    ready = $state(false),
    query = $state('');
  let hydrated = $state(false);
  let playerCount = $state(4);
  const scenario = $derived(getScenario(scenarioId));
  const device = $derived(devices.find((d) => d.id === deviceId)!);
  const width = $derived(
    landscape && deviceId !== 'desktop' && deviceId !== 'tabletop' ? device.height : device.width
  );
  const height = $derived(
    landscape && deviceId !== 'desktop' && deviceId !== 'tabletop' ? device.width : device.height
  );
  const scale = $derived(fit ? Math.min(1, available / (width + 2)) : 1);
  const source = $derived(
    `${base}/${deviceId === 'tabletop' ? 'tabletop' : 'review'}/?embedded=1&scenario=${scenarioId}&time=${time.toFixed(3)}${reduced ? '&reduced=1' : ''}&players=${playerCount}`
  );
  // Stable source changes only when the actual viewport surface changes. Clock updates use postMessage.
  const route = $derived(`${base}/${deviceId === 'tabletop' ? 'tabletop' : 'review'}/?embedded=1`);
  const visible = $derived(
    scenarios.filter((s) =>
      `${s.title} ${s.description}`.toLowerCase().includes(query.toLowerCase())
    )
  );
  const currentBeat = $derived(
    [...scenario.beats].reverse().find((b) => b.at <= time) ?? scenario.beats[0]
  );
  const groups = [...new Set(scenarios.map((s) => s.group))];
  let mounted = false;
  function broadcast(reset = false) {
    if (!ready) return;
    iframe?.contentWindow?.postMessage(
      { type: 'vianova-frame', scenario: scenarioId, time, reduced, reset, players: playerCount },
      location.origin
    );
  }
  function updateUrl() {
    if (!mounted) return;
    const url = new URL(location.href);
    url.searchParams.set('scenario', scenarioId);
    url.searchParams.set('device', deviceId);
    url.searchParams.set('players', String(playerCount));
    if (landscape) url.searchParams.set('landscape', '1');
    else url.searchParams.delete('landscape');
    url.searchParams.set('time', time.toFixed(2));
    history.replaceState(null, '', url);
  }
  function choose(id: string) {
    scenarioId = id;
    time = 0;
    playing = false;
    broadcast(true);
    updateUrl();
  }
  function seek(t: number) {
    playing = false;
    time = Math.max(0, Math.min(scenario.duration, t));
    broadcast(true);
    updateUrl();
  }
  function replay() {
    time = 0;
    playing = true;
    broadcast(true);
  }
  function play() {
    if (time >= scenario.duration) time = 0;
    playing = !playing;
    broadcast(true);
  }
  $effect(() => {
    scenarioId;
    time;
    reduced;
    broadcast();
  });
  $effect(() => {
    deviceId;
    landscape;
    void tick().then(() => {
      if (mounted) {
        broadcast(true);
        updateUrl();
      }
    });
  });
  onMount(() => {
    mounted = true;
    hydrated = true;
    const params = new URLSearchParams(location.search);
    const count = Number(params.get('players'));
    if ([2, 3, 4].includes(count)) playerCount = count;
    scenarioId = getScenario(params.get('scenario')).id;
    const d = params.get('device');
    if (devices.some((x) => x.id === d)) deviceId = d as DeviceId;
    landscape = params.get('landscape') === '1';
    const t = Number(params.get('time'));
    time = Number.isFinite(t) ? Math.max(0, Math.min(scenario.duration, t)) : 0;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = media.matches;
    const mediaChange = () => {
      reduced = media.matches;
    };
    media.addEventListener('change', mediaChange);
    const observer = new ResizeObserver((entries) => {
      available = Math.max(200, entries[0].contentRect.width - 32);
    });
    if (stage) observer.observe(stage);
    const receive = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== iframe?.contentWindow) return;
      if (e.data?.type === 'vianova-interaction') {
        playing = false;
        updateUrl();
      }
      if (e.data?.type === 'vianova-ready') {
        ready = true;
        broadcast(true);
      }
      if (e.data?.type === 'vianova-scenario' && scenarios.some((s) => s.id === e.data.id)) {
        choose(e.data.id);
        playing = true;
      }
    };
    window.addEventListener('message', receive);
    let raf = 0,
      last = 0;
    function animate(now: number) {
      if (playing) {
        time = Math.min(scenario.duration, time + (last ? (now - last) / 1000 : 0) * speed);
        if (time >= scenario.duration) {
          if (loop && !reduced) time = 0;
          else {
            playing = false;
            updateUrl();
          }
        }
      }
      last = now;
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,select,textarea,button,a')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        play();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        seek(time + 0.1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seek(time - 0.1);
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('message', receive);
      window.removeEventListener('keydown', key);
      media.removeEventListener('change', mediaChange);
    };
  });
</script>

<svelte:head
  ><title>Animation lab · Via Nova</title><meta
    name="description"
    content="Review the exact production Svelte components across mobile, tablet, desktop, and shared tabletop layouts."
  /></svelte:head
>
<WorkshopHeader active="lab" />
<main class="work-main lab-main" inert={!hydrated} data-lab-ready={hydrated}>
  <div class="page-heading">
    <div>
      <span class="eyebrow">Mosaic Forum · Motion & interaction studies</span>
      <h1>Watch a city come to life.</h1>
      <p>
        Explore the actions of Via Nova, one moment at a time. Every device renders the same shared
        game components.
      </p>
    </div>
    <a class="control" href="{base}/gallery/">Browse components ↗</a>
  </div>
  <div class="lab-layout">
    <aside class="scenarios">
      <label class="scene-search"
        ><span class="eyebrow">{scenarios.length} motion studies</span><input
          aria-label="Search animation studies"
          type="search"
          placeholder="Find an action…"
          bind:value={query}
        /></label
      >{#each groups as group}{#if visible.some((s) => s.group === group)}<div
            class="scenario-group"
          >
            <span class="eyebrow">{group}</span
            >{#each visible.filter((s) => s.group === group) as s}<button
                class:active={scenarioId === s.id}
                aria-pressed={scenarioId === s.id}
                onclick={() => choose(s.id)}
                ><span>{s.title}</span><small>{s.duration.toFixed(1)}s</small></button
              >{/each}
          </div>{/if}{/each}{#if !visible.length}<p class="no-scenes">
          No studies match this search.
        </p>{/if}
      <div class="lab-note">
        Presentation fixtures, not a rules engine. Use the controls inside the preview to explore
        local interactions.
      </div>
    </aside>
    <section class="lab-workspace">
      <div class="device-toolbar">
        <div class="devices" role="group" aria-label="Preview device">
          {#each devices as d}<button
              class:active={deviceId === d.id}
              aria-pressed={deviceId === d.id}
              onclick={() => {
                deviceId = d.id;
              }}>{d.name}</button
            >{/each}
        </div>
        <div class="viewport-tools">
          <label class="player-count"
            >Players<select
              aria-label="Preview player count"
              bind:value={playerCount}
              onchange={(event) => {
                playerCount = Number(event.currentTarget.value);
                broadcast(true);
                updateUrl();
              }}
              ><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option
              ></select
            ></label
          >
          {#if deviceId === 'phone' || deviceId === 'tablet'}<button
              class="control"
              aria-label="Rotate preview"
              onclick={() => (landscape = !landscape)}>↻</button
            >{/if}<button class="control" aria-pressed={fit} onclick={() => (fit = !fit)}
            >{fit ? 'Fit' : '1:1'}</button
          ><a
            class="control"
            href={source.replace('embedded=1', 'embedded=0')}
            target="_blank"
            rel="noreferrer"
            aria-label="Open preview at native size">↗</a
          >
        </div>
      </div>
      <div class="viewport-meta">
        <span
          ><i class:ready></i>{width} × {height}
          <span class="scale-label">· {Math.round(scale * 100)}% preview scale</span></span
        ><span
          >{deviceId === 'tabletop'
            ? 'Shared touch table · private hands concealed'
            : 'Personal screen · private hand visible'}</span
        >
      </div>
      <div class="preview-stage" class:full={!fit} bind:this={stage}>
        <div
          class="device-frame"
          class:phone={deviceId === 'phone'}
          style:width="{(width + 2) * scale}px"
          style:height="{(height + 2) * scale}px"
        >
          <iframe
            bind:this={iframe}
            src={route}
            title="Via Nova {device.name} production component preview"
            style:width="{width}px"
            style:height="{height}px"
            style:transform="scale({scale})"
            onload={() => {
              ready = true;
              broadcast(true);
            }}
          ></iframe>
        </div>
      </div>
      <section class="playback panel" aria-label="Animation playback">
        <div class="playback-heading">
          <div>
            <span class="eyebrow">{scenario.group}</span>
            <h2>{scenario.title}</h2>
          </div>
          <span class="time-readout"
            >{time.toFixed(1)} <small>/ {scenario.duration.toFixed(1)} s</small></span
          >
        </div>
        <p class="scene-description">{scenario.description}</p>
        <div class="timeline">
          <input
            aria-label="Animation timeline"
            type="range"
            min="0"
            max={scenario.duration}
            step="0.01"
            value={time}
            oninput={(event) => seek(Number(event.currentTarget.value))}
          />
          <div class="beat-markers">
            {#each scenario.beats as b, i}<button
                class:current={currentBeat.at === b.at}
                style:left="{(b.at / scenario.duration) * 100}%"
                aria-label="Seek to beat {i + 1}: {b.label}"
                title={b.label}
                onclick={() => seek(b.at)}><span></span><small>{i + 1}</small></button
              >{/each}
          </div>
        </div>
        <div class="playback-controls">
          <div class="transport">
            <button
              class="control primary"
              aria-label={playing ? 'Pause animation' : 'Play animation'}
              onclick={play}>{playing ? 'Ⅱ Pause' : '▶ Play'}</button
            ><button class="control" onclick={replay}>↻ Replay</button><button
              class="control"
              aria-label="Jump to animation end"
              onclick={() => seek(scenario.duration)}>End ⇥</button
            >
          </div>
          <div class="motion-options">
            <label
              >Speed<select aria-label="Animation speed" bind:value={speed}
                ><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}
                  >2×</option
                ></select
              ></label
            ><label><input type="checkbox" bind:checked={loop} />Loop</label><label
              ><input
                type="checkbox"
                bind:checked={reduced}
                onchange={() => broadcast(true)}
              />Reduced motion</label
            >
          </div>
        </div>
        <div class="beat-explanation" aria-live="polite">
          <span
            >{reduced
              ? '✓'
              : String(scenario.beats.indexOf(currentBeat) + 1).padStart(2, '0')}</span
          >
          <div>
            <strong>{reduced ? 'Reduced motion · settled state' : currentBeat.label}</strong>
            <p>
              {reduced
                ? 'Moving pieces are omitted. The same final fixture is shown immediately.'
                : currentBeat.detail}
            </p>
          </div>
        </div>
      </section>
      <div class="review-contract">
        <b>Same components. Real viewport.</b> The iframe renders <code>GameSurface.svelte</code> at
        the selected dimensions. Clock controls sample a deterministic presentation timeline; they
        do not implement game legality or calculate final scores.
        <span>Space: play/pause · ← / →: step 0.1s</span>
      </div>
    </section>
  </div>
</main>
<footer class="work-footer">
  <span>Via Nova by Stefan Alexander · GPLv3</span><span
    >Mosaic Forum / Component & interaction review</span
  >
</footer>

<style>
  .lab-main {
    max-width: 1700px;
  }
  .lab-layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 32px;
  }
  .scenarios {
    min-width: 0;
  }
  .scene-search {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  .scene-search .eyebrow {
    font-size: 9px;
    color: #8d815e;
  }
  .scene-search input {
    width: 100%;
    background: #fffaf0;
    border: 1px solid #d3c6a8;
    border-radius: 5px;
    min-height: 44px;
    padding: 9px 11px;
    font-size: 11px;
  }
  .scenario-group {
    margin-bottom: 22px;
  }
  .scenario-group > .eyebrow {
    font-size: 9px;
    color: #a08b5b;
    padding-left: 10px;
    display: block;
    margin-bottom: 8px;
  }
  .scenario-group button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 1px solid transparent;
    color: #56695e;
    font-size: 11px;
    width: 100%;
    text-align: left;
    min-height: 44px;
    padding: 9px 11px;
    border-radius: 5px;
  }
  .scenario-group button.active {
    background: #e5dcc7;
    border-color: #cdbb91;
    color: #233e40;
    font-weight: 700;
  }
  .scenario-group button small {
    font-size: 9px;
    color: #95896b;
    font-weight: 400;
  }
  .lab-note {
    font-size: 10px;
    line-height: 1.7;
    color: #90856c;
    border-top: 1px solid #dcd1b9;
    padding: 20px 10px;
  }
  .lab-workspace {
    min-width: 0;
  }
  .device-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 13px;
  }
  .devices {
    display: flex;
    gap: 3px;
    background: #e9e1d0;
    border: 1px solid #d8ccb3;
    border-radius: 7px;
    padding: 4px;
  }
  .devices button {
    border: 0;
    background: transparent;
    padding: 8px 18px;
    min-height: 38px;
    color: #73806e;
    font-size: 11px;
    border-radius: 4px;
  }
  .devices button.active {
    background: #fffaf0;
    box-shadow: 0 1px 4px #7e6f4930;
    color: #29423f;
    font-weight: 700;
  }
  .player-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #7b8069;
  }
  .player-count select {
    background: #fffaf0;
    border: 1px solid #d8ccb3;
    border-radius: 4px;
    min-height: 42px;
    color: #52694f;
    padding: 6px;
    font-size: 11px;
  }
  .viewport-tools {
    display: flex;
    gap: 6px;
  }
  .viewport-tools .control {
    font-size: 11px;
    min-height: 42px;
    padding: 8px 12px;
  }
  .viewport-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    font-size: 9px;
    color: #8a8c74;
    padding: 0 3px 12px;
  }
  .viewport-meta > span:first-child {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .viewport-meta i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c8b67f;
  }
  .viewport-meta i.ready {
    background: #60977f;
  }
  .preview-stage {
    background: repeating-conic-gradient(#e4ddcf 0 25%, #e9e2d4 0 50%) 0 0/16px 16px;
    border: 1px solid #d3c8b0;
    border-radius: 9px;
    padding: 22px 16px;
    display: flex;
    justify-content: center;
    align-items: start;
    min-height: 320px;
    max-height: 790px;
    overflow: auto;
    scrollbar-width: thin;
  }
  .preview-stage.full {
    justify-content: start;
  }
  .device-frame {
    position: relative;
    flex-shrink: 0;
    border: 1px solid #172d37;
    box-shadow: 0 8px 20px #283e3930;
    background: #17323c;
    overflow: hidden;
    border-radius: 6px;
  }
  .device-frame.phone {
    border-radius: 20px;
    box-shadow:
      0 0 0 5px #263b3f,
      0 12px 25px #19333033;
    margin: 6px;
  }
  iframe {
    border: 0;
    transform-origin: top left;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  }
  .playback {
    margin-top: 20px;
    padding: 23px;
  }
  .playback-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }
  .playback-heading .eyebrow {
    font-size: 9px;
    color: #a18a57;
  }
  .playback-heading h2 {
    font-size: 32px;
    margin-top: 4px;
  }
  .time-readout {
    font-size: 22px;
    color: #385347;
    white-space: nowrap;
  }
  .time-readout small {
    font-size: 11px;
    color: #979077;
  }
  .scene-description {
    font-size: 12px;
    max-width: 800px;
    color: #7c806d;
    margin-top: 10px;
    line-height: 1.6;
  }
  .timeline {
    margin: 22px 0 32px;
    position: relative;
  }
  .timeline > input {
    width: 100%;
    height: 24px;
    accent-color: #a08645;
    margin: 0;
    cursor: pointer;
  }
  .beat-markers {
    position: relative;
    height: 13px;
    margin: 0 8px;
  }
  .beat-markers button {
    position: absolute;
    transform: translateX(-50%);
    padding: 0;
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 32px;
    min-height: 32px;
    gap: 3px;
    color: #a59a7b;
  }
  .beat-markers button > span {
    width: 5px;
    height: 5px;
    background: #a59a7b;
    border-radius: 50%;
  }
  .beat-markers button.current > span {
    background: #31594f;
  }
  .beat-markers small {
    font-size: 9px;
  }
  .playback-controls {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
  }
  .transport {
    display: flex;
    gap: 7px;
  }
  .transport .control {
    font-size: 11px;
    padding: 9px 13px;
  }
  .motion-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }
  .motion-options label {
    display: flex;
    align-items: center;
    gap: 5px;
    min-height: 44px;
    font-size: 10px;
    color: #7b7e67;
  }
  .motion-options select {
    background: #f2ebdc;
    border: 1px solid #dbceb0;
    border-radius: 4px;
    padding: 5px;
    font-size: 11px;
    min-height: 36px;
    color: #5a6b57;
  }
  .motion-options input {
    accent-color: #486b59;
    min-width: 16px;
    min-height: 16px;
  }
  .beat-explanation {
    border-top: 1px solid #e1d7c0;
    padding-top: 19px;
    margin-top: 18px;
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .beat-explanation > span {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px;
    color: #b2995d;
    line-height: 1;
  }
  .beat-explanation strong {
    font-size: 12px;
    color: #466353;
  }
  .beat-explanation p {
    font-size: 11px;
    color: #8c8972;
    margin-top: 3px;
  }
  .review-contract {
    font-size: 10px;
    color: #928b76;
    line-height: 1.7;
    padding: 20px 4px;
  }
  .review-contract b {
    color: #637b66;
  }
  .review-contract code {
    font-size: 9px;
  }
  .review-contract > span {
    display: block;
    margin-top: 7px;
    color: #9c947e;
  }
  .no-scenes {
    font-size: 12px;
    color: #8b8165;
    padding: 15px;
  }
  @media (max-width: 1050px) {
    .lab-layout {
      grid-template-columns: 180px minmax(0, 1fr);
      gap: 22px;
    }
    .devices button {
      padding: 8px 10px;
      font-size: 10px;
    }
    .viewport-meta > span:last-child {
      display: none;
    }
    .playback {
      padding: 18px;
    }
    .motion-options {
      gap: 9px;
    }
  }
  @media (max-width: 700px) {
    .lab-layout {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .scenarios {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      overflow: auto;
      max-height: 195px;
      padding-bottom: 6px;
    }
    .scene-search {
      margin: 0;
      width: 100%;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }
    .scene-search input {
      width: auto;
      flex: 1;
    }
    .scene-search .eyebrow {
      white-space: nowrap;
    }
    .scenario-group {
      display: contents;
    }
    .scenario-group > .eyebrow,
    .lab-note {
      display: none;
    }
    .scenario-group button {
      width: auto;
      min-height: 38px;
      font-size: 10px;
      border-color: #ddd1b8;
      background: #f4eddc;
      padding: 8px 10px;
      gap: 9px;
    }
    .device-toolbar {
      gap: 6px;
      flex-wrap: wrap;
    }
    .devices {
      flex: 1;
      justify-content: space-between;
      padding: 3px;
    }
    .devices button {
      padding: 8px;
      font-size: 10px;
    }
    .player-count {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #7b8069;
    }
    .player-count select {
      background: #fffaf0;
      border: 1px solid #d8ccb3;
      border-radius: 4px;
      min-height: 42px;
      color: #52694f;
      padding: 6px;
      font-size: 11px;
    }
    .viewport-tools {
      gap: 3px;
    }
    .viewport-tools .control {
      padding: 7px 10px;
      min-height: 40px;
    }
    .viewport-meta {
      font-size: 8px;
    }
    .scale-label {
      font-size: 8px;
    }
    .preview-stage {
      padding: 18px 16px;
      max-height: 700px;
      min-height: 250px;
    }
    .playback {
      margin-top: 14px;
      padding: 16px;
    }
    .playback-heading h2 {
      font-size: 29px;
    }
    .time-readout {
      font-size: 19px;
    }
    .scene-description {
      font-size: 11px;
    }
    .transport .control {
      font-size: 10px;
      padding: 8px 11px;
    }
    .playback-controls {
      gap: 10px;
    }
    .motion-options {
      justify-content: space-between;
      width: 100%;
    }
    .beat-explanation {
      align-items: start;
    }
    .beat-explanation p {
      font-size: 10px;
    }
    .review-contract {
      font-size: 10px;
    }
  }
</style>
