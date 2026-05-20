@echo off
title Fix_IT - Baslatiliyor
echo ============================================
echo   Fix_IT Destek Sistemi - Baslatiyor
echo ============================================
echo.
echo  BACKEND  : http://localhost:3001  (PHP)
echo  FRONTEND : http://localhost:3000  (React UI)
echo.

:: Onceden acik node sureclerini temizle
taskkill /F /IM node.exe >nul 2>&1

:: Gizli calistirma icin VBScript olustur
echo Set objShell = WScript.CreateObject("WScript.Shell") > run_hidden.vbs
echo objShell.Run "cmd /c php -S localhost:3001 -t ""%~dp0backend""", 0, False >> run_hidden.vbs
echo objShell.Run "cmd /c cd /d ""%~dp0frontend"" && npm run dev", 0, False >> run_hidden.vbs

:: Gizli baslat
cscript //nologo run_hidden.vbs
del run_hidden.vbs

echo Sunucular arka planda baslatildi.
echo Kapatmak icin kapat.bat dosyasini calistirin.
timeout /t 4 >nul
start http://localhost:3000
exit
