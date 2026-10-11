#!/bin/bash
# ==============================================================================
# Respiratory Sound Denoising & Visualization Platform - Startup Script
# Supports both Local Dev & Remote Server Deployment (Port 3000)
# ==============================================================================

set -e

# Load environment file if present
if [ -f ".env" ]; then
    echo "[*] Loading configuration from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

PORT="${PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

echo "=============================================================================="
echo "  RESPIRATORY SOUND DENOISING & VISUALIZATION PLATFORM"
echo "  He Thong Khu Nhieu & Truc Quan Hoa Am Thanh Ho Hap Chuyen Dung Y Khoa"
echo "=============================================================================="
echo "  Target Port:         $PORT (UI & Reverse Proxy)"
echo "  Backend Port:        $BACKEND_PORT"
echo "  Host Binding:        $HOST"
echo "=============================================================================="
echo ""

# 1. Kiem tra Python 3
if ! command -v python3 &> /dev/null; then
    echo "[!] ERROR: python3 is not installed or not in system PATH!"
    exit 1
fi
echo "[*] Python environment: $(python3 --version)"

# Kiem tra virtualenv neu co
if [ -d "venv" ]; then
    echo "[*] Activating virtual environment (venv)..."
    source venv/bin/activate
elif [ -d ".venv" ]; then
    echo "[*] Activating virtual environment (.venv)..."
    source .venv/bin/activate
fi

# 2. Kiem tra Node & npm
if ! command -v node &> /dev/null; then
    echo "[!] ERROR: node is not installed or not in system PATH!"
    exit 1
fi
echo "[*] Node environment: $(node -v)"

# 3. Kiem tra dependencies frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "[*] Installing frontend dependencies (npm install)..."
    (cd frontend && npm install)
fi

# 4. Kiem tra xung dot port truoc khi chay
check_port() {
    local check_p=$1
    if command -v ss &> /dev/null; then
        ss -tuln | grep -q ":$check_p "
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$check_p "
    elif command -v lsof &> /dev/null; then
        lsof -i :$check_p &> /dev/null
    else
        return 1
    fi
}

if check_port "$PORT"; then
    echo "[!] CANH BAO: Port $PORT hien dang duoc su dung boi mot tien trinh hoac Docker container khac!"
    echo "    Neu ban dang chay container khac, hay tam dung no (docker stop <container_name>)"
    echo "    Hoac chi dinh port khac bang cach chay: PORT=3001 ./start.sh"
    echo ""
fi

# 5. Khoi tao cleanup handler khi tat
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

# 6. Khoi dong Backend
echo "[*] Starting FastAPI Backend on http://$HOST:$BACKEND_PORT ..."
python3 -m uvicorn backend.app.main:app --host "$HOST" --port "$BACKEND_PORT" &
BACKEND_PID=$!

# 7. Khoi dong Frontend (export PORT de Vite nhan dien)
echo "[*] Starting React Vite Frontend on port $PORT (host: $HOST) ..."
(cd frontend && PORT="$PORT" VITE_BACKEND_URL="http://127.0.0.1:$BACKEND_PORT" npm run dev) &
FRONTEND_PID=$!

# 8. Lay dia chi IP Server neu co the
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_SERVER_IP")

# 9. Tu dong mo browser neu dang o moi truong co desktop GUI
sleep 3
if [ -n "$DISPLAY" ] || [ -n "$WAYLAND_DISPLAY" ]; then
    echo "[*] Opening browser..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT" 2>/dev/null &
    fi
fi

echo ""
echo "=============================================================================="
echo "  SYSTEM IS READY!"
echo "  - Local Access:     http://localhost:$PORT"
echo "  - Remote Server IP: http://$SERVER_IP:$PORT"
echo "  - API Docs:         http://localhost:$PORT/docs"
echo "  - Press Ctrl+C in this terminal to stop all services."
echo "=============================================================================="
echo ""

wait
