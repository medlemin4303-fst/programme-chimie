# Programme Chimie — دليل التشغيل الكامل

## 1) ما الذي تم إصلاحه في الكود
- رفع حقيقي للملفات إلى **Firebase Storage** (مع شريط تقدم فعلي، وليس شكليًا).
- حفظ رابط التحميل (`url`) في Firestore، مع إمكانية **فتح/تحميل PDF** بالنقر على أي ملف.
- إضافة **حذف الملفات** (من Storage و Firestore معًا).
- إصلاح دالة `renderRecentFiles()` المفقودة (كانت تسبب كسر التطبيق).
- **رسائل خطأ حقيقية** عند فشل تسجيل الدخول (كلمة سر خاطئة، بريد مستخدم، إلخ).
- تحديد حجم أقصى للملف (25 ميغابايت) والتحقق من نوع PDF.
- ترتيب الملفات حسب تاريخ الرفع (الأحدث أولاً).
- إضافة **manifest.json** + **Service Worker** (`sw.js`) → التطبيق أصبح PWA حقيقي قابل للتثبيت ويعمل جزئيًا دون إنترنت (تصفح الملفات المخزنة مسبقًا؛ الرفع وتسجيل الدخول يحتاجان اتصالاً بالطبع).
- تجهيز مشروع **Capacitor** لتحويله لتطبيق أندرويد (APK).

## 2) خطوات إلزامية في Firebase Console (قبل أي تجربة)

### أ) تفعيل Storage
1. ادخل إلى [Firebase Console](https://console.firebase.google.com) → مشروعك `mychemistryapp`.
2. من القائمة الجانبية: **Storage** → **Get Started** → اختر أقرب موقع للخادم.

### ب) لصق قواعد الأمان
- **Firestore** → تبويب **Rules** → الصق محتوى ملف `firestore.rules` المرفق → **Publish**.
- **Storage** → تبويب **Rules** → الصق محتوى ملف `storage.rules` المرفق → **Publish**.

بدون هاتين الخطوتين، سيفشل الرفع بخطأ صلاحيات (`permission-denied`).

## 3) تجربة التطبيق كـ PWA (على المتصفح مباشرة)
Service Worker يتطلب تشغيل الملفات عبر خادم حقيقي (وليس فتح الملف مباشرة بصيغة `file://`). أسهل طريقة محليًا:

```bash
cd www
python3 -m http.server 8080
```

ثم افتح `http://localhost:8080` في المتصفح. من قائمة المتصفح ستجد خيار **"تثبيت التطبيق" / Add to Home Screen**.

بعد رفع الملفات على استضافة حقيقية (مثل Firebase Hosting نفسها)، PWA سيعمل بشكل كامل تلقائيًا لأنه سيكون على `https`.

## 4) تحويل المشروع إلى تطبيق أندرويد (APK) عبر Capacitor

هذه الخطوات يجب تنفيذها على جهازك (تحتاج Node.js + Android Studio مثبتين):

```bash
# 1. داخل مجلد المشروع (حيث package.json و capacitor.config.json)
npm install

# 2. إضافة منصة أندرويد
npx cap add android

# 3. مزامنة ملفات الويب (www/) مع المشروع الأندرويدي
npx cap sync android

# 4. فتح المشروع في Android Studio
npx cap open android
```

داخل Android Studio:
- انتظر انتهاء Gradle Sync.
- لتجربة سريعة: **Run ▶** على محاكي أو هاتف حقيقي.
- لإصدار APK نهائي: **Build → Generate Signed Bundle / APK → APK** واتبع الخطوات (إنشاء Keystore أول مرة).

> ملاحظة: أي تعديل لاحق على `index.html` يجب أن يُنسخ إلى `www/index.html` ثم `npx cap sync android` قبل إعادة البناء.

## 5) نشر التطبيق على الويب (اختياري لكن موصى به)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # اختر مجلد www كـ public directory
firebase deploy
```
سيعطيك هذا رابطًا مباشرًا بصيغة `https://mychemistryapp.web.app` — استضافة مجانية وسريعة ومتوافقة تمامًا مع PWA و Service Worker.

## 6) هيكل الملفات
```
├── index.html          # التطبيق (تم إصلاحه)
├── manifest.json        # إعدادات PWA
├── sw.js                 # Service Worker (عمل دون اتصال)
├── icon-192.png / icon-512.png
├── firestore.rules       # قواعد أمان Firestore (يجب لصقها في Console)
├── storage.rules         # قواعد أمان Storage (يجب لصقها في Console)
├── capacitor.config.json # إعداد Capacitor
├── package.json
└── www/                  # نسخة الويب الجاهزة لـ Capacitor (نفس محتوى الجذر)
```

## 7) ما لم يُنفَّذ عمدًا (يحتاج قرارات منك أولًا)
- **نظام Admin منفصل / صلاحيات متعددة**: يحتاج تصميم أدوار (role-based) — أخبرني إن أردت إضافته.
- **إشعارات FCM**: تحتاج مفتاح VAPID وإعداد صلاحيات إشعارات المتصفح/الهاتف.
- **ضغط PDF**: يحتاج مكتبة خارجية على الخادم (Cloud Functions)، غير عملي في المتصفح مباشرة.
- **Backup تلقائي**: يُفعَّل من Firebase Console (Firestore → Backups) أو عبر Cloud Functions مجدولة.

هذه النقاط الأربع كل واحدة منها قرار معماري منفصل وليست إصلاح خطأ — أخبرني إن أردت أن ننفذ أيًا منها بالتفصيل.
