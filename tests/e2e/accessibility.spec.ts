import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('senior home is usable and has no WCAG 2.1 A/AA axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Enable SomaCare wake word/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Enable hands-free voice/ })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('caregiver can add a schedule; the caregiver view has no WCAG 2.1 A/AA axe violations', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'The mobile project audits the senior home; caregiver schedule workflow is covered in desktop Chromium.');
  await page.goto('/');
  await page.getByRole('button', { name: /Portal/ }).click();
  await page.getByRole('button', { name: 'Add medication' }).click();
  const formResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(formResults.violations).toEqual([]);

  await page.getByLabel('Medicine name').fill('Demo medicine');
  await page.getByLabel('Dose').fill('1 tablet');
  await page.getByLabel('Scheduled time').fill('08:00 AM');
  await page.getByLabel('Pills remaining').fill('10');
  await page.getByLabel('Pack quantity').fill('30');
  await page.getByLabel('Refill reminder threshold').fill('5');
  await page.getByRole('button', { name: 'Save medicine schedule' }).click();
  await expect(page.getByRole('heading', { name: 'Demo medicine' })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
