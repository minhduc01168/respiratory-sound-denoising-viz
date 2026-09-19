# Story 1.4: Adaptive Spectral Gating Denoising

- **Story ID:** `1.4`
- **Story Key:** `1-4-adaptive-spectral-gating`
- **Epic:** `Epic 1: Lõi Xử Lý Tín Hiệu DSP & Thuật Toán Khử Nhiễu`
- **Story Points:** 4
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư Xử lý Tín hiệu Số (DSP),  
> **Tôi muốn** một thuật toán lọc nhiễu Spectral Gating thích ứng (Adaptive Spectral Gating) trên miền thời gian - tần số STFT,  
> **Để** triệt tiêu tiếng ồn nền môi trường (quạt, điều hòa, tiếng ồn tĩnh của microphone), cải thiện tỷ số tín hiệu trên nhiễu $\Delta\text{SNR} \ge +8\text{ dB}$ mà không gây ra hiện tượng méo âm "nhạc nước" (musical noise) và không làm mất đi các dải tần bệnh học của tiếng thở.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Giảm nhiễu nền trên tín hiệu bị nhiễm tạp âm (SNR Improvement)
- **Given:** Một bản ghi âm hô hấp tổng hợp pha trộn với tiếng ồn trắng (Gaussian white noise) hoặc tiếng ồn quạt (low-frequency pink noise) ở mức SNR = 5 dB.
- **When:** Chạy qua `reduce_noise_spectral_gating(audio, sr=16000)`.
- **Then:** Độ ồn nền trong các khoảng nghỉ bị triệt tiêu rõ rệt, chỉ số SNR đầu ra cải thiện ít nhất $+8\text{ dB}$ so với ban đầu.

### Scenario 2: Bảo tồn tần số bệnh học (Wheeze & Crackle Preservation)
- **Given:** Tín hiệu mô phỏng tiếng ran rít (sóng hài kéo dài 400Hz - 800Hz) hoặc ran nổ (xung kích ngắn < 20ms).
- **When:** Chạy qua bộ lọc Spectral Gating.
- **Then:** Năng lượng của tiếng rít/nổ không bị dập tắt, biên độ bảo toàn $> 85\%$ mức ban đầu, không tạo ra âm vang giả (phantom echoes).

### Scenario 3: Thời gian tính toán siêu tốc (< 500ms cho file 15s)
- **Given:** Mảng âm thanh thời lượng 15 giây (240,000 mẫu tại 16kHz).
- **When:** Thực thi `reduce_noise_spectral_gating(audio, sr=16000)`.
- **Then:** Toàn bộ quá trình STFT, tính mask và ISTFT hoàn thành trong thời gian $< 500\text{ms}$ trên CPU thông thường.

---

## 3. Architecture & Developer Guardrails
- **Implementation:** Sử dụng `scipy.signal.stft` và `scipy.signal.istft` với cửa sổ `hann`, $N_{FFT}=1024$, hop size $H=256$.
- **Target Files:**
  - `backend/app/engine/spectral_gating.py`
  - `backend/tests/test_spectral.py`
