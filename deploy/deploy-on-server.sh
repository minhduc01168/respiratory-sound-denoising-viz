#!/usr/bin/env bash
set -e

# ==============================================================================
# Script triển khai RSDV trên Server đích
# Chạy script này từ thư mục chứa file rsdv-images.tar.gz và docker-compose.yml
# ==============================================================================

if [ ! -f "rsdv-images.tar.gz" ]; then
    echo "LỖI: Không tìm thấy file rsdv-images.tar.gz trong thư mục hiện tại!"
    exit 1
fi

echo "=== [1/3] Đang nạp Docker images từ file nén... ==="
docker load < rsdv-images.tar.gz

echo "=== [2/3] Khởi chạy các container với Docker Compose... ==="
docker compose up -d

echo "=== [3/3] Kiểm tra trạng thái hoạt động... ==="
docker compose ps

echo ""
echo ">>> Hoàn tất khởi động RSDV trong Docker! <<<"
echo "Frontend đang lắng nghe tại nội bộ: http://127.0.0.1:3008"
echo "Bước tiếp theo: Hãy gắn cấu hình Reverse Proxy (Nginx) cho domain spectra.laptrinhai.org"
