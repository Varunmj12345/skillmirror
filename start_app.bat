@echo off
setlocal

echo ===================================================
echo   SkillMirror Application Launcher
echo ===================================================

REM Define root directory
set "PROJECT_ROOT=%~dp0"
REM Remove trailing backslash if present
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"
set "VENV_ACTIVATE="

REM Check for venv
if exist "%PROJECT_ROOT%\venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\venv\Scripts\activate.bat"
    goto :VenvFound
)

REM Check for .venv
if exist "%PROJECT_ROOT%\.venv\Scripts\activate.bat" (
    set "VENV_ACTIVATE=%PROJECT_ROOT%\.venv\Scripts\activate.bat"
    goto :VenvFound
)

echo [ERROR] Virtual environment not found (checked 'venv' and '.venv').
echo Please create one or ensure it exists.
pause
exit /b 1

:VenvFound
echo Found virtual environment.

echo.
echo ===================================================
echo [Phase 1] Validation ^& Setup
echo ===================================================

echo 1. Checking Backend Requirements...
cd /d "%BACKEND_DIR%"
call "%VENV_ACTIVATE%"

REM Fix setuptools version to ensure pkg_resources availability
python -m pip install "setuptools<70" --upgrade pip
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to setup python environment.
    pause
    exit /b 1
)

python -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

echo.
echo 2. Running Database Migrations...
python manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database migration failed.
    echo Check for errors in settings.py or missing dependencies.
    pause
    exit /b 1
)

echo.
echo 3. Checking Frontend Requirements...
cd /d "%FRONTEND_DIR%"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo [Phase 2] Server Startup
echo ===================================================

echo 4. Starting Backend Server (Django)...
REM Use caret to escape special characters if needed, but simple quoting usually suffices
start "SkillMirror Backend" /D "%BACKEND_DIR%" cmd /k "call "%VENV_ACTIVATE%" && python manage.py runserver"

echo    Waiting 5 seconds for backend initialization...
timeout /t 5 >nul

echo 5. Starting Frontend Server (Next.js)...
start "SkillMirror Frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev"

echo.
echo ===================================================
echo [Phase 3] Launch
echo ===================================================

echo 6. Waiting 5 seconds for frontend initialization...
timeout /t 5 >nul

echo 7. Opening Browser...
start http://localhost:3000

echo.
echo ===================================================
echo   SkillMirror is running!
echo   - Backend: http://127.0.0.1:8000
echo   - Frontend: http://localhost:3000
echo ===================================================
pause
