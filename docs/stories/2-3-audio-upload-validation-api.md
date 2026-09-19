# Story 2.3: Audio Ingestion & Validation API (POST /api/audio/upload)

- **Story ID:** `2.3`
- **Story Key:** `2-3-audio-upload-validation-api`
- **Epic:** `Epic 2: Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Người dùng Web / Bác sĩ,  
> **Tôi muốn** tải lên tệp âm thanh (.wav, .mp3) hoặc gửi luồng ghi âm qua API `POST /api/audio/upload`,  
> **Để** hệ thống kiểm tra tính hợp lệ (định dạng, dung lượng < 10MB, tính toàn vẹn âm thanh) và lưu trữ an toàn vào thư mục `raw/` trước khi tiến hành lọc nhiễu.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Upload thành công tệp âm thanh hợp lệ
- **Given:** Một file WAV hoặc MP3 hợp lệ, dung lượng < 10MB, thời lượng từ 2s đến 120s.
- **When:** Gửi request `POST /api/audio/upload` với form-data chứa file.
- **Then:** Trả về HTTP 201 Created kèm JSON:
  `{ "audio_id": "...", "filename": "...", "duration_sec": ..., "sample_rate": 16000, "size_bytes": ... }`.
  Tệp gốc được lưu an toàn tại `storage/raw/{audio_id}.wav`.

### Scenario 2: Chặn tệp sai định dạng
- **Given:** Tệp tin có đuôi không phải âm thanh (ví dụ: `.txt`, `.exe`, `.pdf`).
- **When:** Gửi request `POST /api/audio/upload`.
- **Then:** Trả về HTTP 400 Bad Request kèm thông báo lỗi: `"Định dạng tệp không được hỗ trợ. Chỉ chấp nhận .wav hoặc .mp3"`.

### Scenario 3: Chặn tệp vượt quá dung lượng cho phép (> 10MB)
- **Given:** Tệp âm thanh có kích thước lớn hơn 10MB.
- **When:** Gửi request `POST /api/audio/upload`.
- **Then:** Trả về HTTP 413 Payload Too Large kèm thông báo lỗi dung lượng.

---

## 3. Architecture & Developer Guardrails
- **Router:** `backend/app/api/routes_audio.py`
- **Target Files:**
  - `backend/app/api/routes_audio.py`
  - `backend/app/main.py` (include router)
  - `backend/tests/test_api_upload.py`
