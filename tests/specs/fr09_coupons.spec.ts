import { test, expect } from '@playwright/test';
import testData from '../data/fr09_coupons.json';

const studentId = '23127086'; 

interface CouponTestData {
  caseId: string;
  description: string;
  code: string;
  totalAmount: number;
  expectedStatus: string;
  expectedFinalAmount?: number;
  expectedMessage?: string;
}

test.describe(`FR-09: Discount Coupons - Run by: ${studentId}`, () => {

  for (const data of testData as CouponTestData[]) {
    test(`Test Case ${data.caseId}: ${data.description}`, async ({ page }) => {
      // Truy cập trang checkout
      await page.goto('/checkout');

      // Nhập tổng giá trị đơn hàng
      const totalInput = page.locator('input[type="number"]');
      await expect(totalInput).toBeVisible();
      await totalInput.fill(data.totalAmount.toString());
      await totalInput.dispatchEvent('change');

      // Nhập mã coupon
      const couponInput = page.locator('input[placeholder="Nhập mã giảm giá..."]');
      await expect(couponInput).toBeVisible();
      await couponInput.fill(data.code);

      // Click áp dụng
      const applyBtn = page.locator('button:has-text("Áp dụng")');
      if (data.code.trim() === '') {
        await expect(applyBtn).toBeDisabled();
        return;
      }
      await applyBtn.click();
      // Đợi API response
      await page.waitForTimeout(500);

      // Kiểm tra kết quả phản hồi
      if (data.expectedStatus === 'success') {
        // Kiểm tra thông điệp thành công
        const successMsg = page.locator('div.text-green-700 p').first();
        await expect(successMsg).toBeVisible();
        await expect(successMsg).toContainText('Áp dụng thành công');

        // Kiểm tra tổng tiền cuối cùng hiển thị trên UI
        if (data.expectedFinalAmount !== undefined) {
          const finalTotalText = page.locator('span.font-bold.text-xl');
          const firstPart = data.expectedFinalAmount.toString().slice(0, 3);
          await expect(finalTotalText).toContainText(firstPart);
        }
      } else if (data.expectedStatus === 'error') {
        // Kiểm tra thông điệp báo lỗi từ server hiển thị trên UI
        const errorMsg = page.locator('p.text-red-600.text-sm');
        await expect(errorMsg).toBeVisible();
        const expectedMsg = data.expectedMessage ?? '';
        await expect(errorMsg).toContainText(expectedMsg);
      }
    });
  }
});
