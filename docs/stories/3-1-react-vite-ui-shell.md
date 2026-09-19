# Story 3.1: React + Vite Workspace & Medical Dark UI Shell

- **Story ID:** `3.1`
- **Story Key:** `3-1-react-vite-ui-shell`
- **Epic:** `Epic 3: Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Kỹ sư Frontend & Bác sĩ chẩn đoán,  
> **Tôi muốn** một khung ứng dụng React + Vite với phong cách thiết kế Medical Dark UI cao cấp (Gam màu Slate/Navy y khoa, điểm nhấn Cyan/Emerald, hiệu ứng Glassmorphism tinh tế),  
> **Để** làm nền tảng trực quan hóa chuyên nghiệp cho toàn bộ hệ thống xử lý tín hiệu âm thanh hô hấp và gán nhãn bệnh học.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Khởi tạo thành công ứng dụng React + Vite
- **Given:** Môi trường Node.js 18+ đã cài đặt.
- **When:** Khởi tạo project trong thư mục `frontend/`.
- **Then:** Chạy lệnh `npm run build` thành công không phát sinh bất kỳ lỗi bundle hoặc TypeScript/JSX.

### Scenario 2: Cấu trúc Layout Shell y tế hoàn chỉnh
- **Given:** Giao diện được nạp trong trình duyệt tại `http://localhost:5173`.
- **When:** Quan sát bố cục dashboard.
- **Then:** Hiển thị 4 phân khu chính chuẩn khoa học:
  1. **Clinical Header:** Tiêu đề hệ thống, Badge trạng thái kết nối Backend API (`ONLINE / OFFLINE`), đồng hồ phiên làm việc.
  2. **Patient & Audio Inspector Bar:** Thông tin ca bệnh (ID, mã tệp, chỉ số $\Delta\text{SNR}$, thời lượng, tần số lấy mẫu 16kHz).
  3. **Acoustic Diagnostic Area:** Không gian phân chia cho Waveform đôi và Canvas Mel-spectrogram.
  4. **Medical Annotation Sidebar:** Bảng danh sách ghi chú chẩn đoán lâm sàng của bác sĩ kèm 6 Quick-Tags màu sắc rõ ràng.

### Scenario 3: Thiết kế thẩm mỹ đạt chuẩn Clinical Premium
- **Given:** Người dùng mở giao diện trên màn hình Desktop hoặc Tablet.
- **When:** Thao tác tương tác chuột qua các nút điều khiển.
- **Then:** Phông chữ hiện đại, màu sắc dịu mắt giảm mỏi mắt cho bác sĩ trực ca đêm, hiệu ứng hover/transition mượt mà (0.2s cubic-bezier).

---

## 3. Architecture & Developer Guardrails
- **Tech Stack:** React 18, Vite, Lucide Icons, Custom Medical Design Tokens CSS (`frontend/src/index.css`).
- **Target Files:**
  - `frontend/package.json`
  - `frontend/src/App.jsx`
  - `frontend/src/index.css`
  - `frontend/src/components/Header.jsx`
  - `frontend/src/components/MetricsCard.jsx`
