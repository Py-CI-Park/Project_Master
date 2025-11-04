import { test, expect } from '@playwright/test';

/**
 * E2E Test: Basic UI Navigation
 *
 * 기본 UI 네비게이션 테스트
 */

test.describe('Basic UI Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Project/i);
  });

  test('should navigate to project list', async ({ page }) => {
    await page.goto('/');

    // 프로젝트 목록으로 이동
    const projectsLink = page.getByRole('link', { name: /projects/i });
    if (await projectsLink.isVisible()) {
      await projectsLink.click();
      await expect(page).toHaveURL(/\/projects/);
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // 주요 네비게이션 요소 확인
    const navigation = page.locator('nav, header').first();
    await expect(navigation).toBeVisible();
  });
});
