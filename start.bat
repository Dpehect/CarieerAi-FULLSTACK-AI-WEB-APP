@echo off
chcp 65001 >nul
setlocal EnableExtensions
title KariyerAI
cd /d "%~dp0"

:: Ollama PATH (yaygin kurulum yolu)
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
  set "PATH=%LOCALAPPDATA%\Programs\Ollama;%PATH%"
)

if not exist ".venv\Scripts\streamlit.exe" (
  echo [HATA] Kurulum yapilmamis. Once setup.bat calistirin.
  pause
  exit /b 1
)

:: Ollama ayakta mi? (zorunlu degil baslat; sadece uyar)
where ollama >nul 2>&1
if errorlevel 1 (
  echo [UYARI] ollama komutu yok. Ollama uygulamasini Start menusunden acin.
) else (
  ollama list >nul 2>&1
  if errorlevel 1 (
    echo [UYARI] Ollama yanit vermiyor. Ollama uygulamasini acin.
  )
)

echo.
echo  KariyerAI baslatiliyor...
echo  Tarayici: http://localhost:8501
echo  Durdurmak icin bu pencerede Ctrl+C
echo.

".venv\Scripts\streamlit.exe" run main.py --server.headless false
if errorlevel 1 (
  echo.
  echo [HATA] Streamlit baslamadi.
  pause
)
endlocal
