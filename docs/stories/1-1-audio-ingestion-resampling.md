# Story 1.1: Audio Ingestion, Mono Conversion & 16kHz Resampling

- **Story ID:** `1.1`
- **Story Key:** `1-1-audio-ingestion-resampling`
- **Epic:** `Epic 1: Lõi Xử Lý Tín Hiệu DSP & Thuật Toán Khử Nhiễu`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư Xử lý Tín hiệu Số (DSP),  
> **Tôi muốn** chuẩn hóa mọi tệp âm thanh đầu vào (.wav, .mp3, raw bytes, stereo/mono, mọi sample rate) về mảng NumPy Float32 1D chuẩn hóa, đơn kênh (Mono), tần số lấy mẫu cố định 16,000 Hz và biên độ trong khoảng [-1.0, 1.0],  
> **Để** cung cấp dữ liệu đầu vào đồng nhất, đạt chuẩn y khoa cho toàn bộ pipeline lọc dải thông và khử nhiễu tiếp theo.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Đọc tệp WAV Stereo với tần số lấy mẫu 44.1kHz / 48kHz
- **Given:** Một file âm thanh hoặc raw bytes có định dạng WAV 2 kênh (stereo) và sample rate 44,100 Hz hoặc 48,000 Hz.
- **When:** Gọi hàm `load_and_resample_audio(source, target_sr=16000)`.
- **Then:** Trả về một tuple `(audio_data, 16000)` trong đó `audio_data` là mảng NumPy 1D kiểu `float32`, độ dài tương ứng đúng thời lượng âm thanh gốc, và sample rate trả về bằng 16,000 Hz.

### Scenario 2: Chuẩn hóa biên độ năng lượng (RMS Normalization)
- **Given:** Tín hiệu âm thanh có mức âm lượng rất nhỏ hoặc bị clip quá ngưỡng.
- **When:** Gọi hàm `normalize_audio(audio_data, target_peak=0.95)`.
- **Then:** Giá trị cực đại biên độ $|\max(x)|$ được đưa về đúng `target_peak` (mặc định 0.95), không bị clipping $> 1.0$, và không bị lỗi chia cho 0 nếu tín hiệu hoàn toàn tĩnh lặng.

### Scenario 3: Lưu trữ âm thanh sạch ra tệp chuẩn WAV PCM 16-bit
- **Given:** Mảng tín hiệu Float32 đã xử lý tại 16,000 Hz.
- **When:** Gọi hàm `save_wav(output_path, audio_data, sr=16000)`.
- **Then:** Tệp được ghi ra đĩa với định dạng WAV PCM 16-bit Mono, kiểm tra lại bằng `soundfile.info` cho ra đúng `channels=1`, `samplerate=16000`, `subtype='PCM_16'`.

---

## 3. Architecture & Developer Guardrails
- **Libraries:** Sử dụng `soundfile` cho I/O, `scipy.signal.resample_poly` cho resampling chất lượng cao (tránh aliasing), `numpy` cho các phép toán vector.
- **Performance:** Resampling 15s audio phải hoàn thành trong `< 50ms`.
- **Target Files:**
  - `backend/app/engine/audio_io.py`
  - `backend/tests/test_audio_io.py`
