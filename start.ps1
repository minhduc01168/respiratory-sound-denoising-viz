# ==============================================================================
# RSDV One-Click Launcher for PowerShell
# ==============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  RESPIRATORY SOUND DENOISING AND VISUALIZATION PLATFORM" -ForegroundColor Cyan
Write-Host "  He Thong Khu Nhieu va Truc Quan Hoa Am Thanh Ho Hap Chuyen Dung Y Khoa" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiem tra Python
Write-Host "[*] Checking Python environment..." -ForegroundColor Yellow
try {
    $pyVer = python -c "import sys; print(sys.version.split()[0])"
    Write-Host "    Found Python $pyVer" -ForegroundColor Green
} catch {
    Write-Host "[!] ERROR: Python is not installed or not in system PATH!" -ForegroundColor Red
    exit 1
}

# 2. Kiem tra Node.js
Write-Host "[*] Checking Node.js environment..." -ForegroundColor Yellow
try {
    $nodeVer = node -v
    Write-Host "    Found Node.js $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[!] ERROR: Node.js is not installed or not in system PATH!" -ForegroundColor Red
    exit 1
}

# 3. Kiem tra va cai dat frontend dependencies neu chua co
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "[*] Installing frontend dependencies (first time setup)..." -ForegroundColor Yellow
    npm --prefix frontend install
}

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  STARTING SYSTEM SERVICES..." -ForegroundColor Cyan
Write-Host "  - Backend API:  http://127.0.0.1:8000 (FastAPI + ONNX AI Engine)" -ForegroundColor White
Write-Host "  - Frontend App: http://localhost:5173 (React Vite Dashboard)" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 4. Khoi dong Backend FastAPI trong cua so doc lap
Start-Process powershell -WorkingDirectory $PSScriptRoot -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'RSDV Backend'; python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

# 5. Khoi dong Frontend Vite trong cua so doc lap
Start-Process powershell -WorkingDirectory $PSScriptRoot -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'RSDV Frontend'; cd frontend; npm run dev"

# 6. Cho 4 giay va tu dong mo trinh duyet
Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"

Write-Host "[*] System started! Doctor dashboard opening at http://localhost:5173" -ForegroundColor Green
Write-Host "    To stop the services, simply close the two popup PowerShell windows." -ForegroundColor Gray
