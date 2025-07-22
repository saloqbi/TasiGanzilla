#!/bin/bash
# سكريبت عرض شجرة ملفات المشروع بشكل مختصر ومرتب (جاهز للنسخ هنا)

# إذا لم يكن أمر tree متوفراً، حاول تثبيته (على لينكس فقط)
if ! command -v tree &> /dev/null
then
    echo "⚠️ أمر 'tree' غير مثبت. يمكنك تثبيته عبر: sudo apt install tree"
    # بديل بسيط:
    echo "بديل: عرض المجلدات والملفات:"
    find . -maxdepth 3 -print | sed 's|[^/]*/|  |g'
    exit
fi

# استعمل أمر tree وأرسل الناتج إلى ملف نصي (يمكنك نسخه من الترمينال)
tree -a -L 3 --dirsfirst --noreport > project-tree.txt

echo "تم إنشاء ملف project-tree.txt فيه شجرة المجلدات (حتى 3 مستويات)."
echo "انسخ محتواه وأرسله هنا."