<script lang="ts">
  import { buildingInfo, type Building } from '../presentation/types';
  let { building }: { building: Building } = $props();
  const uid = $props.id();
</script>

<svg viewBox="0 0 100 86" aria-hidden="true" class="building-art">
  <defs>
    <pattern id="{uid}-tessera" width="9" height="9" patternUnits="userSpaceOnUse"
      ><path
        d="M.8 .8H8.2V8.2H.8Z"
        fill="none"
        stroke="#2c302b"
        stroke-width=".65"
        opacity=".27"
      /><path d="M2 2H7" stroke="#fff5d1" stroke-width=".8" opacity=".4" /></pattern
    >
  </defs>
  <rect width="100" height="86" fill={buildingInfo[building].color} />
  <path d="M0 70Q22 63 50 70T100 69V86H0Z" fill="#142d3a" opacity=".12" />
  <g stroke="#30362d" stroke-width="1.8" stroke-linejoin="round" fill="#f5e3ae">
    {#if building === 'quarry'}
      <path d="M15 65V43H35V28H54V52H73V71H15Z" fill="#ead79e" />
      <path
        d="M15 43L25 36H43L35 43M35 28L45 21H63L54 28M54 52L64 45H82L73 52M35 43V65M54 28V65M15 54H35M35 42H54M54 62H73"
        fill="none"
      />
      <path
        d="M13 72H87M72 69V23L28 48M72 23L84 68M33 47H78M51 36V51"
        fill="none"
        stroke-width="3"
      />
      <path d="M47 51H57V62H47Z" fill="#d5b469" />
      <circle cx="72" cy="23" r="3" fill="#8b663d" />
    {:else if building === 'market'}
      <path d="M19 70V34H82V70Z" fill="#ba7337" />
      <path d="M14 35L23 17H77L86 35Z" fill="#faf0c7" />
      <path d="M23 17H33L28 35H17M44 17H55V35H40M66 17H77L83 35H69" fill="#bf5e3d" stroke="none" />
      <path
        d="M14 35Q20 43 26 35Q32 43 38 35Q44 43 50 35Q56 43 62 35Q68 43 74 35Q80 43 86 35M23 42V65M77 42V65"
        fill="none"
      />
      <path d="M15 58H85V72H15Z" fill="#e8ce8d" />
      <circle cx="29" cy="53" r="6" fill="#7e9a57" /><circle
        cx="40"
        cy="53"
        r="5"
        fill="#bf5544"
      /><path d="M55 56V45H65V56M68 56V48H76V56" fill="#dec36d" />
      <path d="M22 61V69M33 61V69M44 61V69M55 61V69M66 61V69M77 61V69" stroke-width="1" />
    {:else if building === 'temple'}
      <path d="M10 71H90V76H10ZM15 65H85V71H15ZM18 29H82V36H18Z" />
      <path d="M12 29L50 10L88 29Z" fill="#f5e7bf" />
      <path d="M29 27L50 17L71 27Z" fill="#56829b" />
      <path d="M27 36V65M42 36V65M58 36V65M73 36V65" stroke="#eee4bd" stroke-width="9" />
      <path d="M24 36V65M39 36V65M55 36V65M70 36V65" stroke="#3b5461" stroke-width="1" />
      <path
        d="M22 37H32M37 37H47M53 37H63M68 37H78M22 63H32M37 63H47M53 63H63M68 63H78"
        stroke-width="2"
      />
    {:else if building === 'barracks'}
      <path d="M14 73V24H33V39H67V24H86V73Z" fill="#d39a76" />
      <path d="M14 24V17H20V24H26V17H33V28H14M67 24V17H74V24H80V17H86V28H67" />
      <path d="M33 39V32H40V39H47V32H54V39H61V32H67V45H33" />
      <path d="M40 73V60Q50 44 60 60V73Z" fill="#543d35" />
      <path d="M21 38H26V47H21ZM74 38H79V47H74Z" fill="#563c32" />
      <path d="M19 55H30M70 55H81M16 65H32M68 65H84M35 48H64" stroke="#9b644c" stroke-width="1" />
      <path d="M44 24V42L50 47L56 42V24Z" fill="#bd523e" /><path d="M50 27V40" stroke="#e9c56d" />
    {:else if building === 'library'}
      <path d="M16 70V32L50 15L84 32V70Z" fill="#e5d5a3" />
      <path d="M12 32L50 11L88 32Z" fill="#a9bd80" />
      <path d="M25 65V39H75V65Z" fill="#405842" />
      <path d="M28 47H72M28 56H72M49 39V65" stroke="#e5d5a3" stroke-width="2" />
      <path
        d="M31 41V46M36 40V46M42 41V46M54 41V46M59 40V46M65 41V46M32 50V55M39 49V55M44 50V55M54 50V55M62 49V55M68 50V55"
        stroke="#d1b969"
        stroke-width="3"
      />
      <path d="M29 69V59Q40 54 50 61Q60 54 71 59V69Q60 64 50 71Q40 64 29 69Z" fill="#fff0c6" />
      <path d="M50 61V71M34 61L45 63M55 63L66 61" stroke-width="1" />
    {:else}
      <path d="M13 75V31H19V20H81V31H87V75H66V49Q50 25 34 49V75Z" fill="#e3d2d6" />
      <path d="M10 75H36V79H10ZM64 75H90V79H64ZM15 20H85V26H15ZM23 10H77V20H23Z" />
      <path d="M35 75V48Q50 27 65 48V75" fill="#62516e" />
      <path d="M24 33V70M76 33V70" stroke="#a691b4" stroke-width="6" />
      <path
        d="M20 31H29M71 31H80M20 70H29M71 70H80M30 26V34M41 26V31M51 26V30M61 26V32M71 26V34"
        stroke-width="1.3"
      />
      <path d="M29 14H71" stroke="#a691b4" />
    {/if}
  </g>
  <rect width="100" height="86" fill="url(#{uid}-tessera)" pointer-events="none" />
  <path d="M4 4H96V82H4Z" fill="none" stroke="#f8ebc7" stroke-width="1" opacity=".6" />
</svg>

<style>
  .building-art {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
