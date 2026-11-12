import { base } from '$app/paths';
/** The exact same shipped raster layers are used in every route. */
export const gameArt = (name: string) => `${base}/assets/mosaic/${name}.png`;
