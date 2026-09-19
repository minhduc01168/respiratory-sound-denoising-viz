# Story 3.7: Preset Patient Selector & Export Clinical Report

- **Story ID:** `3.7`
- **Story Key:** `3-7-preset-selector-export-summary`
- **Epic:** `Epic 3: Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học`
- **Story Points:** 2
- **Priority:** P1 (High)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ / Giám khảo hội đồng,  
> **Tôi muốn** chọn nhanh các ca bệnh lâm sàng mẫu và bấm "Xuất Báo Cáo Y Khoa" để xem trước và in bản tóm tắt chẩn đoán (Medical Diagnostic Report) gồm thông tin định danh, các chỉ số cải thiện chất lượng âm thanh ($\Delta\text{SNR}$, VAD) cùng toàn bộ các đoạn ghi chú âm bệnh học đã take-note,  
> **Để** lưu vào hồ sơ bệnh án điện tử (EMR) hoặc phục vụ hội chẩn liên chuyên khoa.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Thanh chọn ca bệnh lâm sàng mẫu (Quick Preset Selector)
- **Given:** Danh sách 4 ca bệnh từ backend.
- **When:** Người dùng click vào một thẻ ca bệnh trên thanh Preset Selector.
- **Then:** Hệ thống chuyển đổi tức thì sang ca bệnh đó, nạp dữ liệu sóng âm, phổ tần số và cập nhật các chỉ số DSP tương ứng.

### Scenario 2: Xem trước và xuất báo cáo y khoa (Print-Ready EMR Summary)
- **Given:** Bản ghi âm đã được phân tích và có các ghi chú lâm sàng.
- **When:** Bấm nút "Xuất báo cáo".
- **Then:** Modal Báo Cáo Y Khoa hiển thị trang trọng với:
  1. Quốc hiệu hoặc Tiêu đề Bệnh viện / Phòng khám Thính Chẩn Hô Hấp.
  2. Bảng thông số định danh ca bệnh & thời gian đo đạc.
  3. Bảng chỉ số kỹ thuật âm học ($\Delta\text{SNR}$, SNR Before/After, Silence Trimmed, Sampling Rate 16kHz).
  4. Danh sách toàn bộ các đoạn bất thường đã gán nhãn (Wheeze, Crackle...) kèm mô tả chi tiết.
  5. Chữ ký xác nhận của Bác sĩ điều trị.
  6. Nút "In Báo Cáo / Lưu PDF" kích hoạt `window.print()` với định dạng A4 sạch sẽ, che các nút điều khiển dư thừa.

---

## 3. Architecture & Developer Guardrails
- **Components:**
  - `frontend/src/components/PresetSelector.jsx`
  - `frontend/src/components/ReportModal.jsx`
- **Print Stylesheet:** `@media print` trong `frontend/src/index.css`.
