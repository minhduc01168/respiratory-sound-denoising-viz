## BÁO CÁO KỸ THUẬT SẢN PHẨM PHẦN MỀM
### ĐỀ TÀI: NỀN TẢNG KHỬ NHIỄU VÀ TRỰC QUAN HÓA ÂM THANH HÔ HẤP CHUYÊN DỤNG Y KHOA (RSDV)
**Tên tiếng Anh:** Respiratory Sound Denoising and Visualization Platform  
**Thời gian:** Hà Nội, 10/2026  

---

## MỤC LỤC
1. [LỜI MỞ ĐẦU](#lời-mở-đầu)
2. [DANH MỤC HÌNH VẼ](#danh-mục-hình-vẽ)
3. [DANH MỤC BẢNG BIỂU](#danh-mục-bảng-biểu)
4. [DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT](#danh-mục-thuật-ngữ-và-từ-viết-tắt)
5. [CHƯƠNG 1. THU THẬP YÊU CẦU](#chương-1-thu-thập-yêu-cầu)
 - 1.1. [Các kỹ thuật thu thập yêu cầu](#11-các-kỹ-thuật-thu-thập-yêu-cầu)
 - 1.2. [Bảng câu hỏi khảo sát và phân tích yêu cầu chuyên môn](#12-bảng-câu-hỏi-khảo-sát-và-phân-tích-yêu-cầu-chuyên-môn)
 - 1.3. [Phân loại yêu cầu hệ thống](#13-phân-loại-yêu-cầu-hệ-thống)
 - 1.3.1. [Yêu cầu về phần mềm](#131-yêu-cầu-về-phần-mềm)
 - 1.3.2. [Yêu cầu về phần cứng](#132-yêu-cầu-về-phần-cứng)
 - 1.3.3. [Yêu cầu về dữ liệu âm sinh học](#133-yêu-cầu-về-dữ-liệu-âm-sinh-học)
 - 1.3.4. [Yêu cầu về người dùng và vai trò tác nhân](#134-yêu-cầu-về-người-dùng-và-vai-trò-tác-nhân)
 - 1.3.5. [Yêu cầu phi chức năng](#135-yêu-cầu-phi-chức-năng)
6. [CHƯƠNG 2. PHÂN TÍCH HỆ THỐNG](#chương-2-phân-tích-hệ-thống)
 - 2.1. [Biểu đồ ca sử dụng (Use Case Diagrams)](#21-biểu-đồ-ca-sử-dụng-use-case-diagrams)
 - 2.1.1. [Biểu đồ ca sử dụng tổng quát](#211-biểu-đồ-ca-sử-dụng-tổng-quát)
 - 2.1.2. [Biểu đồ phân rã ca sử dụng chi tiết](#212-biểu-đồ-phân-rã-ca-sử-dụng-chi-tiết)
 - 2.1.3. [Bảng đặc tả các Use Case cốt lõi](#213-bảng-đặc-tả-các-use-case-cốt-lõi)
 - 2.2. [Biểu đồ hoạt động (Activity Diagrams)](#22-biểu-đồ-hoạt-động-activity-diagrams)
 - 2.2.1. [Quy trình Khử nhiễu Thích ứng 4 Tầng](#221-quy-trình-khử-nhiễu-thích-ứng-4-tầng)
 - 2.2.2. [Quy trình Phát âm thanh Đồng bộ và Đổi chế độ A/B](#222-quy-trình-phát-âm-thanh-đồng-bộ-và-đổi-chế-độ-ab)
 - 2.2.3. [Quy trình Trực quan hóa Ma trận Phổ 2D](#223-quy-trình-trực-quan-hóa-ma-trận-phổ-2d)
 - 2.2.4. [Quy trình Nạp Ca bệnh Mẫu và Stream mượt mà](#224-quy-trình-nạp-ca-bệnh-mẫu-và-stream-mượt-mà)
 - 2.3. [Biểu đồ tuần tự (Sequence Diagrams)](#23-biểu-đồ-tuần-tự-sequence-diagrams)
 - 2.3.1. [Vòng đời Xử lý tệp âm thanh và Trích xuất Chỉ số SNR](#231-vòng-đời-xử-lý-tệp-âm-thanh-và-trích-xuất-chỉ-số-snr)
 - 2.3.2. [Đồng bộ Playhead Dual WaveSurfer & Instant Switch](#232-đồng-bộ-playhead-dual-wavesurfer--instant-switch)
 - 2.3.3. [Ghi chú bệnh án và Đánh dấu Dải bất thường](#233-ghi-chú-bệnh-án-và-đánh-dấu-dải-bất-thường)
 - 2.4. [Mô hình thực thể liên kết (ERD Phân tích)](#24-mô-hình-thực-thể-liên-kết-erd-phân-tích)
7. [CHƯƠNG 3. THIẾT KẾ HỆ THỐNG](#chương-3-thiết-kế-hệ-thống)
 - 3.1. [Kiến trúc hệ thống](#31-kiến-trúc-hệ-thống)
 - 3.1.1. [Mô hình kiến trúc tổng thể 4 phân tầng](#311-mô-hình-kiến-trúc-tổng-thể-4-phân-tầng)
 - 3.1.2. [Đặc tả các phân tầng kiến trúc](#312-đặc-tả-các-phân-tầng-kiến-trúc)
 - 3.1.3. [Các mục tiêu thiết kế kiến trúc y sinh](#313-các-mục-tiêu-thiết-kế-kiến-trúc-y-sinh)
 - 3.2. [Thiết kế lớp (Class Diagrams)](#32-thiết-kế-lớp-class-diagrams)
 - 3.2.1. [Sơ đồ lớp phân hệ Động cơ DSP & Trích xuất Đặc trưng](#321-sơ-đồ-lớp-phân-hệ-động-cơ-dsp--trích-xuất-đặc-trưng)
 - 3.2.2. [Sơ đồ lớp phân hệ API Controllers & Service Router](#322-sơ-đồ-lớp-phân-hệ-api-controllers--service-router)
 - 3.2.3. [Sơ đồ lớp phân hệ Quản lý Dữ liệu Y tế SQLite](#323-sơ-đồ-lớp-phân-hệ-quản-lý-dữ-liệu-y-tế-sqlite)
 - 3.2.4. [Sơ đồ lớp phân hệ Giao diện Dashboard & Trực quan](#324-sơ-đồ-lớp-phân-hệ-giao-diện-dashboard--trực-quan)
 - 3.3. [Thiết kế Cơ sở dữ liệu](#33-thiết-kế-cơ-sở-dữ-liệu)
 - 3.3.1. [Chiến lược lưu trữ lai Hybrid Storage](#331-chiến-lược-lưu-trữ-lai-hybrid-storage)
 - 3.3.2. [Sơ đồ Thực thể CSDL Chi tiết (Database Schema ERD)](#332-sơ-đồ-thực-thể-csdl-chi-tiết-database-schema-erd)
 - 3.3.3. [Từ điển dữ liệu (Data Dictionary) chi tiết 3 Bảng cốt lõi](#333-từ-điển-dữ-liệu-data-dictionary-chi-tiết-3-bảng-cốt-lõi)
 - 3.4. [Thiết kế mẫu biểu và giao diện giao tiếp](#34-thiết-kế-mẫu-biểu-và-giao-diện-giao-tiếp)
8. [CHƯƠNG 4. TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG](#chương-4-triển-khai-và-đánh-giá-hệ-thống)
 - 4.1. [Kết quả triển khai giao diện thực tế](#41-kết-quả-triển-khai-giao-diện-thực-tế)
 - 4.2. [Đánh giá hệ thống và kết quả kiểm thử](#42-đánh-giá-hệ-thống-và-kết-quả-kiểm-thử)
 - 4.2.1. [Bảng thống kê kết quả kiểm thử tự động (62 Unit Tests)](#421-bảng-thống-kê-kết-quả-kiểm-thử-tự-động-62-unit-tests)
 - 4.2.2. [Đánh giá mức độ đáp ứng mục tiêu y khoa & DSP](#422-đánh-giá-mức-độ-đáp-ứng-mục-tiêu-y-khoa--dsp)
 - 4.2.3. [So sánh định lượng với các giải pháp thị trường](#423-so-sánh-định-lượng-với-các-giải-pháp-thị-trường)
9. [KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#kết-luận-và-hướng-phát-triển)
10. [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

## DANH MỤC HÌNH VẼ

| Ký hiệu | Tên hình vẽ | Trang tham chiếu |
| :--- | :--- | :--- |
| **Hình 2.1** | Biểu đồ ca sử dụng (Use Case) tổng quát hệ thống RSDV | Chương 2 |
| **Hình 2.2** | Biểu đồ phân rã ca sử dụng: Phân hệ Tiếp nhận & Khử nhiễu Thích ứng | Chương 2 |
| **Hình 2.3** | Biểu đồ phân rã ca sử dụng: Phân hệ Trực quan hóa Phổ & Kiểm âm A/B | Chương 2 |
| **Hình 2.4** | Biểu đồ phân rã ca sử dụng: Phân hệ Thẩm định Lâm sàng & Preset Y tế | Chương 2 |
| **Hình 2.5** | Biểu đồ hoạt động: Quy trình Khử nhiễu Thích ứng 4 Tầng | Chương 2 |
| **Hình 2.6** | Biểu đồ hoạt động: Cơ chế Phát âm song song và Chuyển kênh A/B tức thời | Chương 2 |
| **Hình 2.7** | Biểu đồ hoạt động: Tính toán STFT và Vẽ Heatmap Spectrogram 2D Canvas | Chương 2 |
| **Hình 2.8** | Biểu đồ tuần tự: Vòng đời Xử lý tệp âm thanh qua FastAPI & Pipeline DSP | Chương 2 |
| **Hình 2.9** | Biểu đồ tuần tự: Đồng bộ trục thời gian Playhead giữa Raw và Clean Player | Chương 2 |
| **Hình 2.10** | Biểu đồ tuần tự: Khởi tạo và Lưu trữ Ghi chú chẩn đoán lâm sàng | Chương 2 |
| **Hình 2.11** | Sơ đồ mô hình thực thể liên kết phân tích (ERD Phân tích) | Chương 2 |
| **Hình 3.1** | Mô hình Kiến trúc Phân tầng 4 Lớp của Nền tảng RSDV | Chương 3 |
| **Hình 3.2** | Sơ đồ lớp chi tiết: Phân hệ Động cơ Xử lý Tín hiệu Số (DSP Core) | Chương 3 |
| **Hình 3.3** | Sơ đồ lớp chi tiết: Phân hệ Bộ điều khiển API & Routing (FastAPI) | Chương 3 |
| **Hình 3.4** | Sơ đồ lớp chi tiết: Phân hệ Lưu trữ Dữ liệu Y tế (SQLAlchemy ORM) | Chương 3 |
| **Hình 3.5** | Sơ đồ Thực thể CSDL SQLite chi tiết (Database Schema ERD) | Chương 3 |
| **Hình 4.1** | Bố cục Giao diện Bảng điều khiển Y khoa RSDV (Doctor Dashboard) | Chương 4 |
| **Hình 4.2** | Biểu đồ Phổ nhiệt Mel Spectrogram 2D so sánh Trước và Sau khử nhiễu | Chương 4 |

---

## DANH MỤC BẢNG BIỂU

| Ký hiệu | Tên bảng | Nội dung chính |
| :--- | :--- | :--- |
| **Bảng 1.1** | Bảng câu hỏi phỏng vấn và khảo sát thực tế Bác sĩ Hô hấp | Thu thập nhu cầu của Bác sĩ chuyên khoa & Y tế tuyến đầu |
| **Bảng 1.2** | Bảng mô tả các tập dữ liệu âm thanh và thực thể hệ thống | Đặc tả đối tượng dữ liệu âm sinh học và siêu dữ liệu |
| **Bảng 2.1** | Bảng đặc tả Use Case UC-01: Tải lên & Chuẩn hóa Âm thanh Hô hấp | Quy trình chuyển đổi 16kHz Mono Float32 |
| **Bảng 2.2** | Bảng đặc tả Use Case UC-02: Khử nhiễu Thích ứng Đa tầng | Phối hợp Butterworth, Spectral Gating và VAD |
| **Bảng 2.3** | Bảng đặc tả Use Case UC-03: Trực quan hóa Sóng âm & Phổ Spectrogram | Hiển thị Waveform và ma trận năng lượng tần số |
| **Bảng 2.4** | Bảng đặc tả Use Case UC-04: Kiểm âm Đối chứng Tức thời A/B | Chuyển đổi Raw - Clean qua phím tắt không trễ |
| **Bảng 2.5** | Bảng đặc tả Use Case UC-05: Tải Ca bệnh Mẫu Lâm sàng (Presets) | Nạp 4 ca bệnh điển hình không cần thiết bị thu |
| **Bảng 2.6** | Bảng đặc tả Use Case UC-06: Ghi chú Bệnh án & Phân tích Dải bất thường | Lưu nhận định lâm sàng và timestamp âm bệnh |
| **Bảng 3.1** | Từ điển dữ liệu: Bảng `audio_metadata` | Thuộc tính tệp âm thanh, thời lượng, tần số lấy mẫu |
| **Bảng 3.2** | Từ điển dữ liệu: Bảng `processing_jobs` | Thông số kỹ thuật, cấu hình bộ lọc, SNR Gain |
| **Bảng 3.3** | Từ điển dữ liệu: Bảng `clinical_annotations` | Chẩn đoán y khoa, dấu mốc thời gian, loại âm bệnh học |
| **Bảng 4.1** | Thống kê Kết quả Kiểm thử Tự động (Automated Test Suites) | Tổng hợp 62 Unit & Integration Tests đạt 100% Passed |
| **Bảng 4.2** | Đánh giá Mức độ Đáp ứng Mục tiêu Kỹ thuật và Y khoa | So sánh các tiêu chí SNR gain, độ trễ và toàn vẹn âm bệnh |
| **Bảng 4.3** | Bảng So sánh Định lượng với Audacity, SoX và MATLAB | Phân tích ưu thế vượt trội của RSDV cho y tế |

---

## DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT

| Thuật ngữ | Tên viết tắt | Diễn giải chi tiết |
| :--- | :--- | :--- |
| **Digital Signal Processing** | DSP | Xử lý tín hiệu số: Các kỹ thuật lọc, biến đổi và tối ưu hóa chuỗi tín hiệu rời rạc. |
| **Short-Time Fourier Transform** | STFT | Biến đổi Fourier thời gian ngắn: Phân tích phổ năng lượng của tín hiệu theo từng khung thời gian. |
| **Signal-to-Noise Ratio** | SNR | Tỷ số tín hiệu trên nhiễu: Thước đo chất lượng âm thanh, tính theo đơn vị Decibel (dB). |
| **Voice Activity Detection** | VAD | Phát hiện hoạt động âm thanh/tiếng thở: Phân đoạn khoảng lặng sinh học và pha thở tích cực. |
| **Infinite Impulse Response** | IIR | Bộ lọc phản hồi vô hạn: Cấu trúc lọc Butterworth đảm bảo độ dốc cắt sắc nét và tối ưu tài nguyên. |
| **Open Neural Network Exchange** | ONNX | Định dạng chuẩn mở dùng để triển khai và tăng tốc mô hình học sâu (Deep Learning) trên CPU/GPU. |
| **Auditory A/B Testing** | A/B Test | Phương pháp kiểm âm mù hoặc chuyển kênh tức thì giữa tín hiệu gốc (A) và tín hiệu đã xử lý (B). |
| **Mel-Frequency Spectrogram** | Mel Spec | Biểu đồ phổ tần số theo thang đo Mel, mô phỏng cách cảm nhận cao độ của thính giác con người. |
| **Chronic Obstructive Pulmonary Disease** | COPD | Bệnh phổi tắc nghẽn mạn tính – bệnh lý phổ biến có triệu chứng âm thở ran rít và ran ngáy. |
| **Nyquist-Shannon Sampling Frequency** | $f_s$ | Tần số lấy mẫu âm thanh: Đặt tại 16.000 Hz, bao phủ hoàn toàn dải tần số hô hấp người (50 - 2.000 Hz). |

---

## LỜI MỞ ĐẦU

Trong y khoa hiện đại, thính chẩn (Auscultation) bằng ống nghe là kỹ thuật thăm khám lâm sàng đầu tay, không xâm lấn, nhanh chóng và có chi phí thấp nhất để đánh giá sức khỏe hệ hô hấp. Thông qua việc lắng nghe âm thanh phế nang và các âm bệnh học bất thường như tiếng ran rít (Wheeze), ran ngáy (Rhonchi), ran ẩm (Coarse Crackle), ran nổ (Fine Crackle) và tiếng cọ màng phổi (Pleural Rub), các bác sĩ có thể phát hiện sớm các bệnh lý nguy hiểm như Hen phế quản, Bệnh phổi tắc nghẽn mạn tính (COPD), Viêm phổi thùy, và Xơ hóa phế nang.

Tuy nhiên, trong môi trường lâm sàng thực tế tại Việt Nam, đặc biệt là các bệnh viện tuyến cơ sở, phòng cấp cứu quá tải hoặc trạm y tế vùng sâu vùng xa, việc thính chẩn gặp phải ba rào cản nghiêm trọng:
1. **Ô nhiễm tiếng ồn âm học phức tạp:** Âm thanh thu nhận qua ống nghe thường bị lấn át bởi tiếng ồn môi trường phòng khám (tiếng còi cấp cứu, quạt gió, tiếng nói chuyện), tiếng cọ sát cơ học của màng nghe trên da bệnh nhân (Friction Noise, dải tần 10 - 150 Hz) và tiếng nhịp đập của tim (Heart Sound Interference, dải tần 20 - 120 Hz) với biên độ lớn gấp nhiều lần tiếng thở phế nang.
2. **Thiếu trực quan hóa định lượng:** Thính chẩn truyền thống hoàn toàn dựa vào kinh nghiệm chủ quan của tai người nghe. Âm thanh biến mất ngay sau khi thở, không có đồ thị phổ tần số để hội chẩn liên chuyên khoa, không thể lưu lại bệnh án điện tử để theo dõi tiến triển điều trị.
3. **Các phần mềm âm thanh đa năng không đáp ứng yêu cầu y tế:** Các công cụ phổ biến như Audacity, Adobe Audition hay SoX được thiết kế cho âm nhạc/podcast; khi áp dụng các bộ lọc khử nhiễu tự động thông thường (Noise Gate), chúng triệt tiêu luôn cả các dải tần bệnh lý tinh vi có năng lượng thấp (như tiếng ran nổ tần số cao 600 - 1.200 Hz), dẫn tới sai lệch chẩn đoán y khoa nghiêm trọng.

Xuất phát từ thực tiễn trên, dự án **Nền tảng Khử nhiễu và Trực quan hóa Âm thanh Hô hấp Chuyên dụng Y khoa (RSDV - Respiratory Sound Denoising & Visualization Platform)** được thiết kế và hiện thực hóa. Hệ thống mang lại một giải pháp công nghệ toàn diện:
- **Chuỗi xử lý tín hiệu số (DSP Pipeline) chuyên sâu cho hô hấp:** Kết hợp bộ lọc thông dải Butterworth bậc 4 cô lập dải tần 50 - 2.000 Hz, thuật toán Khử nhiễu Thích ứng Phổ (Adaptive Spectral Gating với STFT Hann Window), và thuật toán Tách phân đoạn thở (Respiratory VAD với Hysteresis Thresholding).
- **Trực quan hóa Phổ nhiệt Mel Spectrogram 2D & Sóng âm đồng bộ:** Hiển thị trực tiếp ma trận năng lượng tần số theo thời gian thực trên HTML5 Canvas.
- **Trải nghiệm Thẩm định Thính chẩn A/B Tức thời:** Đồng bộ hóa Playhead giữa hai luồng âm thanh Raw và Clean, cho phép chuyển kênh chỉ bằng một phím tắt (Tab) với độ trễ < 5ms.
- **Hệ thống dữ liệu mẫu lâm sàng chuẩn hóa:** Cung cấp sẵn các ca bệnh điển hình hỗ trợ đào tạo y khoa và kiểm định thuật toán độc lập.

Báo cáo kỹ thuật này trình bày chi tiết toàn bộ chu trình phân tích, thiết kế hướng đối tượng, kiến trúc phần mềm, hiện thực hóa mã nguồn và kết quả đánh giá thực nghiệm của dự án RSDV.

---

## CHƯƠNG 1. THU THẬP YÊU CẦU

### 1.1. Các kỹ thuật thu thập yêu cầu
Để xây dựng một nền tảng đáp ứng chính xác các quy chuẩn khắt khe của âm thanh y sinh, nhóm nghiên cứu đã áp dụng ba kỹ thuật kỹ thuật phần mềm:
1. **Phỏng vấn chuyên sâu chuyên gia Y tế (In-depth Medical Interviews):** Trao đổi với 6 bác sĩ chuyên khoa Hô hấp và 8 điều dưỡng tại các bệnh viện đa khoa về quy trình nghe phổi, dải tần số quan trọng của từng âm bệnh lý và các loại tạp âm gây khó khăn nhất khi chẩn đoán.
2. **Khảo sát thực nghiệm trên tập dữ liệu chuẩn quốc tế (Dataset Benchmarking):** Phân tích 920 bản ghi âm từ cơ sở dữ liệu **ICBHI 2017 Respiratory Sound Database** và bộ dữ liệu hô hấp Việt Nam **PTITLab Multitask-Breath-Sound** để đo đạc phổ công suất thực tế của tiếng ồn cọ màng nghe và tiếng tim.
3. **Phân tích đối chuẩn kỹ thuật (Technical Benchmarking):** So sánh các thuật toán lọc số cổ điển (IIR, FIR, Spectral Subtraction) với các mô hình học sâu hiện đại trên nền tảng máy trạm y tế nhằm xác định bài toán tối ưu giữa độ trễ xử lý (Latency) và độ bảo toàn âm bệnh học.

### 1.2. Bảng câu hỏi khảo sát và phân tích yêu cầu chuyên môn

**Bảng 1.1: Bảng câu hỏi khảo sát thực tế và phân tích yêu cầu kỹ thuật tương ứng**

| STT | Câu hỏi khảo sát thực tế | Đối tượng khảo sát | Phân tích yêu cầu kỹ thuật hệ thống |
| :--- | :--- | :--- | :--- |
| **1** | Bác sĩ thường gặp khó khăn gì nhất khi thính chẩn bằng ống nghe điện tử? | Bác sĩ Hô hấp | Tạp âm ma sát màng nghe trên da và tiếng quạt/máy lạnh trong phòng. Cần bộ lọc Bandpass chặn tuyệt đối dưới 50Hz và khử nhiễu dừng (stationary noise). |
| **2** | Khi khử nhiễu, làm thế nào để không làm biến dạng tiếng thở rít của bệnh nhân hen? | Bác sĩ Hô hấp | Tiếng Wheeze nằm ở dải tần 200 - 800 Hz. Thuật toán Spectral Gating phải có mặt nạ làm mịn (Smoothing Mask) và hệ số quá mức (Oversubtraction factor) kiểm soát nghiêm ngặt. |
| **3** | Bác sĩ muốn so sánh kết quả trước và sau khi lọc như thế nào? | Bác sĩ & Giám định viên | Cần chức năng nghe chuyển kênh tức thời (A/B Audio Switching) trên cùng 1 trục thời gian chính xác đến từng mili-giây mà không bị ngắt quãng dòng phát. |
| **4** | Phổ tần số cần hiển thị những thông số gì để phục vụ chẩn đoán? | Chuyên gia Âm sinh học | Cần biểu đồ Mel Spectrogram dải 0 - 4.000 Hz với dải màu nhiệt (Viridis/Plasma) thể hiện mật độ năng lượng Decibel (dB) theo thời gian. |
| **5** | Nếu phòng khám không có kết nối mạng Internet, phần mềm có hoạt động được không? | Bác sĩ tuyến cơ sở | Toàn bộ thuật toán DSP và máy chủ backend phải chạy 100% On-premise trên máy tính cá nhân, không phụ thuộc vào API Cloud trả phí. |
| **6** | Nếu người dùng chưa có ống nghe điện tử, làm thế nào để trải nghiệm phần mềm? | Giám khảo & Người dùng mới | Cần cung cấp sẵn danh mục Ca bệnh mẫu (Clinical Presets) gồm 4 ca bệnh điển hình: Thở bình thường, Hen phế quản, Viêm phổi và Cơn ho cấp. |

---

### 1.3. Phân loại yêu cầu hệ thống

#### 1.3.1. Yêu cầu về phần mềm
- **Tầng Giao diện Y khoa (Frontend):** 
  - Thư viện nền tảng: **React 18** kết hợp bundler tốc độ cao **Vite**.
  - Xử lý Sóng âm thanh: **WaveSurfer.js v7** kết hợp Web Audio API.
  - Vẽ phổ Spectrogram: **HTML5 Canvas 2D API** tối ưu hiệu năng render đồ họa theo khung hình 60 FPS.
  - Bộ biểu tượng và Giao diện: **Lucide React**, kiến trúc giao diện Dark Mode y khoa giảm mỏi mắt cho bác sĩ.
- **Tầng Máy chủ Ứng dụng & Dịch vụ DSP (Backend):**
  - Khung máy chủ: **FastAPI (Python 3.9+)** chạy trên nền ASGI **Uvicorn**, hỗ trợ bất đồng bộ High-concurrency.
  - Xử lý Tín hiệu Số (DSP): **Scipy (scipy.signal)**, **NumPy**, **Librosa**, **SoundFile**.
  - Động cơ Trí tuệ Nhân tạo: **ONNX Runtime (onnxruntime)** hỗ trợ suy luận mô hình học sâu nhẹ trên CPU máy tính thông thường.
  - Cơ sở dữ liệu: **SQLite** thông qua ORM **SQLAlchemy**, quản lý tệp cấu trúc theo tiêu chuẩn y tế.

#### 1.3.2. Yêu cầu về phần cứng
- **Thiết bị chạy ứng dụng (Workstation / Laptop y tế):**
  - CPU: Intel Core i3 / AMD Ryzen 3 trở lên (xung nhịp tối thiểu 2.0 GHz).
  - Bộ nhớ RAM: Tối thiểu 4 GB (khuyến nghị 8 GB để xử lý nhiều tệp âm thanh đồng thời).
  - Ổ cứng lưu trữ: Trống tối thiểu 500 MB cho mã nguồn, cơ sở dữ liệu và kho tệp âm thanh lâm sàng.
  - Card âm thanh: Hỗ trợ đầu ra Stereo 16-bit / 44.1 kHz hoặc 48 kHz.
  - Thiết bị nghe: Tai nghe chụp tai chuyên dụng y tế hoặc loa kiểm âm phòng khám.

#### 1.3.3. Yêu cầu về dữ liệu âm sinh học

**Bảng 1.2: Mô tả các tập dữ liệu chính trong hệ thống RSDV**

| Tên tập dữ liệu | Mô tả bản chất dữ liệu | Định dạng & Lưu trữ |
| :--- | :--- | :--- |
| **Raw Audio Storage** | Tệp âm thanh thô thu nhận từ ống nghe điện tử hoặc tải lên. | WAV / MP3 / FLAC / OGG tại `backend/storage/raw/` |
| **Cleaned Audio Storage** | Tệp âm thanh đã lọc sạch nhiễu qua chuỗi pipeline DSP. | WAV 16kHz 16-bit PCM tại `backend/storage/cleaned/` |
| **Audio Metadata** | Siêu dữ liệu âm thanh: UID, Tên tệp, Thời lượng, $f_s$, Số kênh, RMS. | Bảng SQLite `audio_metadata` |
| **Processing Jobs** | Thông số phiên lọc: Chiến lược lọc, SNR gain, Độ trễ tính toán. | Bảng SQLite `processing_jobs` |
| **Clinical Annotations** | Nhật ký thính chẩn của bác sĩ: Timestamp, Loại âm bệnh, Mô tả. | Bảng SQLite `clinical_annotations` |
| **Spectrogram Matrices** | Ma trận phổ năng lượng STFT 2D ($T \times F$) biểu diễn năng lượng dB. | Dữ liệu nhị phân / JSON phục vụ Canvas vẽ Heatmap |

#### 1.3.4. Yêu cầu về người dùng và vai trò tác nhân
- **Bác sĩ Chuyên khoa Hô hấp (Pulmonologist / Doctor Actor):**
  - Tải lên tệp âm thanh thu được từ bệnh nhân.
  - Lựa chọn cấu hình lọc thích ứng phù hợp với bệnh cảnh lâm sàng.
  - Lắng nghe đối chứng A/B, phóng to/thu nhỏ vùng âm thanh nghi vấn.
  - Ghi chú bệnh án điện tử, đánh dấu các chu kỳ thở có tiếng ran bệnh lý.
- **Giám định viên / Nhà nghiên cứu Y sinh (Researcher / Evaluator Actor):**
  - Đánh giá định lượng hiệu quả thuật toán thông qua chỉ số SNR Gain.
  - Nạp các ca bệnh mẫu (Clinical Presets) để đối chuẩn kết quả phân tích.
  - Xuất báo cáo kỹ thuật và ma trận phổ tần số.
- **Động cơ DSP Chạy ngầm (System / DSP Pipeline Actor):**
  - Tiếp nhận luồng âm thanh nhị phân, chuẩn hóa về định dạng 16.000 Hz Mono.
  - Tự động ước lượng mẫu nhiễu nền từ các khoảng lặng sinh học (VAD).
  - Thực thi chuỗi thuật toán lọc số thích ứng đa tầng.
  - Tính toán ma trận năng lượng STFT và lưu trữ siêu dữ liệu.

#### 1.3.5. Yêu cầu phi chức năng
1. **Thời gian xử lý gần thời gian thực (Ultra-low Latency):** Thời gian xử lý toàn bộ pipeline khử nhiễu đối với đoạn âm thanh hô hấp 5 giây phải **nhỏ hơn 100ms** trên CPU thông thường.
2. **Tăng ích Tỷ số Tín hiệu trên Nhiễu (SNR Gain):** Thuật toán phải cải thiện SNR ít nhất **+10 dB** trên các bản ghi có nhiễu nền mà không làm méo âm thanh hô hấp chính.
3. **Bảo toàn Tần số Âm bệnh học (Clinical Frequency Preservation):** Đảm bảo giữ nguyên vẹn 100% năng lượng các đỉnh tần số của tiếng ran rít Hen phế quản (dải 200 - 800 Hz) và tiếng ran nổ Viêm phổi (dải 600 - 1.500 Hz).
4. **Độ trễ Chuyển mạch Âm thanh Không cảm nhận được (< 5ms):** Khi người dùng nhấn phím chuyển kênh A/B (giữa âm thô và âm sạch), vị trí con trỏ phát (Playhead) không được giật hoặc dừng lại, thời gian chuyển mạch kênh < 5ms.
5. **Độ ổn định và Độc lập Ngoại tuyến:** Hoạt động hoàn toàn cục bộ (100% Offline-capable), không yêu cầu kết nối đám mây, bảo mật dữ liệu y tế người bệnh theo tiêu chuẩn HIPAA.

---

## CHƯƠNG 2. PHÂN TÍCH HỆ THỐNG

### 2.1. Biểu đồ ca sử dụng (Use Case Diagrams)

#### 2.1.1. Biểu đồ ca sử dụng tổng quát
Biểu đồ tổng quát mô tả sự tương tác giữa các tác nhân (Bác sĩ, Nhà nghiên cứu) và tác nhân Động cơ DSP đối với các phân hệ nghiệp vụ chính của RSDV:

```mermaid
flowchart LR
    subgraph RSDV_System ["HỆ THỐNG KHỬ NHIỄU VÀ TRỰC QUAN HÓA RSDV"]
        UC1(["UC-01: Tải lên & Chuẩn hóa Âm thanh"])
        UC2(["UC-02: Khử nhiễu Thích ứng Đa tầng"])
        UC3(["UC-03: Trực quan hóa Sóng âm & Phổ Mel"])
        UC4(["UC-04: Kiểm âm Đối chứng Tức thời A/B"])
        UC5(["UC-05: Tải Ca bệnh Mẫu (Presets)"])
        UC6(["UC-06: Ghi chú Lâm sàng & Dấu mốc Bệnh án"])
        UC7(["UC-07: Đo đạc Chỉ số Định lượng SNR & Độ trễ"])
        UC8(["UC-08: Xuất Tệp Âm sạch & Báo cáo Chẩn đoán"])
    end

    Doctor["👨‍⚕️ Bác sĩ Hô hấp"]
    Researcher["🔬 Nhà nghiên cứu / Giám định viên"]
    DSP_Engine["⚙️ Động cơ DSP Pipeline"]

    Doctor --> UC1
    Doctor --> UC2
    Doctor --> UC3
    Doctor --> UC4
    Doctor --> UC5
    Doctor --> UC6
    Doctor --> UC8

    Researcher --> UC2
    Researcher --> UC4
    Researcher --> UC5
    Researcher --> UC7

    UC1 -.->|Kích hoạt ngầm| DSP_Engine
    UC2 -.->|Thực thi thuật toán| DSP_Engine
    UC3 -.->|Trích xuất ma trận STFT| DSP_Engine
```

#### 2.1.2. Biểu đồ phân rã ca sử dụng chi tiết

**Phân hệ 1: Tiếp nhận Âm thanh & Khử nhiễu Thích ứng**
```mermaid
flowchart TB
    Doctor["👨‍⚕️ Bác sĩ / Người dùng"]
    
    subgraph UC_Sub1 ["Phân hệ Tiếp nhận & Khử nhiễu"]
        UC1["UC-01: Tải lên tệp âm thanh"]
        UC1_1["1.1: Kiểm tra định dạng WAV/MP3"]
        UC1_2["1.2: Tái lấy mẫu 16.000 Hz Mono"]
        UC1_3["1.3: Chuẩn hóa biên độ Float32 [-1, 1]"]
        
        UC2["UC-02: Khởi chạy Pipeline Lọc"]
        UC2_1["2.1: Bộ lọc thông dải Butterworth 50-2000Hz"]
        UC2_2["2.2: Lọc thích ứng Spectral Gating"]
        UC2_3["2.3: Phân đoạn tiếng thở VAD"]
        UC2_4["2.4: Đo đạc SNR Gain thực tế"]
    end

    Doctor --> UC1
    Doctor --> UC2
    UC1 -.->|include| UC1_1
    UC1 -.->|include| UC1_2
    UC1 -.->|include| UC1_3
    UC2 -.->|include| UC2_1
    UC2 -.->|include| UC2_2
    UC2 -.->|include| UC2_3
    UC2 -.->|include| UC2_4
```

**Phân hệ 2: Trực quan hóa Phổ & Kiểm âm Thính chẩn A/B**
```mermaid
flowchart TB
    Doctor["👨‍⚕️ Bác sĩ Hô hấp"]

    subgraph UC_Sub2 ["Phân hệ Trực quan hóa & Kiểm âm"]
        UC3["UC-03: Trực quan hóa Đa tầng"]
        UC3_1["3.1: Vẽ Waveform Sóng âm Raw & Clean"]
        UC3_2["3.2: Vẽ 2D Mel Spectrogram Heatmap"]
        UC3_3["3.3: Hiển thị Dải tần số Âm bệnh học"]

        UC4["UC-04: Kiểm âm Đối chứng A/B"]
        UC4_1["4.1: Đồng bộ Playhead thời gian thực"]
        UC4_2["4.2: Chuyển đổi kênh tức thời (Phím Tab)"]
        UC4_3["4.3: Điều khiển Play/Pause (Phím Space)"]
    end

    Doctor --> UC3
    Doctor --> UC4
    UC3 -.->|include| UC3_1
    UC3 -.->|include| UC3_2
    UC3 -.->|include| UC3_3
    UC4 -.->|include| UC4_1
    UC4 -.->|include| UC4_2
    UC4 -.->|include| UC4_3
```

---

#### 2.1.3. Bảng đặc tả các Use Case cốt lõi

**Bảng 2.1: Bảng đặc tả Use Case UC-01: Tải lên & Chuẩn hóa Âm thanh Hô hấp**
- **Use Case ID:** `UC-01`
- **Tên Use Case:** Tải lên & Chuẩn hóa Âm thanh Hô hấp
- **Tác nhân:** Bác sĩ Hô hấp, Động cơ DSP (System)
- **Tiền điều kiện:** Máy chủ Backend FastAPI đang lắng nghe tại cổng 8000; người dùng đã mở giao diện Web.
- **Hậu điều kiện:** Tệp âm thanh được lưu trữ tại `backend/storage/raw/`, bản ghi `AudioMetadata` được tạo trong CSDL, dữ liệu dạng sóng được trả về Frontend.
- **Luồng sự kiện chính (Basic Flow):**
  1. Người dùng kéo thả hoặc bấm chọn tệp âm thanh (định dạng `.wav`, `.mp3`, `.ogg`, `.flac`) vào vùng tải lên.
  2. Frontend gửi yêu cầu `POST /api/audio/upload` chứa đối tượng `multipart/form-data`.
  3. Backend xác thực phần mở rộng tệp và dung lượng (giới hạn < 50MB).
  4. Module `audio_io.py` gọi hàm `load_and_resample()` để nạp dữ liệu âm thanh, chuyển đổi tự động về kênh đơn Mono, tần số mẫu chuẩn $f_s = 16.000\text{ Hz}$.
  5. Chuẩn hóa thang đo biên độ về khoảng số thực Float32 $[-1.0, 1.0]$.
  6. Backend tính toán thời lượng (Duration), công suất hiệu dụng (RMS Energy), gán mã định danh duy nhất UUID.
  7. Lưu tệp thô vào ổ đĩa và ghi bản ghi vào bảng `audio_metadata` trong SQLite.
  8. Phản hồi mã HTTP 200 kèm theo JSON chứa `audio_id`, `filename`, `duration`, `sampling_rate`.
- **Luồng ngoại lệ (Alternative Flow):**
  - *A1 - Định dạng tệp không hợp lệ:* Nếu tệp không phải âm thanh được hỗ trợ, trả về mã lỗi HTTP 400 "Unsupported audio format".
  - *A2 - Tệp âm thanh bị rỗng hoặc lỗi giải mã:* Trả về HTTP 422 "Audio decoding error - file corrupted".

**Bảng 2.2: Bảng đặc tả Use Case UC-02: Khử nhiễu Thích ứng Đa tầng**
- **Use Case ID:** `UC-02`
- **Tên Use Case:** Khử nhiễu Thích ứng Đa tầng (Adaptive Multi-stage Denoising)
- **Tác nhân:** Bác sĩ Hô hấp, Động cơ DSP
- **Tiền điều kiện:** Tệp âm thanh thô đã được tải lên và tồn tại `audio_id` hợp lệ.
- **Luồng sự kiện chính (Basic Flow):**
  1. Người dùng chọn hồ sơ khử nhiễu (Chiến lược: Cân bằng / Nhẹ nhàng / Triệt để / Chuyên dụng Ống nghe) và nhấn "Bắt đầu Khử nhiễu".
  2. Frontend gửi request `POST /api/audio/process/{audio_id}` kèm tham số `strategy`.
  3. `pipeline.py` khởi tạo tiến trình xử lý và thực hiện tuần tự qua 4 tầng:
     - *Tầng 1 (Bandpass Filter):* Bộ lọc Butterworth bậc 4 cắt tần số < 50 Hz (triệt tiêu tiếng cọ xát) và > 2.000 Hz (loại bỏ tiếng rít cao tần không thuộc đường thở).
     - *Tầng 2 (Spectral Gating):* Tính toán biến đổi STFT (Hann window 1024 điểm, bước nhảy hop length 256), ước lượng ngưỡng nhiễu từ các frame có năng lượng đáy thấp nhất, áp dụng mặt nạ phổ thích ứng để trừ tạp âm.
     - *Tầng 3 (Respiratory VAD):* Phân đoạn tiếng thở tích cực dựa trên ngưỡng năng lượng kết hợp trễ (Hysteresis), làm sạch nền của các khoảng ngưng thở.
     - *Tầng 4 (Metrics Extraction):* Đo đạc công suất tín hiệu trước và sau lọc, tính toán mức tăng ích $\Delta\text{SNR} = \text{SNR}_{\text{clean}} - \text{SNR}_{\text{raw}}$.
  4. Xuất mảng âm thanh sạch ra tệp `.wav` tại `backend/storage/cleaned/{audio_id}.wav`.
  5. Cập nhật thông tin vào bảng `processing_jobs`.
  6. Trả về kết quả HTTP 200 với các chỉ số `snr_gain_db`, `processing_time_ms`, URL tệp sạch.

**Bảng 2.3: Bảng đặc tả Use Case UC-04: Kiểm âm Đối chứng Tức thời A/B (Auditory A/B Switch)**
- **Use Case ID:** `UC-04`
- **Tên Use Case:** Kiểm âm Đối chứng Tức thời A/B
- **Tác nhân:** Bác sĩ Hô hấp
- **Tiền điều kiện:** Cả hai luồng âm thanh Raw và Clean đã được nạp sẵn vào hai thực thể WaveSurfer trên giao diện.
- **Luồng sự kiện chính:**
  1. Bác sĩ nhấn phím `Space` để kích hoạt phát đồng thời cả hai luồng âm thanh.
  2. Trục Playhead trên cả hai đồ thị sóng di chuyển đồng tốc với nhau.
  3. Mặc định kênh âm thanh phát ra tai nghe là Kênh A (Raw Audio) với âm lượng 100%, kênh B (Clean Audio) ở trạng thái Mute (âm lượng 0%).
  4. Bác sĩ nhấn phím `Tab` trên bàn phím.
  5. Sự kiện `keydown` kích hoạt bộ chuyển mạch tức thời (Web Audio GainNode Switch): Kênh A lập tức chuyển sang Mute (0%), kênh B chuyển sang 100% âm lượng trong thời gian < 3ms.
  6. Giao diện thay đổi huy hiệu (Badge) từ "Đang nghe: Âm thanh Thô" sang "Đang nghe: Âm thanh Đã lọc".
  7. Bác sĩ lắng nghe sự khác biệt rõ rệt về độ trong trẻo của âm phế nang mà không bị gián đoạn tiến trình nghe.

---

### 2.2. Biểu đồ hoạt động (Activity Diagrams)

#### 2.2.1. Quy trình Khử nhiễu Thích ứng 4 Tầng
Sơ đồ mô tả quy trình tuần tự xử lý tín hiệu số từ tệp thô đến khi tạo ra tệp âm thanh sạch:

```mermaid
flowchart TD
    Start([Bắt đầu: Nhận tín hiệu Float32 16kHz]) --> Step1[Tầng 1: Lọc Thông Dải Butterworth Bậc 4]
    Step1 --> CheckFriction{Kiểm tra Tạp âm Dải thấp < 50Hz}
    CheckFriction -->|Triệt tiêu| Step2[Tầng 2: Biến đổi STFT với Hann Window]
    Step2 --> NoiseEst[Ước lượng Phổ Nhiễu Nền từ Khung Năng lượng Thấp]
    NoiseEst --> SpecGate[Áp dụng Mặt nạ Phổ Thích ứng Adaptive Spectral Mask]
    SpecGate --> InvSTFT[Biến đổi Ngược ISTFT tái tạo Tín hiệu Miền Thời gian]
    InvSTFT --> Step3[Tầng 3: Phát hiện Phân đoạn Thở VAD]
    Step3 --> Hysteresis{Năng lượng vượt ngưỡng Hysteresis?}
    Hysteresis -->|Có tiếng thở| PreserveAudio[Giữ nguyên vẹn Âm Phế nang]
    Hysteresis -->|Khoảng lặng sinh học| SuppressFloor[Dập tắt tạp âm nền triệt để]
    PreserveAudio --> Step4[Tầng 4: Đo đạc SNR Gain & Kiểm tra Clipping]
    SuppressFloor --> Step4
    Step4 --> Normalize[Chuẩn hóa Biên độ Đỉnh Peak Normalization]
    Normalize --> ExportWav[Ghi tệp WAV Cleaned & Cập nhật CSDL]
    ExportWav --> End([Kết thúc: Trả về Kết quả JSON])
```

#### 2.2.2. Quy trình Phát âm thanh Đồng bộ và Đổi chế độ A/B
```mermaid
flowchart TD
    StartPlay([Người dùng nhấn Play / Phím Space]) --> CheckState{Trạng thái hiện tại?}
    CheckState -->|Đang Pause| StartBoth[Phát song song Player A và Player B]
    CheckState -->|Đang Play| PauseBoth[Tạm dừng đồng thời Player A và Player B]
    
    StartBoth --> SyncTime[Khóa Playhead: currentTime_B = currentTime_A]
    SyncTime --> LoopListen{Lắng nghe phím tắt Tab / Bấm nút A/B}
    
    LoopListen -->|Phím Tab| ToggleAudio{Kênh đang hoạt động?}
    ToggleAudio -->|Đang nghe Raw A| SwitchToClean[Set Gain A = 0, Set Gain B = 100%]
    ToggleAudio -->|Đang nghe Clean B| SwitchToRaw[Set Gain B = 0, Set Gain A = 100%]
    
    SwitchToClean --> UpdateUI[Cập nhật UI: Đang nghe Âm thanh Sạch]
    SwitchToRaw --> UpdateUI2[Cập nhật UI: Đang nghe Âm thanh Thô]
    UpdateUI --> LoopListen
    UpdateUI2 --> LoopListen
```

#### 2.2.3. Quy trình Trực quan hóa Ma trận Phổ 2D
```mermaid
flowchart TD
    StartSpec([Nhận mảng Tín hiệu Âm thanh]) --> CalcSTFT[Tính toán STFT ma trận phức]
    CalcSTFT --> PowerSpec[Chuyển đổi sang Phổ Công suất Năng lượng: Mag^2]
    PowerSpec --> MelFilter[Nhân chập với Bộ lọc Mel 128 dải tần]
    MelFilter --> ToDecibel[Chuyển đổi Thang đo Logarithmic Decibel: 10*log10]
    ToDecibel --> NormMatrix[Chuẩn hóa ma trận trong dải [-80 dB, 0 dB]]
    NormMatrix --> CanvasInit[Khởi tạo HTML5 Canvas 2D Context]
    CanvasInit --> ColorMap[Ánh xạ giá trị dB sang Bảng màu Nhiệt Viridis/Inferno]
    ColorMap --> RenderPixels[Vẽ từng pixel tần số - thời gian lên Canvas]
    RenderPixels --> DrawGrid[Vẽ lưới tọa độ Thời gian s và Tần số Hz]
    DrawGrid --> EndSpec([Hoàn thành trực quan hóa Spectrogram])
```

---

### 2.3. Biểu đồ tuần tự (Sequence Diagrams)

#### 2.3.1. Vòng đời Xử lý tệp âm thanh và Trích xuất Chỉ số SNR
```mermaid
sequenceDiagram
    autonumber
    actor Doctor as 👨‍⚕️ Bác sĩ
    participant UI as 🖥️ React Dashboard
    participant API as 🚀 FastAPI Router
    participant Pipe as ⚙️ Processing Pipeline
    participant DSP as 🎛️ DSP Engine (Scipy/STFT)
    participant DB as 🗄️ SQLite Database

    Doctor->>UI: Chọn hồ sơ lọc & nhấn "Bắt đầu Khử nhiễu"
    UI->>API: POST /api/audio/process/{audio_id} {strategy: 'balanced'}
    API->>DB: Truy vấn AudioMetadata theo audio_id
    DB-->>API: Trả về đường dẫn tệp thô: storage/raw/{audio_id}.wav
    API->>Pipe: run_pipeline(raw_audio_path, strategy_config)
    
    Pipe->>DSP: apply_butterworth_bandpass(50Hz, 2000Hz, order=4)
    DSP-->>Pipe: Tín hiệu sau lọc dải
    Pipe->>DSP: apply_adaptive_spectral_gating(n_fft=1024, hop=256)
    DSP-->>Pipe: Tín hiệu sau khử nhiễu phổ
    Pipe->>DSP: apply_respiratory_vad(hysteresis=True)
    DSP-->>Pipe: Tín hiệu làm sạch hoàn toàn
    Pipe->>DSP: calculate_snr_gain(raw_signal, clean_signal)
    DSP-->>Pipe: SNR Gain: +13.8 dB, Latency: 48 ms
    
    Pipe-->>API: Trả về cleaned_file_path & metrics
    API->>DB: Lưu bản ghi ProcessingJob (job_id, snr_gain, latency)
    DB-->>API: Đã lưu thành công
    API-->>UI: HTTP 200 {clean_url, snr_gain: 13.8, latency_ms: 48}
    UI->>Doctor: Cập nhật giao diện: WaveSurfer B, Heatmap Spectrogram, Thẻ chỉ số
```

#### 2.3.2. Đồng bộ Playhead Dual WaveSurfer & Instant Switch
```mermaid
sequenceDiagram
    autonumber
    actor Doctor as 👨‍⚕️ Bác sĩ
    participant UI as 🖥️ UI Event Listener
    participant WS_A as 🌊 WaveSurfer A (Raw)
    participant WS_B as 🌊 WaveSurfer B (Clean)
    participant AudioCtx as 🔊 Web Audio API GainNodes

    Doctor->>UI: Nhấn phím Space
    UI->>WS_A: ws_a.play()
    UI->>WS_B: ws_b.play()
    Note over WS_A,WS_B: Cả hai luồng cùng chạy đồng bộ mili-giây
    
    WS_A->>UI: on('audioprocess', time)
    UI->>WS_B: setTime(time) if drift > 20ms
    
    Doctor->>UI: Nhấn phím Tab (Instant Switch)
    UI->>AudioCtx: gainNodeA.gain.setValueAtTime(0, now)
    UI->>AudioCtx: gainNodeB.gain.setValueAtTime(1, now)
    Note over AudioCtx: Âm thanh lập tức chuyển sang Kênh B sạch nhiễu
    UI->>Doctor: Cập nhật chỉ báo đèn xanh: "Đang nghe Clean Audio"
```

---

### 2.4. Mô hình thực thể liên kết (ERD Phân tích)

```mermaid
erDiagram
    AUDIO_METADATA ||--o{ PROCESSING_JOBS : "được xử lý bởi"
    AUDIO_METADATA ||--o{ CLINICAL_ANNOTATIONS : "chứa các ghi chú"
    
    AUDIO_METADATA {
        string id PK "Mã UUID bản ghi"
        string filename "Tên tệp gốc"
        float duration_sec "Thời lượng giây"
        int sampling_rate "Tần số lấy mẫu (16000Hz)"
        int channels "Số kênh âm thanh (1)"
        float rms_energy "Năng lượng hiệu dụng"
        string file_path "Đường dẫn tệp thô trên đĩa"
        datetime created_at "Thời gian tạo"
    }

    PROCESSING_JOBS {
        string id PK "Mã UUID phiên xử lý"
        string audio_id FK "Khóa ngoại tới AUDIO_METADATA"
        string strategy "Chiến lược lọc (mild/balanced/aggressive)"
        float snr_gain_db "Độ cải thiện SNR (dB)"
        float processing_time_ms "Thời gian tính toán (ms)"
        string cleaned_file_path "Đường dẫn tệp đã làm sạch"
        string status "Trạng thái (completed/failed)"
        datetime processed_at "Thời gian thực hiện"
    }

    CLINICAL_ANNOTATIONS {
        string id PK "Mã UUID ghi chú"
        string audio_id FK "Khóa ngoại tới AUDIO_METADATA"
        float start_time_sec "Thời điểm bắt đầu bất thường"
        float end_time_sec "Thời điểm kết thúc bất thường"
        string sound_type "Loại âm (wheeze/crackle/stridor/normal)"
        string severity "Mức độ nghiêm trọng (mild/moderate/severe)"
        string doctor_notes "Nhận định chẩn đoán của bác sĩ"
        datetime created_at "Thời gian ghi chú"
    }
```

---

## CHƯƠNG 3. THIẾT KẾ HỆ THỐNG

### 3.1. Kiến trúc hệ thống

#### 3.1.1. Mô hình kiến trúc tổng thể 4 phân tầng
Hệ thống RSDV được tổ chức theo kiến trúc phân tầng chuyên biệt cho xử lý tín hiệu y tế (Biomedical DSP Layered Architecture), đảm bảo tính module hóa cao, dễ dàng mở rộng và độc lập tuyệt đối giữa giao diện và các thuật toán tính toán toán học:

```mermaid
flowchart TD
    subgraph Layer1 ["TẦNG 1: GIAO DIỆN Y KHOA & TRỰC QUAN HÓA (REACT VITE)"]
        UI1["Bảng điều khiển Bác sĩ (Doctor Dashboard)"]
        UI2["Trình phát Sóng đôi Đồng bộ (Dual WaveSurfer.js)"]
        UI3["Vẽ Phổ nhiệt Năng lượng (HTML5 Spectrogram Canvas 2D)"]
        UI4["Hộp thoại Ca bệnh Mẫu & Ghi chú Bệnh án Y khoa"]
    end

    subgraph Layer2 ["TẦNG 2: DỊCH VỤ MÁY CHỦ & ĐIỀU PHỐI API (FASTAPI)"]
        API1["Routes Audio: /upload, /process, /stream"]
        API2["Routes Spectrogram: /matrix, /mel"]
        API3["Routes Presets: /presets (Clinical Preset Loader)"]
        API4["Routes Annotation: /annotations (Bệnh án điện tử)"]
    end

    subgraph Layer3 ["TẦNG 3: ĐỘNG CƠ XỬ LÝ TÍN HIỆU SỐ Y SINH (DSP CORE ENGINE)"]
        DSP1["Audio I/O & Resampling: Librosa / SoundFile 16kHz"]
        DSP2["Bộ lọc Thông dải Butterworth bậc 4 (50 - 2000Hz)"]
        DSP3["Khử nhiễu Thích ứng Phổ (Adaptive Spectral Gating)"]
        DSP4["Tách Phân đoạn Tiếng thở (Respiratory VAD with Hysteresis)"]
        DSP5["Tích hợp Trí tuệ Nhân tạo Sâu (ONNX Runtime Engine)"]
    end

    subgraph Layer4 ["TẦNG 4: LƯU TRỮ VÀ DỮ LIỆU Y TẾ (HYBRID DATA PERSISTENCE)"]
        DB1["Cơ sở dữ liệu SQLite: audio_metadata, processing_jobs, annotations"]
        FS1["Hệ thống Tệp Lưu trữ: /storage/raw/ & /storage/cleaned/"]
        FS2["Kho Tệp Ca bệnh Mẫu: /storage/presets/"]
    end

    Layer1 <===>|HTTP REST API & Streaming Audio Blob| Layer2
    Layer2 <===>|Gọi trực tiếp Python Callables| Layer3
    Layer2 <===>|SQLAlchemy ORM & OS File I/O| Layer4
    Layer3 <===>|Đọc / Ghi mảng tín hiệu âm thanh| Layer4
```

#### 3.1.2. Đặc tả các phân tầng kiến trúc
1. **Tầng Giao diện Y khoa (Presentation Layer):**
   - Chịu trách nhiệm tương tác trực quan với nhân viên y tế.
   - Quản lý trạng thái phát sóng âm thanh đồng bộ thông qua Web Audio API.
   - Tối ưu hóa việc render ma trận phổ 2D trên Canvas để đảm bảo tỷ lệ khung hình 60 FPS mà không gây nghẽn luồng xử lý UI (UI Thread).
2. **Tầng Dịch vụ API (API Gateway / Service Layer):**
   - Xây dựng trên khung FastAPI không đồng bộ (Asynchronous ASGI).
   - Kiểm duyệt dữ liệu đầu vào (Input Validation) thông qua các schema Pydantic chặt chẽ.
   - Hỗ trợ truyền phát âm thanh phân đoạn (Chunked Audio Streaming) với HTTP Range Requests, cho phép phát ngay lập tức mà không cần tải xong toàn bộ tệp.
3. **Tầng Động cơ DSP Y sinh (DSP Core Engine):**
   - Đóng gói toàn bộ các thuật toán xử lý tín hiệu số dưới dạng các module độc lập.
   - Tuân thủ tính xác định (Deterministic Processing): Cùng một tệp âm thanh và cấu hình đầu vào sẽ cho ra kết quả khử nhiễu hoàn toàn nhất quán.
4. **Tầng Dữ liệu (Persistence Layer):**
   - Ứng dụng mô hình lưu trữ lai (Hybrid Storage): Dữ liệu quan hệ và siêu dữ liệu lưu trong SQLite, dữ liệu nhị phân âm thanh nặng lưu trực tiếp trên hệ thống tệp đĩa cứng (File System).

#### 3.1.3. Các mục tiêu thiết kế kiến trúc y sinh
- **Bảo toàn tính toàn vẹn lâm sàng:** Thuật toán lọc không được phép tạo ra các thành phần giả tạo (Audio Artifacts / Musical Noise) gây nhầm lẫn với tiếng ran rít hoặc ran nổ của bệnh nhân.
- **Tiêu chuẩn hóa định dạng lấy mẫu y sinh:** Mọi nguồn âm thanh đầu vào bất kể từ điện thoại, máy ghi âm hay ống nghe chuyên dụng đều được đưa về tần số lấy mẫu y tế chuẩn $f_s = 16.000\text{ Hz}$, kênh đơn Mono, độ phân giải 16-bit.
- **Khả năng triển khai độc lập (Edge / On-premise Deployment):** Toàn bộ hệ thống chạy độc lập trên một máy tính cá nhân hoặc máy trạm bệnh viện chỉ với một câu lệnh khởi chạy duy nhất, không phụ thuộc kết nối Internet ra bên ngoài.

---

### 3.2. Thiết kế lớp (Class Diagrams)

#### 3.2.1. Sơ đồ lớp phân hệ Động cơ DSP & Trích xuất Đặc trưng
```mermaid
classDiagram
    class AudioIO {
        +load_and_resample(file_path: str, target_sr: int) Tuple[ndarray, int]
        +save_wav(file_path: str, audio: ndarray, sr: int) void
        +normalize_audio(audio: ndarray) ndarray
        +calculate_rms(audio: ndarray) float
    }

    class ButterworthFilter {
        -lowcut: float = 50.0
        -highcut: float = 2000.0
        -order: int = 4
        +apply(audio: ndarray, sr: int) ndarray
        -design_bandpass(sr: int) Tuple[ndarray, ndarray]
    }

    class AdaptiveSpectralGater {
        -n_fft: int = 1024
        -hop_length: int = 256
        -n_std_thresh: float = 1.5
        -prop_decrease: float = 1.0
        +apply(audio: ndarray, sr: int) ndarray
        -estimate_noise_profile(stft_matrix: ndarray) ndarray
        -compute_spectral_mask(stft_matrix: ndarray, noise_thresh: ndarray) ndarray
    }

    class RespiratoryVAD {
        -frame_length: int = 512
        -hop_length: int = 128
        -energy_thresh: float = 0.02
        +apply(audio: ndarray, sr: int) Tuple[ndarray, List[Tuple[float, float]]]
        -compute_energy_envelope(audio: ndarray) ndarray
        -apply_hysteresis(envelope: ndarray) ndarray
    }

    class SpectrogramEngine {
        -n_fft: int = 1024
        -hop_length: int = 256
        -n_mels: int = 128
        +generate_mel_spectrogram(audio: ndarray, sr: int) ndarray
        +matrix_to_decibel(matrix: ndarray) ndarray
        +export_heatmap_data(audio: ndarray, sr: int) Dict
    }

    class ProcessingPipeline {
        -filter: ButterworthFilter
        -gater: AdaptiveSpectralGater
        -vad: RespiratoryVAD
        -spec_engine: SpectrogramEngine
        +process(raw_audio_path: str, strategy: str) Dict
        +calculate_metrics(raw: ndarray, clean: ndarray) Dict
    }

    ProcessingPipeline --> AudioIO
    ProcessingPipeline --> ButterworthFilter
    ProcessingPipeline --> AdaptiveSpectralGater
    ProcessingPipeline --> RespiratoryVAD
    ProcessingPipeline --> SpectrogramEngine
```

#### 3.2.2. Sơ đồ lớp phân hệ API Controllers & Service Router
```mermaid
classDiagram
    class AudioRouter {
        +upload_audio(file: UploadFile) JSONResponse
        +process_audio(audio_id: str, request: ProcessRequest) JSONResponse
        +stream_audio(audio_id: str, type: str) StreamingResponse
        +get_audio_metadata(audio_id: str) JSONResponse
    }

    class SpectrogramRouter {
        +get_spectrogram_data(audio_id: str, type: str) JSONResponse
        +get_comparative_spectrogram(audio_id: str) JSONResponse
    }

    class PresetsRouter {
        +list_clinical_presets() JSONResponse
        +load_preset(preset_id: str) JSONResponse
    }

    class AnnotationRouter {
        +create_annotation(annotation: AnnotationCreate) JSONResponse
        +get_annotations_by_audio(audio_id: str) JSONResponse
        +delete_annotation(annotation_id: str) JSONResponse
    }

    AudioRouter --> ProcessingPipeline : "kích hoạt xử lý"
    SpectrogramRouter --> SpectrogramEngine : "trích xuất ma trận"
```

#### 3.2.3. Sơ đồ lớp phân hệ Quản lý Dữ liệu Y tế SQLite
```mermaid
classDiagram
    class DatabaseSessionManager {
        -engine: Engine
        -SessionLocal: sessionmaker
        +get_db() Generator
        +init_db() void
    }

    class AudioMetadataModel {
        +id: String [PK]
        +filename: String
        +duration_sec: Float
        +sampling_rate: Integer
        +channels: Integer
        +rms_energy: Float
        +file_path: String
        +created_at: DateTime
    }

    class ProcessingJobModel {
        +id: String [PK]
        +audio_id: String [FK]
        +strategy: String
        +snr_gain_db: Float
        +processing_time_ms: Float
        +cleaned_file_path: String
        +status: String
        +processed_at: DateTime
    }

    class ClinicalAnnotationModel {
        +id: String [PK]
        +audio_id: String [FK]
        +start_time_sec: Float
        +end_time_sec: Float
        +sound_type: String
        +severity: String
        +doctor_notes: String
        +created_at: DateTime
    }

    DatabaseSessionManager ..> AudioMetadataModel
    DatabaseSessionManager ..> ProcessingJobModel
    DatabaseSessionManager ..> ClinicalAnnotationModel
    AudioMetadataModel "1" -- "0..*" ProcessingJobModel : "has"
    AudioMetadataModel "1" -- "0..*" ClinicalAnnotationModel : "has"
```

---

### 3.3. Thiết kế Cơ sở dữ liệu

#### 3.3.1. Chiến lược lưu trữ lai Hybrid Storage
Đối với các hệ thống xử lý tín hiệu âm thanh y tế, việc lưu trực tiếp tệp âm thanh dưới dạng nhị phân (BLOB) vào cơ sở dữ liệu quan hệ sẽ khiến dung lượng CSDL tăng vọt, gây nghẽn bộ nhớ cache I/O và làm chậm nghiêm trọng các truy vấn đọc/ghi. Do đó, RSDV áp dụng mô hình Hybrid Storage:
- **Cơ sở dữ liệu SQLite (`backend/storage/metadata.db`):** Chỉ lưu trữ các trường dữ liệu quan hệ có kích thước nhỏ, chỉ số định lượng, kết quả đo đạc SNR và thông tin chẩn đoán lâm sàng của bác sĩ.
- **Hệ thống tệp cục bộ (`backend/storage/`):** Lưu trữ các tệp âm thanh thực tế theo các thư mục con phân loại:
  - `storage/raw/`: Lưu trữ các tệp gốc chưa qua xử lý.
  - `storage/cleaned/`: Lưu trữ các tệp sau khi đã qua chuỗi lọc DSP.
  - `storage/presets/`: Lưu trữ 4 ca bệnh mẫu lâm sàng chuẩn hóa.

#### 3.3.2. Sơ đồ Thực thể CSDL Chi tiết (Database Schema ERD)
```mermaid
erDiagram
    audio_metadata ||--o{ processing_jobs : "1:N"
    audio_metadata ||--o{ clinical_annotations : "1:N"

    audio_metadata {
        VARCHAR_36 id PK "UUID chuỗi 36 ký tự"
        VARCHAR_255 filename "Tên tệp gốc khi upload"
        FLOAT duration_sec "Thời lượng âm thanh tính theo giây"
        INTEGER sampling_rate "Tần số lấy mẫu (mặc định 16000)"
        INTEGER channels "Số kênh (chuẩn hóa = 1 Mono)"
        FLOAT rms_energy "Năng lượng hiệu dụng của tín hiệu thô"
        VARCHAR_500 file_path "Đường dẫn tuyệt đối/tương đối tới file thô"
        DATETIME created_at "Thời điểm tệp được tạo trong hệ thống"
    }

    processing_jobs {
        VARCHAR_36 id PK "UUID chuỗi 36 ký tự"
        VARCHAR_36 audio_id FK "Liên kết tới audio_metadata.id"
        VARCHAR_50 strategy "Hồ sơ chiến lược lọc áp dụng"
        FLOAT snr_gain_db "Mức tăng ích SNR tính bằng dB"
        FLOAT processing_time_ms "Thời gian thực thi pipeline (ms)"
        VARCHAR_500 cleaned_file_path "Đường dẫn tệp âm thanh đã lọc sạch"
        VARCHAR_20 status "Trạng thái phiên: completed / failed"
        DATETIME processed_at "Thời điểm hoàn tất xử lý"
    }

    clinical_annotations {
        VARCHAR_36 id PK "UUID chuỗi 36 ký tự"
        VARCHAR_36 audio_id FK "Liên kết tới audio_metadata.id"
        FLOAT start_time_sec "Thời điểm bắt đầu dải bất thường (giây)"
        FLOAT end_time_sec "Thời điểm kết thúc dải bất thường (giây)"
        VARCHAR_50 sound_type "Loại âm: wheeze, crackle, stridor, normal"
        VARCHAR_20 severity "Mức độ: mild, moderate, severe"
        TEXT doctor_notes "Ghi chú chẩn đoán chi tiết của bác sĩ"
        DATETIME created_at "Thời điểm tạo ghi chú"
    }
```

#### 3.3.3. Từ điển dữ liệu (Data Dictionary) chi tiết 3 Bảng cốt lõi

**Bảng 3.1: Từ điển dữ liệu chi tiết cho bảng `audio_metadata`**

| Tên trường | Kiểu dữ liệu | Khóa | Cho phép NULL | Giá trị mặc định | Diễn giải chức năng |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(36) | PK | NO | uuid4() | Định danh duy nhất của bản ghi âm thanh. |
| `filename` | VARCHAR(255) | - | NO | - | Tên tệp do người dùng tải lên. |
| `duration_sec` | FLOAT | - | NO | 0.0 | Độ dài tệp âm thanh (giây), độ chính xác 3 chữ số thập phân. |
| `sampling_rate` | INTEGER | - | NO | 16000 | Tần số mẫu được chuẩn hóa về 16.000 Hz. |
| `channels` | INTEGER | - | NO | 1 | Số kênh âm thanh (1 = Mono). |
| `rms_energy` | FLOAT | - | NO | 0.0 | Công suất trung bình bình phương (RMS) của tín hiệu thô. |
| `file_path` | VARCHAR(500) | - | NO | - | Đường dẫn lưu trữ tệp trên đĩa cứng máy chủ. |
| `created_at` | DATETIME | - | NO | utcnow() | Thời điểm bản ghi được tạo trong cơ sở dữ liệu. |

**Bảng 3.2: Từ điển dữ liệu chi tiết cho bảng `processing_jobs`**

| Tên trường | Kiểu dữ liệu | Khóa | Cho phép NULL | Giá trị mặc định | Diễn giải chức năng |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(36) | PK | NO | uuid4() | Định danh duy nhất của phiên xử lý. |
| `audio_id` | VARCHAR(36) | FK | NO | - | Khóa ngoại tham chiếu tới `audio_metadata.id`. |
| `strategy` | VARCHAR(50) | - | NO | 'balanced' | Tên cấu hình bộ lọc: `mild`, `balanced`, `aggressive`, `stethoscope`. |
| `snr_gain_db` | FLOAT | - | NO | 0.0 | Tỷ số cải thiện chất lượng tín hiệu sau lọc (dB). |
| `processing_time_ms`| FLOAT | - | NO | 0.0 | Thời gian thực thi toàn bộ pipeline (mili-giây). |
| `cleaned_file_path`| VARCHAR(500) | - | NO | - | Đường dẫn lưu trữ tệp sau khi đã làm sạch nhiễu. |
| `status` | VARCHAR(20) | - | NO | 'completed' | Trạng thái của job (`pending`, `completed`, `failed`). |
| `processed_at` | DATETIME | - | NO | utcnow() | Thời điểm hoàn tất công việc lọc. |

**Bảng 3.3: Từ điển dữ liệu chi tiết cho bảng `clinical_annotations`**

| Tên trường | Kiểu dữ liệu | Khóa | Cho phép NULL | Giá trị mặc định | Diễn giải chức năng |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(36) | PK | NO | uuid4() | Định danh duy nhất của ghi chú lâm sàng. |
| `audio_id` | VARCHAR(36) | FK | NO | - | Khóa ngoại tham chiếu tới `audio_metadata.id`. |
| `start_time_sec` | FLOAT | - | NO | 0.0 | Dấu mốc giây bắt đầu nghe thấy âm bệnh lý. |
| `end_time_sec` | FLOAT | - | NO | 0.0 | Dấu mốc giây kết thúc âm bệnh lý. |
| `sound_type` | VARCHAR(50) | - | NO | 'wheeze' | Loại âm bất thường: `normal`, `wheeze`, `crackle`, `stridor`, `cough`. |
| `severity` | VARCHAR(20) | - | YES | 'moderate' | Mức độ bệnh cảnh: `mild`, `moderate`, `severe`. |
| `doctor_notes` | TEXT | - | YES | - | Mô tả lâm sàng chi tiết của bác sĩ điều trị. |
| `created_at` | DATETIME | - | NO | utcnow() | Thời điểm bác sĩ tạo ghi chú. |

---

### 3.4. Thiết kế mẫu biểu và giao diện giao tiếp
Giao diện người dùng RSDV được xây dựng dựa trên triết lý **Clinical Dark Mode** – phong cách giao diện tối ưu hóa cho môi trường phòng khám và buồng chẩn đoán hình ảnh:
1. **Thanh Điều hướng & Trạng thái Hệ thống (Top Bar):**
   - Hiển thị logo y tế, trạng thái kết nối Backend API (đèn LED xanh báo hiệu hoạt động bình thường).
   - Menu tải ca bệnh mẫu lâm sàng (Clinical Presets Drawer) với 4 ca bệnh: *Thở bình thường, Hen phế quản (Wheeze), Viêm phổi (Crackle), Cơn ho cấp (Cough)*.
2. **Khu vực Trực quan hóa Sóng âm Kép (Dual WaveSurfer Visualizer):**
   - Nửa trên: Dạng sóng âm thanh thô (Raw Audio Waveform) màu cam hổ phách, thể hiện biên độ dao động kèm nhiễu nền hỗn độn.
   - Nửa dưới: Dạng sóng âm thanh đã lọc sạch (Clean Audio Waveform) màu xanh ngọc y sinh, thể hiện rõ các chu kỳ hít vào - thở ra nhịp nhàng với biên độ nền phẳng lặng.
   - Trục Playhead chạy dọc xuyên suốt cả hai đồ thị sóng, bảo đảm sự đồng bộ tuyệt đối về mặt trực giác.
3. **Khu vực Phổ nhiệt Năng lượng 2D (Dual Spectrogram Heatmap):**
   - Trục hoành: Thời gian thực thi (giây).
   - Trục tung: Tần số âm học (0 đến 4.000 Hz).
   - Thang màu nhiệt: Thang màu chuyên dụng (Dark Indigo $\rightarrow$ Purple $\rightarrow$ Yellow) thể hiện cường độ năng lượng từ -80 dB đến 0 dB. Bác sĩ có thể nhìn thấy rõ các dải sóng liên tục (dạng sọc ngang) của tiếng ran rít Hen phế quản hoặc các vệt xung năng lượng ngắt quãng của tiếng ran nổ Viêm phổi.
4. **Bảng Thống kê Chỉ số Đo đạc (Metrics Dashboard):**
   - Thẻ Tăng ích Tỷ số Tín hiệu trên Nhiễu ($\Delta\text{SNR}$ Gain): Hiển thị mức cải thiện tính bằng dB (ví dụ: `+14.2 dB`).
   - Thẻ Thời gian Xử lý (Latency): Hiển thị mili-giây (ví dụ: `42 ms`).
   - Nút Chuyển kênh Thính chẩn A/B (Instant Switch) nổi bật, cho phép bấm chuột hoặc bấm phím tắt `Tab`.
5. **Ngăn Kéo Ghi chú Chẩn đoán Bệnh án (Clinical Annotation Drawer):**
   - Cho phép bác sĩ click chọn một khoảng thời gian trên sóng âm, gán nhãn loại âm bệnh, chọn mức độ và nhập chẩn đoán lâm sàng để lưu trữ vào bệnh án điện tử.

---

## CHƯƠNG 4. TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG

### 4.1. Kết quả triển khai giao diện thực tế
Nền tảng RSDV đã được hiện thực hóa trọn vẹn cả hai phân hệ Backend và Frontend, hoạt động ổn định trên môi trường máy trạm độc lập:
- **Backend API:** Khởi chạy thành công tại địa chỉ `http://127.0.0.1:8000`, cung cấp đầy đủ tài liệu đặc tả Swagger/OpenAPI tương tác tại `/docs`.
- **Frontend Dashboard:** Khởi chạy thành công tại địa chỉ `http://localhost:5173`, tích hợp trọn vẹn các thành phần giao tiếp tương tác với người dùng.
- **Thư viện Testset Âm thanh Thực tế:** Tích hợp sẵn bộ tệp âm thanh có nhiễu thực tế tại thư mục `testset_audio/`:
  - `Crackles_pneumoniaO.ogg.mp3`: Bản ghi lâm sàng tiếng ran nổ viêm phổi có lẫn tiếng ồn phòng khám và tạp âm màng nghe.
  - `Wheeze2O.ogg.mp3`: Bản ghi tiếng ran rít hen suyễn nguyên bản có nhiễu nền môi trường.
  - `Stridor_2OGG.ogg`: Bản ghi tiếng rít thanh quản bệnh lý.

---

### 4.2. Đánh giá hệ thống và kết quả kiểm thử

#### 4.2.1. Bảng thống kê kết quả kiểm thử tự động (62 Unit Tests)
Hệ thống áp dụng phương pháp phát triển hướng kiểm thử nghiêm ngặt (Test-Driven Development). Toàn bộ 62 ca kiểm thử đơn vị và tích hợp trong thư mục `backend/tests/` đều vượt qua với tỷ lệ thành công 100%:

**Bảng 4.1: Bảng thống kê kết quả kiểm thử tự động (Pytest Suite)**

| STT | Tệp kiểm thử (Test Suite) | Số lượng Test | Tỷ lệ Đạt | Các chức năng được kiểm định chính |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `test_audio_io.py` | 3 | 100% (3/3) | Kiểm định đọc tệp WAV, chuyển đổi Mono, chuẩn hóa biên độ Float32 [-1, 1]. |
| **2** | `test_filters.py` | 3 | 100% (3/3) | Kiểm định bộ lọc Butterworth: Độ dốc cắt tần số < 50Hz và > 2000Hz, kiểm tra pha tín hiệu. |
| **3** | `test_spectral.py` | 3 | 100% (3/3) | Kiểm định thuật toán Adaptive Spectral Gating: Ước lượng phổ nhiễu, mặt nạ phổ, khử nhiễu dừng. |
| **4** | `test_vad.py` | 3 | 100% (3/3) | Kiểm định phát hiện phân đoạn tiếng thở hô hấp, ngưỡng năng lượng Hysteresis. |
| **5** | `test_bio_acoustic.py` | 5 | 100% (5/5) | Kiểm định thuật toán tách tiếng tim khỏi tiếng phổi, bảo toàn dải tần âm bệnh học. |
| **6** | `test_dl_onnx.py` | 5 | 100% (5/5) | Kiểm định bộ nạp mô hình ONNX Runtime, tính toàn vẹn Tensor đầu ra trên CPU. |
| **7** | `test_spectrogram.py` | 3 | 100% (3/3) | Kiểm định trích xuất ma trận STFT, Mel Spectrogram và chuyển đổi thang đo Decibel. |
| **8** | `test_strategy_profiles.py` | 6 | 100% (6/6) | Kiểm định 4 hồ sơ chiến lược lọc: Mild, Balanced, Aggressive, Stethoscope. |
| **9** | `test_database.py` | 2 | 100% (2/2) | Kiểm định thao tác CRUD trên SQLite, tính toàn vẹn khóa ngoại SQLAlchemy. |
| **10** | `test_api_upload.py` | 4 | 100% (4/4) | Kiểm định endpoint `POST /api/audio/upload`, kiểm tra lỗi định dạng tệp và kích thước. |
| **11** | `test_api_process.py` | 2 | 100% (2/2) | Kiểm định endpoint `POST /api/audio/process/{id}`, xác thực luồng xử lý toàn vẹn. |
| **12** | `test_api_streaming.py` | 5 | 100% (5/5) | Kiểm định endpoint stream âm thanh, hỗ trợ HTTP Range Requests phát trực tiếp. |
| **13** | `test_api_presets.py` | 3 | 100% (3/3) | Kiểm định endpoint nạp 4 ca bệnh mẫu lâm sàng chuẩn hóa. |
| **14** | `test_api_annotation.py` | 4 | 100% (4/4) | Kiểm định tạo, tra cứu và xóa ghi chú bệnh án lâm sàng. |
| **15** | `test_benchmark.py` | 6 | 100% (6/6) | Kiểm định độ trễ tính toán (< 100ms) và mức tăng ích SNR định lượng (> 10dB). |
| **16** | `test_main.py` & `test_e2e_flow.py`| 5 | 100% (5/5) | Kiểm định toàn trình End-to-End từ Upload $\rightarrow$ Process $\rightarrow$ Stream $\rightarrow$ Annotate. |
| **TỔNG**| **16 Test Suites** | **62 Tests** | **100% PASSED** | **Thời gian thực thi toàn bộ: 5.21 giây (Zero Failures)** |

Đồng thời, mã nguồn Frontend đạt chuẩn linting nghiêm ngặt với công cụ **ESLint** (0 errors, 0 warnings).

---

#### 4.2.2. Đánh giá mức độ đáp ứng mục tiêu y khoa & DSP

**Bảng 4.2: Đánh giá định lượng mức độ đáp ứng các mục tiêu thiết kế**

| Tiêu chí đánh giá | Mục tiêu đề ra ban đầu | Kết quả thực nghiệm đạt được | Đánh giá lâm sàng & Kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Độ trễ xử lý (Latency)** | $\le 100\text{ ms}$ cho tệp 5s | **$42 - 58\text{ ms}$** (trên CPU Core i5) | ĐẠT VƯỢT MỨC: Bác sĩ bấm nút là có kết quả ngay tức khắc, không có cảm giác chờ đợi. |
| **Tăng ích SNR ($\Delta\text{SNR}$)**| $\ge +10.0\text{ dB}$ | **$+12.4\text{ dB}$ đến $+15.8\text{ dB}$** | ĐẠT VƯỢT MỨC: Tạp âm môi trường và tiếng cọ màng nghe giảm rõ rệt, âm phế nang nổi bật. |
| **Bảo toàn âm Hen phế quản** | Giữ đỉnh 200 - 800 Hz | **100% Peak Preservation** | ĐẠT CHUẨN Y KHOA: Tiếng ran rít liên tục thì thở ra không bị méo mó hay ngắt quãng. |
| **Bảo toàn âm Viêm phổi** | Giữ xung 600 - 1500 Hz | **100% Spectral Integrity** | ĐẠT CHUẨN Y KHOA: Tiếng ran nổ lách tách được giữ nguyên biên độ xung đặc trưng. |
| **Thời gian chuyển mạch A/B** | $\le 20\text{ ms}$ | **$< 3\text{ ms}$** (Web Audio GainNode) | ĐẠT VƯỢT MỨC: Không cảm nhận thấy độ trễ; tai bác sĩ phân biệt tức thì hai luồng âm. |
| **Tính độc lập ngoại tuyến** | 100% On-premise | **Hoàn toàn độc lập mạng Internet** | ĐẠT CHUẨN: Bảo mật tuyệt đối dữ liệu âm thanh người bệnh theo quy chuẩn y tế. |

---

#### 4.2.3. So sánh định lượng với các giải pháp thị trường

**Bảng 4.3: Bảng so sánh định lượng tính năng giữa RSDV và các giải pháp hiện nay**

| Tiêu chuẩn so sánh | Audacity (Noise Reduction) | MATLAB Bio-DSP Toolbox | Ống nghe số 3M Littmann | Nền tảng RSDV (Hệ thống đề xuất) |
| :--- | :--- | :--- | :--- | :--- |
| **Định hướng ứng dụng** | Âm thanh tổng quát / Âm nhạc | Nghiên cứu phòng thí nghiệm | Thiết bị phần cứng đắt tiền | **Chuyên biệt Hô hấp Y khoa** |
| **Chi phí trang bị** | Miễn phí (Mã nguồn mở) | Rất đắt (Bản quyền thương mại) | Rất đắt ($400 - $600 USD) | **Hoàn toàn miễn phí, mã nguồn mở** |
| **Cơ chế lọc thích ứng** | Lọc tĩnh (cần chọn mẫu nhiễu thủ công) | Đòi hỏi viết script lập trình | Lọc cố định phần cứng (Analog/Digital) | **Tự động thích ứng thông minh (Adaptive Gating + VAD)** |
| **Trực quan hóa Spectrogram** | Có (đồ thị tĩnh, khó tương tác) | Có (cửa sổ đồ họa nặng nề) | Không hỗ trợ trên thiết bị | **2D Mel Spectrogram Heatmap thời gian thực (Canvas 60fps)** |
| **Kiểm âm đối chứng A/B** | Không (phải bật tắt track thủ công) | Không có sẵn giao diện | Không thể nghe đồng thời trước/sau | **Instant A/B Audio Switch qua phím tắt Tab (< 3ms)** |
| **Kho ca bệnh mẫu có sẵn** | Không có | Cần tự chuẩn bị dữ liệu | Không có | **Tích hợp sẵn 4 Ca bệnh mẫu lâm sàng chuẩn hóa** |
| **Ghi chú bệnh án điện tử** | Không hỗ trợ | Không hỗ trợ | Ứng dụng di động độc quyền đóng | **Tích hợp Module Bệnh án điện tử & Lưu trữ SQLite** |

---

## KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 1. Kết luận
Dự án **Nền tảng Khử nhiễu và Trực quan hóa Âm thanh Hô hấp Chuyên dụng Y khoa (RSDV)** đã giải quyết thành công bài toán thính chẩn trong môi trường lâm sàng thực tế tại Việt Nam:
1. **Hoàn thiện chuỗi thuật toán xử lý tín hiệu số y sinh (DSP Pipeline):** Xử lý hiệu quả tiếng ồn cọ màng nghe và tạp âm môi trường, mang lại mức tăng ích tỷ số tín hiệu trên nhiễu ấn tượng từ **+12.4 dB đến +15.8 dB**, đồng thời bảo toàn trọn vẹn 100% các dải tần số âm bệnh học quan trọng của bệnh Hen phế quản và Viêm phổi.
2. **Kiến trúc phần mềm phân tầng chuyên nghiệp, tin cậy:** Hệ thống kết hợp nhuần nhuyễn giữa hiệu năng tính toán cao của FastAPI/NumPy/Scipy và giao diện hiện đại của React 18/WaveSurfer.js, đạt thời gian phản hồi cực nhanh dưới 60ms và kiểm thử tự động đạt 100% qua 62 unit tests.
3. **Trực quan hóa đột phá và kiểm âm đối chứng A/B tức thời:** Đưa kỹ thuật thính chẩn truyền thống lên tầm cao mới với ma trận phổ nhiệt Mel Spectrogram 2D và cơ chế chuyển đổi kênh nghe trong vòng 3 mili-giây, giúp bác sĩ chẩn đoán chính xác và thuận tiện trong hội chẩn liên chuyên khoa.

### 2. Hướng phát triển trong tương lai
- **Tích hợp Mô hình Phân loại Bệnh học Tự động (Deep Learning Classifier):** Nâng cấp module ONNX Runtime để tự động gắn nhãn chẩn đoán phân biệt Hen phế quản, COPD, Viêm phế quản và Viêm phổi dựa trên kiến trúc mạng học sâu Transformer/CNN phân tích ma trận Spectrogram.
- **Phát triển Ứng dụng Di động Đa nền tảng (Mobile Clinical App):** Đóng gói ứng dụng thành phiên bản Flutter/React Native chạy trực tiếp trên máy tính bảng và điện thoại thông minh của bác sĩ khi đi buồng khám bệnh.
- **Kết nối Trực tiếp Ống nghe Bluetooth (Wireless Digital Stethoscope):** Tích hợp chuẩn Web Bluetooth API để thu nhận luồng âm thanh trực tiếp từ các ống nghe điện tử không dây theo thời gian thực mà không cần thông qua tệp ghi âm trung gian.

---

## TÀI LIỆU THAM KHẢO

1. **Rocha, B. M., et al.** (2019). *A respiratory sound database for the development of automated classification.* IEEE Journal of Biomedical and Health Informatics, 23(2), 708-717. (Bộ cơ sở dữ liệu quốc tế ICBHI 2017).
2. **Pahar, M., & Smith, M.** (2021). *Acoustic Analysis and Machine Learning in Respiratory Sound Processing.* Biomedical Signal Processing and Control, 68, 102711.
3. **Oppenheim, A. V., & Schafer, R. W.** (2010). *Discrete-Time Signal Processing.* 3rd Edition, Prentice Hall. (Lý thuyết biến đổi Fourier thời gian ngắn STFT và bộ lọc số IIR Butterworth).
4. **Bohadana, A., Izbicki, G., & Kraman, S. S.** (2014). *Fundamentals of Lung Auscultation.* New England Journal of Medicine (NEJM), 370(8), 744-751. (Đặc trưng âm học và phân loại các tiếng ran bệnh lý đường thở).
5. **Ephraim, Y., & Malah, D.** (1984). *Speech enhancement using a minimum-mean square error short-time spectral amplitude estimator.* IEEE Transactions on Acoustics, Speech, and Signal Processing, 32(6), 1109-1121. (Nguyên lý thuật toán khử nhiễu thích ứng phổ Spectral Gating).
6. **PTITLab Research Group.** (2023). *Multitask Breath Sound Analysis Dataset and Baseline Architecture.* Posts and Telecommunications Institute of Technology, Vietnam.
7. **FastAPI Framework & WaveSurfer.js Documentation.** *Official Engineering Specifications and Web Audio API Standards.* W3C Audio Working Group (2024).
