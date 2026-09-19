# Story 1.3: Acoustic Energy & Entropy VAD Engine

- **Story ID:** `1.3`
- **Story Key:** `1-3-acoustic-vad-engine`
- **Epic:** `Epic 1: Lõi Xử Lý Tín Hiệu DSP & Thuật Toán Khử Nhiễu`
- **Story Points:** 4
- **Priority:** P0 (Critical)
- **Status:** ready-for-dev

---

## 1. User Story
> **Là một** Kỹ sư Xử lý Tín hiệu Âm học Y tế,  
> **Tôi muốn** một bộ phát hiện hoạt động âm học (Acoustic VAD) phát hiện chính xác các chu kỳ hô hấp dựa trên Năng lượng cục bộ (Short-Time Energy) và Entropy phổ, có cơ chế Hangover Padding an toàn (150ms trước và 200ms sau),  
> **Để** tự động loại bỏ >90% khoảng lặng không chứa tiếng thở/tiếng ho mà không bao giờ cắt phạm vào các chu kỳ thở yếu (False Rejection Rate < 1%).

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Nhận diện khoảng lặng và cắt bỏ chính xác
- **Given:** Một đoạn âm thanh 10 giây gồm 3 giây đầu im lặng, 4 giây giữa có tiếng thở hô hấp, 3 giây cuối im lặng.
- **When:** Chạy qua `detect_and_trim_silence(signal, sr=16000)`.
- **Then:** Các đoạn im lặng đầu và cuối được cắt bỏ; thời lượng bản ghi sau cắt xấp xỉ 4 giây (+/- padding an toàn).

### Scenario 2: Bảo tồn vùng đệm an toàn (Pre-pad & Post-pad)
- **Given:** Một xung âm thanh hô hấp xuất hiện tại $t = 2.0\text{s}$ và kết thúc tại $t = 3.0\text{s}$.
- **When:** Thuật toán VAD sinh ra các đoạn `segments`.
- **Then:** Đoạn hô hấp được mở rộng bắt đầu từ tối đa $1.85\text{s}$ (pre-pad 150ms) đến tối thiểu $3.20\text{s}$ (post-pad 200ms).

### Scenario 3: Không cắt vụn chu kỳ hô hấp (Hangover Bridge)
- **Given:** Hai tiếng thở liên tiếp cách nhau một khoảng nghỉ ngắn 200ms.
- **When:** Chạy qua VAD với `min_silence_duration_ms=300`.
- **Then:** Hai đợt thở được nối liền mạch (bridge) thành một chu kỳ hô hấp thống nhất thay vì bị cắt xé thành các mảnh nhỏ rời rạc.

---

## 3. Architecture & Developer Guardrails
- **Inputs & Outputs:**
  - `detect_breath_activity(signal, sr=16000, frame_len=512, hop_len=256, ...)`: Trả về boolean mask `np.ndarray` cùng kích thước hoặc theo frame.
  - `trim_silence(signal, sr=16000, ...)`: Trả về `(trimmed_signal, segments)`.
- **Target Files:**
  - `backend/app/engine/vad.py`
  - `backend/tests/test_vad.py`
