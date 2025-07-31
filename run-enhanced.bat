@echo off
title تشغيل التطبيق مع لوحة التحكم الجديدة
color 0A

echo.
echo ================================================================
echo               🎯 كوكبة الأرقام السحرية - الإصدار المحسن
echo ================================================================
echo.
echo 🆕 الميزات الجديدة:
echo    ⚙️ لوحة التحكم الشاملة في التحليل الفني
echo    📊 إعدادات قابلة للتخصيص
echo    🔄 أنماط الانعكاس المتطورة
echo    📈 معايير الصعود والهبوط
echo    📅 فترات زمنية مخصصة
echo.
echo ================================================================
echo.

:menu
echo اختر طريقة التشغيل:
echo.
echo [1] تشغيل التطبيق الرئيسي (خادم التطوير)
echo [2] معاينة لوحة التحكم (HTML)
echo [3] اختبار الإعدادات الجديدة
echo [4] عرض توضيحي متقدم
echo [5] فتح ملف README الجديد
echo [0] خروج
echo.
set /p choice="أدخل اختيارك (0-5): "

if "%choice%"=="1" goto run_dev
if "%choice%"=="2" goto show_control_panel
if "%choice%"=="3" goto test_settings
if "%choice%"=="4" goto advanced_demo
if "%choice%"=="5" goto show_readme
if "%choice%"=="0" goto exit
goto invalid

:run_dev
echo.
echo 🚀 تشغيل خادم التطوير...
echo ================================================================
echo.
echo تأكد من تثبيت المتطلبات بتشغيل: npm install
echo.
echo سيتم تشغيل التطبيق مع الميزات الجديدة...
echo البوابة الافتراضية: http://localhost:5173
echo.
pause
npm run dev
goto end

:show_control_panel
echo.
echo 👀 فتح معاينة لوحة التحكم...
echo ================================================================
start "" "launch-app.html"
echo.
echo تم فتح صفحة التشغيل في المتصفح!
echo يمكنك اختيار العرض التوضيحي المناسب من الصفحة.
goto continue

:test_settings
echo.
echo 🧪 فتح اختبار الإعدادات...
echo ================================================================
start "" "analysis-settings-test.html"
echo.
echo تم فتح صفحة اختبار الإعدادات في المتصفح!
goto continue

:advanced_demo
echo.
echo 🎯 فتح العرض التوضيحي المتقدم...
echo ================================================================
start "" "advanced-analysis-demo.html"
echo.
echo تم فتح العرض التوضيحي المتقدم في المتصفح!
goto continue

:show_readme
echo.
echo 📖 فتح ملف README المحدث...
echo ================================================================
start "" "README-ENHANCED.md"
echo.
echo تم فتح ملف README في المحرر الافتراضي!
goto continue

:invalid
echo.
echo ❌ اختيار غير صحيح! يرجى المحاولة مرة أخرى.
echo.
goto menu

:continue
echo.
echo ================================================================
echo.
pause
goto menu

:exit
echo.
echo 👋 شكراً لاستخدام كوكبة الأرقام السحرية!
echo ================================================================
goto end

:end
pause
