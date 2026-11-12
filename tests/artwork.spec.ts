import { test, expect } from '@playwright/test';

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
    'src',
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

test('small phone game uses full artwork with readable score targets and tactile input sizes', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/review/');
  await expect(page.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
  // The visible city keeps real tiles; panning replaces destructive shrinking.
  const city = page.locator('.city-column [data-component="CityBoard"]');
  await expect(city).toBeVisible();
  const symbol = city.locator('.building-emblem').first();
  const bounds = await symbol.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(24);
  const target = city.locator('.target').first();
  expect((await target.boundingBox())!.width).toBeGreaterThanOrEqual(24);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/review/mosaic-game-phone.png', fullPage: true });
});
