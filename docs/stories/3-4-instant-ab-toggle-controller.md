# Story 3.4: Instant A/B Toggle Controller (0ms Delay)

- **Story ID:** `3.4`
- **Story Key:** `3-4-instant-ab-toggle-controller`
- **Epic:** `Epic 3: Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ thính chẩn chuyên khoa hô hấp,  
> **Tôi muốn** chuyển đổi qua lại tức thì (0ms độ trễ, không khựng giật hay ngắt nhịp) giữa việc nghe bản gốc và bản đã khử nhiễu bằng phím tắt `Tab` hoặc nút bấm trên màn hình,  
> **Để** não bộ bác sĩ thẩm định ngay lập tức độ trong trẻo và xác thực việc các tiếng thở bệnh lý (ran rít / ran nổ) không bị thuật toán khử nhiễu xóa nhầm.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Chuyển kênh âm thanh tức thì (0ms Seamless Toggle)
- **Given:** Âm thanh đang phát ở mốc thời gian $t$.
- **When:** Bác sĩ nhấn phím `Tab` hoặc click nút chuyển kênh "Kênh A: Gốc" / "Kênh B: Đã Lọc".
- **Then:** Âm lượng track hiện tại chuyển về 0 và track đối ứng chuyển lên 1.0 ngay lập tức mà không làm dừng hoặc thay đổi vị trí Playhead (độ trễ bằng 0).

### Scenario 2: Trực quan hóa kênh đang hoạt động
- **Given:** Kênh B (Đã lọc) đang được chọn.
- **When:** Quan sát giao diện.
- **Then:** Khung kênh B viền xanh Emerald kèm badge `[ĐANG PHÁT RA LOA]`, thanh trạng thái thông báo rõ ràng mức cải thiện SNR.

### Scenario 3: Điều khiển bàn phím trợ năng (Accessibility Hotkeys)
- **Given:** Cửa sổ làm việc đang mở.
- **When:** Bấm `Space` (Phát/Dừng), `Tab` (Hoán đổi A/B), mũi tên trái/phải (Tua lùi/tiến 1s).
- **Then:** Hệ thống phản hồi chính xác tương ứng mà không cần phải dùng chuột.

---

## 3. Architecture & Developer Guardrails
- **Implementation:** Tích hợp trong `DualWaveformPlayer.jsx` qua cơ chế Web Audio volume switching và global keyboard listener.
