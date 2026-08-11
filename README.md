# EShop Automation Testing - HW04

Dự án kiểm thử tự động cho hệ thống **EShop SUT** sử dụng Playwright trong khuôn khổ môn học Kiểm thử phần mềm (HW04).

---

## 1. Bảng tự đánh giá điểm (Self-Assessment Table)

| STT | Tiêu chí đánh giá | Điểm tối đa | Điểm tự đánh giá |
| :-: | :--- | :-: | :-: |
| **1** | Task 1 - Feature A (FR-03) | 25 | 25 |
| **2** | Task 1 - Feature B (FR-09) | 25 | 25 |
| **3** | Task 1 - Feature C (FR-14) | 25 | 25 |
| **4** | Task 2 - Video Demo | 15 | 15 |
| **5** | Agent Skills | 10 | 10 |
| | **Tổng cộng** | **100** | **100** | |

---

## 2. Báo cáo tổng hợp kiểm thử (Test Summary Report)

* **Số lượng tính năng đã kiểm thử (Features):** 3 tính năng (`FR-03`, `FR-09`, `FR-14`)
* **Tổng số test cases đã thực thi (Executed):** 36 test cases x 3 trình duyệt = 108 test cases.
* **Số lượng test case thành công (Pass):** 81 test cases.
* **Số lượng test case thất bại (Fail):** 27 test cases.
* **Số lượt chạy trên trình duyệt (Browser runs):** 3 trình duyệt (Chromium, Firefox, WebKit) x 3 tính năng = 9 browser runs.
* **Số lượng lỗi thực tế (Bugs):** 5 bugs thực tế (được liệt kê chi tiết trong `bug_report.md`).
* **Video Demo:** https://youtu.be/ZBUaBCpR77E

---

## 3. Hướng dẫn chạy test
1. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   npx playwright install
   ```
2. Chạy toàn bộ các bài test trên cả 3 trình duyệt:
   ```bash
   npx playwright test
   ```
3. Xem báo cáo HTML kết quả chạy test:
   ```bash
   npx playwright show-report
   ```
