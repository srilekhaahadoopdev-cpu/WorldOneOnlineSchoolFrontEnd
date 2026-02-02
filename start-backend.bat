@echo off
cd /d "%~dp0backend"
echo Starting World One Online School Backend...
echo.
python main.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend crashed with error code %ERRORLEVEL%
    pause
)
