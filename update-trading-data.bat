@echo off
chcp 65001 >nul
echo ========================================
echo   🔄 تحديث بيانات التداول من TradingView
echo ========================================
echo.

echo 🐍 تشغيل جامع البيانات...
echo 📊 جاري جلب البيانات للرموز الافتراضية...
echo.

python scripts\data_fetcher.py

echo.
if errorlevel 1 (
    echo ❌ حدث خطأ أثناء جلب البيانات
    echo 💡 تحقق من:
    echo   - اتصالك بالإنترنت
    echo   - صحة معلومات MongoDB
    echo   - ملف السجل trading_data.log
) else (
    echo ✅ تم تحديث البيانات بنجاح!
    echo 💾 تم حفظ البيانات في MongoDB وملفات CSV
)

echo.
echo 📁 للتحقق من البيانات المحفوظة:
echo   - MongoDB: قاعدة البيانات TradingViewData
echo   - CSV: مجلد data_15min
echo.

pause
