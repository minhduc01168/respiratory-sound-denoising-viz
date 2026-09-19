@echo off
title Respiratory Sound Denoising & Visualization System - One Click Launcher
color 0B

echo ==============================================================================
echo   RESPIRATORY SOUND DENOISING & VISUALIZATION PLATFORM
echo   He Thong Khu Nhieu & Truc Quan Hoa Am Thanh Ho Hap Chuyen Dung Y Khoa
echo ==============================================================================
echo.

:: 1. Kiem tra Python
echo [*] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] ERROR: Python is not installed or not in system PATH!
    echo     Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)
python -c "import sys; print('    Found Python ' + sys.version.split()[0])"

:: 2. Kiem tra Node.js & npm
echo [*] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] ERROR: Node.js is not installed or not in system PATH!
    echo     Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo     Found Node.js %NODE_VER%

:: 3. Kiem tra va cai dat frontend dependencies neu can
if not exist "frontend\node_modules\" (
    echo [*] Initializing frontend dependencies (first time setup)...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ==============================================================================
echo   STARTING SYSTEM SERVICES...
echo   - Backend API:  http://127.0.0.1:8000 (FastAPI + DSP Engine)
echo   - Frontend App: http://localhost:5173 (React Vite Dashboard)
echo ==============================================================================
echo.

:: 4. Khoi dong Backend FastAPI trong cua so doc lap
echo [*] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "RSDV - FastAPI Backend (Port 8000)" cmd /k "title RSDV Backend && color 0A && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 5. Khoi dong Frontend Vite trong cua so doc lap
echo [*] Launching React Vite Frontend on http://localhost:5173 ...
start "RSDV - React Frontend (Port 5173)" cmd /k "title RSDV Frontend && color 0E && cd frontend && npm run dev"

:: 6. Cho doi server khoi dong va tu dong mo trinh duyet
echo [*] Waiting for services to initialize...
timeout /t 4 /nobreak >nul

echo [*] Opening Doctor Dashboard in default browser...
start http://localhost:5173

echo.
echo ==============================================================================
echo   SYSTEM IS READY!
echo   - Web URL: http://localhost:5173
echo   - API Docs: http://127.0.0.1:8000/docs
echo   - Shortcuts: Space (Play/Pause), Tab (Instant A/B Audio Switch)
echo   - To stop the system, simply close both opened command windows.
echo ==============================================================================
echo.
pause
