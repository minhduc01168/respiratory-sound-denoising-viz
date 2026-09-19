# Story 2.7: Preset Clinical Audio Loader API

- **Story ID:** `2.7`
- **Story Key:** `2-7-preset-clinical-audio-loader`
- **Epic:** `Epic 2: Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế`
- **Story Points:** 1
- **Priority:** P1 (High)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ / Giám khảo thẩm định / Người dùng thử nghiệm,  
> **Tôi muốn** hệ thống cung cấp sẵn danh mục 4 ca bệnh âm thanh hô hấp điển hình (Thở bình thường, Hen phế quản - Wheeze, Viêm phổi - Crackle, Cơn ho cấp - Cough) qua endpoint `GET /api/audio/presets`,  
> **Để** có thể trải nghiệm ngay lập tức quy trình lọc khử nhiễu và trực quan hóa phổ tần số mà không bắt buộc phải tải tệp lên hoặc ghi âm thực tế.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Lấy danh sách ca bệnh mẫu có sẵn
- **Given:** Server backend đang hoạt động với các file mẫu được nạp tại `backend/storage/presets/`.
- **When:** Gửi request `GET /api/audio/presets`.
- **Then:** Trả về HTTP 200 danh sách gồm 4 preset:
  1. `preset_normal`: Âm thở phế nang bình thường (Normal Vesicular Breath).
  2. `preset_wheeze`: Hen phế quản - Tiếng ran rít liên tục thì thở ra (Asthma Wheeze).
  3. `preset_crackle`: Viêm phổi thùy - Tiếng ran nổ ngắt quãng (Pneumonia Crackles).
  4. `preset_cough`: Cơn ho nhiễm khuẩn đường hô hấp (Wet Cough Spasm).
  Mỗi preset chứa đầy đủ các thuộc tính: `id`, `title`, `disease_group`, `description`, `duration_sec`, `raw_url`, `cleaned_url`, `estimated_snr_gain`.

### Scenario 2: Trực tiếp stream hoặc phân tích preset
- **Given:** Người dùng chọn preset `preset_wheeze`.
- **When:** Gửi request stream `GET /api/audio/stream/preset_wheeze/raw` hoặc `POST /api/audio/process/preset_wheeze`.
- **Then:** Server stream âm thanh thành công hoặc kích hoạt pipeline khử nhiễu chính xác tương tự như file upload.

---

## 3. Architecture & Developer Guardrails
- **Presets Location:** `backend/storage/presets/`
- **API Endpoint:** `GET /api/audio/presets` trong `backend/app/api/routes_audio.py`
- **Unit Tests:** `backend/tests/test_api_presets.py`
