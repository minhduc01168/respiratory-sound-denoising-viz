# respiratory-sound-denoising-viz

> **Ứng dụng công nghệ xử lý tín hiệu và trí tuệ nhân tạo trong khử nhiễu và trực quan hóa âm thanh hô hấp**

## 1. Giới thiệu (Overview)
Nền tảng web hỗ trợ chuẩn hóa chất lượng nguồn dữ liệu âm thanh y tế. Dự án tập trung giải quyết bài toán tiền xử lý, tự động làm sạch các bản ghi âm tiếng thở và tiếng ho bằng cách loại bỏ tạp âm môi trường, đồng thời trích xuất các đặc trưng âm học chuyên sâu để phục vụ quá trình lưu trữ và phân tích.

Hệ thống kết hợp các thuật toán xử lý tín hiệu số (DSP) và mô hình học sâu chuyên biệt cho tác vụ lọc nhiễu (Denoising) để xử lý dữ liệu đầu vào. Đầu ra của hệ thống bao gồm:
1. **Tệp âm thanh đã được khử nhiễu** đạt tiêu chuẩn lưu trữ y khoa.
2. **Hệ thống biểu đồ trực quan chuyên dụng** (Waveform đối sánh và Mel-spectrogram tương tác với colormap y tế Magma).
3. **Bảng điều khiển Bác sĩ (Doctor Dashboard)** với công cụ chuyển đổi A/B tức thời và ghi chú lâm sàng (Medical Take-note).

---

## 2. Kiến trúc & Công nghệ (Tech Stack)
- **Frontend:** React + Vite, Web Audio API (Raw recording không lọc phần cứng), Wavesurfer.js v7, Canvas API.
- **Backend:** Python (FastAPI + Uvicorn).
- **Lõi DSP Engine:** NumPy, SciPy Signal (Butterworth Zero-phase Bandpass 50-4000Hz, Acoustic VAD, Adaptive Spectral Gating), SoundFile.
- **Data Layer:** SQLite (`metadata.db`) quản lý bản ghi và ghi chú y khoa.

---

## 3. Tài liệu Dự án (Documentation)
- 📋 [Kế hoạch Triển khai Dự án (Project Execution Plan)](docs/PROJECT_EXECUTION_PLAN.md)
- 🎯 [Danh sách Epics & User Stories](docs/EPICS_AND_STORIES.md)
- 📊 [Bảng Trạng thái Sprint (sprint-status.yaml)](sprint-status.yaml)

---

## 4. Quản lý Dự án (Agile Roadmap)
Dự án được phân chia thành 4 Sprints:
- **Sprint 1 (Epic 1 - 18 pts):** Lõi Xử Lý Tín Hiệu DSP & Thuật Toán Khử Nhiễu *(In Progress)*
- **Sprint 2 (Epic 2 - 13 pts):** Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế *(Backlog)*
- **Sprint 3 (Epic 3 - 19 pts):** Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học *(Backlog)*
- **Sprint 4 (Epic 4 - 8 pts):** Tích Hợp E2E, Thẩm Định Y Tế & Đóng Gói *(Backlog)*
