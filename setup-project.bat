@echo off
chcp 65001 >nul
echo ========================================
echo   ⚙️ إعداد مشروع التحليل الياباني ⚙️
echo ========================================
echo.

echo 🎯 هذا الملف سيقوم بإعداد المشروع للعمل مع:
echo   📊 TradingView لجلب البيانات
echo   🗄️ MongoDB لتخزين البيانات
echo   🕯️ تحليل الشموع اليابانية
echo   📈 أدوات جان والفيبوناتشي
echo.

pause

echo 📦 التحقق من المتطلبات...

echo 🔍 التحقق من Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير مثبت
    echo 📥 يرجى تنزيل وتثبيت Node.js من: https://nodejs.org
    echo 🔄 أعد تشغيل هذا الملف بعد التثبيت
    pause
    exit /b 1
)
echo ✅ Node.js مثبت: 
node --version

echo 🔍 التحقق من Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python غير مثبت
    echo 📥 يرجى تنزيل وتثبيت Python من: https://www.python.org
    echo 🔄 أعد تشغيل هذا الملف بعد التثبيت
    pause
    exit /b 1
)
echo ✅ Python مثبت: 
python --version

echo 🔍 التحقق من pip...
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip غير متوفر
    echo 📥 يرجى إعادة تثبيت Python مع تضمين pip
    pause
    exit /b 1
)
echo ✅ pip متوفر

echo.
echo 🏗️ بدء عملية الإعداد...

echo 📦 تثبيت تبعيات Node.js للمشروع الرئيسي...
npm install
if errorlevel 1 (
    echo ❌ فشل في تثبيت تبعيات المشروع الرئيسي
    pause
    exit /b 1
)
echo ✅ تم تثبيت تبعيات المشروع الرئيسي

echo 📁 إنشاء مجلد الخادم إذا لم يكن موجوداً...
if not exist "server" mkdir server

echo 📦 تثبيت تبعيات الخادم...
cd server
npm install
if errorlevel 1 (
    echo ❌ فشل في تثبيت تبعيات الخادم
    cd ..
    pause
    exit /b 1
)
echo ✅ تم تثبيت تبعيات الخادم
cd ..

echo 🐍 تثبيت تبعيات Python...
pip install -r requirements.txt
if errorlevel 1 (
    echo ⚠️ تحذير: فشل في تثبيت بعض تبعيات Python
    echo 💡 سيتم المحاولة مع التبعيات الأساسية...
    
    echo 📦 تثبيت التبعيات الأساسية...
    pip install pandas numpy websocket-client requests pymongo tqdm
    if errorlevel 1 (
        echo ❌ فشل في تثبيت التبعيات الأساسية
        echo 💡 تحقق من اتصالك بالإنترنت وأعد المحاولة
        pause
        exit /b 1
    )
)
echo ✅ تم تثبيت تبعيات Python

echo 📁 إنشاء المجلدات المطلوبة...
if not exist "data_15min" mkdir data_15min
if not exist "scripts" mkdir scripts
echo ✅ تم إنشاء المجلدات

echo 🗄️ اختبار الاتصال مع MongoDB...
echo import pymongo; print("✅ اختبار الاتصال مع MongoDB..."); client = pymongo.MongoClient("mongodb+srv://admin:admin123@tradingviewdb.yc0suhj.mongodb.net/"); print("✅ الاتصال ناجح!"); client.close() > test_mongo.py
python test_mongo.py
if errorlevel 1 (
    echo ⚠️ تحذير: فشل في الاتصال مع MongoDB
    echo 💡 تحقق من:
    echo   - اتصالك بالإنترنت
    echo   - صحة معلومات قاعدة البيانات
) else (
    echo ✅ اتصال MongoDB ناجح
)
del test_mongo.py >nul 2>&1

echo.
echo 🎉 تم إكمال الإعداد بنجاح!
echo.
echo 📋 الخطوات التالية:
echo   1️⃣ تشغيل: start-japanese-analysis.bat
echo   2️⃣ أو تحديث البيانات: update-trading-data.bat
echo   3️⃣ افتح المتصفح على: http://localhost:5000
echo.
echo 💡 معلومات إضافية:
echo   📊 البيانات تُحفظ في MongoDB والمجلد data_15min
echo   📝 السجلات في: trading_data.log
echo   🔧 إعدادات الخادم في: server/server.js
echo.

pause

echo 🚀 هل تريد تشغيل التطبيق الآن؟ (y/n)
set /p choice="> "
if /i "%choice%"=="y" (
    echo 🔄 تشغيل التطبيق...
    call start-japanese-analysis.bat
) else (
    echo 👋 يمكنك تشغيل التطبيق لاحقاً باستخدام start-japanese-analysis.bat
    pause
)
