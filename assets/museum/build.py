# -*- coding: utf-8 -*-
"""يجهّز ملفات متحف أثر الوقفي للموقع: نسخة كاملة للتنزيل ومعاينة خفيفة للعرض."""
import os, shutil
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
SRC  = os.path.join(os.path.dirname(SITE), 'بنرات')
FULL = os.path.join(HERE, 'full')
PREV = os.path.join(HERE, 'preview')

# (المعرّف, اسم الملف المصدر, العنوان, السطر المرافق)
BANNERS = [
    ('olive',        'وقف الزيتون.png',        'وقف الزيتون',              'غرسٌ مبارك.. وأثرٌ باقٍ..'),
    ('mushaf',       'وقف المصاحف.png',        'وقف المصاحف والكتب',       'يدوم نفعه وأثره، ولا ينقطع أجره..'),
    ('palms',        'وقف النخيل.png',         'وقف النخيل',               'يمتد خيره، ويستدام أثره'),
    ('prisoners',    'وقف الأسرى.png',         'وقف الأسرى',               'تفريج كربة.. وبناء أمل..'),
    ('bride',        'وقف تجهيز العروس.png',   'وقف تجهيز العروس',         'لبدايةٍ كريمة.. وأثرٌ يمتدّ في حياة الزوجين'),
    ('fruit',        'وقف الثمار.png',         'وقف الثمار',               'كل ثمرةٍ ينتفع بها مخلوق.. صدقةٌ تُكتب لواقفها'),
    ('water',        'وقف الماء.png',          'وقف الماء',                'جودٌ لا ينضب.. وأجرٌ لا ينقطع'),
    ('health',       'الوقف الصحي.png',        'الوقف الصحي',              'وقفٌ يداوي الألم.. ويمتدّ أثره أجرًا'),
    ('nursing',      'وقف المرضعات.png',       'وقف المرضعات',             'غذاءٌ لصغير، وفرجٌ لأهله.. وأجرٌ لواقف'),
    ('family',       'الوقف الذري.png',        'الوقف الذري',              'أثرٌ يمتدّ.. في أهلك وذريّتك'),
    ('cats',         'وقف القطط.png',          'وقف القطط',                'إحياءُ معنى الرفق.. بالحيوان'),
    ('adahi',        'وقف الأضاحي.png',        'وقف الأضاحي',              'إحياءٌ للسنة.. وإسعادٌ للقلوب'),
    ('iftar',        'وقف تفطير الصائم.png',   'وقف تفطير الصائم',         'من فطّر صائمًا.. كان له مثل أجره'),
    ('universities', 'وقف الجامعات .png',      'وقف الجامعات والبحث العلمي', 'استثمارٌ في العقول.. وبناءُ مستقبل الأمة ونهضتها'),
]

PREVIEW_W = 1000


def build():
    os.makedirs(FULL, exist_ok=True)
    os.makedirs(PREV, exist_ok=True)
    ready = []
    for slug, fname, title, sub in BANNERS:
        src = os.path.join(SRC, fname)
        if not os.path.exists(src):
            print('ناقص:', fname)
            continue
        try:
            im = Image.open(src)
            im.load()
            im = im.convert('RGB')
        except Exception as e:
            print('تالف أو قيد الكتابة، تخطّيته:', fname, e.__class__.__name__)
            continue
        dst = os.path.join(FULL, slug + '.png')
        if not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst):
            shutil.copy2(src, dst)
        im = im.resize((PREVIEW_W, int(im.height * PREVIEW_W / im.width)), Image.LANCZOS)
        im.save(os.path.join(PREV, slug + '.jpg'), quality=82, optimize=True, progressive=True)
        ready.append((slug, title, sub, os.path.getsize(dst)))
        print('جاهز:', slug, round(os.path.getsize(dst)/1e6, 1), 'م.ب')
    return ready


if __name__ == '__main__':
    build()
