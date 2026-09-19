# Story 4.4: One-Click Startup Script & Deployment Packaging

- **Story ID:** `4.4`
- **Story Key:** `4-4-one-click-startup-packaging`
- **Epic:** `Epic 4: Tích Hợp E2E, Thẩm Định Y Tế & Đóng Gói`
- **Story Points:** 1
- **Priority:** P1 (High)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ / Giám khảo hội đồng / Kỹ thuật viên CNTT Bệnh viện,  
> **Tôi muốn** một script khởi động một chạm (`start.bat` cho Windows và `start.sh` cho Linux/macOS) cùng tệp `docker-compose.yml`,  
> **Để** khởi chạy đồng thời cả máy chủ Backend FastAPI và giao diện Frontend React chỉ bằng 1 cú nhấp chuột và tự động mở trình duyệt vào hệ thống mà không cần thao tác dòng lệnh phức tạp.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Khởi động một chạm trên Windows (`start.bat`)
- **Given:** Người dùng nhấp đúp vào file `start.bat`.
- **When:** Script thực thi.
- **Then:** Tự động kiểm tra Python & Node.js, khởi chạy 2 tiến trình độc lập:
  1. Backend FastAPI: `http://127.0.0.1:8000`
  2. Frontend React: `http://localhost:5173`
  Và tự động mở trình duyệt web mặc định tại `http://localhost:5173`.

### Scenario 2: Khởi động một chạm trên Linux/macOS (`start.sh`)
- **Given:** Người dùng chạy `./start.sh`.
- **When:** Script thực thi.
- **Then:** Tự động mở Backend & Frontend ở background, bẫy tín hiệu `SIGINT`/`SIGTERM` để tắt sạch sẽ khi bấm `Ctrl+C`.

### Scenario 3: Đóng gói Container hóa Docker (`docker-compose.yml`)
- **Given:** Máy chủ có cài đặt Docker & Docker Compose.
- **When:** Chạy `docker compose up -d`.
- **Then:** Toàn bộ hệ thống được dựng thành các container độc lập (`backend/Dockerfile`, `frontend/Dockerfile` với Nginx), an toàn và sẵn sàng phục vụ.

### Scenario 4: Tài liệu hướng dẫn sử dụng chuyên nghiệp (`README.md`)
- **Given:** Người dùng mở kho mã nguồn trên GitHub.
- **When:** Đọc trang chủ `README.md`.
- **Then:** Hiển thị sơ đồ kiến trúc, bảng chỉ số benchmark y học, bảng độ trễ, hướng dẫn chạy 1 chạm và hướng dẫn thao tác chi tiết.

---

## 3. Implementation Summary
- Đã tạo `start.bat` với tính năng kiểm tra tự động Python 3.9+, Node.js 18+, auto npm install nếu thiếu `node_modules`, khởi chạy 2 console riêng biệt và tự động mở trình duyệt.
- Đã tạo `start.sh` hỗ trợ macOS/Linux với signal trap dọn dẹp tiến trình.
- Đã tạo `backend/requirements.txt` và `backend/Dockerfile` với thư viện âm thanh y tế `libsndfile1` và `ffmpeg`.
- Đã tạo `frontend/Dockerfile` đa tầng (multi-stage) kết hợp máy chủ siêu nhẹ Nginx Alpine cùng `frontend/nginx.conf` hỗ trợ SPA và proxy API `/api/`.
- Đã tạo `docker-compose.yml` liên kết 2 dịch vụ, hỗ trợ healthcheck và persistent volume lưu trữ âm thanh y tế.
- Đã cập nhật `README.md` toàn diện chuẩn quốc tế, đầy đủ bảng benchmark, kiến trúc hệ thống và hướng dẫn lâm sàng.

---

## 4. Verification & Testing
- Đã chạy kiểm thử build frontend: `npm run build` thành công trong 2.84s.
- Đã chạy 42/42 backend tests: 100% pass trong 2.64s.
- Code review hoàn tất đạt chuẩn chất lượng cao.
