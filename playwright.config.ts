import { defineConfig, devices } from '@playwright/test';

const studentId = '23127086';

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  // Cấu hình sinh HTML Report và đặt tên báo cáo có chứa StudentID
  reporter: [
    ['html', { 
      outputFolder: `playwright-report-${studentId}`,
      open: 'never' 
    }]
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Chạy trên 3 trình duyệt
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
