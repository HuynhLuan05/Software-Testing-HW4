# BÁO CÁO BÀI TẬP HW04 – AUTOMATION TESTING (EShop SUT)

---

## 1. Thông tin sinh viên
* **Họ và tên:** Huỳnh Sĩ Luân
* **Mã số sinh viên:** 23127086
* **Link GitHub Repository:** [GitHub](https://github.com/HuynhLuan05/Software-Testing-HW4)

---

## 2. Các tính năng lựa chọn kiểm thử tự động
Dựa trên báo cáo kiểm thử miền trị & biên ở bài tập HW02, 3 tính năng dưới đây được chọn để thực hiện kiểm thử tự động:
1. **Feature A (Pool A):** `FR-03 – Quên mật khẩu và Đặt lại mật khẩu (Forgot Password and Password Reset)`
2. **Feature B (Pool B):** `FR-09 – Mã giảm giá (Discount Coupons)`
3. **Feature C (Pool C):** `FR-14 – Quản lý danh mục (Category Management - CRUD)`

---

## 3. Task 1: Thiết kế & Thực thi Kiểm thử Tự động (Playwright)

### 3.1. Thiết kế dữ liệu kiểm thử (Data-Driven Testing)
* Dữ liệu test của cả 3 tính năng được tách biệt hoàn toàn khỏi mã nguồn test và lưu dưới dạng JSON tại thư mục: `tests/data/`
  * Dữ liệu FR-03: `tests/data/fr03_forgot_password.json` — 12 test cases (bao gồm email hợp lệ, sai định dạng, email trống, OTP sai, mật khẩu yếu, biên BVA)
  * Dữ liệu FR-09: `tests/data/fr09_coupons.json` — 12 test cases (áp dụng coupon fixed/percent, hết hạn, BVA biên 299,999/300,000/300,001 ₫, coupon rỗng, số tiền âm)
  * Dữ liệu FR-14: `tests/data/fr14_categories.json` — 12 test cases (CRUD: thêm hợp lệ, tên trống, tên trùng, tên đặc biệt, XSS, xóa có/không sản phẩm)

---

### 3.2. Quá trình sinh Script kiểm thử

#### 3.2.1. Feature A: FR-03 – Quên và Đặt lại mật khẩu
* **Tổng số test cases được viết:** 12 (4 ca Step 1 lấy OTP + 8 ca Step 2 đổi mật khẩu, bao gồm ca hợp lệ, lỗi, và biên)
* **Gap Analysis (Phân tích khoảng cách AI):**
  * *Những lỗi sai/thiếu sót của AI:* AI ban đầu dùng selector `input[type="email"]` nhưng SUT thực tế dùng `input[type="text"]` cho ô nhập email; AI viết selector `.success-alert` và `.error-alert` là class không tồn tại trong giao diện SUT; AI giả định backend validate định dạng email trước khi query DB nhưng thực tế backend không validate (Bug của SUT); AI không xử lý được việc OTP hiển thị động trên UI — cần thêm cơ chế trích xuất OTP bằng regex.
  * *Cách con người chỉnh sửa, tối ưu lại:* Sửa selector sang `input[type="text"]`; thêm logic `page.on('dialog')` để bắt alert của trình duyệt; triển khai regex `/Mã OTP của bạn là:\s*(\w+)/` để tự động trích xuất OTP thực tế từ DOM; đặt `workers: 1` để tránh race condition OTP khi chạy đa trình duyệt.

#### 3.2.2. Feature B: FR-09 – Mã giảm giá
* **Tổng số test cases được viết:** 12 (2 ca thành công, 6 ca lỗi, 4 ca BVA biên)
* **Gap Analysis (Phân tích khoảng cách AI):**
  * *Những lỗi sai/thiếu sót của AI:* AI dùng `toLocaleString()` không chỉ định locale dẫn đến sai format số khi so sánh chuỗi ("550.000" vs "550,000"); AI ban đầu dùng selector `span.text-xl` không đủ đặc hiệu, dẫn đến lấy nhầm element.
  * *Cách con người chỉnh sửa, tối ưu lại:* Sửa selector thành `span.font-bold.text-xl`; thêm `waitForTimeout(500)` sau khi click nút Áp dụng để đợi API response.

#### 3.2.3. Feature C: FR-14 – Quản lý danh mục (CRUD)
* **Tổng số test cases được viết:** 12 (6 ca tạo danh mục + 4 ca xóa danh mục, bao gồm các ca biên và kiểm tra bảo mật XSS)
* **Gap Analysis (Phân tích khoảng cách AI):**
  * *Những lỗi sai/thiếu sót của AI:* AI không dùng `waitForLoadState('networkidle')` sau khi login vào admin SPA khiến các selector tìm element bị timeout do React chưa render kịp; AI dùng locator không có `.first()` trên bộ chọn `table tbody td` khiến Playwright báo strict mode error khi có nhiều row trùng tên (do chạy test nhiều lần với DB không reset).
  * *Cách con người chỉnh sửa, tối ưu lại:* Thêm `waitForLoadState('networkidle')` và tăng timeout lên 10000ms; thêm `.first()` vào tất cả locator có thể trả về nhiều phần tử.

---

### 3.3. Kết quả thực thi đa trình duyệt (Multi-browser Execution)
Các bài test được cấu hình chạy trên 3 trình duyệt: **Chromium**, **Firefox**, và **WebKit** (Safari).

* **Tổng số lượt chạy:** 108 (36 test cases × 3 trình duyệt)
* **HTML Report:** Báo cáo HTML được tự động tạo ra sau mỗi lượt chạy tại thư mục `playwright-report-23127086/`.
* **Tóm tắt kết quả chạy test:**

| Trình duyệt | Số TC đã chạy | Đạt (Pass) | Thất bại (Fail) | Ghi chú |
| :--- | :---: | :---: | :---: | :--- |
| **Chromium** | 36 | 27 | 9 | 9 ca fail do Bug SUT |
| **Firefox** | 36 | 27 | 9 | 9 ca fail do Bug SUT |
| **WebKit** | 36 | 27 | 9 | 9 ca fail do Bug SUT |
| **Tổng cộng** | **108** | **81** | **27** | |

*(Xem báo cáo HTML tại: `playwright-report-23127086/index.html`)*

---

