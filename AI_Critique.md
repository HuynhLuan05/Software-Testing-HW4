# Đánh giá và Phản biện AI (AI Critique) — HW04

Qua quá trình cộng tác với AI trong bài tập HW04 về kiểm thử tự động (Automation Testing) cho hệ thống **EShop SUT** bằng Playwright, em nhận thấy các thế mạnh và hạn chế rõ rệt của AI khi áp dụng vào sinh script kiểm thử như sau:

---

### 1. Những sai sót và điểm chưa hoàn thiện của AI

AI thường giả định hệ thống hoạt động theo các nguyên lý chuẩn mà không kiểm tra mã nguồn thực tế:

- **Giả định hệ thống lý tưởng hóa:** Đối với FR-03, AI tự sinh script kỳ vọng backend trả về `"Invalid email format"` khi nhập email sai định dạng. Thực tế, backend EShop không validate format email mà chỉ query DB → trả về `"User not found"`. AI không đọc `server.js` để phát hiện điều này.

- **Không hiểu môi trường chạy động (Race Condition):** AI sinh script FR-03 chạy song song mà không xử lý việc nhiều test cùng gọi `/api/forgot-password` cho cùng email, khiến OTP trong DB bị ghi đè liên tục → test thất bại ngẫu nhiên.

- **Selector không khớp thực tế DOM:** AI dùng `span.text-xl` để lấy tổng tiền, nhưng element thực tế có class `font-bold text-xl`. AI cũng dùng `toLocaleString()` không chỉ định locale, dẫn đến format số sai tùy hệ điều hành.

- **Không biết SQLite tắt Foreign Key mặc định:** AI viết test FR-14 kỳ vọng hệ thống chặn xóa danh mục đang chứa sản phẩm. Thực tế SQLite không bật Foreign Keys → xóa thành công → test fail (nhưng đây là Bug SUT, không phải lỗi test).

---

### 2. Nguyên nhân AI bỏ sót các vấn đề

Nguyên nhân chủ yếu là AI hoạt động như một "hộp đen" suy luận ngôn từ từ tài liệu tĩnh, không thực thi và quan sát ứng dụng chạy động. Khi prompt chỉ mô tả tính năng chung chung mà không đính kèm mã nguồn (`server.js`, file JSX), AI sẽ sinh test case lý thuyết dựa trên "chuẩn thực hành tốt" mà bỏ lọt hoàn toàn các lỗi logic nội bộ, lỗi biên, và lỗi cấu hình môi trường.

---

### 3. Bài học rút ra khi cộng tác với AI

Nguyên tắc cốt lõi là duy trì vai trò **"Human-in-the-loop"** (con người kiểm duyệt toàn bộ output của AI). AI đóng vai trò xuất sắc trong việc sinh khung script ban đầu, và cấu trúc data-driven JSON. Tuy nhiên, người kiểm thử phải:

1. **Đọc mã nguồn SUT** để xác định assertion đúng thay vì tin vào giả định của AI.
2. **Chạy thử thực tế** để phát hiện selector sai, timeout chưa đủ, locale format sai.
3. **Phân tích lỗi thất bại** để phân biệt lỗi script và lỗi SUT — cả hai đều có giá trị nhưng cần xử lý khác nhau.

AI không thể thay thế con người trong bước quan sát và phán đoán kết quả thực tế trên trình duyệt.