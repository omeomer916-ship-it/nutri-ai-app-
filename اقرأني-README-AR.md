# Nutri AI — التطبيق الحقيقي (آيفون + أندرويد)

هذا مشروع **Expo / React Native**: كود واحد يطلع منه تطبيق آيفون وتطبيق أندرويد.
نفس الهوية: أسود #000000 + أخضر #39E68C + أبيض، وشعار الورقة، وصورك.

## شو موجود في هالنسخة (المرحلة 1)
- مقدمة 4 شاشات بصورك + بطاقات متحركة + زر Google + المتابعة كضيف
- أسئلة البداية (الجنس، العمر، الطول، الوزن، الهدف، الوزن المستهدف، النشاط) ← تحسب خطتك
- **اليوم**: حلقة السعرات، العناصر، الوجبات، الماء، أنواع الوجبات بالصور
- **مسح**: كاميرا حقيقية + معرض ← الذكاء الاصطناعي يحسب السعرات ← حفظ
- **المدرب الذكي**: محادثة تعرف أهدافك وأكل يومك
- **التقدّم**: آخر 7 أيام، المتوسطات، الأيام المتتالية، الوزن مع رسم بياني
- **حسابي**: الأهداف، اللغة (عربي/إنجليزي)، إعادة الخطة، حذف البيانات
- كل شيء محفوظ على الجوال (حتى بعد إغلاق التطبيق)

## اللي بتحتاجه
1. **كمبيوتر** (ويندوز أو ماك) — للتشغيل والبناء أول مرة.
2. حساب مجاني على **expo.dev** وتطبيق **Expo Go** على جوالك.
3. حساب مجاني على **vercel.com** + مفتاح **OpenAI** (للذكاء الاصطناعي).
4. للنشر: Google Play (25$ مرة وحدة)، App Store (99$ بالسنة).

## الخطوة 1: شغّل خادم الذكاء الاصطناعي (مرة وحدة)
المفتاح السري لازم يكون على خادم، **مش** جوّا التطبيق (وإلا أي حد بيسرقه).
1. ارفع مجلد `server` على GitHub (مستودع جديد).
2. افتح vercel.com ← Add New Project ← اختار المستودع.
3. في Environment Variables أضف: `OPENAI_API_KEY` = مفتاحك.
4. اضغط Deploy. رح يعطيك رابط متل `https://nutri-ai-server.vercel.app`.

## الخطوة 2: شغّل التطبيق على جوالك
على الكمبيوتر (بعد تثبيت Node.js من nodejs.org):
```bash
cd nutri-ai-app
npm install
npx expo install --fix
```
انسخ `.env.example` إلى ملف اسمه `.env` وحط رابط الخادم:
```
EXPO_PUBLIC_API_URL=https://nutri-ai-server.vercel.app
```
بعدين:
```bash
npx expo start
```
افتح **Expo Go** على جوالك وامسح الـ QR. التطبيق بيفتح على جوالك فوراً.

## الخطوة 3: ملف APK للتثبيت على الجوال
شوف الملف **«طريقة-بناء-APK.md»** — فيه كل الخطوات بالتفصيل.

## الخطوة 4: ابنِ نسخة للمتجر
```bash
npm install -g eas-cli
eas login
eas build -p android     # ملف للـ Google Play
eas build -p ios         # للآيفون (بدها حساب Apple Developer)
```

## تسجيل الدخول بـ Google (اختياري — المرحلة 2)
1. Google Cloud Console ← APIs & Services ← Credentials ← OAuth client ID.
2. اعمل Client ID للأندرويد (package: `com.nutriai.app`)، وللآيفون (bundle: `com.nutriai.app`)، وواحد Web.
3. حطهم في `.env`:
```
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
```
قبل ما تحطهم، زر Google بيكمّل كضيف تلقائياً.

## خريطة الملفات
```
app/intro.tsx            المقدمة وتسجيل الدخول
app/onboarding.tsx       أسئلة البداية والخطة
app/(tabs)/today.tsx     اليوم
app/(tabs)/scan.tsx      الماسح
app/(tabs)/coach.tsx     المدرب الذكي
app/(tabs)/progress.tsx  التقدّم والوزن
app/(tabs)/profile.tsx   حسابي
src/i18n.ts              كل النصوص (عربي/إنجليزي)
src/theme.ts             الألوان والصور
src/store.ts             حفظ البيانات
src/ai.ts                الاتصال بالخادم
server/api/scan.js       تحليل صورة الوجبة
server/api/chat.js       المدرب الذكي
assets/images/           الصور (بدّلها بنفس الاسم لتغييرها)
```

## المرحلة الجاية
- تسجيل دخول Google + حفظ بالسحابة (Supabase أو Firebase) لنقل البيانات بين الأجهزة
- إشعارات حقيقية للتذكيرات
- فيديو خلفية لشاشة الدخول والماسح
- باقي اللغات
