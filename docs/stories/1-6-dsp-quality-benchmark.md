# Story 1.6: DSP Quality Benchmark Harness (SNR & Distortion)

- **Story ID:** `1.6`
- **Story Key:** `1-6-dsp-quality-benchmark`
- **Epic:** `Epic 1: Lõi Xử Lý Tín Hiệu DSP & Thuật Toán Khử Nhiễu`
- **Story Points:** 3
- **Priority:** P1 (High)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Master Test Architect & Kỹ sư QA Y tế,  
> **Tôi muốn** một module tính toán chỉ số chất lượng âm học (SNR, Log-Spectral Distance - LSD) và bộ kịch bản kiểm chuẩn Benchmark tự động chạy toàn bộ pipeline tiền xử lý trên các ca bệnh mô phỏng,  
> **Để** đo lường khách quan mức độ cải thiện tạp âm ($\Delta\text{SNR} \ge +8\text{ dB}$), kiểm soát biến dạng âm học ($LSD < 1.5\text{ dB}$) và nghiệm thu toàn bộ Epic 1 với thời gian chạy $< 800\text{ms}$.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Đo lường chỉ số SNR và ΔSNR chính xác
- **Given:** Tín hiệu sạch $S$, tín hiệu nhiễu $N$, và tín hiệu sau khi khử nhiễu $\hat{S}$.
- **When:** Gọi `calculate_snr(clean, noisy)` và `calculate_snr_improvement(clean, noisy, denoised)`.
- **Then:** Trả về các giá trị Decibel thực tế; với tín hiệu thử nghiệm chuẩn, $\Delta\text{SNR}$ đạt mức cải thiện $\ge +8.0\text{ dB}$.

### Scenario 2: Đo lường mức độ biến dạng phổ tần (Log-Spectral Distance - LSD)
- **Given:** Tín hiệu tiếng rít phổi (Wheeze) trước và sau khi đi qua toàn bộ pipeline.
- **When:** Gọi `calculate_log_spectral_distance(original, processed, sr=16000, fmin=100, fmax=2000)`.
- **Then:** Giá trị $LSD < 1.5\text{ dB}$, chứng minh pipeline không bóp méo hay triệt tiêu các đặc trưng âm học của bệnh lý đường thở.

### Scenario 3: Pipeline tích hợp toàn diện (Full Denoising Pipeline)
- **Given:** Một file âm thanh thô 15 giây.
- **When:** Gọi `run_full_dsp_pipeline(audio_bytes, sr=16000)`.
- **Then:** Hoàn tất toàn bộ chuỗi: Resample $\to$ Normalize $\to$ Bandpass $\to$ VAD $\to$ Spectral Gating $\to$ Mel Spectrogram trong thời gian $< 800\text{ms}$, trả về đủ dữ liệu audio sạch và ma trận phổ.

---

## 3. Architecture & Developer Guardrails
- **Pipeline Orchestrator:** `backend/app/engine/pipeline.py` tích hợp toàn bộ các module `audio_io`, `filters`, `vad`, `spectral_gating`, `spectrogram`, `metrics`.
- **Target Files:**
  - `backend/app/engine/metrics.py`
  - `backend/app/engine/pipeline.py`
  - `backend/tests/test_benchmark.py`
