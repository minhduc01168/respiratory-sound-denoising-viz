# Story 5.2: Dual Audio Profile Schema & Strategy Pattern Engine

- **Story ID:** `5.2`
- **Story Key:** `5-2-dual-profile-strategy-pattern-engine`
- **Epic:** `Epic 5: Nghiên Cứu Chuyên Sâu & Tối Ưu Hóa Khử Nhiễu Đa Miền (Dual Profile)`
- **Story Points:** 4
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story & Motivation
> **Là một** System Architect & Backend Developer,  
> **Tôi muốn** tái cấu trúc `backend/app/engine/` theo mẫu thiết kế Strategy Pattern với lớp cơ sở trừu tượng `BaseDenoisingEngine`, `EngineRegistry`, và cấu hình Pydantic/dataclass `AudioProfileConfig` hỗ trợ hai chế độ: `respiratory` (tiếng phổi) và `speech` (tiếng nói),  
> **Để** hệ thống có thể mở rộng cắm rút nhiều thuật toán khử nhiễu khác nhau (Classical DSP, AI DTLN, Bio-acoustic) và tùy biến linh hoạt theo ngữ cảnh âm thanh mà không phá vỡ API hiện tại (Zero Breaking Changes).

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Đa hình thuật toán qua Strategy Pattern
- **Given:** Request gửi tới API `/api/audio/process/{audio_id}` hoặc hàm gọi trực tiếp `process_respiratory_audio()`.
- **When:** Tham số `algorithm` nhận giá trị `"classical_dsp"` (hoặc các thuật toán được đăng ký trong tương lai).
- **Then:** `EngineRegistry` phân giải và kích hoạt đúng Engine thực thi tương ứng; mỗi engine kế thừa từ `BaseDenoisingEngine` và trả về cấu trúc dữ liệu `DenoiseResult` chuẩn hóa. [PASS ✅]

### Scenario 2: Chuyển đổi tham số theo Profile âm học
- **Given:** Tham số `profile="speech"` được chỉ định.
- **When:** Engine thực thi quá trình khử nhiễu.
- **Then:** Hệ thống tự động cấu hình: Bandpass 80Hz - 7500Hz, VAD threshold phù hợp âm vị tiếng nói, hệ số trừ thừa $\alpha = 3.2$, sàn phổ $\beta = 0.03$. [PASS ✅]
- **And Given:** Tham số `profile="respiratory"` (mặc định) được chỉ định.
- **Then:** Các tham số y tế (Bandpass 50Hz - 2500Hz, $\alpha = 1.8$, bảo vệ transient rale nổ) được kích hoạt. [PASS ✅]

### Scenario 3: Tương thích ngược tuyệt đối (Zero Breaking Changes)
- **Given:** Các client cũ hoặc test suite cũ gọi endpoint mà không truyền `profile` hoặc `algorithm`.
- **When:** API thực hiện xử lý.
- **Then:** Mặc định sử dụng `profile="respiratory"` và `algorithm="classical_dsp"`; 100% các unit test cũ pass không cần chỉnh sửa. [PASS ✅]

---

## 3. Tasks & Subtasks
- [x] **Task 1: Xây dựng Core Interfaces & Profiles (`backend/app/engine/`)**
  - [x] Tạo `backend/app/engine/base.py`: Định nghĩa `DenoiseResult` dataclass và abstract class `BaseDenoisingEngine`.
  - [x] Tạo `backend/app/engine/profiles.py`: Định nghĩa `AudioProfile` enum và `AudioProfileConfig` với các preset `respiratory` và `speech`.
  - [x] Tạo `backend/app/engine/registry.py`: Xây dựng `EngineRegistry` singleton với cơ chế register và get engine.
- [x] **Task 2: Chuyển đổi Classical DSP thành Engine đầu tiên**
  - [x] Tạo `backend/app/engine/classical_engine.py`: Đóng gói logic Spectral Gating + Bandpass Filter vào `ClassicalDspEngine`.
  - [x] Tích hợp tự động đăng ký `"classical_dsp"` vào `EngineRegistry`.
- [x] **Task 3: Cập nhật Unified Pipeline & API Endpoints**
  - [x] Nâng cấp `process_respiratory_audio()` trong `backend/app/engine/pipeline.py` để phân giải engine và profile qua registry.
  - [x] Cập nhật endpoint `/api/audio/process/{audio_id}` trong `backend/app/api/routes_audio.py` nhận query params `profile: str = "respiratory"`, `algorithm: str = "classical_dsp"`.
  - [x] Bổ sung endpoint `GET /api/audio/algorithms` để liệt kê thuật toán và profiles có sẵn.
  - [x] Cập nhật Pydantic schema trong `backend/app/models/schemas.py`.
- [x] **Task 4: Viết Unit Tests kiểm chuẩn Strategy Pattern & Profiles**
  - [x] Viết `backend/tests/test_strategy_profiles.py` kiểm thử đầy đủ các kịch bản `respiratory`, `speech`, fallback và invalid parameters.
  - [x] Chạy toàn bộ test suite đảm bảo 100% pass (48/48 tests passed).

---

## 4. Dev Agent Record
- **File List Created/Modified:**
  - `backend/app/engine/base.py` (New)
  - `backend/app/engine/profiles.py` (New)
  - `backend/app/engine/classical_engine.py` (New)
  - `backend/app/engine/registry.py` (New)
  - `backend/app/engine/pipeline.py` (Updated)
  - `backend/app/engine/audio_io.py` (Updated - hỗ trợ trực tiếp np.ndarray)
  - `backend/app/engine/__init__.py` (Updated)
  - `backend/app/api/routes_audio.py` (Updated)
  - `backend/app/models/schemas.py` (Updated)
  - `backend/tests/test_strategy_profiles.py` (New)
- **Completion Notes:**
  - Triển khai thành công Strategy Pattern đa hình cho Denoising Engine.
  - Hỗ trợ đầy đủ Dual Audio Profile (`respiratory` và `speech`) với bộ thông số vật lý riêng biệt.
  - Bảo đảm Zero Breaking Changes, 48/48 unit tests chạy xanh 100%.
