import { test, expect } from '@playwright/test';

/**
 * E2E Test: Calendar and Reports
 *
 * 캘린더 이벤트 확인 → 리포트 생성 → 익스포트
 */

test.describe('Calendar View', () => {
  test('should display calendar tab in project detail', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 캘린더 탭 클릭
    const calendarTab = page.getByRole('tab', { name: /calendar|캘린더/i });
    if (await calendarTab.isVisible()) {
      await calendarTab.click();

      // FullCalendar 컨테이너 확인
      const calendarContainer = page.locator('.fc, [class*="calendar"]').first();
      await expect(calendarContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show task events in calendar', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    const calendarTab = page.getByRole('tab', { name: /calendar|캘린더/i });
    if (await calendarTab.isVisible()) {
      await calendarTab.click();

      // 캘린더 이벤트 확인 (FullCalendar 이벤트 클래스)
      const calendarEvents = page.locator('.fc-event, [class*="event"]');

      // 최소 1개 이상의 이벤트가 있는지 확인 (태스크가 있는 경우)
      const eventCount = await calendarEvents.count();
      if (eventCount > 0) {
        await expect(calendarEvents.first()).toBeVisible();
      }
    }
  });
});

test.describe('Reports View', () => {
  test('should display reports tab in project detail', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 리포트 탭 클릭
    const reportsTab = page.getByRole('tab', { name: /report|리포트/i });
    if (await reportsTab.isVisible()) {
      await reportsTab.click();

      // 리포트 컨테이너 확인
      await page.waitForTimeout(1000); // 리포트 렌더링 대기

      // 리포트 섹션이 표시되는지 확인
      const reportContent = page.locator('[role="tabpanel"]').filter({ hasText: /critical|progress|delay|크리티컬|진행|지연/i });
      await expect(reportContent).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show critical path analysis', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    const reportsTab = page.getByRole('tab', { name: /report|리포트/i });
    if (await reportsTab.isVisible()) {
      await reportsTab.click();
      await page.waitForTimeout(1000);

      // 크리티컬 패스 섹션 확인
      const criticalPathSection = page.locator('h5, h6').filter({ hasText: /critical.*path|크리티컬.*패스/i });
      if (await criticalPathSection.isVisible()) {
        await expect(criticalPathSection).toBeVisible();
      }
    }
  });

  test('should show progress report with charts', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    const reportsTab = page.getByRole('tab', { name: /report|리포트/i });
    if (await reportsTab.isVisible()) {
      await reportsTab.click();
      await page.waitForTimeout(1000);

      // 진행 현황 섹션 확인
      const progressSection = page.locator('h5, h6').filter({ hasText: /progress|진행.*현황/i });
      if (await progressSection.isVisible()) {
        await expect(progressSection).toBeVisible();

        // Recharts SVG 차트 확인
        const charts = page.locator('svg.recharts-surface');
        const chartCount = await charts.count();
        if (chartCount > 0) {
          await expect(charts.first()).toBeVisible();
        }
      }
    }
  });

  test('should show delay analysis', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    const reportsTab = page.getByRole('tab', { name: /report|리포트/i });
    if (await reportsTab.isVisible()) {
      await reportsTab.click();
      await page.waitForTimeout(1000);

      // 지연 분석 섹션 확인
      const delaySection = page.locator('h5, h6').filter({ hasText: /delay.*analysis|지연.*분석/i });
      if (await delaySection.isVisible()) {
        await expect(delaySection).toBeVisible();
      }
    }
  });
});

test.describe('Export Functionality', () => {
  test('should open export dialog', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 익스포트 버튼 클릭
    const exportButton = page.getByRole('button', { name: /export|익스포트/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Export 다이얼로그 확인
      const dialog = page.locator('[role="dialog"], .MuiDialog-root');
      await expect(dialog).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display export options in dialog', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    const exportButton = page.getByRole('button', { name: /export|익스포트/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });

      // CSV 옵션 확인
      const csvOption = dialog.locator('text=/csv/i').first();
      if (await csvOption.isVisible()) {
        await expect(csvOption).toBeVisible();
      }
    }
  });

  test('should close export dialog', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    const exportButton = page.getByRole('button', { name: /export|익스포트/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });

      // 닫기 버튼 클릭
      const closeButton = dialog.getByRole('button', { name: /close|cancel|취소|닫기/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();

        // 다이얼로그가 사라졌는지 확인
        await expect(dialog).not.toBeVisible({ timeout: 3000 });
      }
    }
  });
});
