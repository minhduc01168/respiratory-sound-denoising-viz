# Story 5.5: Multi-Metric Clinical & Speech Quality Benchmark Suite

- **Story ID:** `5.5`
- **Story Key:** `5-5-clinical-speech-benchmark-suite`
- **Epic:** `Epic 5: Nghiên Cứu Chuyên Sâu & Tối Ưu Hóa Khử Nhiễu Đa Miền (Dual Profile)`
- **Story Points:** 4
- **Priority:** P1 (High)
- **Status:** done

---

## 1. User Story & Motivation
> **Là một** Test Architect & Chuyên gia Đánh giá Âm học Y sinh,  
> **Tôi muốn** mở rộng bộ công cụ đo lường (`backend/app/engine/metrics.py`) và test suite tự động hóa để đo đạc đồng thời các chỉ số âm học tiếng nói (PESQ, STOI, SDR, LSD) lẫn các chỉ số lâm sàng độc quyền (CPR - Crackle Preservation Rate, WHF - Wheeze Harmonic Fidelity, HSAI - Heart Sound Attenuation Index),  
> **Để** cung cấp số liệu so sánh định lượng trực tiếp, minh bạch giữa các thuật toán và giữa hai profile `respiratory` vs `speech`.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Đo đạc chỉ số lâm sàng độc quyền cho Respiratory Profile
- **Given:** Cặp tín hiệu âm thanh hô hấp trước và sau khử nhiễu với `profile="respiratory"`.
- **When:** Chạy hàm `evaluate_comprehensive_benchmark(ref, processed, sr, profile="respiratory")`.
- **Then:** Trả về dictionary chứa `crackle_preservation_rate_pct` ($\ge 90\%$), `wheeze_harmonic_fidelity_pct` ($\ge 90\%$), `lsd_db` ($\le 1.5$), `snr_delta_db`. [PASS ✅]

### Scenario 2: Đo đạc chỉ số độ hiểu rõ cho Speech Profile
- **Given:** Cặp tín hiệu giọng nói hội chẩn trước và sau khử nhiễu với `profile="speech"`.
- **When:** Chạy hàm `evaluate_comprehensive_benchmark(ref, processed, sr, profile="speech")`.
- **Then:** Trả về dictionary chứa `pesq_score` (thang điểm 1.0 - 4.5), `stoi_intelligibility` (thang điểm 0.0 - 1.0), `sdr_db`, `snr_delta_db`. [PASS ✅]

### Scenario 3: Tích hợp vào Pipeline và API Response
- **Given:** Request xử lý âm thanh gửi tới `/api/audio/process/{audio_id}`.
- **When:** Pipeline thực thi xong.
- **Then:** Metrics trả về được cấu hình động theo Profile được chọn (nếu respiratory có CPR/WHF, nếu speech có PESQ/STOI). [PASS ✅]

---

## 3. Tasks & Subtasks
- [x] **Task 1: Mở rộng `backend/app/engine/metrics.py`**
  - [x] Viết hàm `calculate_crackle_preservation_rate()`.
  - [x] Viết hàm `calculate_wheeze_harmonic_fidelity()`.
  - [x] Viết hàm `calculate_source_to_distortion_ratio()`.
  - [x] Viết hàm ước lượng `estimate_pesq()` và `estimate_stoi()`.
  - [x] Xây dựng hàm điều phối `evaluate_comprehensive_benchmark()`.
- [x] **Task 2: Tích hợp đánh giá đa chỉ số vào Pipeline & API Response**
  - [x] Cập nhật `process_respiratory_audio()` trong `pipeline.py` để bổ sung các chỉ số theo Profile.
  - [x] Xuất khẩu các hàm trong `backend/app/engine/__init__.py`.
- [x] **Task 3: Viết Unit Tests kiểm chuẩn (`backend/tests/test_benchmark.py`)**
  - [x] Bổ sung test cases cho CPR, WHF, SDR, PESQ, STOI.
  - [x] Chạy toàn bộ test suite đảm bảo 100% pass (61/61 tests passed).

---

## 4. Dev Agent Record
- **File List Created/Modified:**
  - `backend/app/engine/metrics.py` (Updated - CPR, WHF, SDR, PESQ, STOI, evaluate_comprehensive_benchmark)
  - `backend/app/engine/pipeline.py` (Updated - auto evaluate comprehensive benchmark based on profile)
  - `backend/app/engine/__init__.py` (Updated - exported new metrics)
  - `backend/tests/test_benchmark.py` (Updated - 3 comprehensive new test functions)
- **Completion Notes:**
  - Hệ thống đo lường chất lượng âm học đã được nâng cấp toàn diện, phân tách rõ ràng giữa tiêu chuẩn y tế (CPR/WHF) và viễn thông giọng nói (PESQ/STOI).
  - Toàn bộ 61/61 bài kiểm thử unit tests vượt qua với kết quả tuyệt đối.
