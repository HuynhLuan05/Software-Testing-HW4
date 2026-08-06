import { test, expect } from '@playwright/test';
import testData from '../data/fr03_forgot_password.json';

const studentId = '23127086'; 

interface ForgotPasswordTestData {
  caseId: string;
  description: string;
  step: number;
  email: string;
  otpType?: string;
  newPassword?: string;
  expectedStatus: string;
  expectedAlert: string;
}

test.describe(`FR-03: Forgot Password & Reset - Run by: ${studentId}`, () => {

  for (const data of testData as ForgotPasswordTestData[]) {
    test(`Test Case ${data.caseId}: ${data.description}`, async ({ page }) => {
      // Điều hướng tới trang Quên mật khẩu
      await page.goto('/forgot-password');

      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      if (data.step === 1) {
        // Nhập email vào input
        const emailInput = page.locator('input[type="text"]').first();
        await emailInput.fill(data.email);

        // Click lấy OTP
        const submitBtn = page.locator('button:has-text("Lấy mã OTP")');
        if (data.email === '') {
          await expect(submitBtn).toBeVisible();
          return;
        }
        await submitBtn.click();
        await page.waitForTimeout(500);

        // Assertions
        if (data.expectedStatus === 'success') {
          const messageDiv = page.locator('div.bg-green-100');
          await expect(messageDiv).toBeVisible();
          await expect(messageDiv).toContainText('Mã OTP của bạn là:');
        } else if (data.expectedStatus === 'error') {
          expect(alertMessage).toContain(data.expectedAlert);
        }

      } else if (data.step === 2) {
        // Thực hiện lấy mã OTP hợp lệ trước
        const emailInput = page.locator('input[type="text"]').first();
        await emailInput.fill('test@eshop.com');
        await page.locator('button:has-text("Lấy mã OTP")').click();

        // Đợi div chứa OTP xuất hiện
        const messageDiv = page.locator('div.bg-green-100');
        await expect(messageDiv).toBeVisible();
        const msgText = await messageDiv.textContent() ?? '';
        
        // Trích xuất mã OTP bằng regex
        const otpMatch = msgText.match(/Mã OTP của bạn là:\s*(\w+)/);
        const actualOtp = otpMatch ? otpMatch[1] : '';

        // Điền thông tin Step 2
        const otpInput = page.locator('input[type="text"]').nth(0); 
        const passwordInput = page.locator('input[type="password"]');
        const resetBtn = page.locator('button:has-text("Đặt lại mật khẩu")');

        if (data.otpType === 'valid') {
          await otpInput.fill(actualOtp);
        } else if (data.otpType === 'invalid') {
          await otpInput.fill('9999');
        } else if (data.otpType === 'empty') {
          await otpInput.fill('');
        }

        if (data.newPassword !== undefined) {
          await passwordInput.fill(data.newPassword);
        }

        if (data.otpType === 'empty' || data.newPassword === '') {
          await expect(resetBtn).toBeVisible();
          return;
        }

        await resetBtn.click();
        await page.waitForTimeout(500);

        // Assertions
        expect(alertMessage).toContain(data.expectedAlert);
      }
    });
  }
});
