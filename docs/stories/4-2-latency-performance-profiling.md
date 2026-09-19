# Story 4.2: Latency & Performance Optimization Profiling

- **Story ID:** `4.2`
- **Story Key:** `4-2-latency-performance-profiling`
- **Epic:** `Epic 4: Tích Hợp E2E, Thẩm Định Y Tế & Đóng Gói`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Kỹ sư Kiến trúc Hệ thống (System Architect),  
> **Tôi muốn** đo lường, phân tích và lập báo cáo chi tiết về hiệu năng thực thi (Latency Budget, RAM footprint, Canvas Rendering Frame Rate, API Response Time),  
> **Để** thẩm định rằng hệ thống đáp ứng trọn vẹn các yêu cầu phi chức năng (NFR) cho môi trường lâm sàng thực tế.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Đáp ứng ngân sách độ trễ xử lý âm thanh (Latency Budget)
- **Given:** Một bản ghi âm hô hấp chuẩn độ dài 15.0 giây (240.000 mẫu tại 16kHz).
- **When:** Chạy qua toàn bộ pipeline DSP liên hoàn.
- **Then:** Tổng thời gian thực thi (Latency) $\le 1.200\text{ms}$ (Thực tế đạt $< 400\text{ms}$).

### Scenario 2: Kiểm soát dung lượng bộ nhớ (Memory Footprint)
- **Given:** Server tải đồng thời 5 phiên xử lý tín hiệu âm thanh.
- **When:** Giám sát mức tiêu thụ RAM qua `tracemalloc` / `psutil`.
- **Then:** Dung lượng RAM đỉnh $\le 300\text{MB}$, không có hiện tượng rò rỉ bộ nhớ (memory leaks).

### Scenario 3: Báo cáo hiệu năng hoàn chỉnh
- **Given:** Quá trình profiling hoàn tất.
- **When:** Biên soạn báo cáo `docs/PERFORMANCE_REPORT.md`.
- **Then:** Báo cáo phản ánh bảng số liệu chi tiết từng công đoạn DSP, biểu đồ Gantt/Waterfall độ trễ và các giải pháp kỹ thuật đã áp dụng.

---

## 3. Architecture & Developer Guardrails
- **Profiling Script:** `backend/app/engine/profiler.py`.
- **Deliverable:** `docs/PERFORMANCE_REPORT.md`.
