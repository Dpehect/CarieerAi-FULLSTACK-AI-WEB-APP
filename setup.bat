@echo off
chcp 65001 >nul
setlocal EnableExtensions
title KariyerAI - Kurulum
cd /d "%~dp0"

echo.
echo  ========================================
echo   KariyerAI - Tek tik kurulum
echo  ========================================
echo.

:: --- Python ---
where python >nul 2>&1
if errorlevel 1 (
  echo [HATA] Python bulunamadi. https://www.python.org/downloads/
  echo        Kurarken "Add python.exe to PATH" isaretleyin.
  pause
  exit /b 1
)
python --version
echo.

:: --- Ollama (opsiyonel uyarisi) ---
where ollama >nul 2>&1
if errorlevel 1 (
  if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\Ollama;%PATH%"
    echo [OK] Ollama PATH'e eklendi (bu oturum).
  ) else (
    echo [UYARI] Ollama bulunamadi. https://ollama.com/download
    echo         Kurduktan sonra bu scripti tekrar calistirin.
  )
) else (
  echo [OK] Ollama bulundu.
)

:: --- venv ---
if not exist ".venv\Scripts\python.exe" (
  echo [..] Sanal ortam olusturuluyor...
  python -m venv .venv
  if errorlevel 1 (
    echo [HATA] venv olusturulamadi.
    pause
    exit /b 1
  )
) else (
  echo [OK] Sanal ortam mevcut.
)

echo [..] pip guncelleniyor...
".venv\Scripts\python.exe" -m pip install --upgrade pip -q

echo [..] Paketler kuruluyor (birkaç dakika surebilir)...
".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 (
  echo [HATA] pip install basarisiz.
  pause
  exit /b 1
)

:: --- Modeller ---
where ollama >nul 2>&1
if not errorlevel 1 (
  echo [..] nomic-embed-text indiriliyor (yoksa)...
  ollama pull nomic-embed-text
  echo [..] llama3.1:8b indiriliyor (yoksa, ~5GB)...
  ollama pull llama3.1:8b
) else if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
  echo [..] Modeller indiriliyor...
  "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" pull nomic-embed-text
  "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" pull llama3.1:8b
)

echo.
echo  ========================================
echo   Kurulum bitti!
echo   Simdi start.bat cift tiklayin.
echo  ========================================
echo.
pause
endlocal
