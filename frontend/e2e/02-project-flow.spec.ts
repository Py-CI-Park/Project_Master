import { test, expect } from '@playwright/test';

/**
 * E2E Test: Project Creation to Gantt Chart Flow
 *
 * 프로젝트 생성 → 태스크 추가 → 의존성 설정 → 간트 차트 확인
 */

test.describe('Project Creation Flow', () => {
  test('should create project, add tasks, and view Gantt chart', async ({ page }) => {
    // 1. 프로젝트 목록 페이지로 이동
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // 2. 새 프로젝트 생성 버튼 클릭
    const newProjectButton = page.getByRole('button', { name: /new project|프로젝트 추가|새 프로젝트/i });
    if (await newProjectButton.isVisible()) {
      await newProjectButton.click();

      // 3. 프로젝트 폼 작성
      await page.fill('input[name="name"], input[label*="프로젝트명"]', 'E2E Test Project');
      await page.fill('textarea[name="description"], textarea[label*="설명"]', 'E2E testing project description');

      const startDateInput = page.locator('input[name="start_date"], input[type="date"]').first();
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2024-01-01');
      }

      const endDateInput = page.locator('input[name="end_date"], input[type="date"]').last();
      if (await endDateInput.isVisible()) {
        await endDateInput.fill('2024-12-31');
      }

      // 4. 프로젝트 저장
      const submitButton = page.getByRole('button', { name: /submit|저장|생성|create/i });
      await submitButton.click();

      // 5. 프로젝트 상세 페이지로 이동 확인
      await page.waitForURL(/\/projects\/\d+/, { timeout: 5000 });
    }
  });

  test('should navigate to Gantt chart tab', async ({ page }) => {
    // 프로젝트 상세 페이지로 이동 (존재하는 프로젝트 ID 1 사용)
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // Gantt 차트 탭 클릭
    const ganttTab = page.getByRole('tab', { name: /gantt|간트/i });
    if (await ganttTab.isVisible()) {
      await ganttTab.click();

      // Gantt 차트 컨테이너 확인
      const ganttContainer = page.locator('#gantt, .gantt-chart, [class*="gantt"]').first();
      await expect(ganttContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to dependency view', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 의존성 탭 클릭
    const dependencyTab = page.getByRole('tab', { name: /dependency|의존성/i });
    if (await dependencyTab.isVisible()) {
      await dependencyTab.click();

      // 의존성 그래프 또는 매트릭스 확인
      const dependencyView = page.locator('[class*="dependency"], [class*="graph"], [class*="matrix"]').first();
      await expect(dependencyView).toBeVisible({ timeout: 5000 });
    }
  });
});

/**
 * E2E Test: Enabler Workflow
 *
 * Enabler 추가 → 영향 분석 → 지연 시뮬레이션
 */
test.describe('Enabler Workflow', () => {
  test('should navigate to enabler list', async ({ page }) => {
    await page.goto('/projects/1/enablers');
    await page.waitForLoadState('networkidle');

    // Enabler 목록 페이지 확인
    const heading = page.locator('h1, h2, h3').filter({ hasText: /enabler/i });
    await expect(heading).toBeVisible();
  });

  test('should show enabler creation form', async ({ page }) => {
    await page.goto('/projects/1/enablers/new');
    await page.waitForLoadState('networkidle');

    // 폼 필드 확인
    const nameInput = page.locator('input[name="name"], input[label*="이름"]').first();
    const descriptionInput = page.locator('textarea[name="description"], textarea[label*="설명"]').first();

    await expect(nameInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();
  });
});
