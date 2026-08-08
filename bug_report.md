# BÁO CÁO LỖI (BUG REPORTS) - HW04

Dưới đây là thông tin chi tiết các lỗi thực tế (defects) được phát hiện trong hệ thống **EShop SUT** thông qua các kịch bản kiểm thử tự động.

---

## Danh sách lỗi tổng hợp

| ID Bug | Test Case phát hiện | Tên lỗi / Mô tả tóm tắt | Mức độ | Trạng thái |
| :--- | :--- | :--- | :---: | :---: |
| **BUG-01** | FR09-TC-02, TC-07, TC-08, TC-10 | Tính sai số tiền khi áp dụng mã giảm giá phần trăm (SAVE10) | High | Open |
| **BUG-02** | FR03-TC-03 | Backend không validate định dạng email khi yêu cầu OTP | Medium | Open |
| **BUG-03** | FR14-TC-02, TC-03, TC-09 | Cho phép tạo danh mục tên trống / trùng / chỉ khoảng trắng | Medium | Open |
| **BUG-04** | FR14-TC-08 | Cho phép xóa danh mục đang chứa sản phẩm | High | Open |
| **BUG-05** | FR09-TC-07 | Điều kiện biên `min_order_amount` dùng sai toán tử `>` thay vì `>=` | Medium | Open |

---

## Chi tiết từng Bug

---

### BUG-01: Tính sai số tiền đơn hàng khi áp dụng mã giảm giá phần trăm

* **Test Case phát hiện:** `FR09-TC-02` (500k), `FR09-TC-07` (BVA biên 300k), `FR09-TC-08` (BVA 300,001), `FR09-TC-10` (SAVE10 với khoảng trắng)
* **Mức độ nghiêm trọng:** High — Lỗi nghiệp vụ ảnh hưởng trực tiếp đến tài chính người dùng.
* **Các bước tái hiện:**
  1. Truy cập trang thanh toán của EShop (`/checkout`).
  2. Nhập tổng giá trị đơn hàng là `500,000 ₫`.
  3. Nhập mã giảm giá `SAVE10` (10% off, min_order_amount = 300,000 ₫).
  4. Nhấn nút **Áp dụng** và quan sát số tiền cuối cùng.
* **Kết quả mong đợi:**
  * Số tiền giảm: `500,000 × 10% = 50,000 ₫`
  * Tổng thanh toán: `500,000 - 50,000 = 450,000 ₫`
* **Kết quả thực tế:**
  * Hệ thống báo áp dụng thành công nhưng hiển thị tổng thanh toán là **5,000,000 ₫** (tăng gấp 10 lần!).
* **Nguyên nhân kỹ thuật:**
  * File `backend/server.js`: công thức tính giảm giá phần trăm sai:
    ```javascript
    // SAI: discount_value được lưu là 10 (integer), không phải 0.1
    discount_amount = Math.floor(total_amount * (1 - coupon.discount_value));
    // 1 - 10 = -9 → total * (-9) → số âm → final = total - âm = tăng vọt
    ```
  * Phải là: `Math.floor(total_amount * (coupon.discount_value / 100))`

---

### BUG-02: Backend không validate định dạng email khi yêu cầu OTP

* **Test Case phát hiện:** `FR03-TC-03`
* **Mức độ nghiêm trọng:** Medium — Có thể gây spam query DB với dữ liệu rác.
* **Các bước tái hiện:**
  1. Truy cập trang Quên mật khẩu (`/forgot-password`).
  2. Nhập email sai định dạng: `invalid-email-format` (không có `@`).
  3. Nhấn nút **Lấy mã OTP**.
* **Kết quả mong đợi:**
  * Hệ thống báo lỗi: `"Lỗi: Invalid email format"` (HTTP 400).
* **Kết quả thực tế:**
  * Hệ thống trả về: `"Lỗi: User not found"` (HTTP 404) — backend query thẳng DB mà không kiểm tra format email trước.
* **Nguyên nhân kỹ thuật:**
  * File `backend/server.js` endpoint `/api/forgot-password` không có bước validate format email. Code chỉ thực hiện `db.get("SELECT * FROM users WHERE email = ?", [email], ...)` ngay lập tức.

---

### BUG-03: Cho phép tạo danh mục với tên trống, trùng lặp, hoặc chỉ chứa khoảng trắng

* **Test Case phát hiện:** `FR14-TC-02` (tên trống `""`), `FR14-TC-03` (tên trùng `"Laptop"`), `FR14-TC-09` (chỉ chứa khoảng trắng `"   "`)
* **Mức độ nghiêm trọng:** Medium — Làm bẩn dữ liệu, gây khó quản lý.
* **Các bước tái hiện (tên trống):**
  1. Đăng nhập admin tại `http://localhost:5174`.
  2. Chuyển sang tab **Danh mục**.
  3. Để trống ô nhập tên danh mục, nhấn **Thêm mới**.
* **Kết quả mong đợi:** Hệ thống báo lỗi: `"Tên danh mục không được để trống"`.
* **Kết quả thực tế:** Hệ thống tạo thành công danh mục với tên rỗng `""`, hiển thị dòng trống trong bảng.
* **Nguyên nhân kỹ thuật:**
  * Endpoint `POST /api/categories` trong `backend/server.js` không có bước kiểm tra `name` trước khi INSERT vào SQLite. Cột `name TEXT` trong schema cũng không có ràng buộc `NOT NULL` hay `UNIQUE`.

---

### BUG-04: Cho phép xóa danh mục đang chứa sản phẩm (vi phạm ràng buộc khóa ngoại)

* **Test Case phát hiện:** `FR14-TC-08`
* **Mức độ nghiêm trọng:** High — Gây ra dữ liệu mồ côi (orphan records), sản phẩm mất danh mục tham chiếu.
* **Các bước tái hiện:**
  1. Đăng nhập admin.
  2. Chuyển sang tab **Danh mục**.
  3. Nhấn nút **Xóa** trên danh mục `"Laptop"` (đang có 2 sản phẩm: MacBook Pro M3, ...).
* **Kết quả mong đợi:** Hệ thống từ chối và báo lỗi: `"Không thể xóa danh mục đang chứa sản phẩm"`.
* **Kết quả thực tế:** Danh mục bị xóa thành công, các sản phẩm trong danh mục `Laptop` trở thành orphan records (`category_id` trỏ đến ID không còn tồn tại).
* **Nguyên nhân kỹ thuật:**
  * SQLite mặc định **tắt** kiểm tra khóa ngoại. Backend không gọi `PRAGMA foreign_keys = ON` nên ràng buộc `category_id INTEGER REFERENCES categories(id)` trong bảng `products` bị bỏ qua hoàn toàn.

---

### BUG-05: Điều kiện biên min_order_amount dùng sai toán tử `>` thay vì `>=`

* **Test Case phát hiện:** `FR09-TC-07` (BVA Biên đúng — totalAmount = 300,000 ₫ = min_order_amount của SAVE10)
* **Mức độ nghiêm trọng:** Medium — Người dùng bị từ chối coupon hợp lệ khi đơn hàng đúng bằng giá trị tối thiểu.
* **Các bước tái hiện:**
  1. Truy cập trang thanh toán.
  2. Nhập tổng đơn hàng **đúng bằng** `300,000 ₫` (= min_order_amount của SAVE10).
  3. Áp dụng mã `SAVE10`.
* **Kết quả mong đợi:** Coupon được áp dụng thành công (đơn hàng đủ điều kiện vì `300,000 >= 300,000`).
* **Kết quả thực tế:** Hệ thống báo lỗi `"Đơn hàng chưa đủ giá trị tối thiểu"` — từ chối coupon.
* **Nguyên nhân kỹ thuật:**
  * File `backend/server.js`:
    ```javascript
    // SAI: dùng > thay vì >=
    if (total_amount > coupon.min_order_amount) { ... }
    // 300000 > 300000 → false → từ chối
    ```
  * Phải là: `if (total_amount >= coupon.min_order_amount)`
