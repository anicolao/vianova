import { test, expect, type Page } from '@playwright/test';
import { galleryItems, categories } from '../src/lib/review/catalog';
import { scenarios } from '../src/lib/review/scenarios';
const screenshot = async (page: Page, name: string) => {
  await page.screenshot({ path: `test-results/review/${name}.png`, fullPage: true });
};
test('gallery renders all component families and inspectors use their production renderer', async ({
  page
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/gallery/');
  await expect(page.getByRole('heading', { name: 'The pieces of a new Rome.' })).toBeVisible();
  for (const c of categories) {
    await page.getByRole('button', { name: new RegExp(`^${c.name.replace('&', '&')}`) }).click();
    const items = galleryItems.filter((i) => i.category === c.id);
    await expect(page.locator('.component-card')).toHaveCount(items.length);
    for (const item of items) {
      await expect(page.locator(`[data-review-id="${item.id}"]`)).toHaveAttribute(
        'data-renderer',
        item.renderer
      );
    }
  }
  await page.getByLabel('Search components').fill('Domino Arch');
  await page.getByRole('button', { name: 'Inspect Domino Arch · 3', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('[data-component="Tile"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Inspect Domino Arch · 3', exact: true })
  ).toBeFocused();
  expect(errors).toEqual([]);
  await page.getByLabel('Search components').fill('');
  await page.getByRole('button', { name: /^Buildings & Arches/ }).click();
  await screenshot(page, 'gallery-desktop');
});
test('gallery is usable at phone width and starting selection counts marked values', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/gallery/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await screenshot(page, 'gallery-phone');
  await page.getByLabel('Search components').fill('Starting-hand selection');
  await page.getByRole('button', { name: 'Inspect Starting-hand selection' }).click();
  const dialog = page.getByRole('dialog');
  const choices = dialog.locator('[data-component="Domino"]');
  await expect(choices).toHaveCount(5);
  await choices.nth(0).click();
  await choices.nth(1).click();
  await choices.nth(2).click();
  await expect(dialog.getByRole('button', { name: 'Keep selection' })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Keep selection' }).click();
  await dialog.getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(
    dialog.locator('[data-component="PrivateHand"] [data-component="Domino"]')
  ).toHaveCount(3);
  await expect(dialog.getByText(/Simulated: Kept starting dominos h0, h1, h2/)).toBeVisible();
});
test('lab timeline reaches every scene final state, reverses, and shows travelers', async ({
  page
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/dev/animations/');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('[data-component="GameSurface"]')).toBeVisible();
  for (const s of scenarios) {
    await page.locator('.scenario-group button').filter({ hasText: s.title }).click();
    await page.getByRole('button', { name: 'Jump to animation end' }).click();
    await expect(frame.locator('[data-study-beat]')).toHaveAttribute(
      'data-study-beat',
      String(s.beats.length - 1)
    );
  }
  await page.locator('.scenario-group button').filter({ hasText: 'Create population' }).click();
  await page.getByLabel('Animation timeline', { exact: true }).fill('1');
  await expect(frame.locator('[data-motion="recruit"]')).toBeVisible();
  await page.getByLabel('Animation timeline', { exact: true }).fill('0');
  await expect(frame.locator('[data-motion]')).toHaveCount(0);
  await expect(frame.locator('[data-study-beat]')).toHaveAttribute('data-study-beat', '0');
  await page.getByRole('checkbox', { name: 'Reduced motion' }).check();
  await expect(frame.locator('[data-study-beat]')).toHaveAttribute('data-study-beat', '1');
  await expect(frame.locator('[data-motion]')).toHaveCount(0);
  expect(errors).toEqual([]);
  await screenshot(page, 'lab-desktop');
});
test('lab embeds exact native viewport sizes and conceals hands on the tabletop', async ({
  page
}) => {
  await page.goto('/dev/animations/?device=phone&scenario=rebuild');
  const frame = page.frameLocator('iframe');
  await expect(page.locator('iframe')).toHaveCSS('width', '390px');
  await expect(frame.getByRole('button', { name: 'Your city', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Rotate preview' }).click();
  await expect(page.locator('iframe')).toHaveCSS('width', '844px');
  await page.getByRole('button', { name: 'Tablet', exact: true }).click();
  await expect(page.locator('iframe')).toHaveCSS('width', '1180px');
  await page.getByRole('button', { name: 'Desktop', exact: true }).click();
  await expect(page.locator('iframe')).toHaveCSS('width', '1440px');
  await page.getByRole('button', { name: 'Tabletop', exact: true }).click();
  await expect(page.locator('iframe')).toHaveCSS('width', '1920px');
  await expect(frame.locator('.seated-city')).toHaveCount(4);
  await expect(
    frame.locator('[data-component="PrivateHand"] [data-component="Domino"]')
  ).toHaveCount(0);
  await expect(frame.getByText('Your dominos stay private.')).toBeVisible();
  await screenshot(page, 'lab-tabletop');
});
test('direct review uses real placement, rotation, cancellation, commitment, and inspection callbacks', async ({
  page
}) => {
  await page.goto('/review/');
  await expect(page.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
  const hand = page.locator('[data-component="PrivateHand"]');
  await hand.locator('button[data-component="Domino"]').first().click();
  await expect(hand.locator('button[aria-pressed="true"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Stage tile at x 4, y 4', exact: true }).click();
  await page.getByRole('button', { name: 'Rotate', exact: false }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(hand.locator('button[aria-pressed="true"]')).toHaveCount(0);
  await hand.locator('button[data-component="Domino"]').first().click();
  await expect(hand.locator('button[aria-pressed="true"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Stage tile at x 4, y 4', exact: true }).click();
  await page.getByRole('button', { name: 'Place here ✓' }).click();
  await expect(hand.locator('[data-component="Domino"]')).toHaveCount(2);
  await expect(page.locator('[data-cell="4,4"] [data-component="Tile"]')).toHaveAttribute(
    'data-building',
    'market'
  );
  await page.locator('[data-cell="4,4"] button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Market' })).toBeVisible();
});
for (const viewport of [
  { id: 'phone', width: 390, height: 844 },
  { id: 'phone-landscape', width: 844, height: 390 },
  { id: 'tablet', width: 820, height: 1180 },
  { id: 'desktop', width: 1440, height: 1000 }
]) {
  test(`personal surface fits ${viewport.id} with the production renderer`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/review/?scenario=rebuild&time=3');
    await expect(page.locator('[data-component="GameSurface"]')).toBeVisible();
    await expect(page.locator('[data-cell="1,1"] [data-component="Tile"]')).toHaveAttribute(
      'data-building',
      'library'
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width
    );
    if (viewport.id === 'phone') {
      await page.getByRole('button', { name: /^Contests/ }).click();
      await expect(page.getByRole('region', { name: 'Battle board' })).toBeVisible();
      await page.getByRole('button', { name: 'Players', exact: true }).click();
      await expect(page.getByRole('region', { name: 'Aurelia player board' })).toBeVisible();
    }
    await screenshot(page, `surface-${viewport.id}`);
  });
}
test('tabletop positions stay inside the 1080p surface and city motion anchors identify only the viewer', async ({
  page
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/tabletop/?embedded=0&scenario=rebuild');
  await expect(page.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
  await expect(page.locator('[data-anchor="city-1,1"]')).toHaveCount(1);
  const seats = await page.locator('.seated-city').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    })
  );
  await screenshot(page, 'tabletop-native');
  for (const seat of seats) {
    expect(seat.left).toBeGreaterThanOrEqual(0);
    expect(seat.right).toBeLessThanOrEqual(1920);
    expect(seat.top).toBeGreaterThanOrEqual(54);
    expect(seat.bottom).toBeLessThanOrEqual(1080);
  }
});
test('interacting with the iframe pauses the lab clock and preserves the selection', async ({
  page
}) => {
  await page.goto('/dev/animations/');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
  await page.getByRole('button', { name: 'Play animation', exact: true }).click();
  await frame.locator('[data-component="PrivateHand"] button').first().click();
  await expect(page.getByRole('button', { name: 'Play animation', exact: true })).toBeVisible();
  await expect(
    frame.locator('[data-component="PrivateHand"] button[aria-pressed="true"]')
  ).toHaveCount(1);
});
test('tabletop projection supports two, three, and four players without inventing seats', async ({
  page
}) => {
  await page.goto('/dev/animations/?device=tabletop');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
  for (const count of [2, 3, 4]) {
    await page.getByLabel('Preview player count').selectOption(String(count));
    await expect(frame.locator('.seated-city')).toHaveCount(count);
    await expect(
      frame.locator('[data-component="PrivateHand"] [data-component="Domino"]')
    ).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Jump to animation end' }).click();
  await expect(frame.locator('[data-study-beat]')).toHaveAttribute('data-study-beat', '2');
});
