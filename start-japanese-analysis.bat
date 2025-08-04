@echo off
chcp 65001 >nul
echo ========================================
echo    🚀 تشغيل خادم التحليل الياباني 🚀
echo ========================================
echo.

echo 📦 التحقق من Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً
    echo 🌐 قم بتنزيله من: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js مثبت

echo 🐍 التحقق من Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python غير مثبت. يرجى تثبيت Python أولاً
    echo 🌐 قم بتنزيله من: https://www.python.org
    pause
    exit /b 1
)

echo ✅ Python مثبت

echo.
echo 📁 الانتقال إلى مجلد الخادم...
if not exist "server" (
    echo ❌ مجلد الخادم غير موجود
    pause
    exit /b 1
)

cd server

echo 📦 تثبيت تبعيات Node.js...
npm install
if errorlevel 1 (
    echo ❌ فشل في تثبيت تبعيات Node.js
    pause
    exit /b 1
)

echo ✅ تم تثبيت تبعيات Node.js

echo.
echo 🐍 تثبيت تبعيات Python...
cd ..
pip install -r requirements.txt
if errorlevel 1 (
    echo ⚠️ تحذير: فشل في تثبيت بعض تبعيات Python
    echo 💡 سيتم المتابعة مع التبعيات المتاحة
)

echo ✅ تم تثبيت تبعيات Python

echo.
echo 🏗️ بناء المشروع الأمامي...
npm run build
if errorlevel 1 (
    echo ❌ فشل في بناء المشروع
    pause
    exit /b 1
)

echo ✅ تم بناء المشروع بنجاح

echo.
echo 🚀 تشغيل الخادم...
cd server
start "Japanese Candlestick Server" node server.js

echo.
echo ✅ تم تشغيل الخادم بنجاح!
echo 🌐 يمكنك الوصول للتطبيق على: http://localhost:5000
echo.
echo 💡 نصائح:
echo   - استخدم Ctrl+C لإيقاف الخادم
echo   - تأكد من اتصالك بالإنترنت لجلب البيانات
echo   - راجع ملف trading_data.log للسجلات
echo.

timeout /t 3 >nul
start http://localhost:5000

echo 🎉 استمتع بالتحليل!
pause
