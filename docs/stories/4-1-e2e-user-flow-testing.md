# Story 4.1: End-to-End User Flow Integration Testing

- **Story ID:** `4.1`
- **Story Key:** `4-1-e2e-user-flow-testing`
- **Epic:** `Epic 4: Tích Hợp E2E, Thẩm Định Y Tế & Đóng Gói`
- **Story Points:** 3
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Chuyên viên Kiểm thử Đảm bảo Chất lượng Y tế (QA Lead),  
> **Tôi muốn** một bộ kịch bản kiểm thử tích hợp toàn trình (E2E Integration Test Suite) bao phủ toàn bộ luồng hoạt động: Tiếp nhận âm thanh $\to$ Khử nhiễu DSP $\to$ Trích xuất phổ Mel $\to$ Stream âm thanh $\to$ Gán nhãn bất thường $\to$ Xuất kết quả,  
> **Để** đảm bảo 100% các thành phần hệ thống phối hợp chính xác, không phát sinh lỗi dữ liệu hoặc rò rỉ trạng thái.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Chu trình làm việc hoàn chỉnh cho ca bệnh thu âm mới
- **Given:** Một file âm thanh hô hấp thô được tạo ra.
- **When:** Hệ thống thực hiện tuần tự:
  1. `POST /api/audio/upload`: Tải file lên và chuẩn hóa 16kHz.
  2. `POST /api/audio/process/{id}`: Kích hoạt pipeline DSP khử nhiễu (Butterworth + VAD + Spectral Gating).
  3. `GET /api/audio/spectrogram/{id}`: Kiểm tra ma trận phổ Decibel trả về hợp lệ.
  4. `GET /api/audio/stream/{id}/cleaned`: Xác nhận tệp âm thanh sạch có thể stream với `audio/wav`.
  5. `POST /api/annotations`: Tạo 2 ghi chú chẩn đoán lâm sàng (`Wheeze`, `Crackle`).
  6. `GET /api/annotations/{id}`: Xác nhận 2 ghi chú đã được lưu và sắp xếp đúng trình tự.
- **Then:** Toàn bộ 6 bước thành công 100% với mã HTTP tương ứng (201, 200), không có ngoại lệ.

### Scenario 2: Chu trình làm việc hoàn chỉnh cho ca bệnh mẫu có sẵn (Presets Flow)
- **Given:** Endpoint `GET /api/audio/presets`.
- **When:** Lấy ca bệnh `preset_wheeze`, kích hoạt `process`, tạo ghi chú và truy vấn phổ.
- **Then:** Hệ thống hoạt động trơn tru tương tự như ca bệnh tải lên.

---

## 3. Architecture & Developer Guardrails
- **Target File:** `backend/tests/test_e2e_flow.py`.
