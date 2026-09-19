#!/bin/bash
# ==============================================================================
# Respiratory Sound Denoising & Visualization Platform - One-Click Startup (Bash)
# ==============================================================================

set -e

echo "=============================================================================="
echo "  RESPIRATORY SOUND DENOISING & VISUALIZATION PLATFORM"
echo "  He Thong Khu Nhieu & Truc Quan Hoa Am Thanh Ho Hap Chuyen Dung Y Khoa"
echo "=============================================================================="
echo ""

# 1. Kiem tra Python 3
if ! command -v python3 &> /dev/null; then
    echo "[!] ERROR: python3 is not installed or not in system PATH!"
    exit 1
fi
echo "[*] Python environment: $(python3 --version)"

# 2. Kiem tra Node & npm
if ! command -v node &> /dev/null; then
    echo "[!] ERROR: node is not installed or not in system PATH!"
    exit 1
fi
echo "[*] Node environment: $(node -v)"

# 3. Kiem tra dependencies frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "[*] Installing frontend dependencies (npm install)..."
    cd frontend && npm install && cd ..
fi

# 4. Khoi tao cleanup handler khi tat
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "[*] Shutting down RSDV services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo "[*] All services terminated gracefully."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 5. Khoi dong Backend
echo "[*] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 6. Khoi dong Frontend
echo "[*] Starting React Vite Frontend on http://localhost:5173 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# 7. Cho 3s va tu dong mo browser
sleep 3
echo "[*] Opening browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173" &
elif command -v open &> /dev/null; then
    open "http://localhost:5173" &
fi

echo ""
echo "=============================================================================="
echo "  SYSTEM IS READY!"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend:  http://127.0.0.1:8000/docs"
echo "  - Press Ctrl+C in this terminal to stop all services."
echo "=============================================================================="
echo ""

wait
