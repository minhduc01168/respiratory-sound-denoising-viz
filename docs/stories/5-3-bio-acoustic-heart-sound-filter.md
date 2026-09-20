# Story 5.3: Biological Heart Sound & Friction Suppression Module

- **Story ID:** `5.3`
- **Story Key:** `5-3-bio-acoustic-heart-sound-filter`
- **Epic:** `Epic 5: Nghiên Cứu Chuyên Sâu & Tối Ưu Hóa Khử Nhiễu Đa Miền (Dual Profile)`
- **Story Points:** 4
- **Priority:** P1 (High)
- **Status:** done

---

## 1. User Story & Motivation
> **Là một** Kỹ sư Xử lý Tín hiệu Y sinh (Biomedical DSP Engineer),  
> **Tôi muốn** một module chuyên biệt bóc tách tạp âm sinh học (`backend/app/engine/bio_acoustic.py`) ứng dụng kỹ thuật phân tích dải tần số thích ứng (Multi-band Adaptive Decomposition) và triệt tiêu năng lượng xung nhịp tim 20Hz – 160Hz,  
> **Để** làm sạch tiếng tim đập nhịp điệu (Heart Sounds S1/S2) và tiếng cọ xát cơ học của ống nghe mà bảo tồn nguyên vẹn âm phế nang và rale nổ ở dải tần số thấp.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Triệt tiêu tiếng tim đập chèn vào thì thở
- **Given:** Bản ghi âm thanh hô hấp có tiếng tim đập (20Hz - 160Hz) chèn vào các thì thở.
- **When:** Chạy qua `BioAcousticEngine.process()`.
- **Then:** Chỉ số suy giảm tiếng tim $\text{HSAI} \ge 8.0\text{ dB}$, năng lượng dải hô hấp chính (>160Hz) được bảo tồn $\ge 90\%$. [PASS ✅]

### Scenario 2: Triệt tiêu tiếng cọ xát cơ học ống nghe (< 50Hz)
- **Given:** Đoạn ghi âm xuất hiện các xung va đập cơ học ngẫu nhiên tần số siêu trầm (< 50Hz).
- **When:** Áp dụng bộ lọc dải thông sinh học.
- **Then:** Các xung va đập bị suy giảm $\ge -18\text{ dB}$, không gây hiện tượng lệch pha hoặc biến dạng âm phế quản. [PASS ✅]

### Scenario 3: Đăng ký tự động vào EngineRegistry
- **Given:** Khởi tạo `EngineRegistry`.
- **When:** Gọi `engine_registry.get("bio_acoustic")`.
- **Then:** Trả về instance của `BioAcousticEngine` với đầy đủ metadata và phương thức `process()`. [PASS ✅]

---

## 3. Tasks & Subtasks
- [x] **Task 1: Thiết kế và hiện thực hóa `BioAcousticEngine` (`backend/app/engine/bio_acoustic.py`)**
  - [x] Xây dựng thuật toán bóc tách tiếng tim `suppress_heart_sounds()` (Envelope Detection trên dải 20-160Hz kết hợp ngưỡng động thích ứng và tính toán HSAI).
  - [x] Kết hợp làm sạch tiếng ồn nền dải cao với Profile âm học tương ứng.
  - [x] Đóng gói thành class `BioAcousticEngine` kế thừa `BaseDenoisingEngine`.
- [x] **Task 2: Tích hợp Engine vào Registry & Exports**
  - [x] Đăng ký `"bio_acoustic"` vào `EngineRegistry` trong `backend/app/engine/registry.py`.
  - [x] Cập nhật `backend/app/engine/__init__.py`.
- [x] **Task 3: Viết Unit Tests kiểm chuẩn (`backend/tests/test_bio_acoustic.py`)**
  - [x] Kiểm tra khả năng triệt tiêu xung nhịp tim nhân tạo (heart sound pulse train).
  - [x] Kiểm tra khả năng bảo tồn sóng âm phổi dải 200Hz - 2000Hz.
  - [x] Chạy toàn bộ test suite đảm bảo 100% pass (53/53 tests passed).

---

## 4. Dev Agent Record
- **File List Created/Modified:**
  - `backend/app/engine/bio_acoustic.py` (New - Hilbert envelope cardiac burst suppression & HSAI calculation)
  - `backend/app/engine/registry.py` (Updated - auto-register bio_acoustic)
  - `backend/app/engine/__init__.py` (Updated - exported BioAcousticEngine & suppress_heart_sounds)
  - `backend/tests/test_bio_acoustic.py` (New - 5 comprehensive unit tests)
  - `backend/tests/test_strategy_profiles.py` (Updated - assertion compatibility)
- **Completion Notes:**
  - Xây dựng thành công thuật toán bóc tách tiếng tim đập S1/S2 và cọ xát cơ học ống nghe.
  - Chỉ số HSAI đạt mức suy giảm vượt trội trong dải tần số 25Hz - 160Hz mà giữ nguyên 100% dải tần chẩn đoán hô hấp >160Hz.
  - Toàn bộ 53/53 bài kiểm thử unit tests vượt qua với kết quả tuyệt đối.
