# Story 2.2: SQLite Database & Schema Definition

- **Story ID:** `2.2`
- **Story Key:** `2-2-sqlite-database-schema`
- **Epic:** `Epic 2: Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư Backend,  
> **Tôi muốn** thiết lập cơ sở dữ liệu SQLite `metadata.db` với bảng quản lý bản ghi âm (`audio_records`) và bảng ghi chú y khoa (`annotations`), có quan hệ khóa ngoại (Foreign Key) và cascade delete,  
> **Để** lưu trữ bền vững lịch sử xử lý âm thanh, chỉ số cải thiện tiếng ồn (SNR delta) và các phân tích chẩn đoán của bác sĩ.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Tự động khởi tạo cấu trúc bảng SQLite
- **Given:** File database chưa tồn tại hoặc kết nối lần đầu.
- **When:** Hàm `init_db()` được gọi lúc khởi động ứng dụng.
- **Then:** Tạo bảng `audio_records` và `annotations` cùng các index tìm kiếm theo `audio_id` và `created_at`.

### Scenario 2: CRUD trên bảng `audio_records`
- **Given:** Thông tin metadata của một ca bệnh đã xử lý xong.
- **When:** Gọi `create_audio_record(...)` và `get_audio_record(id)`.
- **Then:** Bản ghi được lưu và đọc lại chính xác với định dạng dictionary chứa đầy đủ các trường SNR, đường dẫn file và thời lượng.

### Scenario 3: Quan hệ khóa ngoại và Cascade Delete cho `annotations`
- **Given:** Một bản ghi âm chứa 2 ghi chú y khoa (annotations).
- **When:** Xóa bản ghi âm qua `delete_audio_record(id)`.
- **Then:** Cả bản ghi âm và 2 annotations liên kết đều bị xóa sạch khỏi database mà không để lại dữ liệu rác (orphaned rows).

---

## 3. Architecture & Developer Guardrails
- **Implementation:** Dùng thư viện chuẩn `sqlite3` của Python với context manager `with get_db()`, bật cờ `PRAGMA foreign_keys = ON;`, `row_factory = sqlite3.Row`.
- **Target Files:**
  - `backend/app/core/database.py`
  - `backend/app/models/schemas.py`
  - `backend/tests/test_database.py`
