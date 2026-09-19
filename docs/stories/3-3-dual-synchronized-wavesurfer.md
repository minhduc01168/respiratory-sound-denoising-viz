# Story 3.3: Dual-Synchronized Wavesurfer Audio Player

- **Story ID:** `3.3`
- **Story Key:** `3-3-dual-synchronized-wavesurfer`
- **Epic:** `Epic 3: Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học`
- **Story Points:** 3
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ thính chẩn hô hấp,  
> **Tôi muốn** quan sát đồng thời dạng sóng âm học (Waveform) của cả bản thu gốc (Kênh A) và bản thu đã xử lý làm sạch (Kênh B) chạy song song và hoàn toàn đồng bộ,  
> **Để** đánh giá trực quan sự khác biệt về biên độ sóng âm, nhận diện các xung bất thường và đối chiếu thời điểm tiếng thở bệnh lý xảy ra.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Khởi tạo và kết xuất 2 track sóng âm
- **Given:** Bản ghi âm đã được nạp (URL file gốc và URL file sạch).
- **When:** Component `DualWaveformPlayer` được render.
- **Then:** Wavesurfer v7 tạo 2 instance sóng âm riêng biệt với màu sắc chuyên biệt:
  - Track Gốc: Màu viền xám đậm, tiến trình đỏ Rose (`#F43F5E`).
  - Track Đã lọc: Màu nền tối, tiến trình xanh Emerald y tế (`#10B981`).

### Scenario 2: Đồng bộ phát và tua âm thanh (Synchronized Playback & Seeking)
- **Given:** Người dùng bấm nút Play hoặc click chuột vào bất kỳ vị trí nào trên sóng âm của track A (hoặc B).
- **When:** Playhead di chuyển hoặc nhảy tới mốc thời gian $t$.
- **Then:** Track còn lại tự động nhảy tới đúng vị trí $t$ với sai số thời gian $< 10\text{ms}$, âm thanh phát đồng pha mượt mà.

### Scenario 3: Dọn dẹp tài nguyên âm thanh (Lifecycle Cleanup)
- **Given:** Người dùng chuyển đổi sang một ca bệnh khác hoặc đóng ứng dụng.
- **When:** Component re-render hoặc unmount.
- **Then:** Các instance Wavesurfer cũ được gọi `destroy()` an toàn, không gây memory leak hoặc chồng chéo âm thanh nền.

---

## 3. Architecture & Developer Guardrails
- **Library:** `wavesurfer.js` v7.
- **Target File:** `frontend/src/components/DualWaveformPlayer.jsx`.
- **Props:** `rawUrl`, `cleanedUrl`, `onTimeUpdate`, `currentTime`, `duration`.
