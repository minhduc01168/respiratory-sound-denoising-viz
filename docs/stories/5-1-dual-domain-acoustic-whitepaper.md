# Story 5.1: Dual-Domain Acoustic Research Whitepaper (Lung Sounds & Speech)

- **Story ID:** `5.1`
- **Story Key:** `5-1-dual-domain-acoustic-whitepaper`
- **Epic:** `Epic 5: Nghiên Cứu Chuyên Sâu & Tối Ưu Hóa Khử Nhiễu Đa Miền (Dual Profile)`
- **Story Points:** 3
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Technical Writer & Nhà nghiên cứu AI/DSP,  
> **Tôi muốn** một tài liệu nghiên cứu khoa học chuyên sâu và toàn diện (`docs/ADVANCED_DENOISING_RESEARCH.md`) phân tích bản chất âm học hô hấp và tiếng nói con người, đánh giá giới hạn của DSP cổ điển, khảo sát các kiến trúc Deep Learning hiện đại (DTLN, DCCRN, Wave-U-Net, WPT, EMD), và thiết kế kiến trúc Dual Audio Profile,  
> **Để** làm kim chỉ nam lý thuyết và đặc tả kỹ thuật cho việc triển khai toàn bộ các thuật toán trong Epic 5.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Cơ sở vật lý âm học & Nghịch lý triệt tiêu bệnh học
- **Given:** Nhu cầu hiểu rõ sự khác biệt giữa âm thanh phổi và tiếng nói.
- **When:** Đọc Chương 1 và Chương 2 của tài liệu.
- **Then:** Phân tích chi tiết dải tần số, cấu trúc thời gian của Crackles (xung 5-20ms), Wheezes (họa âm >100ms) và Formants tiếng nói; giải thích toán học hiện tượng Musical Noise và nguyên nhân thuật toán lọc trừ phổ cổ điển làm mất tiếng rale nổ.

### Scenario 2: Khảo sát đối sánh Deep Learning & Tiêu chuẩn y tế
- **Given:** Các mô hình SOTA trong xử lý âm thanh.
- **When:** Đọc Chương 4 và Chương 5 của tài liệu.
- **Then:** Có ma trận so sánh đầy đủ về Parameters, FLOPs, Latency CPU, $\Delta\text{SNR}$, CPR (Crackle Preservation Rate), WHF (Wheeze Harmonic Fidelity); định nghĩa chuẩn xác mô hình DTLN ONNX là giải pháp số 1 cho thời gian thực.

---

## 3. Architecture & Deliverables
- **Tài liệu nguồn:** `docs/ADVANCED_DENOISING_RESEARCH.md`.
- **Trạng thái nghiệm thu:** Hoàn thành xuất sắc, đầy đủ sơ đồ Mermaid, công thức toán LaTeX và ma trận so sánh.
