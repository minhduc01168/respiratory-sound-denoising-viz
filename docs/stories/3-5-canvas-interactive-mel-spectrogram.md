# Story 3.5: Canvas Interactive Mel-Spectrogram Viewer (Magma Colormap)

- **Story ID:** `3.5`
- **Story Key:** `3-5-canvas-interactive-mel-spectrogram`
- **Epic:** `Epic 3: Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học`
- **Story Points:** 4
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ chẩn đoán hình ảnh âm học,  
> **Tôi muốn** biểu đồ phổ tần số Mel-spectrogram 64 băng tần (50Hz - 4000Hz) được kết xuất sắc nét trên Canvas với bảng màu nhiệt y khoa `Magma`, hiển thị đầy đủ trục tần số, trục thời gian và vạch con trỏ phát (Playhead) đồng bộ,  
> **Để** phát hiện các đặc trưng bệnh học trực quan (dải sóng hài đặc trưng của ran rít Wheeze hoặc các xung năng lượng phân tán của ran nổ Crackle).

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Kết xuất ma trận phổ Decibel siêu tốc với bảng màu Magma
- **Given:** Dữ liệu ma trận phổ 2D `mel_matrix` (64 băng x $N$ khung thời gian) được tải từ `/api/audio/spectrogram/{audio_id}`.
- **When:** Component `MelSpectrogramViewer` render dữ liệu lên thẻ `<canvas>`.
- **Then:** Chuyển đổi các giá trị chuẩn hóa $[0.0, 1.0]$ sang hệ màu `Magma` (từ đen tím sâu $\to$ đỏ mận $\to$ cam $\to$ vàng sáng) bằng `ImageData.data` với tốc độ kết xuất $< 15\text{ms}$.

### Scenario 2: Đồng bộ vạch Playhead với âm thanh đang phát
- **Given:** Âm thanh đang phát ở thời gian $t$.
- **When:** Prop `currentTime` thay đổi liên tục.
- **Then:** Vạch Playhead màu trắng/cyan với hiệu ứng phát sáng di chuyển mượt mà 60 FPS trên phổ tần số, khớp chính xác vị trí thời gian của sóng âm.

### Scenario 3: Hiển thị trục đo đạc y tế chuẩn xác
- **Given:** Canvas đã render phổ.
- **When:** Quan sát 2 cạnh của biểu đồ.
- **Then:** Cạnh trái hiển thị thang tần số logarit y tế: 4000Hz, 2000Hz, 1000Hz, 500Hz, 100Hz; Cạnh dưới hiển thị các mốc thời gian từng giây (0.0s, 1.0s, 2.0s...).

---

## 3. Architecture & Developer Guardrails
- **Color Engine:** `frontend/src/utils/colormap.js` (Magma 256-color gradient LUT).
- **Target Component:** `frontend/src/components/MelSpectrogramViewer.jsx`.
