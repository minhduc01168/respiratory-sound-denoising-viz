# Story 1.2: Zero-Phase Butterworth Bandpass Filter (50Hz - 4000Hz)

- **Story ID:** `1.2`
- **Story Key:** `1-2-zero-phase-bandpass-filter`
- **Epic:** `Epic 1: Lõi Xử Lý Tín Hiệu DSP & Thuật Toán Khử Nhiễu`
- **Story Points:** 3
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư DSP Y sinh,  
> **Tôi muốn** áp dụng bộ lọc dải thông (Bandpass) IIR Butterworth bậc 4 từ 50Hz đến 4000Hz bằng kỹ thuật lọc hai chiều (`sosfiltfilt`) trên tín hiệu 16kHz,  
> **Để** triệt tiêu hoàn toàn tạp âm siêu trầm (<50Hz) từ rung chấn cơ thể và nhiễu tần số cao (>4000Hz) mà không làm lệch pha (Zero-phase distortion) của các đỉnh sóng hô hấp.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Lọc suy giảm tần số ngoài dải (Attenuation)
- **Given:** Tín hiệu kiểm thử kết hợp 3 sóng sin: 20Hz (siêu trầm), 500Hz (dải hô hấp mục tiêu), và 6000Hz (nhiễu tần số cao).
- **When:** Áp dụng `butter_bandpass_filter(signal, lowcut=50, highcut=4000, sr=16000, order=4)`.
- **Then:** Biên độ của thành phần 20Hz và 6000Hz bị suy giảm tối thiểu -20dB, trong khi thành phần 500Hz được giữ nguyên với độ suy giảm $< 0.5\text{dB}$.

### Scenario 2: Chống lệch pha tuyệt đối (Zero-phase Distortion)
- **Given:** Một xung tín hiệu hoặc sóng sin 500Hz chuẩn.
- **When:** Chạy qua `butter_bandpass_filter`.
- **Then:** Độ lệch trễ thời gian (time delay) giữa đỉnh tín hiệu gốc và tín hiệu sau lọc bằng 0 (Cross-correlation lag = 0).

### Scenario 3: Ổn định số học và xử lý mảng rỗng/ngắn
- **Given:** Tín hiệu ngắn (dưới $3 \times$ filter length) hoặc tín hiệu chứa giá trị bất thường.
- **When:** Chạy qua bộ lọc.
- **Then:** Không bị văng Exception `ValueError: The length of the input vector x must be greater than padlen`, tự động điều chỉnh padding hoặc fallback an toàn.

---

## 3. Architecture & Developer Guardrails
- **Implementation:** Dùng Second-Order Sections (`sos`) từ `scipy.signal.butter(..., output='sos')` và `scipy.signal.sosfiltfilt`. Bộ biểu diễn `sos` có độ ổn định số học cao hơn nhiều so với hệ số `b, a` truyền thống.
- **Target Files:**
  - `backend/app/engine/filters.py`
  - `backend/tests/test_filters.py`
