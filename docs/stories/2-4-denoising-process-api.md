# Story 2.4: Denoising Pipeline Orchestration API (POST /api/audio/process/{id})

- **Story ID:** `2.4`
- **Story Key:** `2-4-denoising-process-api`
- **Epic:** `Epic 2: Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế`
- **Story Points:** 3
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư Backend / Bác sĩ,  
> **Tôi muốn** gọi endpoint `POST /api/audio/process/{audio_id}` để kích hoạt chuỗi xử lý DSP tự động cho bản ghi âm đã tải lên,  
> **Để** tạo ra tệp âm thanh sạch, tính toán ma trận phổ tần số Mel, cập nhật cơ sở dữ liệu SQLite và trả về kết quả đối sánh toàn diện trong thời gian $< 1.2\text{ giây}$.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Xử lý thành công bản ghi âm tồn tại
- **Given:** Một `audio_id` đã được upload thành công trong `storage/raw/`.
- **When:** Gửi request `POST /api/audio/process/{audio_id}`.
- **Then:** Hệ thống thực thi pipeline DSP:
  - Tệp sạch được tạo tại `storage/cleaned/{audio_id}_clean.wav`.
  - Cơ sở dữ liệu SQLite lưu bản ghi với đầy đủ `snr_original`, `snr_processed`, `snr_delta`.
  - Phản hồi HTTP 200 trả về JSON chứa `metrics` (latency < 1200ms), `spectrogram` (ma trận Mel) và URLs stream audio.

### Scenario 2: Xử lý `audio_id` không tồn tại
- **Given:** Mã `audio_id` ngẫu nhiên không có trong hệ thống (ví dụ: `rec_nonexistent`).
- **When:** Gửi request `POST /api/audio/process/rec_nonexistent`.
- **Then:** Trả về HTTP 404 Not Found kèm thông báo lỗi `"Không tìm thấy bản ghi âm"`.

### Scenario 3: Hỗ trợ cấu hình tham số lọc động
- **Given:** Bác sĩ muốn tùy chỉnh ngưỡng lọc (ví dụ: không cắt khoảng lặng `trim_silence=false`).
- **When:** Gửi request kèm query parameters `POST /api/audio/process/{id}?trim_silence=false`.
- **Then:** Pipeline chạy đúng theo cấu hình yêu cầu và trả kết quả chính xác.

---

## 3. Architecture & Developer Guardrails
- **Target Files:**
  - `backend/app/api/routes_audio.py`
  - `backend/tests/test_api_process.py`
