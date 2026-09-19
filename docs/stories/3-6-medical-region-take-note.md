# Story 3.6: Medical Region Selector & Quick-Tag Annotation Panel

- **Story ID:** `3.6`
- **Story Key:** `3-6-medical-region-take-note`
- **Epic:** `Epic 3: Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học`
- **Story Points:** 3
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ lâm sàng / Chuyên gia thính chẩn,  
> **Tôi muốn** dùng chuột bôi đen trực tiếp một khoảng thời gian trên biểu đồ phổ tần số Mel, chọn nhanh 6 thẻ bệnh lý lâm sàng (`Wheeze`, `Crackle`, `Rhonchi`, `Stridor`, `Cough`, `Artifact`), nhập ghi chú và lưu vào cơ sở dữ liệu y tế,  
> **Để** đánh dấu chính xác các bất thường âm học phục vụ hội chẩn, lưu trữ hồ sơ bệnh án điện tử và làm giàu tập dữ liệu huấn luyện AI.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Kéo chuột chọn vùng bất thường trên phổ tần số
- **Given:** Biểu đồ Mel-Spectrogram đang hiển thị.
- **When:** Bác sĩ kéo chuột từ mốc thời gian $t_1$ đến $t_2$.
- **Then:** Vùng được highlight màu Cyan trong suốt; bảng Take-note bên phải tự động điền giá trị `start_time = t1` và `end_time = t2`.

### Scenario 2: Chọn nhanh Quick-Tags và lưu ghi chú
- **Given:** Vùng thời gian đã được chọn.
- **When:** Bác sĩ click chọn thẻ bệnh lý (ví dụ: `+Wheeze`) và nhập mô tả "Ran rít âm sắc cao thì thở ra", sau đó bấm "Lưu Chẩn Đoán".
- **Then:** Gửi `POST /api/annotations` lên backend; ghi chú mới xuất hiện trong danh sách hiển thị với đầy đủ thời gian, tag và tên bác sĩ.

### Scenario 3: Xóa ghi chú lâm sàng
- **Given:** Danh sách hiển thị có ít nhất 1 ghi chú.
- **When:** Bác sĩ bấm nút biểu tượng thùng rác trên ghi chú.
- **Then:** Gửi `DELETE /api/annotations/{id}`, ghi chú biến mất khỏi danh sách và database SQLite.

---

## 3. Architecture & Developer Guardrails
- **Target Component:** `frontend/src/components/AnnotationPanel.jsx`.
- **API Integration:**
  - `GET /api/annotations/{audio_id}`
  - `POST /api/annotations`
  - `DELETE /api/annotations/{id}`
