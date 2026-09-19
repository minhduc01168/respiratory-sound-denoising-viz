# Story 2.1: FastAPI App Initialization & Storage Architecture

- **Story ID:** `2.1`
- **Story Key:** `2-1-fastapi-initialization-storage`
- **Epic:** `Epic 2: Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế`
- **Story Points:** 1
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư Backend,  
> **Tôi muốn** khởi tạo ứng dụng FastAPI với cấu hình CORS toàn diện, quản lý biến môi trường tập trung và tự động khởi tạo các thư mục lưu trữ (`storage/raw`, `storage/cleaned`, `storage/presets`),  
> **Để** làm nền tảng vững chắc phục vụ các REST API xử lý âm thanh hô hấp và tương tác với Web Dashboard.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Healthcheck API và khởi động ứng dụng
- **Given:** Server FastAPI khởi động qua `uvicorn backend.app.main:app`.
- **When:** Gửi request `GET /api/health`.
- **Then:** Trả về HTTP 200 `{ "status": "healthy", "service": "respiratory-sound-denoising-api", "version": "1.0.0" }`.

### Scenario 2: Tự động khởi tạo hệ thống lưu trữ tệp
- **Given:** Server backend khởi chạy lần đầu trên máy mới chưa có thư mục storage.
- **When:** Module `backend/app/core/config.py` được load.
- **Then:** Các thư mục `backend/storage/raw/`, `backend/storage/cleaned/`, `backend/storage/presets/` được tự động tạo lập sẵn sàng lưu trữ.

### Scenario 3: Cấu hình CORS cho phép Frontend giao tiếp
- **Given:** Request gửi từ trình duyệt tại domain `http://localhost:5173` hoặc `http://127.0.0.1:5173`.
- **When:** Gửi preflight OPTIONS hoặc HTTP request tới bất kỳ endpoint `/api/*`.
- **Then:** Phản hồi chứa các headers `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods: *`, `Access-Control-Allow-Headers: *`.

---

## 3. Architecture & Developer Guardrails
- **Target Files:**
  - `backend/app/core/config.py`
  - `backend/app/main.py`
  - `backend/tests/test_main.py`
