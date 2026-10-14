#!/usr/bin/env bash
set -e

# ==============================================================================
# Script đóng gói Docker images và tệp cấu hình để chuyển sang máy chủ mới
# ==============================================================================

OUTPUT_DIR="./deploy_package"
TAR_FILE="$OUTPUT_DIR/rsdv-images.tar.gz"

echo "=== [1/3] Chuẩn bị thư mục xuất file: $OUTPUT_DIR ==="
mkdir -p "$OUTPUT_DIR"

echo "=== [2/3] Đang lưu và nén Docker images (backend + frontend)... ==="
echo "Quá trình này có thể mất 1-2 phút tùy tốc độ ổ đĩa..."
docker save respiratory-sound-denoising-viz-backend:latest respiratory-sound-denoising-viz-frontend:latest | gzip > "$TAR_FILE"

echo "=== [3/3] Sao chép các tệp cấu hình cần thiết... ==="
cp docker-compose.prod.yml "$OUTPUT_DIR/docker-compose.yml"
cp deploy/nginx-spectra.laptrinhai.org.conf "$OUTPUT_DIR/"
cp deploy/deploy-on-server.sh "$OUTPUT_DIR/deploy.sh"
chmod +x "$OUTPUT_DIR/deploy.sh"

echo ""
echo ">>> HOÀN THÀNH ĐÓNG GÓI! <<<"
echo "Các tệp đã được tạo trong thư mục '$OUTPUT_DIR':"
ls -lh "$OUTPUT_DIR"
echo ""
echo "Bạn chỉ cần copy thư mục '$OUTPUT_DIR' sang server đích."
