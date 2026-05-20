@echo off
title Dostlar IT - Servisleri Kapat
echo ===================================
echo   Dostlar IT Destek Sistemi
echo ===================================
echo.
echo Arka planda calisan tum API ve Arayuz sunuculari kapatiliyor...

taskkill /F /IM node.exe >nul 2>&1

echo.
echo Islem tamamlandi. Tum sunucular durduruldu.
timeout /t 3 >nul
exit
