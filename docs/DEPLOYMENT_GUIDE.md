# Hướng Dẫn Triển Khai Hệ Thống RSDV (Deployment Guide)

> **Dự án**: Respiratory Sound Denoising & Clinical Visualization (RSDV)  
> **Tên miền đích**: `spectra.laptrinhai.org`  
> **Mục tiêu**: Đóng gói Docker images và triển khai an toàn lên máy chủ đang chạy website khác (`vigil.green`) mà không gây gián đoạn hay xung đột cổng.

---

## 1. Kiến Trúc Triển Khai (Zero-Downtime & Zero-Conflict)

Mô hình triển khai phân luồng qua **Nginx Reverse Proxy** trung tâm của máy chủ:

```
                            Client / Browser
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   https://vigil.green                       https://spectra.laptrinhai.org
    (Website 1 hiện có)                        (Website 2 - RSDV mới)
              │                                         │
              └────────────────────┬────────────────────┘
                                   ▼
                       [ Host Nginx (Port 80/443) ]
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        ▼                                                     ▼
[ Vigil Next.js & FastAPI ]                        [ RSDV Docker Containers ]
- Frontend: 127.0.0.1:3000                         - Frontend: 127.0.0.1:3008
- Backend:  127.0.0.1:8000                         - Backend:  127.0.0.1:8008 (nội bộ)
- Postgres: 5432                                   - Docker Net: rsdv-network
```

### Bảng phân bổ cổng (Port Allocation)

| Dịch vụ | Cổng trên Host | Vai trò | Trạng thái xung đột |
| :--- | :--- | :--- | :--- |
| **Vigil Frontend** | `127.0.0.1:3000` | Website cũ | Giữ nguyên |
| **Vigil Backend** | `127.0.0.1:8000` | API cũ | Giữ nguyên |
| **Vigil Postgres** | `5432` | Database cũ | Giữ nguyên |
| **RSDV Frontend** | `127.0.0.1:3008` | Web UI RSDV (React + Vite + Nginx) | **Không xung đột** |
| **RSDV Backend** | `127.0.0.1:8008` | FastAPI Engine + Denoising Model | **Không xung đột** |

---

## 2. Cấu Trúc Các Tệp Triển Khai

Trong mã nguồn dự án:
```
├── docker-compose.prod.yml              # File Compose cho môi trường Production (dùng image load)
├── deploy/
│   ├── export-images.sh                 # Script đóng gói và nén Docker images (~340MB)
│   ├── deploy-on-server.sh              # Script tự động nạp image & khởi chạy trên server
│   └── nginx-spectra.laptrinhai.org.conf# Cấu hình Virtual Host Nginx cho Host server
```

---

## 3. Quy Trình Triển Khai Từng Bước

### Bước 1: Đóng gói Docker Images tại máy phát triển

Tại thư mục gốc dự án, thực thi script đóng gói:
```bash
./deploy/export-images.sh
```

Script sẽ tạo thư mục `deploy_package/` chứa:
- `rsdv-images.tar.gz` (Docker images của frontend + backend đã nén)
- `docker-compose.yml` (Bản production)
- `nginx-spectra.laptrinhai.org.conf` (File cấu hình Nginx mẫu)
- `deploy.sh` (Script khởi chạy trên server)

---

### Bước 2: Chuyển dữ liệu sang Server đích

Dùng `scp` hoặc `rsync` để copy thư mục `deploy_package` sang server:
```bash
# Thay 'user' và 'your_server_ip' bằng thông tin máy chủ của bạn
scp -r deploy_package user@your_server_ip:~/rsdv
```

---

### Bước 3: Nạp Docker Images & Khởi chạy Container

Đăng nhập SSH vào server đích:
```bash
ssh user@your_server_ip
cd ~/rsdv

# Cấp quyền thực thi và chạy script triển khai:
chmod +x deploy.sh
./deploy.sh
```

Hoặc chạy thủ công các lệnh:
```bash
# Nạp Docker images từ file nén
docker load < rsdv-images.tar.gz

# Khởi chạy Docker Compose ngầm
docker compose up -d

# Kiểm tra trạng thái container
docker compose ps
```

Kiểm tra sức khỏe dịch vụ nội bộ:
```bash
curl -I http://127.0.0.1:3008/health
```

---

### Bước 4: Cấu hình Virtual Host Nginx cho `spectra.laptrinhai.org`

1. **Trỏ DNS tên miền**:
   Vào trang quản lý DNS của `laptrinhai.org`, tạo bản ghi:
   - **Type**: `A`
   - **Host / Name**: `spectra`
   - **Value**: `IP_SERVER_CỦA_BẠN`

2. **Cấu hình Nginx trên Server**:
   ```bash
   # Copy file cấu hình vào thư mục Nginx
   sudo cp ~/rsdv/nginx-spectra.laptrinhai.org.conf /etc/nginx/sites-available/spectra.laptrinhai.org

   # Kích hoạt site bằng symbolic link
   sudo ln -s /etc/nginx/sites-available/spectra.laptrinhai.org /etc/nginx/sites-enabled/
   ```

3. **Kiểm tra cú pháp và Reload Nginx** (Đảm bảo an toàn 100% cho `vigil.green`):
   ```bash
   # Kiểm tra cú pháp cấu hình
   sudo nginx -t

   # Nếu báo syntax ok, tiến hành reload (không gián đoạn web đang chạy)
   sudo systemctl reload nginx
   ```

---

### Bước 5: Cấp chứng chỉ SSL HTTPS (Let's Encrypt Certbot)

Chạy lệnh Certbot để tự động thiết lập HTTPS cho tên miền mới:
```bash
sudo certbot --nginx -d spectra.laptrinhai.org
```

Certbot sẽ:
- Xác thực tên miền qua HTTP-01 challenge.
- Cấp chứng chỉ SSL miễn phí từ Let's Encrypt.
- Tự động bổ sung cấu hình lắng nghe cổng 443 và HTTP->HTTPS redirect vào `/etc/nginx/sites-available/spectra.laptrinhai.org`.
- **Hoàn toàn không can thiệp** vào cấu hình của các domain khác trên máy chủ.

---

## 4. Các Lưu Ý Vận Hành Quan Trọng (Best Practices)

1. **Giới hạn dung lượng tải lên (Upload Size)**:
   - File cấu hình Nginx mẫu đã đặt `client_max_body_size 25M;` để hỗ trợ các mẫu file âm thanh hô hấp y tế dung lượng lớn.
2. **Timeout xử lý**:
   - `proxy_read_timeout 180s;` đảm bảo các thuật toán khử nhiễu phổ Mel nâng cao hoặc file ghi âm dài không bị gián đoạn giữa chừng.
3. **Quản lý Log độc lập**:
   - Truy cập log riêng của RSDV tại: `/var/log/nginx/spectra_access.log` và `/var/log/nginx/spectra_error.log`.
4. **Cơ chế Dừng / Khởi động lại an toàn**:
   - Khởi động lại RSDV: `cd ~/rsdv && docker compose restart`
   - Xem log xử lý: `cd ~/rsdv && docker compose logs -f`
   - Tạm dừng RSDV: `cd ~/rsdv && docker compose down`
   *(Các thao tác trên chỉ ảnh hưởng tới RSDV, website `vigil.green` vẫn duy trì hoạt động bình thường).*
