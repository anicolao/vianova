import { test, expect, type Locator } from '@playwright/test';
import { shippedRegistration } from '../src/lib/presentation/tile-registration';
const initialLibraryX = shippedRegistration.faces.library.symbol.x;
const changedLibraryX = initialLibraryX + 7;
const expectX = async (locator: Locator, x: number) => {
  await expect.poll(() => locator.evaluate((el) => (el as HTMLElement).style.left)).toBe(`${x}%`);
};
import { readFileSync } from 'node:fs';
const canvas = (page: import('@playwright/test').Page) => page.locator('.canvas-bed');

test('layer inspector edits the actual tile, isolates real layers, and supports precise drag/keyboard undo', async ({
  page
}) => {
  await page.goto('/dev/layers/');
  await expect(page.getByLabel('Manifest piece')).toBeEnabled();
  await page.getByLabel('Manifest piece').selectOption('battle-13');
  await page.getByRole('button', { name: /^Building emblem/ }).click();
  await page.getByRole('spinbutton', { name: 'Building emblem x', exact: true }).fill('8');
  const layer = canvas(page).locator('[data-registration-layer="building-symbol"]');
  await expect(layer).toHaveAttribute('style', /left:\s*8%/);
  await canvas(page).focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('spinbutton', { name: 'Building emblem x', exact: true })
  ).toHaveValue('8.5');
  const box = (await layer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 32, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect(
    page.getByRole('spinbutton', { name: 'Building emblem x', exact: true })
  ).toHaveValue('18.5');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Building emblem x', exact: true })
  ).toHaveValue('8.5');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Building emblem x', exact: true })
  ).toHaveValue('18.5');
  await page.getByRole('button', { name: 'Isolate selected' }).click();
  await expect(canvas(page).locator('[data-layer="building-art"]')).not.toBeVisible();
  await expect(layer).toBeVisible();
  await page.getByRole('button', { name: 'Show all layers' }).click();
  await page.getByLabel('Layer separation').fill('32');
  await expect(canvas(page).locator('[data-component="Tile"]')).toHaveClass(/separated/);
  await expect(canvas(page).locator('[data-registration-layer="score-ink"]')).toHaveCSS(
    'transform',
    /matrix3d/
  );
  await page.screenshot({ path: 'test-results/review/layer-stack.png', fullPage: true });
  await page.getByLabel('Layer separation').fill('0');
  await page.getByRole('button', { name: 'Reset this layer' }).click();
  await page.getByLabel('Layer bounds').uncheck();
  await page.screenshot({ path: 'test-results/review/layer-registration.png', fullPage: true });
});

test('drafts are isolated; applying and restoring synchronizes the real gallery and existing lab iframe', async ({
  page,
  context
}) => {
  // Simulate saved settings and a tab draft from the previous published preview.
  // They must remain available in storage without masking the newly shipped layout.
  const previous = JSON.parse(JSON.stringify(shippedRegistration));
  previous.faces.library.symbol = { ...previous.faces.library.symbol, x: 4, width: 26, height: 26 };
  await context.addInitScript((book) => {
    localStorage.setItem('vianova::tile-registration:v1', JSON.stringify(book));
    localStorage.setItem('vianova::tile-registration:v1:previous', JSON.stringify(book));
    sessionStorage.setItem('vianova::tile-registration-draft:v1', JSON.stringify(book));
  }, previous);
  await page.goto('/dev/layers/?piece=invention-02');
  await expect(page.getByLabel('Manifest piece')).toBeEnabled();
  await page.getByRole('button', { name: /^Building emblem/ }).click();
  await page
    .getByRole('spinbutton', { name: 'Building emblem x', exact: true })
    .fill(String(changedLibraryX));
  await page.reload();
  await expect(page.getByLabel('Manifest piece')).toBeEnabled();
  await page.getByRole('button', { name: /^Building emblem/ }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Building emblem x', exact: true })
  ).toHaveValue(String(changedLibraryX));
  const gallery = await context.newPage();
  await gallery.goto('/gallery/');
  const emblem = gallery.locator(
    '[data-review-id="building-library"] [data-registration-layer="building-symbol"]'
  );
  await expectX(emblem, initialLibraryX);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('vianova::tile-registration:v1')!).faces.library.symbol
          .width
    )
  ).toBe(26);
  const lab = await context.newPage();
  await lab.goto('/dev/animations/');
  const inLab = lab
    .frameLocator('iframe')
    .locator(
      '[data-component="Tile"][data-building="library"] [data-registration-layer="building-symbol"]'
    )
    .first();
  await expectX(inLab, initialLibraryX);
  await page.getByRole('button', { name: 'Apply to gallery and lab' }).click();
  await expectX(emblem, changedLibraryX);
  await expectX(inLab, changedLibraryX);
  await page.reload();
  await expect(page.getByLabel('Manifest piece')).toBeEnabled();
  await page.getByRole('button', { name: /^Building emblem/ }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Building emblem x', exact: true })
  ).toHaveValue(String(changedLibraryX));
  await page.getByRole('button', { name: 'Remove browser overrides' }).click();
  await expectX(emblem, initialLibraryX);
  await expectX(inLab, initialLibraryX);
});

test('JSON export is portable, invalid import preserves the draft, and phone controls stay on screen', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dev/layers/');
  await expect(page.getByLabel('Manifest piece')).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByText('Import or export settings', { exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('tile-registration.json');
  const data = JSON.parse(readFileSync((await download.path())!, 'utf8'));
  expect(data.version).toBe(1);
  expect(data.faces.library.symbol.x).toBe(initialLibraryX);
  await page.getByLabel('Registration JSON', { exact: true }).fill('{"version":2}');
  await page.getByRole('button', { name: 'Load JSON into draft' }).click();
  await expect(page.getByRole('alert')).toHaveText(/version must be 1/);
  data.faces.library.symbol.x = 9;
  await page.getByLabel('Registration JSON', { exact: true }).fill(JSON.stringify(data));
  await page.getByRole('button', { name: 'Load JSON into draft' }).click();
  await page.getByRole('button', { name: /^Building emblem/ }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Building emblem x', exact: true })
  ).toHaveValue('9');
  await page.screenshot({
    path: 'test-results/review/layer-registration-phone.png',
    fullPage: true
  });
});
