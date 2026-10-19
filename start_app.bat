@echo off
setlocal enabledelayedexpansion

title SkillMirror Application Launcher

echo ================================================================
echo           SkillMirror - Autonomous Career Intelligence
echo ================================================================
echo.

REM Define root directory
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"
set "VENV_ACTIVATE="
set "VENV_PYTHON="

REM Configure Groq AI Models (GROQ_API_KEY is loaded from backend/.env)
set "DEFAULT_GROQ_MODEL=openai/gpt-oss-120b"
set "FAST_GROQ_MODEL=openai/gpt-oss-20b"

REM -----------------------------------------------------------------
REM [Step 1] Virtual Environment Detection & Auto-Creation
REM -----------------------------------------------------------------
echo [1/5] Checking Python Virtual Environment...

if exist "%PROJECT_ROOT%\venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\venv\Scripts\activate.bat"
    set "VENV_PYTHON=%PROJECT_ROOT%\venv\Scripts\python.exe"
    goto :VenvReady
)

if exist "%PROJECT_ROOT%\.venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\.venv\Scripts\activate.bat"
    set "VENV_PYTHON=%PROJECT_ROOT%\.venv\Scripts\python.exe"
    goto :VenvReady
)

REM Fallback check for sibling project venv
if exist "%PROJECT_ROOT%\..\skillmirror\venv\Scripts\activate.bat" (
    echo [INFO] Found virtual environment in sibling directory.
    set "VENV_ACTIVATE=%PROJECT_ROOT%\..\skillmirror\venv\Scripts\activate.bat"
    set "VENV_PYTHON=%PROJECT_ROOT%\..\skillmirror\venv\Scripts\python.exe"
    goto :VenvReady
)

echo [WARN] Virtual environment not found in %PROJECT_ROOT%\venv.
echo [INFO] Attempting to locate Python to create a virtual environment...

set "SYS_PYTHON="
for %%P in (python.exe py.exe "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" "%ProgramFiles%\Python312\python.exe" "%ProgramFiles%\Python311\python.exe") do (
    if not defined SYS_PYTHON (
        %%~P --version >nul 2>&1
        if !errorlevel! EQU 0 (
            set "SYS_PYTHON=%%~P"
        )
    )
)

if not defined SYS_PYTHON (
    echo [ERROR] Python was not found on your system!
    echo Please install Python 3.11 or 3.12 from https://www.python.org/
    echo or run: winget install Python.Python.3.12
    pause
    exit /b 1
)

echo [INFO] Using Python: %SYS_PYTHON%
echo [INFO] Creating new virtual environment at %PROJECT_ROOT%\venv...
call %SYS_PYTHON% -m venv "%PROJECT_ROOT%\venv"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)

set "VENV_ACTIVATE=%PROJECT_ROOT%\venv\Scripts\activate.bat"
set "VENV_PYTHON=%PROJECT_ROOT%\venv\Scripts\python.exe"

:VenvReady
echo [OK] Virtual environment ready.
echo.

REM -----------------------------------------------------------------
REM [Step 2] Backend Setup & Dependencies
REM -----------------------------------------------------------------
echo [2/5] Checking Backend Dependencies...
cd /d "%BACKEND_DIR%"

REM Create staticfiles directory to silence whitenoise warning
if not exist "%BACKEND_DIR%\staticfiles" (
    mkdir "%BACKEND_DIR%\staticfiles" >nul 2>&1
)

REM Test if Django is already installed in this venv
"%VENV_PYTHON%" -c "import django" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend dependencies already satisfied.
) else (
    echo [INFO] Installing / updating backend dependencies...
    call "%VENV_ACTIVATE%"
    python -m pip install "setuptools<70" --upgrade pip
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed.
)

echo.
echo [INFO] Applying database migrations...
"%VENV_PYTHON%" manage.py migrate --noinput
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database migration failed.
    echo Please check database configuration in settings.py.
    pause
    exit /b 1
)
echo [OK] Database schema up to date.
echo.

REM -----------------------------------------------------------------
REM [Step 3] Frontend Setup & Dependencies
REM -----------------------------------------------------------------
echo [3/5] Checking Frontend Dependencies...
cd /d "%FRONTEND_DIR%"

if exist "%FRONTEND_DIR%\node_modules" (
    echo [OK] Frontend node_modules found.
) else (
    echo [INFO] Installing frontend packages via npm install...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
    echo [OK] Frontend packages installed.
)
echo.

REM -----------------------------------------------------------------
REM [Step 4] Port Conflict Check
REM -----------------------------------------------------------------
echo [4/5] Checking Ports (8000 and 3000)...

netstat -ano | findstr /R /C:":8000 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARN] Port 8000 is already in use by another process.
    echo        The Django backend may fail to bind or conflict.
)

netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARN] Port 3000 is already in use by another process.
    echo        Next.js may automatically use port 3001 instead.
)
echo [OK] Port verification complete.
echo.

REM -----------------------------------------------------------------
REM [Step 5] Launch Servers & Application
REM -----------------------------------------------------------------
echo [5/5] Launching SkillMirror Servers...

echo [INFO] Starting Backend Server (Django on http://127.0.0.1:8000)...
start "SkillMirror - Backend (Django :8000)" /D "%BACKEND_DIR%" cmd /k "title SkillMirror Backend && call "%VENV_ACTIVATE%" && python manage.py runserver 127.0.0.1:8000"

echo [INFO] Waiting 3 seconds for backend warmup...
ping 127.0.0.1 -n 4 >nul 2>&1

echo [INFO] Starting Frontend Server (Next.js on http://localhost:3000)...
start "SkillMirror - Frontend (Next.js :3000)" /D "%FRONTEND_DIR%" cmd /k "title SkillMirror Frontend && npm run dev"

echo [INFO] Waiting 4 seconds for frontend warmup...
ping 127.0.0.1 -n 5 >nul 2>&1

echo.
echo ================================================================
echo             SkillMirror Application is LIVE
echo ================================================================
echo   - Web Application : http://localhost:3000
echo   - Bot Analytics   : http://localhost:3000/bot-analytics
echo   - Backend API     : http://127.0.0.1:8000/api/
echo   - Backend Health  : http://127.0.0.1:8000/health/
echo   - Admin Panel     : http://127.0.0.1:8000/admin/
echo ================================================================
echo.
echo [INFO] Launching browser to http://localhost:3000...
start http://localhost:3000

echo.
echo NOTE: Keep this window or the server windows open while using the app.
echo Press any key below to stop both servers and exit.
echo ================================================================
pause >nul

echo.
echo [INFO] Stopping SkillMirror server processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":8000 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":3000 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Servers stopped. Have a great day!
ping 127.0.0.1 -n 3 >nul 2>&1
exit /b 0
