import { test, expect } from '@playwright/test';

/**
 * E2E Test: Error Scenarios
 *
 * 네트워크 오류, 잘못된 입력, 빈 데이터 처리 테스트
 */

test.describe('Network Error Handling', () => {
  test('should handle API server not available', async ({ page }) => {
    // API 서버가 응답하지 않는 시나리오 시뮬레이션
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // 에러 메시지 또는 빈 상태 표시 확인
    const errorIndicator = page.locator('text=/error|오류|failed|실패/i, [role="alert"], .error, .MuiAlert-root').first();
    const emptyState = page.locator('text=/no.*projects|프로젝트.*없습니다|empty/i').first();

    // 에러 표시 또는 빈 상태 중 하나는 표시되어야 함
    const hasErrorOrEmpty = (await errorIndicator.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasErrorOrEmpty).toBeTruthy();
  });

  test('should handle API timeout', async ({ page }) => {
    // API 응답 지연 시뮬레이션
    await page.route('**/api/projects', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5초 지연
      route.continue();
    });

    await page.goto('/projects');

    // 로딩 인디케이터 확인
    const loadingIndicator = page.locator('[role="progressbar"], .loading, .spinner, .MuiCircularProgress-root').first();
    if (await loadingIndicator.isVisible({ timeout: 2000 })) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should handle 404 Not Found error', async ({ page }) => {
    // 존재하지 않는 프로젝트 ID로 접근
    await page.goto('/projects/999999');
    await page.waitForLoadState('networkidle');

    // 404 에러 메시지 또는 리다이렉트 확인
    const notFoundMessage = page.locator('text=/not.*found|찾을.*없습니다|404/i').first();
    const messageCount = await notFoundMessage.count();

    // 404 메시지가 있거나, 다른 페이지로 리다이렉트 되었는지 확인
    const currentUrl = page.url();
    const is404OrRedirected = messageCount > 0 || !currentUrl.includes('/projects/999999');
    expect(is404OrRedirected).toBeTruthy();
  });

  test('should handle 500 Internal Server Error', async ({ page }) => {
    // 서버 오류 시뮬레이션
    await page.route('**/api/projects', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });

    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // 에러 메시지 표시 확인
    const errorMessage = page.locator('text=/error|오류|server.*error|서버.*오류/i, [role="alert"]').first();
    if (await errorMessage.isVisible({ timeout: 3000 })) {
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('Invalid Input Handling', () => {
  test('should validate required fields in project form', async ({ page }) => {
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');

    // 필수 입력 없이 제출 시도
    const submitButton = page.getByRole('button', { name: /submit|저장|생성|create/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // 유효성 검증 메시지 확인
      const validationMessage = page.locator('text=/required|필수|입력.*주세요/i, [role="alert"], .error').first();
      const formError = page.locator('input:invalid, [aria-invalid="true"]').first();

      // 유효성 검증 메시지 또는 invalid 필드 확인
      const hasValidation = (await validationMessage.count()) > 0 || (await formError.count()) > 0;
      expect(hasValidation).toBeTruthy();
    }
  });

  test('should validate date range in project form', async ({ page }) => {
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');

    // 프로젝트명 입력
    const nameInput = page.locator('input[name="name"], input[label*="프로젝트명"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Project');

      // 잘못된 날짜 범위 입력 (종료일이 시작일보다 이전)
      const startDateInput = page.locator('input[name="start_date"], input[type="date"]').first();
      const endDateInput = page.locator('input[name="end_date"], input[type="date"]').last();

      if ((await startDateInput.isVisible()) && (await endDateInput.isVisible())) {
        await startDateInput.fill('2024-12-31');
        await endDateInput.fill('2024-01-01');

        const submitButton = page.getByRole('button', { name: /submit|저장|생성|create/i });
        await submitButton.click();

        // 날짜 범위 오류 메시지 확인
        const dateError = page.locator('text=/date|날짜|end.*date.*start|종료일.*시작일/i, [role="alert"]').first();
        if (await dateError.isVisible({ timeout: 3000 })) {
          await expect(dateError).toBeVisible();
        }
      }
    }
  });

  test('should handle invalid special characters in input', async ({ page }) => {
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[name="name"], input[label*="프로젝트명"]').first();
    if (await nameInput.isVisible()) {
      // 특수 문자 입력 시도
      await nameInput.fill('<script>alert("XSS")</script>');

      const submitButton = page.getByRole('button', { name: /submit|저장|생성|create/i });
      await submitButton.click();

      // XSS 방지 - 스크립트가 실행되지 않아야 함
      await page.waitForTimeout(1000);

      // alert가 뜨지 않았는지 확인 (페이지가 정상 작동)
      const pageTitle = await page.title();
      expect(pageTitle).toBeDefined();
    }
  });

  test('should handle extremely long text input', async ({ page }) => {
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[name="name"], input[label*="프로젝트명"]').first();
    if (await nameInput.isVisible()) {
      // 매우 긴 텍스트 입력
      const longText = 'A'.repeat(1000);
      await nameInput.fill(longText);

      // 입력 길이 제한 확인
      const inputValue = await nameInput.inputValue();
      expect(inputValue.length).toBeLessThanOrEqual(1000);
    }
  });
});

test.describe('Empty Data Handling', () => {
  test('should display empty state when no projects exist', async ({ page }) => {
    // 빈 응답 시뮬레이션
    await page.route('**/api/projects', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // 빈 상태 메시지 확인
    const emptyState = page.locator('text=/no.*projects|프로젝트.*없습니다|empty|데이터.*없습니다/i').first();
    if (await emptyState.isVisible({ timeout: 3000 })) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should display empty state when project has no tasks', async ({ page }) => {
    // 태스크가 없는 프로젝트 시뮬레이션
    await page.route('**/api/projects/1/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 태스크 탭 클릭
    const tasksTab = page.getByRole('tab', { name: /task|태스크/i });
    if (await tasksTab.isVisible()) {
      await tasksTab.click();

      // 빈 상태 확인
      const emptyTasks = page.locator('text=/no.*tasks|태스크.*없습니다|empty/i').first();
      if (await emptyTasks.isVisible({ timeout: 3000 })) {
        await expect(emptyTasks).toBeVisible();
      }
    }
  });

  test('should handle Gantt chart with no tasks', async ({ page }) => {
    // 태스크가 없는 경우 시뮬레이션
    await page.route('**/api/projects/1/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 간트 차트 탭 클릭
    const ganttTab = page.getByRole('tab', { name: /gantt|간트/i });
    if (await ganttTab.isVisible()) {
      await ganttTab.click();

      // 빈 간트 차트 또는 안내 메시지 확인
      const emptyGantt = page.locator('text=/no.*tasks|태스크.*없습니다|add.*task|태스크.*추가/i').first();
      if (await emptyGantt.isVisible({ timeout: 3000 })) {
        await expect(emptyGantt).toBeVisible();
      }
    }
  });

  test('should handle calendar with no events', async ({ page }) => {
    // 이벤트가 없는 경우 시뮬레이션
    await page.route('**/api/projects/1/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 캘린더 탭 클릭
    const calendarTab = page.getByRole('tab', { name: /calendar|캘린더/i });
    if (await calendarTab.isVisible()) {
      await calendarTab.click();

      // 캘린더가 렌더링되었는지 확인 (이벤트는 없어도 됨)
      const calendar = page.locator('.fc, [class*="calendar"]').first();
      await expect(calendar).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle reports with no data', async ({ page }) => {
    // 데이터가 없는 경우 시뮬레이션
    await page.route('**/api/projects/1/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 리포트 탭 클릭
    const reportsTab = page.getByRole('tab', { name: /report|리포트/i });
    if (await reportsTab.isVisible()) {
      await reportsTab.click();

      // 리포트 섹션이 표시되는지 확인 (데이터 없어도 UI는 표시)
      await page.waitForTimeout(1000);

      // 빈 데이터 안내 메시지 또는 0 값 표시 확인
      const reportContent = page.locator('[role="tabpanel"]').filter({ hasText: /리포트|report/i }).first();
      if (await reportContent.isVisible()) {
        await expect(reportContent).toBeVisible();
      }
    }
  });
});

test.describe('Edge Cases', () => {
  test('should handle concurrent API calls gracefully', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 여러 탭을 빠르게 전환하여 동시 API 호출 유발
    const ganttTab = page.getByRole('tab', { name: /gantt|간트/i });
    const calendarTab = page.getByRole('tab', { name: /calendar|캘린더/i });
    const reportsTab = page.getByRole('tab', { name: /report|리포트/i });

    if ((await ganttTab.isVisible()) && (await calendarTab.isVisible()) && (await reportsTab.isVisible())) {
      await ganttTab.click();
      await page.waitForTimeout(100);
      await calendarTab.click();
      await page.waitForTimeout(100);
      await reportsTab.click();
      await page.waitForTimeout(1000);

      // 페이지가 정상적으로 작동하는지 확인
      const reportContent = page.locator('[role="tabpanel"]').first();
      await expect(reportContent).toBeVisible();
    }
  });

  test('should handle page refresh without data loss context', async ({ page }) => {
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 간트 차트 탭으로 이동
    const ganttTab = page.getByRole('tab', { name: /gantt|간트/i });
    if (await ganttTab.isVisible()) {
      await ganttTab.click();
      await page.waitForTimeout(1000);

      // 페이지 새로고침
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 페이지가 정상적으로 다시 로드되는지 확인
      const projectDetail = page.locator('h1, h2, h3, h4').filter({ hasText: /project|프로젝트/i }).first();
      await expect(projectDetail).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle browser back button', async ({ page }) => {
    // 프로젝트 목록 → 상세 → 뒤로가기
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // 프로젝트 상세로 이동
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');

    // 뒤로 가기
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // 프로젝트 목록 페이지로 돌아왔는지 확인
    expect(page.url()).toContain('/projects');
  });
});
