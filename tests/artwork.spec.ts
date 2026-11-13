import { test, expect } from '@playwright/test';
import { shippedRegistration } from '../src/lib/presentation/tile-registration';
import type { Building } from '../src/lib/presentation/types';

test('rich shared layers load, keep symbols consistent and permit monochrome comparison', async ({
  page
}) => {
  await page.goto('/gallery/');
  await expect(page.getByLabel('Search components')).toBeEnabled();
  const quarry = page.locator('[data-review-id="building-quarry"]');
  await expect(quarry.locator('[data-layer="building-art"]')).toHaveAttribute(
    'src',
    /mosaic\/quarry.png$/
  );
  await expect(quarry.locator('[data-building-symbol="quarry"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Compare without colour', exact: true }).click();
  await expect(quarry).toHaveCSS('filter', 'grayscale(1)');
  await page.screenshot({ path: 'test-results/review/mosaic-monochrome.png', fullPage: true });
  await page.getByRole('button', { name: 'Restore colour', exact: true }).click();
  await page.getByRole('button', { name: /^Scrolls & banners/ }).click();
  const scroll = page.locator('[data-review-id="scroll-quarry-1"]');
  await expect(scroll.locator('[data-building-symbol="quarry"]')).toHaveCount(2); // same symbol in both scoring panels
  await expect(scroll.locator('[data-layer="score-material"]').first()).toHaveAttribute(
    'data-asset',
    /score-scroll.png$/
  );
  await page.screenshot({ path: 'test-results/review/mosaic-scoring.png', fullPage: true });
  const broken = await page
    .locator('img')
    .evaluateAll((elements) =>
      (elements as HTMLImageElement[])
        .filter((img) => !img.complete || !img.naturalWidth)
        .map((img) => img.src)
    );
  expect(broken).toEqual([]);
});

test('phone game honours the supplied calibration while keeping physical tiles and touch targets full size', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/review/');
  await expect(page.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
  // The visible city keeps real tiles; panning replaces destructive shrinking.
  const city = page.locator('.city-column [data-component="CityBoard"]');
  await expect(city).toBeVisible();
  const face = city.locator('[data-component="Tile"]').first();
  const tileBounds = (await face.boundingBox())!;
  expect(tileBounds.width).toBeGreaterThanOrEqual(96);
  const building = (await face.getAttribute('data-building')) as Building;
  const symbol = face.locator('[data-registration-layer="building-symbol"]');
  expect((await symbol.boundingBox())!.width).toBeCloseTo(
    (tileBounds.width * shippedRegistration.faces[building].symbol.width) / 100,
    1
  );
  const scored = city
    .locator('[data-component="Tile"]')
    .filter({ has: page.locator('[data-component="ScoreSymbol"]') })
    .first();
  const scoredBounds = (await scored.boundingBox())!;
  const shape = (await scored
    .locator('[data-component="ScoreSymbol"]')
    .getAttribute('class'))!.includes('banner')
    ? 'banner'
    : 'scroll';
  for (const [layer, p] of [
    ['score-material', shippedRegistration.scores[shape].material],
    ['score-ink', shippedRegistration.scores[shape].ink]
  ] as const) {
    const rect = (await scored.locator(`[data-registration-layer="${layer}"]`).boundingBox())!;
    expect(rect.x - scoredBounds.x).toBeCloseTo((scoredBounds.width * p.x) / 100, 1);
    expect(rect.y - scoredBounds.y).toBeCloseTo((scoredBounds.height * p.y) / 100, 1);
    expect(rect.width).toBeCloseTo((scoredBounds.width * p.width) / 100, 1);
    expect(rect.height).toBeCloseTo((scoredBounds.height * p.height) / 100, 1);
  }
  await expect(scored.locator('.target')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/review/mosaic-game-phone.png', fullPage: true });
});
