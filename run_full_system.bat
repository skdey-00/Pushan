@echo off
echo ============================================================
echo Starting Adaptive Traffic Signal System (Full)
echo ============================================================
echo.
echo This will start:
echo   - Flask API Server on port 5000
echo   - Traffic Control Loop
echo   - YOLO Vehicle Detection
echo.
echo API will be available at: http://localhost:5000
echo.
cd /d "%~dp0laptop"

"C:\Users\sanme\AppData\Local\Programs\Python\Python311\python.exe" main.py

pause
