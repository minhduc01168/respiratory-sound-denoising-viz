# Story 4.3: Clinical Acoustic Denoising Benchmark Report

- **Story ID:** `4.3`
- **Story Key:** `4-3-clinical-metric-report`
- **Epic:** `Epic 4: Tích Hợp E2E, Thẩm Định Y Tế & Đóng Gói`
- **Story Points:** 2
- **Priority:** P1 (High)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ Chuyên khoa Hô hấp / Nhà nghiên cứu Âm học Y tế,  
> **Tôi muốn** một báo cáo khoa học chi tiết thẩm định chất lượng khử nhiễu âm thanh lâm sàng (`docs/CLINICAL_BENCHMARK_REPORT.md`) với các chỉ số định lượng ($\Delta\text{SNR}$, LSD, Wheeze Harmonic Preservation Ratio, Noise Reduction Ratio) trên 4 bệnh cảnh điển hình,  
> **Để** xác thực tính an toàn y khoa, chứng minh thuật toán làm sạch tạp âm mà không làm biến dạng hoặc triệt tiêu các dải tần bệnh học nguy hiểm.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Đo lường định lượng trên 4 nhóm bệnh cảnh hô hấp
- **Given:** Bộ 4 ca bệnh mẫu lâm sàng (`Normal`, `Wheeze`, `Crackle`, `Cough`).
- **When:** Chạy script đánh giá định lượng âm học `clinical_benchmark.py`.
- **Then:** Thu được bảng chỉ số chính xác:
  - $\Delta\text{SNR}$ trung bình $\ge +8.0\text{dB}$ (cải thiện rõ rệt độ rõ của âm thanh).
  - Chỉ số méo phổ LSD $\le 1.2$ (bảo toàn đặc trưng phổ).
  - Tỷ lệ bảo tồn sóng hài tiếng rít Wheeze $\ge 99.5\%$.

### Scenario 2: Lập tài liệu báo cáo khoa học y tế chuyên sâu
- **Given:** Dữ liệu benchmark hoàn tất.
- **When:** Xuất file `docs/CLINICAL_BENCHMARK_REPORT.md`.
- **Then:** Tài liệu trình bày chuẩn bài báo khoa học y sinh: Tổng quan, Phương pháp luận toán học, Kết quả đối sánh thực nghiệm và Khuyến nghị ứng dụng lâm sàng.

---

## 3. Architecture & Developer Guardrails
- **Benchmark Tool:** `backend/app/engine/clinical_benchmark.py`.
- **Deliverable:** `docs/CLINICAL_BENCHMARK_REPORT.md`.
