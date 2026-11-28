@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title WebRandomStar - เปิดเวที

rem  Double-click on show day: builds the latest version, starts the local server on port 4173,
rem  opens the stage for OBS (#/?obs=1) and the control window. Set DRYRUN=1 to only print
rem  what it would launch (used to check this script without opening windows).
rem  Windows tools are called by full path so a curl/timeout/find from Git or elsewhere is never used.

set "SYS=%SystemRoot%\System32"
set "URL=http://localhost:4173"
set "STAGE_URL=%URL%/#/?obs=1"
set "CONTROL_URL=%URL%/#/control/live"

echo.
echo  ============================================
echo    SCI TECH THE - เปิดระบบเวที
echo  ============================================
echo.

rem ---- 1. Chrome must be fully closed, or the "keep drawing behind OBS" flag is ignored ----
echo [1/4] ตรวจว่า Chrome ปิดอยู่
if defined DRYRUN goto chrome_ok
:check_chrome
"%SYS%\tasklist.exe" /FI "IMAGENAME eq chrome.exe" 2>nul | "%SYS%\find.exe" /I "chrome.exe" >nul
if errorlevel 1 goto chrome_ok
echo.
echo   ! Chrome ยังเปิดอยู่
echo     ให้ปิด Chrome ทุกหน้าต่าง รวมถึงไอคอน Chrome ที่มุมขวาล่าง (system tray)
echo     ถ้าไม่ปิด หน้าเวทีจะหยุดขยับเมื่อถูกหน้าต่าง OBS บัง
echo.
"%SYS%\choice.exe" /C RC /N /M "   ปิดแล้วกด R เพื่อตรวจใหม่ / กด C เพื่อไปต่อทั้งที่ Chrome เปิดอยู่: "
if errorlevel 2 goto chrome_ok
goto check_chrome
:chrome_ok
echo   OK
echo.

rem ---- 2. Build the latest version (also picks up new photos in Photo/) ----
echo [2/4] build เวอร์ชันล่าสุด (ใช้เวลาประมาณ 10-30 วินาที)
if defined DRYRUN goto build_dry
call npm run build >"%TEMP%\webrandomstar-build.log" 2>&1
if errorlevel 1 goto build_failed
goto build_ok
:build_dry
echo   DRYRUN: npm run build
goto build_ok
:build_failed
echo.
echo   ! build ไม่ผ่าน ดูรายละเอียดได้ที่ %TEMP%\webrandomstar-build.log
pause
exit /b 1
:build_ok
echo   OK
echo.

rem ---- 3. Local server on port 4173 (reuse it if it is already running) ----
echo [3/4] เปิดเซิร์ฟเวอร์ %URL%
"%SYS%\curl.exe" -s -f -o nul "%URL%/" >nul 2>&1
if errorlevel 1 goto start_server
echo   เซิร์ฟเวอร์เปิดอยู่แล้ว ใช้ตัวเดิม
goto server_ok
:start_server
call :launch_cmd "WebRandomStar server - ห้ามปิดหน้าต่างนี้ระหว่างงาน" "npm run preview -- --port 4173 --strictPort"
if defined DRYRUN goto server_ok
set /a tries=0
:wait_server
"%SYS%\timeout.exe" /t 1 /nobreak >nul
"%SYS%\curl.exe" -s -f -o nul "%URL%/" >nul 2>&1
if not errorlevel 1 goto server_ok
set /a tries+=1
if %tries% lss 30 goto wait_server
echo.
echo   ! เปิดเซิร์ฟเวอร์ไม่สำเร็จ ดูข้อความในหน้าต่าง WebRandomStar server
echo     ถ้าขึ้นว่า port 4173 ถูกใช้อยู่ ให้ปิดโปรแกรมที่ใช้ port นี้ก่อน
pause
exit /b 1
:server_ok
echo   OK
echo.

rem ---- 4. Stage (for OBS) and control windows ----
echo [4/4] เปิดหน้าเวทีและหน้าควบคุม
call :launch_chrome --disable-backgrounding-occluded-windows --new-window "--app=%STAGE_URL%" --window-size=1920,1080
"%SYS%\timeout.exe" /t 2 /nobreak >nul
call :launch_chrome --new-window "%CONTROL_URL%"
echo   OK
echo.
echo  ============================================
echo    เสร็จแล้ว ทำต่ออีก 3 อย่าง:
echo    1. คลิกหน้าต่างเวที แล้วกด F11 ให้เต็มจอ
echo    2. หน้าควบคุมต้องขึ้น "เชื่อมต่อจอเวทีแล้ว" สีเขียว
echo    3. เปิด OBS แล้วดูว่า Window Capture เห็นหน้าเวที
echo.
echo    หน้าเวทีต้องมีหน้าเดียว อย่าเปิด %URL%/#/ ซ้ำในแท็บอื่น
echo    ปิดหน้าต่างนี้ได้ แต่ห้ามปิดหน้าต่าง WebRandomStar server
echo  ============================================
echo.
pause
exit /b 0

:launch_chrome
if defined DRYRUN goto launch_chrome_dry
start "" chrome %*
exit /b 0
:launch_chrome_dry
echo   DRYRUN: chrome %*
exit /b 0

:launch_cmd
if defined DRYRUN goto launch_cmd_dry
start "%~1" cmd /k %~2
exit /b 0
:launch_cmd_dry
echo   DRYRUN: [%~1] %~2
exit /b 0
