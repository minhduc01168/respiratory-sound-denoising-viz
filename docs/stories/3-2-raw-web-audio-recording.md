# Story 3.2: Raw Web Audio Recording Studio & Audio Ingestion

- **Story ID:** `3.2`
- **Story Key:** `3-2-raw-web-audio-recording`
- **Epic:** `Epic 3: Bảng Điều Khiển Bác Sĩ & Trực Quan Hóa Âm Học`
- **Story Points:** 3
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ lâm sàng / Người dùng,  
> **Tôi muốn** ghi âm trực tiếp tiếng thở/tiếng ho qua microphone/ống nghe điện tử với Web Audio API (tắt hoàn toàn các bộ lọc khử ồn phần cứng mặc định của trình duyệt) hoặc tải tệp âm thanh (.wav, .mp3) từ máy tính,  
> **Để** hệ thống bảo toàn 100% các tần số bệnh học thô tự nhiên trước khi đưa vào pipeline khử nhiễu số DSP.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Ghi âm chuẩn y khoa (Raw Web Audio - No Hardware Cancellation)
- **Given:** Người dùng mở Modal Thu âm và cấp quyền truy cập Microphone.
- **When:** Hệ thống khởi tạo `navigator.mediaDevices.getUserMedia`.
- **Then:** Cấu hình bắt buộc tắt các bộ lọc: `{ echoCancellation: false, noiseSuppression: false, autoGainControl: false }`.
- **And:** Thanh VU meter trên Canvas hiển thị dao động biên độ âm thanh thời gian thực, đồng hồ hiển thị thời gian trôi qua.

### Scenario 2: Hoàn tất thu âm và tự động xử lý DSP
- **Given:** Bản ghi âm đã thu được thời lượng $\ge 1.0$ giây.
- **When:** Người dùng bấm nút "Dừng & Phân tích khử nhiễu".
- **Then:** Âm thanh được xuất ra blob định dạng chuẩn, gửi tới `POST /api/audio/upload` rồi gọi `POST /api/audio/process/{audio_id}`, tự động cập nhật Dashboard sang ca bệnh mới mà không cần reload trang.

### Scenario 3: Tải tệp âm thanh từ đĩa cứng (File Upload Modal)
- **Given:** Người dùng mở Modal Tải tệp và kéo thả file `.wav` hoặc `.mp3` dung lượng $\le 10\text{MB}$.
- **When:** Bấm "Tải lên & Khử nhiễu".
- **Then:** Hệ thống upload thành công, nhận `audio_id` và nạp vào không gian làm việc.

---

## 3. Architecture & Developer Guardrails
- **Web Audio API:** `AudioContext`, `MediaStreamAudioSourceNode`, `AnalyserNode`.
- **Resource Management:** Luôn gọi `stream.getTracks().forEach(track => track.stop())` khi kết thúc để giải phóng micro phần cứng.
- **Components:**
  - `frontend/src/components/AudioRecordModal.jsx`
  - `frontend/src/components/AudioUploadModal.jsx`
