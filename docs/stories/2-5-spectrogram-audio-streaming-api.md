# Story 2.5: Spectrogram Data & Audio Streaming Endpoints

- **Story ID:** `2.5`
- **Story Key:** `2-5-spectrogram-audio-streaming-api`
- **Epic:** `Epic 2: Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Kỹ sư Frontend / Bác sĩ,  
> **Tôi muốn** các endpoint `GET /api/audio/spectrogram/{audio_id}` để lấy ma trận phổ tần và `GET /api/audio/stream/{audio_id}/{type}` để stream âm thanh gốc hoặc âm thanh sạch,  
> **Để** hiển thị biểu đồ phổ sắc nét trên Canvas và nghe audio đối sánh A/B mượt mà với khả năng tua thời gian (scrubbing/seeking).

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Lấy dữ liệu ma trận phổ tần Mel-spectrogram
- **Given:** Một bản ghi âm đã xử lý `audio_id`.
- **When:** Gửi request `GET /api/audio/spectrogram/{audio_id}`.
- **Then:** Trả về HTTP 200 JSON chứa `time_axis`, `freq_axis`, `mel_matrix` (mảng 2D), `shape: [64, N]`.

### Scenario 2: Stream tệp âm thanh trực tiếp (Audio Streaming)
- **Given:** Tệp âm thanh đã làm sạch hoặc tệp gốc.
- **When:** Gửi request `GET /api/audio/stream/{audio_id}/cleaned` hoặc `/raw`.
- **Then:** Trả về HTTP 200 với `content-type: audio/wav`, hỗ trợ HTTP Range Requests cho phép trình duyệt tua âm thanh tức thì.

### Scenario 3: Xử lý tệp không tồn tại
- **Given:** Mã ID không tồn tại hoặc tệp chưa được xử lý làm sạch.
- **When:** Gửi request tới endpoint stream hoặc spectrogram.
- **Then:** Trả về HTTP 404 Not Found kèm thông báo lỗi rõ ràng.

---

## 3. Architecture & Developer Guardrails
- **Target Files:**
  - `backend/app/api/routes_audio.py`
  - `backend/tests/test_api_streaming.py`
