@echo off
title تشغيل النظام الكامل - MongoDB + TradingView + React
echo ========================================
echo   نظام التحليل المتقدم للشموع اليابانية
echo   مع قاعدة بيانات MongoDB السحابية
echo ========================================
echo.

echo [1/3] تشغيل خادم MongoDB API...
cd /d "%~dp0server"
start "MongoDB Server" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo [2/3] تشغيل تطبيق React...
cd /d "%~dp0"
start "React App" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] فتح التطبيق في المتصفح...
start http://localhost:3001

echo.
echo ========================================
echo   النظام يعمل الآن!
echo   - خادم MongoDB: http://localhost:5000
echo   - تطبيق React: http://localhost:3001
echo   - لإيقاف النظام: اغلق جميع النوافذ
echo ========================================
echo.
pause
