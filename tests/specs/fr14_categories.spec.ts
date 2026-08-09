import { test, expect } from '@playwright/test';
import testData from '../data/fr14_categories.json';

const studentId = '23127086'; 
const adminUrl = 'http://localhost:5174';

test.describe(`FR-14: Category Management (CRUD) - Run by: ${studentId}`, () => {

  // Trước mỗi test case, đảm bảo đã đăng nhập admin và điều hướng đến tab "Danh mục"
  test.beforeEach(async ({ page }) => {
    await page.goto(adminUrl);
    await page.waitForLoadState('networkidle');

    // Nếu thấy form login admin thì đăng nhập
    const emailInput = page.locator('input[placeholder="Email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@eshop.com');
      await page.locator('input[placeholder="Password"]').fill('Admin123!');
      await page.locator('button:has-text("Login")').click();
      // Đợi sidebar render xong sau khi login
      await expect(page.locator('h1:has-text("EShop Admin")')).toBeVisible({ timeout: 10000 });
      await page.waitForLoadState('networkidle');
    }

    // Click vào tab Danh mục
    const categoryTab = page.locator('li:has-text("Danh mục")');
    await expect(categoryTab).toBeVisible({ timeout: 10000 });
    await categoryTab.click();
    
    // Xác nhận đã chuyển sang tab Quản lý danh mục
    await expect(page.locator('h2:has-text("Quản lý Danh mục")')).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  for (const data of testData) {
    test(`Test Case ${data.caseId}: ${data.description}`, async ({ page }) => {
      
      // Xử lý sự kiện Alert
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      if (data.action === 'create') {
        // Điền tên danh mục vào ô input
        const nameInput = page.locator('input[placeholder="Tên danh mục mới"]');
        await nameInput.fill(data.categoryName);

        // Nhấn nút Thêm mới
        const submitBtn = page.locator('button:has-text("Thêm mới")');
        await submitBtn.click();

        // Đợi một khoảng thời gian nhỏ hoặc đợi API response để UI cập nhật
        await page.waitForTimeout(500); 

        // Assertions
        if (data.expectedStatus === 'success') {
          // Kiểm tra xem tên danh mục mới xuất hiện trong bảng danh sách
          const tableCell = page.locator(`table tbody td:has-text("${data.categoryName}")`).first();
          await expect(tableCell).toBeVisible();
        } else if (data.expectedStatus === 'error') {
          // Kiểm tra xem alert có chứa thông báo lỗi mong đợi hay không
          expect(alertMessage).toContain(data.expectedMessage);
        }

      } else if (data.action === 'delete') {
        // Tìm danh mục trong bảng để chuẩn bị xóa
        const categoryRow = page.locator('table tbody tr', { hasText: data.categoryName }).first();
        
        // Ở đây ta tìm nút Xóa của dòng danh mục tương ứng
        if (await categoryRow.count() > 0) {
          const deleteBtn = categoryRow.locator('button:has-text("Xóa")');
          await deleteBtn.click();
          await page.waitForTimeout(500); 

          // Assertions
          if (data.expectedStatus === 'success') {
            // Kiểm tra xem danh mục đó đã biến mất khỏi bảng danh sách
            const tableCell = page.locator(`table tbody td:has-text("${data.categoryName}")`).first();
            await expect(tableCell).not.toBeVisible();
          } else if (data.expectedStatus === 'error') {
            expect(alertMessage).toContain(data.expectedMessage);
          }
        }
      }
    });
  }
});
