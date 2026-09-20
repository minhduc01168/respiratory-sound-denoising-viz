# Story 5.6: Multi-Algorithm & Dual Profile Selector UI

- **Story ID:** `5.6`
- **Story Key:** `5-6-multi-algorithm-dual-profile-ui`
- **Epic:** `Epic 5: Nghiên Cứu Chuyên Sâu & Tối Ưu Hóa Khử Nhiễu Đa Miền (Dual Profile)`
- **Story Points:** 3
- **Priority:** P1 (High)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ / Người dùng Dashboard,  
> **Tôi muốn** trên thanh công cụ của giao diện có nút chuyển đổi trực quan giữa **Chế độ Phổi (🫁 Respiratory)** và **Chế độ Tiếng nói (🎙️ Speech)**, kết hợp cùng dropdown chọn thuật toán (`Classical DSP`, `Deep AI DTLN`, `Bio-Acoustic Filter`),  
> **Để** tôi có thể chủ động lựa chọn giải pháp khử nhiễu tối ưu cho từng mục đích sử dụng và trực tiếp so sánh đối chứng A/B trên biểu đồ Mel-Spectrogram cùng thẻ chỉ số động.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Chuyển đổi Profile và Thuật toán mượt mà
- **Given:** Người dùng đang ở màn hình Dashboard.
- **When:** Người dùng chọn Profile `Speech` hoặc đổi Algorithm sang `Deep AI DTLN`.
- **Then:** Giao diện cập nhật trạng thái ngay lập tức, các request xử lý tiếp theo tự động gửi kèm các tham số này, không làm gián đoạn luồng phát âm thanh hoặc đơ giao diện.

### Scenario 2: Hiển thị chỉ số động theo Profile tương ứng
- **Given:** Kết quả trả về từ Backend.
- **When:** Component `MetricsCard.jsx` render thông tin.
- **Then:** Nếu là `speech profile`, giao diện ưu tiên hiển thị PESQ, STOI, SNR; Nếu là `respiratory profile`, giao diện ưu tiên hiển thị $\Delta\text{SNR}$, CPR (Bảo tồn rale nổ) và WHF (Độ trung thực rale rít).

---

## 3. Architecture & Target Files
- `frontend/src/components/Toolbar.jsx`: Nút chuyển đổi Dual Profile và Dropdown Engine Strategy.
- `frontend/src/components/MetricsCard.jsx`: Hiển thị thích ứng CPR/WHF/HSAI cho Phổi và PESQ/STOI/SDR cho Tiếng nói.
- `frontend/src/components/ReportModal.jsx`: Đồng bộ báo cáo in ấn Y khoa theo Profile và Thuật toán.
- `frontend/src/components/AudioUploadModal.jsx` & `AudioRecordModal.jsx`: Truyền profile & algorithm context khi upload/record.
- `frontend/src/App.jsx`: State management và điều phối sự kiện giữa Toolbar, Preset, và Backend API.

---

## 4. Verification & Testing Sign-Off
- [x] **Frontend Vite Build:** `rtk npm run build` -> Đã biên dịch thành công 1905 modules, không có lỗi runtime/bundle nào.
- [x] **Backend Integration Tests:** `rtk python -m pytest backend/tests` -> 61/61 tests passed 100%.
- [x] **BMAD Code Review:** Tuân thủ chuẩn UI Dark Mode hiện đại, responsive layout, seamless profile transition.
