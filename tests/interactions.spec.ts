import { test, expect, type Page } from '@playwright/test';
async function review(page: Page, url = '/review/') {
  await page.goto(url);
  await expect(page.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
}
const choice = (page: Page) => page.locator('[data-component="InteractionPanel"]');
test('a chosen market domino is staged, cancelled, confirmed with pending feedback, and rendered in the hand', async ({
  page
}) => {
  await review(page);
  const market = page.locator('[data-component="DominoMarket"]');
  await market.locator('button[data-domino-id="m4"]').click();
  await expect(choice(page).getByText('m4', { exact: true })).toBeVisible();
  await expect(market.locator('[data-domino-id="m4"]')).toHaveAttribute('aria-pressed', 'true');
  await choice(page).getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(market.locator('[data-domino-id="m4"]')).toBeVisible();
  await market.locator('button[data-domino-id="m1"]').click();
  await choice(page).getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(choice(page)).toHaveAttribute('aria-busy', 'true');
  await expect(choice(page).getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(page.locator('[data-component="PrivateHand"] [data-domino-id="m1"]')).toBeVisible();
  await expect(market.locator('[data-domino-id="m1"]')).toHaveCount(0);
  await expect(market.locator('[data-domino-id="m4"]')).toBeVisible();
});
test('shared pending/error UI preserves the rejected ID and retries the same command', async ({
  page
}) => {
  await review(page);
  await page.getByRole('button', { name: 'Simulate next rejection', exact: true }).click();
  await page.locator('[data-component="DominoMarket"] [data-domino-id="m3"]').click();
  await choice(page).getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(choice(page).getByRole('alert')).toContainText('Simulated rejection');
  await page.screenshot({ path: 'test-results/review/interaction-error.png', fullPage: true });
  await expect(choice(page).getByText('m3', { exact: true })).toBeVisible();
  await choice(page).getByRole('button', { name: 'Retry confirmation' }).click();
  await expect(page.locator('[data-component="PrivateHand"] [data-domino-id="m3"]')).toBeVisible();
});
test('specific area and reward IDs flow through confirmation, rebuild selection, and city targeting', async ({
  page
}) => {
  await review(page);
  await page.getByRole('button', { name: 'Resolve Invention 2', exact: true }).click();
  await expect(
    choice(page).getByRole('button', { name: 'Confirm choice', exact: true })
  ).toBeDisabled();
  await choice(page).locator('[data-reward-id="invention1-r1"]').click();
  await choice(page).getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(choice(page).locator('[data-tile-id="invention1-rt1"]')).toBeVisible();
  await expect(
    page.locator('[data-anchor="invention-1"] [data-reward-id="invention1-r1"]')
  ).toHaveCount(0);
  await expect(page.locator('[data-anchor="battle-0"] [data-reward-id]')).toHaveCount(2);
  await choice(page).locator('button[data-tile-id="invention1-rt1"]').click();
  await page.locator('[data-cell="2,2"] button').click();
  await expect(
    choice(page).getByRole('button', { name: 'Confirm choice', exact: true })
  ).toBeDisabled();
  await expect(choice(page).getByText('Arches are permanent and cannot be covered.')).toBeVisible();
  await page.locator('[data-cell="0,0"] button').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await choice(page).getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(page.locator('[data-cell="0,0"] [data-tile-id="invention1-rt1"]')).toBeVisible();
});
test('selected turn/generated actions, skip cancellation and skip confirmation use the shared controls', async ({
  page
}) => {
  await review(page);
  const turn = page.locator('[data-component="TurnControls"]');
  await turn.getByRole('button', { name: /Take dominos/ }).click();
  await expect(turn.getByRole('button', { name: /Take dominos/ })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await page
    .locator('[data-component="ActionQueue"]')
    .getByRole('button', { name: /2 Temple actions/ })
    .click();
  await expect(
    page.locator('[data-component="ActionQueue"] button[aria-pressed="true"]')
  ).toHaveCount(1);
  await page.getByRole('button', { name: 'Skip remaining actions →' }).click();
  await choice(page).getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('[data-component="ActionQueue"]')).toBeVisible();
  await page.getByRole('button', { name: 'Skip remaining actions →' }).click();
  await choice(page).getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(page.locator('[data-component="ActionQueue"]')).toHaveCount(0);
});
test('a specific ready meeple is deployed to the chosen valid area; invalid operations are disabled', async ({
  page
}) => {
  await review(page);
  await expect(page.locator('.player-column [data-person-id="coral-soldier-1"]')).toBeDisabled();
  await page.locator('.player-column [data-person-id="teal-soldier-1"]').click();
  await expect(choice(page).getByRole('button', { name: 'Upgrade to 2' })).toBeDisabled();
  await choice(page).getByRole('button', { name: 'Deploy', exact: true }).click();
  await expect(
    choice(page).getByRole('button', { name: 'Invention 1', exact: true })
  ).toBeDisabled();
  await choice(page).getByRole('button', { name: 'Battle 2', exact: true }).click();
  await choice(page).getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(page.locator('.player-column [data-person-id="teal-soldier-1"]')).toHaveCount(0);
  await expect(
    page.locator('[data-anchor="battle-1"] [data-person-id="teal-soldier-1"]')
  ).toBeVisible();
  await expect(page.locator('.player-column [data-person-id="teal-soldier-0"]')).toBeVisible();
});
test('signed city cells and all-edge rotated placement use stable anchors and the shared inspector', async ({
  page
}) => {
  await review(page, '/review/?city=signed');
  await expect(page.locator('[data-anchor="city--2,-1"] [data-component="Tile"]')).toBeVisible();
  await page.locator('[data-component="PrivateHand"] [data-domino-id="h1"]').click();
  await page.getByRole('button', { name: 'Stage tile at x -3, y -2', exact: true }).click();
  await choice(page)
    .getByRole('button', { name: /Rotate/ })
    .click();
  await choice(page)
    .getByRole('button', { name: /Rotate/ })
    .click();
  await expect(page.locator('[data-cell="-4,-2"] [data-tile-id="h1-b"]')).toBeVisible();
  await choice(page).getByRole('button', { name: 'Place here ✓' }).click();
  await expect(page.locator('[data-cell="-4,-2"] button[data-tile-id="h1-b"]')).toBeVisible();
  await page.locator('[data-cell="-4,-2"] button').click();
  await expect(page.locator('[data-component="BuildingInspector"]')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Quarry' })).toBeVisible();
  await page.screenshot({ path: 'test-results/review/interaction-inspector.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('[data-cell="-4,-2"] button')).toBeFocused();
});
test('an empty city can grow left and up without losing rotated ghosts', async ({ page }) => {
  await review(page, '/review/?city=empty');
  await expect(
    page.locator('.city-column [data-component="CityBoard"] [data-component="Tile"]')
  ).toHaveCount(0);
  await page.locator('[data-component="PrivateHand"] [data-domino-id="h0"]').click();
  await page.getByRole('button', { name: 'Stage tile at x -1, y -1', exact: true }).click();
  for (let i = 0; i < 3; i++)
    await choice(page)
      .getByRole('button', { name: /Rotate/ })
      .click();
  await expect(page.locator('[data-cell="-1,-2"] [data-tile-id="h0-b"]')).toBeVisible();
  await choice(page).getByRole('button', { name: 'Place here ✓' }).click();
  await expect(page.locator('[data-cell="-1,-2"] button[data-tile-id="h0-b"]')).toBeVisible();
});
test('gallery uses the same confirmation/inspector primitives and applies the exact market choice', async ({
  page
}) => {
  await page.goto('/gallery/');
  await page.getByLabel('Search components').fill('Five-domino market');
  const renderer = page.locator('[data-review-id="market"]');
  await renderer.locator('[data-domino-id="m4"]').click();
  await renderer.getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(renderer.getByText('Simulated: Took market domino m4.')).toBeVisible();
  await expect(renderer.locator('[data-domino-id="m4"]')).toHaveCount(0);
  await page.getByLabel('Search components').fill('building-temple');
  await page.locator('[data-review-id="building-temple"] button[data-component="Tile"]').click();
  await expect(
    page
      .getByRole('dialog', { name: 'Building inspector' })
      .getByRole('heading', { name: 'Temple' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByLabel('Search components').fill('Final score');
  const scoring = page.locator('[data-review-id="score-sheet"]');
  await scoring.getByRole('button', { name: 'Inspect scoring tiles' }).click();
  await expect(scoring.locator('[data-component="CityBoard"]')).toBeVisible();
  await scoring.getByRole('button', { name: 'Return to scores' }).click();
  await expect(scoring.locator('[data-component="ScoreSheet"]')).toBeVisible();
});
test('tabletop direct choices stay specific and preserve private hand concealment', async ({
  page
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await review(page, '/tabletop/');
  const positions = await page
    .locator('.seated-city')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  await page.locator('[data-component="DominoMarket"] [data-domino-id="m4"]').click();
  expect(
    await page
      .locator('.seated-city')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top))
  ).toEqual(positions);
  await choice(page).getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(page.locator('[data-component="DominoMarket"] [data-domino-id="m4"]')).toHaveCount(
    0
  );
  await expect(page.locator('[data-component="PrivateHand"] [data-domino-id]')).toHaveCount(0);
});
test('lab direct interaction pauses studies and stays separate until an explicit study reset', async ({
  page
}) => {
  await page.goto('/dev/animations/');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('[data-review-ready]')).toHaveAttribute('data-review-ready', 'true');
  await frame.locator('[data-component="DominoMarket"] [data-domino-id="m4"]').click();
  await expect(
    page.getByText('Direct interaction · simulated fixture outcomes', { exact: true })
  ).toBeVisible();
  await frame
    .locator('[data-component="InteractionPanel"]')
    .getByRole('button', { name: 'Confirm choice', exact: true })
    .click();
  await expect(frame.locator('[data-component="PrivateHand"] [data-domino-id="m4"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/review/lab-direct.png', fullPage: true });
  await page.getByRole('button', { name: 'Return to prepared study' }).click();
  await expect(
    frame.locator('[data-component="DominoMarket"] [data-domino-id="m4"]')
  ).toBeVisible();
  await expect(page.getByText('Prepared animation study', { exact: true })).toBeVisible();
});
test('an isolated gallery action uses the shared target picker and changes that exact meeple', async ({
  page
}) => {
  await page.goto('/gallery/');
  await page.getByLabel('Search components').fill('Generated action queue');
  const renderer = page.locator('[data-review-id="action-queue"]');
  await renderer.getByRole('button', { name: /2 Temple actions/ }).click();
  await renderer.locator('[data-person-id="teal-soldier-0"]').click();
  await renderer.getByRole('button', { name: 'Upgrade to 2' }).click();
  await renderer.getByRole('button', { name: 'Confirm choice', exact: true }).click();
  await expect(renderer.getByRole('button', { name: /1 Temple actions/ })).toBeVisible();
  await renderer.getByRole('button', { name: /1 Temple actions/ }).click();
  await expect(renderer.locator('[data-person-id="teal-soldier-0"] b')).toHaveText('2');
});
