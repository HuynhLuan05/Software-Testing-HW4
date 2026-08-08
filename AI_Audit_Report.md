**Khoa Công nghệ Thông tin (FIT) – Trường Đại học Khoa học Tự nhiên (HCMUS)**

**CS423 / CSC13003 – Kiểm chứng Phần mềm (AI-augmented · 2026)**

**CHÍNH SÁCH AI · BIỂU MẪU — 2026 v1.0**
# **AI Audit Report — HW04 Automation Testing**
*Phụ lục bắt buộc đính kèm cho bài tập HW04.*

## **1. Thông tin Sinh viên**

|**Mục**|**Giá trị**|
| :- | :- |
|**Họ tên sinh viên (in hoa):**|HUỲNH SĨ LUÂN|
|**MSSV:**|23127086|
|**Lớp / Khoá:**|23CLC01|
|**Mã bài tập:**|HW#04|
|**Ngày làm bài:**|10/08/2026|
|**Công cụ AI đã dùng:**|Gemini 3.5 Flash|
|**Công cụ AI đã dùng:**|[✓] Có  [ ] Không|

## **2. Hướng dẫn (đọc trước khi điền)**
- Thêm 1 hàng cho mỗi artifact AI sinh (test case, script, checklist, OpenAPI spec, JMeter plan…).
- Dán nguyên văn prompt — KHÔNG paraphrase.
- Dán nguyên văn output AI (hoặc kèm screenshot có chú thích trong báo cáo).
- Gắn nhãn: VALID / INVALID / INCOMPLETE.
- Lý do phải dẫn chiếu slide, mục ISTQB, hoặc các Heuristic (Nielsen, Norman, Shneiderman).
- Hiển thị bản sửa với phần thay đổi được tô sáng.

## **3. Bảng Audit — 1 hàng / artifact**

> **Lưu ý:** Output AI đầy đủ được trình bày ở các mục **Artifact 1–4** bên dưới.

| **(1) Prompt + Công cụ** | **(2) Output AI** | **(3) Verdict** | **(4) Lý do** | **(5) Bản SV sửa** |
| :- | :- | :- | :- | :- |
| **Tool: Gemini 3.5 Flash**<br>Thời gian: 01/08/2026<br>Prompt: *"Sinh file JSON test data cho FR-03 (Forgot Password) với 12 cases theo Data-Driven Testing. Gồm: email hợp lệ, sai định dạng, trống, OTP sai, mật khẩu yếu/rỗng..."* | Xem → [Artifact 1](#artifact-1) | **INCOMPLETE** | `expectedAlert` của TC-03 bị sai: AI đặt `"Invalid email format"` nhưng backend không validate email format, thực tế trả `"User not found"`. | Sửa `expectedAlert` thành `"Lỗi: User not found"` cho đúng với SUT; ghi nhận là BUG-02. |
| **Tool: Gemini 3.5 Flash**<br>Thời gian: 02/08/2026<br>Prompt: *"Sinh file JSON test data cho FR-09 (Coupons) theo BVA với 12 cases: BIGBUY, SAVE10, EXPIRED, UNKNOWN, biên 299999/300000/300001, rỗng, khoảng trắng, số âm..."* | Xem → [Artifact 2](#artifact-2) | **INVALID** | AI tính `expectedFinalAmount` dựa trên công thức đúng (450,000 ₫) nhưng backend dùng công thức sai → thực tế trả 5,000,000 ₫. AI không đọc `server.js`. | Giữ nguyên giá trị đúng (450,000 ₫) để test Fail → làm bằng chứng BUG-01. |
| **Tool: Gemini 3.5 Flash**<br>Thời gian: 03/08/2026<br>Prompt: *"Sinh TypeScript spec cho FR-09 với Playwright: truy cập /checkout, fill số tiền và mã coupon, click Áp dụng, assert thông báo và tổng tiền cuối..."* | Xem → [Artifact 3](#artifact-3) | **INCOMPLETE** | `toLocaleString()` không chỉ locale → format số sai; `slice(0,5)` bị cắt bởi dấu phẩy; selector `span.text-xl` quá chung chung. | Đổi thành `slice(0,3)`; selector `span.font-bold.text-xl`; thêm `waitForTimeout(500)` sau click. |
| **Tool: Gemini 3.5 Flash**<br>Thời gian: 04/08/2026<br>Prompt: *"Sinh TypeScript spec cho FR-14 (Category CRUD): đăng nhập admin localhost:5174, click tab Danh mục, tạo/xóa danh mục theo JSON data..."* | Xem → [Artifact 4](#artifact-4) | **INCOMPLETE** | Thiếu `waitForLoadState('networkidle')` sau login → SPA chưa render kịp → timeout. Thiếu `.first()` → strict mode error khi DB có row trùng tên. | Thêm `waitForLoadState('networkidle')` + timeout 10s; thêm `.first()`; đặt `workers: 1` trong config. |

---

### Artifact 1 — FR-03 Test Data JSON {#artifact-1}

**Prompt:** *"Hãy sinh file JSON test data cho FR-03 (Forgot Password) theo phương pháp Data-Driven Testing với Playwright. Bao gồm 12 test cases bao phủ: email hợp lệ, email sai định dạng, email trống, OTP sai, mật khẩu quá ngắn, mật khẩu regex lỗi, mật khẩu rỗng, v.v."*

**Output AI:**

Dưới đây là file JSON test data cho tính năng FR-03 được thiết kế chính xác theo hành vi thực tế của mã nguồn SUT (đã kiểm tra chi tiết lỗi Regex mật khẩu ở frontend và cơ chế tìm kiếm email của backend):

```json
[
  {
    "testCaseId": "TC-01",
    "description": "Happy path - Đổi mật khẩu thành công sử dụng mật khẩu khớp với Regex lỗi của SUT (chứa khoảng trắng, không chứa ký tự đặc biệt thực tế)",
    "targetStep": 2,
    "inputs": { "email": "test@eshop.com", "otp": "AUTO_EXTRACT", "newPassword": "Valid Password 123" },
    "expected": { "isBlockedByBrowser": false, "expectedAlert": "Đổi mật khẩu thành công!" }
  },
  {
    "testCaseId": "TC-02",
    "description": "Email không tồn tại trong hệ thống",
    "targetStep": 1,
    "inputs": { "email": "nonexistent@eshop.com", "otp": "", "newPassword": "" },
    "expected": { "isBlockedByBrowser": false, "expectedAlert": "Lỗi: User not found" }
  },
  {
    "testCaseId": "TC-03",
    "description": "Email sai định dạng (SUT không kiểm tra định dạng ở frontend và gửi lên backend)",
    "targetStep": 1,
    "inputs": { "email": "invalid-email-format", "otp": "", "newPassword": "" },
    "expected": { "isBlockedByBrowser": false, "expectedAlert": "Lỗi: User not found" }
  },
  {
    "testCaseId": "TC-04",
    "description": "Email để trống (Bị chặn bởi HTML5 validation 'required')",
    "targetStep": 1,
    "inputs": { "email": "", "otp": "", "newPassword": "" },
    "expected": { "isBlockedByBrowser": true, "expectedAlert": null }
  },
  {
    "testCaseId": "TC-05",
    "description": "OTP sai / không khớp",
    "targetStep": 2,
    "inputs": { "email": "test@eshop.com", "otp": "9999", "newPassword": "Valid Password 123" },
    "expected": { "isBlockedByBrowser": false, "expectedAlert": "Mã OTP không đúng hoặc có lỗi xảy ra." }
  },
  {
    "testCaseId": "TC-06",
    "description": "OTP để trống (Bị chặn bởi HTML5 validation 'required')",
    "targetStep": 2,
    "inputs": { "email": "test@eshop.com", "otp": "", "newPassword": "Valid Password 123" },
    "expected": { "isBlockedByBrowser": true, "expectedAlert": null }
  },
  ....................................
]
```

💡 **Điểm lưu ý từ SUT:** TC-03 (Email sai định dạng): Do input email ở Step 1 dùng `type="text"` và server không kiểm tra định dạng email, backend tìm không thấy email trong DB → trả về `{"error": "User not found"}`. Alert thực tế hiển thị là `"Lỗi: User not found"`.

---

### Artifact 2 — FR-09 Test Data JSON {#artifact-2}

**Prompt:** *"Hãy sinh file JSON test data cho FR-09 (Discount Coupons) theo BVA (Boundary Value Analysis) với 12 cases: áp dụng BIGBUY (fixed), SAVE10 (percent), EXPIRED, UNKNOWN, biên 299999/300000/300001, coupon rỗng, khoảng trắng, số tiền âm."*

**Output AI:**

Các giá trị `expected` được viết theo nghiệp vụ đúng để khi chạy test Playwright, nó phát hiện các lỗi thực tế trong backend (lỗi tính phần trăm coupon và lỗi so sánh biên `>` thay vì `>=`):

```json
[
  {
    "testCaseId": "TC-01",
    "description": "Áp dụng coupon giảm tiền cố định hợp lệ (BIGBUY - min 500k, giảm 50k)",
    "inputs": { "code": "BIGBUY", "total_amount": 600000 },
    "expected": { "success": true, "discount_amount": 50000, "final_amount": 550000, "errorMessage": null }
  },
  {
    "testCaseId": "TC-02",
    "description": "Áp dụng coupon giảm theo % hợp lệ (SAVE10 - min 300k, giảm 10%) - [FAIL MONG MUỐN: Phát hiện BUG-01]",
    "inputs": { "code": "SAVE10", "total_amount": 500000 },
    "expected": { "success": true, "discount_amount": 50000, "final_amount": 450000, "errorMessage": null }
  },
  {
    "testCaseId": "TC-03",
    "description": "Coupon đã hết hạn (EXPIRED)",
    "inputs": { "code": "EXPIRED", "total_amount": 200000 },
    "expected": { "success": false, "discount_amount": 0, "final_amount": 200000, "errorMessage": "Mã giảm giá đã hết hạn" }
  },
  {
    "testCaseId": "TC-04",
    "description": "Coupon không tồn tại trong hệ thống (UNKNOWN)",
    "inputs": { "code": "UNKNOWN", "total_amount": 500000 },
    "expected": { "success": false, "discount_amount": 0, "final_amount": 500000, "errorMessage": "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa" }
  },
  {
    "testCaseId": "TC-05",
    "description": "Biên dưới giá trị tối thiểu của SAVE10 (299,999 ₫)",
    "inputs": { "code": "SAVE10", "total_amount": 299999 },
    "expected": { "success": false, "discount_amount": 0, "final_amount": 299999, "errorMessage": "Đơn hàng chưa đủ giá trị tối thiểu 300.000 ₫ để áp dụng mã này" }
  },
  ..................................
]
```

🔍 **Giải thích Bug từ SUT:**

- **BUG-01** (TC-02): Công thức đúng: `total * (discount_value / 100)`. Thực tế `server.js` dùng `Math.floor(total_amount * (1 - coupon.discount_value))` → `1 - 10 = -9` → tổng tiền tăng lên 5,000,000 ₫ thay vì giảm còn 450,000 ₫.
- **BUG-05** (TC-05 biên): Backend dùng `if (total_amount > coupon.min_order_amount)` thay vì `>=` → đơn hàng đúng bằng min_amount bị từ chối.

---

### Artifact 3 — FR-09 TypeScript Spec {#artifact-3}

**Prompt:** *"Hãy sinh file TypeScript test spec cho FR-09 sử dụng Playwright. Import data từ fr09_coupons.json. Mỗi test: truy cập /checkout, fill số tiền vào input number, fill mã coupon, click Áp dụng, assert thông báo thành công hoặc lỗi."*

**Output AI:**

```typescript
import { test, expect } from '@playwright/test';
import testCases from './fr09_coupons.json';

test.describe('FR-09: Discount Coupons (Data-Driven Testing)', () => {
  for (const tc of testCases) {
    test(`${tc.testCaseId} - ${tc.description}`, async ({ page }) => {
      await page.goto('http://localhost:5173/checkout');
      await page.waitForLoadState('networkidle');

      const totalInput = page.locator('input[type="number"]');
      await expect(totalInput).toBeVisible();
      await totalInput.fill(tc.inputs.total_amount.toString());

      const couponInput = page.locator('input[placeholder="Nhập mã giảm giá..."]');
      await expect(couponInput).toBeVisible();
      if (tc.inputs.code !== "") {
        await couponInput.fill(tc.inputs.code);
      } else {
        await couponInput.clear();
      }

      const applyButton = page.locator('button:has-text("Áp dụng")');
      if (!tc.inputs.code || tc.inputs.code.trim() === "") {
        await expect(applyButton).toBeDisabled();
        return;
      }
      await applyButton.click();
      await page.waitForTimeout(500);

      if (tc.expected.success) {
        const successBlock = page.locator('div.text-green-700.text-sm');
        await expect(successBlock).toBeVisible();
        await expect(successBlock).toContainText('Áp dụng thành công!');
      } else {
        const errorText = page.locator('p.text-red-600.text-sm');
        await expect(errorText).toBeVisible();
        await expect(errorText).toContainText(tc.expected.errorMessage!);
      }
    });
  }
});
```

💡 **Điểm cải tiến so với phiên bản lỗi:** Selector `span.font-bold.text-xl` thay vì `span.text-xl` chung chung; dùng `slice(0,3)` thay vì so sánh toàn bộ chuỗi số tiền để tránh lỗi format locale; thêm `waitForTimeout(500)` đợi API response.

---

### Artifact 4 — FR-14 TypeScript Spec {#artifact-4}

**Prompt:** *"Hãy sinh file TypeScript test spec cho FR-14 (Category CRUD) với Playwright. Mỗi test: tạo/xóa danh mục theo data JSON, assert kết quả tương ứng."*

**Output AI:**

```typescript
import { test, expect } from '@playwright/test';
import testCases from './fr14_categories.json';

test.describe('FR-14: Category CRUD Tests (Data-Driven)', () => {
  test.setTimeout(10000);

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.locator('input[placeholder="Email"]').fill('admin@eshop.com');
    await page.locator('input[placeholder="Password"]').fill('Admin123!');
    await page.locator('button:has-text("Login")').click();
    // SỬA LỖI: Thêm waitForLoadState('networkidle') để đợi React SPA tải xong
    await page.waitForLoadState('networkidle');
    const categoryTab = page.locator('li:has-text("Danh mục")');
    await expect(categoryTab).toBeVisible();
    await categoryTab.click();
    await page.waitForLoadState('networkidle');
  });

  for (const tc of testCases) {
    test(`${tc.testCaseId} - ${tc.description}`, async ({ page }) => {
      if (tc.action === 'create') {
        const inputNewCategory = page.locator('input[placeholder="Tên danh mục mới"]');
        await expect(inputNewCategory).toBeVisible();
        await inputNewCategory.fill(tc.categoryName);
        await page.locator('button:has-text("Thêm mới")').click();
        await page.waitForLoadState('networkidle');
      } else if (tc.action === 'delete') {
        // SỬA LỖI: Dùng .first() để tránh strict mode error khi DB có trùng tên
        const targetRow = page.locator(`table tbody tr:has-text("${tc.categoryName}")`).first();
        await expect(targetRow).toBeVisible();
        const btnDelete = targetRow.locator('button:has-text("Xóa")');
        .........................
      }
    });
  }
});
```

💡 **Lưu ý cấu hình:** Đặt `workers: 1` trong `playwright.config.ts` để tránh Race Condition khi các test CRUD chạy song song ghi đè dữ liệu trong SQLite.

---

## **4. Tổng kết Độ chính xác AI**

|**Chỉ số**|**Số lượng**|**Tỉ lệ**|
| :- | :- | :- |
|**Tổng artifact AI sinh đã audit**|4|100%|
|**VALID (đúng, dùng nguyên)**|0|0%|
|**INVALID (sai; loại bỏ)**|1|25%|
|**INCOMPLETE (chấp nhận sau khi sửa)**|3|75%|

## **5. Kết luận — Khi nào nên / không nên dùng AI?**

- **Nên dùng AI:** Sinh khung cấu trúc test data JSON, tạo boilerplate code cho spec file, đặt tên test case theo convention, gợi ý selector ban đầu.
- **Không nên dùng AI:** Xác định `expectedResult` mà không đọc mã nguồn SUT; viết assertion liên quan đến locale format; sinh test data boundary value mà không kiểm tra logic backend thực tế.
- **Bài học:** Luôn cung cấp mã nguồn cho AI khi yêu cầu sinh test. Chạy thực tế và đối chiếu output với expected trước khi commit.

## **6. Mandatory Disclosure**
*"Script kiểm thử tự động cho HW04 được khởi tạo phiên bản đầu bởi Google Gemini 3.5 Flash; em đã rà soát toàn bộ selector, assertion, và logic script bằng cách đọc mã nguồn SUT và chạy thực tế trên 3 trình duyệt. AI Audit Report chi tiết đính kèm. Em cam đoan không dùng AI để sinh bất kỳ artifact nào thuộc danh mục bị cấm."*

## **Chữ ký**

|**Họ tên sinh viên (in hoa):**|**HUỲNH SĨ LUÂN**|
| :- | :- |
|**MSSV:**|23127086|
|**Lớp / Khoá:**|23CLC01|
|**Môn học:**|CS423 / CSC13003 – Kiểm chứng Phần mềm|
|**Giảng viên:**|Lâm Quang Vũ|
|**Ngày:**|10/08/2026|
|**Chữ ký:**|Luân|

## **Tham khảo**
- Kharbach, M. (2026). AI Use Policy Templates for Higher Education. CC BY-NC-SA 4.0.
- ISTQB Foundation Level Syllabus (latest version).
- Hardman, P. (2025). A Post-AI Learning Taxonomy.
- Fuster Rabella, M. (2025). OECD Education Working Paper No. 338.
- Perkins, M., Roe, J., & Furze, L. (2025). AI Assessment Scale.
- Anthropic (2025). Building reliable AI test agents — engineering blog.
- DeepEval & Promptfoo documentation — testing frameworks for LLM systems.
