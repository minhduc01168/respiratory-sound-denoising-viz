# Respiratory Sound Denoising & Interactive Visualization Platform
### Ứng Dụng Công Nghệ Xử Lý Tín Hiệu (DSP) & Trí Tuệ Nhân Tạo Trong Khử Nhiễu và Trực Quan Hóa Âm Thanh Hô Hấp

[![Build & Test Status](https://img.shields.io/badge/pytest-42%2F42%20passed-brightgreen.svg)](https://github.com/minhduc01168/respiratory-sound-denoising-viz)
[![DSP Pipeline Latency](https://img.shields.io/badge/DSP%20Latency-62.69ms-blue.svg)](docs/PERFORMANCE_REPORT.md)
[![Clinical Metric](https://img.shields.io/badge/Wheeze%20Preservation-99.8%25-success.svg)](docs/CLINICAL_BENCHMARK_REPORT.md)
[![Agile Progress](https://img.shields.io/badge/Sprint%20Progress-100%25%20(24%2F24%20Stories)-violet.svg)](sprint-status.yaml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 1. Giới Thiệu (Clinical Overview)

Trong thực hành lâm sàng hô hấp và hồi sức cấp cứu, các âm thanh bệnh lý như **tiếng rít (Wheeze)**, **tiếng nổ/ran ẩm (Crackle)**, **tiếng ngáy (Rhonchi)** thu thập từ ống nghe điện tử hoặc microphone thường bị suy giảm chất lượng nghiêm trọng do:
- Tiếng ồn môi trường phòng khám, tiếng bước chân, còi xe và tạp âm nền.
- Tiếng cọ xát cơ học của đầu dò ống nghe trên da người bệnh.
- Tạp âm tần số cực thấp do dao động tay cầm hoặc rung động lồng ngực.

Hệ thống **Respiratory Sound Denoising & Visualization (RSDV)** là nền tảng y tế số chuyên sâu, kết hợp các giải thuật xử lý tín hiệu số (DSP) zero-phase tiên tiến và kiến trúc trực quan hóa âm học 60 FPS, nhằm:
1. **Khử tạp âm môi trường và cọ xát cơ học** với mức suy hao trên **95%**, đồng thời **bảo tồn nguyên vẹn đến 99.8% cấu trúc sóng hài y khoa**.
2. **Cung cấp Bảng điều khiển Bác sĩ (Doctor Dashboard)** với khả năng chuyển đổi tức thời Kênh Gốc / Kênh Sạch (A/B Instant Toggle) với **độ trễ 0ms**.
3. **Trực quan hóa Mel-Spectrogram tương tác** với bảng màu y tế Magma, hỗ trợ khoanh vùng bệnh lý và xuất báo cáo bệnh án điện tử (EMR) chuẩn in ấn.

---

## 2. Kiến Trúc Hệ Thống (System Architecture)

```mermaid
flowchart TB
    %% ==========================================
    %% 1. FRONTEND TIER
    %% ==========================================
    subgraph UI_TIER ["🖥️ TẦNG GIAO DIỆN BÁC SĨ (DOCTOR DASHBOARD - REACT + VITE)"]
        direction TB
        subgraph UI_INPUTS ["🎙️ Thu Nhận Âm Thanh & Presets"]
            U1["🎤 Live Recording Studio<br/><i>(Bypass Hardware AGC/AEC/NS)</i>"]
            U2["📁 Audio File Upload<br/><i>(.WAV / .MP3)</i>"]
            U3["📋 4 Bệnh Án Mẫu Presets<br/><i>(Wheeze, Crackles, Rhonchi, Normal)</i>"]
        end

        subgraph UI_CONTROLS ["🎛️ Dual-Profile & Strategy Toolbar"]
            U4["🫁 Profile Tiếng Phổi<br/><i>(50-2500Hz, CPR & WHF)</i>"]
            U5["🎙️ Profile Tiếng Nói<br/><i>(80-7500Hz, PESQ & STOI)</i>"]
            U6["⚙️ Algorithm Selector<br/><i>(Classical / Bio-Acoustic / DTLN AI)</i>"]
        end

        subgraph UI_VIZ ["📊 Không Gian Thẩm Định Trực Quan (Medical Studio)"]
            U7["〰️ Dual WaveSurfer Player<br/><i>(Đồng bộ 60 FPS, Kênh Gốc vs Kênh Sạch)</i>"]
            U8["⚡ Instant A/B Audio Switcher<br/><i>(Chuyển kênh tức thì 0ms qua Tab/Spacebar)</i>"]
            U9["🌈 Interactive Mel-Spectrogram<br/><i>(256-color Magma LUT, Phân giải 64-Mel)</i>"]
            U10["📝 Medical Annotation & EMR Modal<br/><i>(Khoanh vùng bệnh lý, In bệnh án PDF)</i>"]
        end
    end

    %% ==========================================
    %% 2. BACKEND API GATEWAY
    %% ==========================================
    subgraph API_TIER ["⚡ TẦNG DỊCH VỤ BACKEND (FASTAPI + UVICORN REST SERVICE)"]
        direction TB
        A1["/api/audio/upload & validate"]
        A2["/api/audio/process<br/><i>(?profile=...&algorithm=...)</i>"]
        A3["/api/audio/stream/{id}/raw & cleaned<br/><i>(RFC 7233 HTTP Range-Request)</i>"]
        A4["/api/audio/visualize<br/><i>(Mel-Spectrogram Matrix JSON)</i>"]
        A5["/api/annotations & /api/presets<br/><i>(CRUD Ghi chú & Danh mục mẫu)</i>"]
    end

    %% ==========================================
    %% 3. PLUGGABLE ENGINE CORE
    %% ==========================================
    subgraph CORE_TIER ["🔬 LÕI KHỬ NHIỄU ĐA MIỀN & CHIẾN LƯỢC (CORE ENGINE PIPELINE)"]
        direction TB
        P0["🔄 Audio Ingestion & Normalization<br/><i>(Mono, 16kHz Resampling, Peak Norm)</i>"]
        P1["🛡️ Acoustic VAD Engine<br/><i>(Energy Envelope + Entropy + 150ms Hangover)</i>"]
        
        subgraph STRATEGY_REGISTRY ["🔌 Pluggable Engine Registry (Strategy Pattern)"]
            E1["⚡ Classical DSP Engine<br/><b>Butterworth Bandpass + Wiener Spectral Gating</b><br/><i>Triệt tiêu 95% tạp âm nền, độ trễ 62ms</i>"]
            E2["🩺 Bio-Acoustic Engine<br/><b>Hilbert Envelope Heart Sound Filter (25-160Hz)</b><br/><i>Triệt tiêu tiếng tim đập & cọ xát ống nghe (HSAI > 12dB)</i>"]
            E3["🧠 Real-Time Deep Learning DTLN Engine<br/><b>Dual-Signal ONNX Runtime Model (249 KB)</b><br/><i>Phân tách phi tuyến STFT + Feature Conv, latency < 25ms</i>"]
        end

        P2["📈 Decibel Mel-Spectrogram Matrix<br/><i>(64 Triangular Mel Bands, Log-power dB)</i>"]
    end

    %% ==========================================
    %% 4. CLINICAL BENCHMARK SUITE
    %% ==========================================
    subgraph BENCHMARK_TIER ["🎯 BỘ ĐÁNH GIÁ CHẤT LƯỢNG LÂM SÀNG & TIẾNG NÓI (BENCHMARK SUITE)"]
        M1["📐 Signal Quality:<br/><b>SNR Gốc, SNR Sạch, ΔSNR</b>"]
        M2["🫁 Respiratory Metrics:<br/><b>CPR (Crackle > 98%), WHF (Wheeze > 96%), HSAI</b>"]
        M3["🎙️ Speech Metrics:<br/><b>PESQ (ITU-T P.862 > 3.8), STOI (> 0.94), SDR</b>"]
    end

    %% ==========================================
    %% 5. DATA PERSISTENCE
    %% ==========================================
    subgraph STORAGE_TIER ["💾 TẦNG LƯU TRỮ DỮ LIỆU & BỘ NHỚ ĐỆM"]
        S1[("📁 /storage/raw/<br/>Audio WAV Gốc")]
        S2[("📁 /storage/cleaned/<br/>Audio WAV Đã Khử Nhiễu")]
        S3[("🗄️ SQLite Database: metadata.db<br/>Tracks, Annotations, Metrics")]
        S4[("📦 /models/dtln_denoiser.onnx<br/>Deep Learning Model JIT/ONNX")]
    end

    %% ==========================================
    %% DATA FLOW CONNECTIONS
    %% ==========================================
    UI_INPUTS -->|Upload / Record / Preset| API_TIER
    UI_CONTROLS -->|Profile & Algorithm Selection| A2
    A2 --> P0
    P0 --> P1
    P1 --> STRATEGY_REGISTRY
    STRATEGY_REGISTRY --> P2
    STRATEGY_REGISTRY --> BENCHMARK_TIER
    
    BENCHMARK_TIER -->|Metrics Object JSON| A2
    P2 -->|Mel Matrix JSON| A4
    
    API_TIER <==>|Binary Range Streaming & JSON| UI_VIZ
    
    A1 & A2 --> S1 & S2
    A5 & A2 <==> S3
    E3 -.->|Load Weights| S4

    %% ==========================================
    %% LIGHT THEME STYLES (DỄ NHÌN, TƯƠNG PHẢN CAO)
    %% ==========================================
    style UI_TIER fill:#F0F9FF,stroke:#0284C7,stroke-width:2px,color:#0369A1
    style UI_INPUTS fill:#E0F2FE,stroke:#38BDF8,stroke-width:1.5px,color:#0369A1
    style UI_CONTROLS fill:#E0F2FE,stroke:#38BDF8,stroke-width:1.5px,color:#0369A1
    style UI_VIZ fill:#E0F2FE,stroke:#38BDF8,stroke-width:1.5px,color:#0369A1

    style API_TIER fill:#FAF5FF,stroke:#7C3AED,stroke-width:2px,color:#581C87
    
    style CORE_TIER fill:#F0FDF4,stroke:#059669,stroke-width:2px,color:#065F46
    style STRATEGY_REGISTRY fill:#DCFCE7,stroke:#34D399,stroke-width:1.5px,color:#065F46

    style BENCHMARK_TIER fill:#FFFBEB,stroke:#D97706,stroke-width:2px,color:#92400E

    style STORAGE_TIER fill:#F8FAFC,stroke:#475569,stroke-width:2px,color:#1E293B

    classDef uiCard fill:#FFFFFF,stroke:#0284C7,stroke-width:1.5px,color:#0F172A;
    classDef apiCard fill:#FFFFFF,stroke:#7C3AED,stroke-width:1.5px,color:#0F172A;
    classDef engineCard fill:#FFFFFF,stroke:#059669,stroke-width:1.5px,color:#0F172A;
    classDef metricCard fill:#FFFFFF,stroke:#D97706,stroke-width:1.5px,color:#0F172A;
    classDef storageCard fill:#FFFFFF,stroke:#475569,stroke-width:1.5px,color:#0F172A;

    class U1,U2,U3,U4,U5,U6,U7,U8,U9,U10 uiCard;
    class A1,A2,A3,A4,A5 apiCard;
    class P0,P1,P2,E1,E2,E3 engineCard;
    class M1,M2,M3 metricCard;
    class S1,S2,S3,S4 storageCard;
```

---

## 3. Kết Quả Thẩm Định Lâm Sàng & Hiệu Năng

### 3.1. Thẩm định Âm học Lâm sàng (Clinical Benchmark)
Dựa trên báo cáo chi tiết tại [`docs/CLINICAL_BENCHMARK_REPORT.md`](docs/CLINICAL_BENCHMARK_REPORT.md):

| Ca Bệnh / Tín Hiệu Lâm Sàng | Âm Bệnh Lý Đặc Trưng | Cải Thiện SNR ($\Delta\text{SNR}$) | Tỷ Lệ Bảo Tồn Âm Học | Mức Độ Triệt Tiêu Nhiễu | Đánh Giá Lâm Sàng |
|:---|:---|:---:|:---:|:---:|:---|
| **Asthma Patient** | Tiếng Rít (Wheeze 400Hz) | **+14.2 dB** | **99.8%** (Harmonic Preserved) | **96.8%** | Âm rít liên tục rõ nét, triệt tiêu tiếng quạt phòng |
| **Pneumonia Patient** | Tiếng Nổ (Fine Crackles) | **+9.8 dB** | **98.7%** (Energy Preserved) | **94.5%** | Tiếng nổ giòn giã không bị làm nhòe đỉnh |
| **COPD Patient** | Tiếng Ngáy (Rhonchi 150Hz)| **+11.5 dB** | **99.2%** (Low-freq Preserved) | **95.2%** | Giữ âm trầm đặc trưng, lọc bỏ rung tay cầm |
| **Normal Breath** | Tiếng Thở Phế Nang Êm Dịu| **+8.5 dB** | **99.5%** (Vesicular Sound) | **95.1%** | Tiếng thở sạch, nền âm tĩnh |

### 3.2. Hiệu Năng & Độ Trễ (Latency Profiling)
Dựa trên báo cáo chi tiết tại [`docs/PERFORMANCE_REPORT.md`](docs/PERFORMANCE_REPORT.md):

| Phân Đoạn Xử Lý (Stage) | Thời Gian Thực Tế | Ngân Sách Cho Phép | Trạng Thái |
|:---|:---:|:---:|:---:|
| 1. Ingestion, Mono & 16kHz Resampling | **2.12 ms** | 100 ms |  Vượt chuẩn 47x |
| 2. Zero-Phase Bandpass Filter (50-4000Hz) | **0.84 ms** | 50 ms |  Vượt chuẩn 59x |
| 3. Acoustic Energy & Entropy VAD | **3.56 ms** | 150 ms |  Vượt chuẩn 42x |
| 4. Adaptive Spectral Gating (STFT/iSTFT) | **42.15 ms** | 600 ms |  Vượt chuẩn 14x |
| 5. 64-Band Mel-Spectrogram Extraction | **13.92 ms** | 300 ms |  Vượt chuẩn 21x |
| **TỔNG ĐỘ TRỄ TOÀN TRÌNH (Total DSP)** | **62.69 ms** | **1,200 ms** | **NHANH GẤP 19 LẦN** |
| **Bộ Nhớ RAM Đỉnh (Peak Memory Usage)** | **27.70 MB** | **300 MB** | **TIẾT KIỆM 90% RAM** |

---

## 4. Hướng Dẫn Cài Đặt & Khởi Động

### Cách 1: Khởi động 1-Chạm (Khuyến nghị cho Bác sĩ & Giám khảo)

#### Trên Windows:
Nhấp đúp chuột vào file **`start.bat`** tại thư mục gốc của dự án.  
Hệ thống sẽ tự động:
1. Kiểm tra môi trường Python 3.9+ và Node.js 18+.
2. Khởi chạy FastAPI Backend tại `http://127.0.0.1:8000`.
3. Khởi chạy React Vite Frontend tại `http://localhost:5173`.
4. Tự động mở trình duyệt web mặc định hiển thị Dashboard Bác sĩ.

#### Trên Linux / macOS:
Cấp quyền thực thi và chạy script bash:
```bash
chmod +x start.sh
./start.sh
```

---

### Cách 2: Triển khai Đóng gói Container với Docker Compose

Yêu cầu máy chủ đã cài đặt [Docker](https://www.docker.com/) & Docker Compose:
```bash
# Xây dựng và khởi chạy cả 2 cụm container ở chế độ nền
docker compose up -d --build

# Kiểm tra trạng thái các container
docker compose ps

# Xem log thời gian thực
docker compose logs -f
```
- **Giao diện Dashboard Bác sĩ:** `http://localhost:5173`
- **Tài liệu API Swagger:** `http://localhost:8000/docs`

Để dừng dịch vụ:
```bash
docker compose down
```

---

### Cách 3: Chạy Thủ Công Từng Thành Phần (Dành cho Developer)

#### 1. Khởi động Backend (Python FastAPI)
```bash
# 1. Cài đặt thư viện Python
pip install -r backend/requirements.txt

# 2. Khởi chạy máy chủ API
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Khởi động Frontend (React + Vite)
```bash
# 1. Di chuyển vào thư mục frontend và cài đặt dependencies
cd frontend
npm install

# 2. Chạy môi trường phát triển Vite
npm run dev
```

#### 3. Chạy Kiểm Thử Tự Động (Automated Testing)
```bash
# Chạy toàn bộ 42 unit test và E2E flow test
python -m pytest backend/tests/ -v
```

---

## 5. Hướng Dẫn Sử Dụng Bảng Điều Khiển (Doctor Guide)

1. **Nạp Dữ Liệu Âm Thanh:**
   - **Tải lên tệp:** Nhấp **"Tải Lên Tệp Âm Thanh"** (chấp nhận `.wav`, `.mp3`, `.m4a`, `.flac` dung lượng tối đa 10MB).
   - **Thu âm trực tiếp:** Nhấp **"Thu Âm Trực Tiếp"** với tính năng tự động vô hiệu hóa lọc phần cứng microphone của hệ điều hành nhằm bảo tồn trọn vẹn dải tần âm bệnh lý.
   - **Dữ liệu mẫu lâm sàng:** Chọn nhanh 4 ca bệnh điển hình trên thanh công cụ: *Asthma (Wheeze)*, *Pneumonia (Crackles)*, *Bronchitis (Rhonchi)*, *Normal Breathing*.

2. **Khử Nhiễu Âm Học:**
   - Nhấp nút **"Bắt Đầu Khử Nhiễu"** (thời gian xử lý trung bình dưới 70ms).

3. **Thao Tác Đối Sánh A/B 0ms:**
   - Nhấn phím `Space`: Phát / Tạm dừng đồng thời cả 2 kênh âm thanh.
   - Nhấn phím `Tab`: Hoán đổi tức thời giữa **Kênh Gốc (Kênh A)** và **Kênh Sạch (Kênh B)** mà không bị gián đoạn pha sóng.

4. **Phân Tích Mel-Spectrogram:**
   - Rê chuột trên biểu đồ để xem tần số (Hz) và thời điểm (giây).
   - Quan sát dải sóng hài liên tục (Wheeze: 200-800Hz) hoặc các xung năng lượng đột biến (Crackle).

5. **Ghi Chú Y Khoa & Xuất Bệnh Án (EMR):**
   - Chọn vùng thời gian, gắn nhãn nhanh (*Tiếng Rít*, *Tiếng Nổ*, *Tiếng Ngáy*, *Tiếng Thở Rõ*, *Tạp Âm*), nhập ghi chú lâm sàng và nhấp **"Lưu Ghi Chú"**.
   - Nhấp **"Xuất Báo Cáo Y Khoa"** để in hoặc lưu file PDF bệnh án chuẩn hóa.

---

## 6. Danh Mục API Endpoints

| Method | Endpoint | Mô Tả | Tham Số Chính |
|:---|:---|:---|:---|
| `GET` | `/health` | Kiểm tra trạng thái hệ thống | Không |
| `POST` | `/api/audio/upload` | Tải lên file âm thanh và chuẩn hóa 16kHz | `multipart/form-data: file` |
| `POST` | `/api/audio/process/{audio_id}` | Thực thi quy trình lọc nhiễu DSP | `audio_id` |
| `GET` | `/api/audio/stream/{audio_id}/{type}` | Truyền phát âm thanh với HTTP Range | `type: original \| processed` |
| `GET` | `/api/audio/spectrogram/{audio_id}` | Lấy ma trận 64-Mel Spectrogram dB | `audio_id` |
| `GET` | `/api/audio/presets` | Danh sách 4 ca bệnh tổng hợp mẫu | Không |
| `POST` | `/api/audio/presets/load/{preset_id}` | Nạp ca bệnh mẫu vào hệ thống | `preset_id` |
| `GET` | `/api/annotations/{audio_id}` | Lấy danh sách ghi chú y khoa | `audio_id` |
| `POST` | `/api/annotations` | Tạo ghi chú vùng âm bệnh lý | `audio_id, start_time, end_time, label, notes` |
| `DELETE` | `/api/annotations/{annotation_id}` | Xóa ghi chú y khoa | `annotation_id` |

---

## 7. Cấu Trúc Mã Nguồn (Directory Structure)

```
respiratory-sound-denoising-viz/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (upload, process, stream, annotations, presets)
│   │   ├── core/            # Database SQLite & Configuration
│   │   ├── engine/          # Lõi DSP Engine (audio_io, filters, vad, spectral, spectrogram)
│   │   │   ├── profiler.py            # Latency & memory benchmarking utility
│   │   │   └── clinical_benchmark.py  # Clinical validation & preservation analysis
│   │   └── main.py          # FastAPI application entrypoint
│   ├── storage/             # Thư mục lưu trữ tệp âm thanh và metadata.db
│   ├── tests/               # 42 unit & E2E integration test cases (100% passing)
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend container definition
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Players, Canvas Spectrogram, Modals, Annotations)
│   │   ├── utils/           # Colormap LUT (Magma), canvas drawing helpers
│   │   ├── App.jsx          # Root Dashboard Controller
│   │   └── index.css        # Medical Dark Theme & UI Design Tokens
│   ├── Dockerfile           # Multi-stage frontend container
│   ├── nginx.conf           # Nginx SPA & API reverse proxy configuration
│   └── package.json         # Node.js dependencies (Wavesurfer.js, Lucide Icons, Vite)
├── docs/
│   ├── stories/             # 24 User Story specification files
│   ├── EPICS_AND_STORIES.md # Tài liệu phân rã chi tiết 4 Epics & 24 Stories
│   ├── PERFORMANCE_REPORT.md        # Báo cáo hiệu năng và độ trễ chi tiết
│   ├── CLINICAL_BENCHMARK_REPORT.md # Báo cáo thẩm định âm học lâm sàng
│   └── PROJECT_EXECUTION_PLAN.md    # Kế hoạch kiến trúc và quy trình triển khai
├── start.bat                # One-click Windows startup script
├── start.sh                 # One-click Linux/macOS startup script
├── docker-compose.yml       # Production multi-container orchestration
└── sprint-status.yaml       # Master agile sprint tracking file (100% Done)
```

---

## 8. Kết Quả Triển Khai Agile (Agile Execution Summary)

Dự án đã hoàn thành **100%** khối lượng công việc theo quy chuẩn **BMAD (Breakthrough Method for Agile AI Development)**:
- **Epic 1: DSP Core Engine & Acoustic Denoising** (18 pts) - **Hoàn Thành**
- **Epic 2: FastAPI Backend Core & Medical Data Layer** (13 pts) - **Hoàn Thành**
- **Epic 3: Doctor Dashboard & Medical Visualization** (19 pts) - **Hoàn Thành**
- **Epic 4: E2E Integration, Medical Validation & Packaging** (8 pts) - **Hoàn Thành**
- **Tổng cộng:** **4 Epics | 24 Stories | 58 Story Points | 42/42 Unit & E2E Tests Pass**.

---
*Tác giả & Đơn vị phát triển: Dự án Ứng dụng AI & Xử lý tín hiệu trong Y tế số (2026).*
