# Story 1.5: Decibel Mel-Spectrogram Matrix Generator

- **Story ID:** `1.5`
- **Story Key:** `1-5-decibel-mel-spectrogram`
- **Epic:** `Epic 1: Lõi Xử Lý Tín Hiệu DSP & Thuật Toán Khử Nhiễu`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư Phần mềm Fullstack Y sinh,  
> **Tôi muốn** một module tạo ma trận phổ tần Mel-spectrogram theo thang đo Decibel (dB) từ mảng âm thanh 16kHz bằng NumPy/SciPy thuần mà không cần thư viện nặng như `librosa`,  
> **Để** cung cấp dữ liệu số thực 2D nhẹ, tối ưu hóa cho trình duyệt web (Canvas/WebGL) vẽ biểu đồ phổ tương tác mượt mà trong thời gian thực.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Sinh ma trận Mel Filterbank chuẩn xác (50Hz - 4000Hz)
- **Given:** Cấu hình tần số lấy mẫu $sr=16000$, dải tần quan tâm $f_{min}=50\text{Hz}$ đến $f_{max}=4000\text{Hz}$, số lượng dải Mel $n_{mels}=64$.
- **When:** Gọi `create_mel_filterbank(sr=16000, n_fft=1024, n_mels=64, f_min=50, f_max=4000)`.
- **Then:** Trả về ma trận trọng số tam giác có kích thước `(64, 513)`, tổng diện tích mỗi filter được chuẩn hóa diện tích (slaney/area normalization).

### Scenario 2: Chuyển đổi công suất sang thang Decibel chuẩn hóa
- **Given:** Mảng âm thanh hô hấp 15 giây.
- **When:** Gọi `compute_mel_spectrogram(audio, sr=16000, n_mels=64, hop_len=512)`.
- **Then:** Ma trận kết quả có giá trị trong thang đo Decibel chuẩn y tế (từ $-80.0\text{ dB}$ đến $0.0\text{ dB}$ hoặc chuẩn hóa $[0.0, 1.0]$), không chứa giá trị `NaN` hay `Inf`.

### Scenario 3: Đóng gói Payload nhẹ cho Web (< 250KB)
- **Given:** Ma trận phổ của file 15s.
- **When:** Chuyển đổi thành dictionary qua `get_spectrogram_payload(audio, sr=16000, target_time_bins=200)`.
- **Then:** Payload chứa `{ time_axis: [...], freq_axis: [...], mel_matrix: [[...]] }`, dung lượng khi serialize JSON $< 250\text{KB}$, cho phép tải qua mạng trong $< 20\text{ms}$.

---

## 3. Architecture & Developer Guardrails
- **Performance:** Không dùng `librosa.feature.melspectrogram` trong API! Dùng ma trận lọc nhân ma trận NumPy vector hóa: `mel_spec = np.dot(filterbank, power_spec)`. Tốc độ thực thi $< 30\text{ms}$.
- **Target Files:**
  - `backend/app/engine/spectrogram.py`
  - `backend/tests/test_spectrogram.py`
