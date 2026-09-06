# -*- coding: utf-8 -*-
"""يبني صفحة متحف أثر الوقفي من قائمة البنرات في build.py"""
import os, io
from build import BANNERS, FULL, PREV

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))

HEAD = '''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>متحف أثر الوقفي، مؤسسة أثر للإعلام الوقفي</title>
<meta name="description" content="متحف أثر الوقفي في عمّان: لوحات وقفية تُعرض مطبوعة، تروي كل واحدة منها فكرة وقفية بصورة وكلمة، ويمكن تنزيلها بجودة الطباعة.">
<link rel="canonical" href="https://atharwaqf.com/museum.html">
<meta property="og:type" content="website">
<meta property="og:title" content="متحف أثر الوقفي">
<meta property="og:description" content="لوحات وقفية تُعرض في متحف وقفي بعمّان، متاحة للتنزيل بجودة الطباعة.">
<meta name="theme-color" content="#fbfaf6">
<link rel="icon" type="image/svg+xml" href="assets/img/logo-v.svg">
<link rel="preload" href="assets/fonts/Qomra-Light.otf" as="font" type="font/otf" crossorigin>
<link rel="stylesheet" href="assets/css/athar.css?v=1">
<script>document.documentElement.className+=" js";</script>
</head>
<body>
<a href="#main" class="skip-link">تجاوز إلى المحتوى</a>

<header class="header" id="header">
  <div class="container">
    <div class="bar">
      <a href="index.html" class="brand" aria-label="مؤسسة أثر، الصفحة الرئيسية">
        <img src="assets/img/logo-h.svg" alt="مؤسسة أثر للإعلام الوقفي" width="112" height="24">
      </a>
      <nav class="nav" id="nav" aria-label="التنقل الرئيسي">
        <a href="index.html">الرئيسية</a>
        <a href="about.html">عن المؤسسة</a>
        <a href="programs.html">برامج أثر</a>
        <a href="museum.html">المتحف</a>
        <a href="certificate.html">الوقف المعنوي</a>
        <a href="contact.html">تواصل</a>
      </nav>
      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="nav" aria-label="فتح القائمة">
        <span></span><span></span>
      </button>
    </div>
  </div>
</header>

<main id="main">

  <section class="page-head">
    <div class="container">
      <span class="eyebrow" data-r>متحف لوحات وقفية في عمّان</span>
      <h1 class="display" data-r>متحف أثر الوقفي</h1>
      <div class="museum-intro" data-r>
        <p class="lead">
          لوحاتٌ وقفية تلهم الناس بأفكار حول الوقف معروضة في متحفٍ خاص لها في عمّان؛
          كل لوحةٍ تحمل فكرة وقفية واحدة بصورةٍ هادئة وكلمةٍ موجزة، لتقول لمن يراها
          إنّ للوقف وجوهًا أكثر مما نظن.
        </p>
        <p class="muted">
          اللوحات متاحة هنا بجودة الطباعة الكاملة، لمن أراد عرضها في مسجدٍ أو مدرسةٍ
          أو مؤسسةٍ وقفية.
        </p>
      </div>
    </div>
  </section>

  <section class="section section--rule">
    <div class="container">
      <div class="museum-grid">
'''

CARD = '''        <article class="banner-card" data-r>
          <figure><img src="assets/museum/preview/{slug}.jpg"
            srcset="assets/museum/preview/sm/{slug}.jpg 500w, assets/museum/preview/{slug}.jpg 1000w"
            sizes="(max-width:560px) min(64vw,290px), (max-width:960px) 44vw, 30vw"
            alt="{title}" width="1000" height="2000" loading="{load}" decoding="async" fetchpriority="{prio}"></figure>
          <h3>{title}</h3>{subline}
          <a class="dl" href="assets/museum/print/{slug}.jpg" download="{title}.jpg">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13"/><path d="M7 12l5 5 5-5"/><path d="M4 21h16"/></svg>
            تنزيل اللوحة
          </a>
        </article>
'''

FOOT = '''      </div>

      <div class="museum-note">
        <span>اللوحات معدّة للطباعة بمقاس <span class="num">1</span> متر عرض × <span class="num">2</span> متر ارتفاع.</span>
        <span>للتنسيق حول عرض اللوحات: <a href="contact.html">تواصلوا معنا</a></span>
      </div>
    </div>
  </section>

</main>

<footer class="footer" id="siteFooter"></footer>
<script src="assets/js/athar.js?v=1" defer></script>
</body>
</html>
'''


def build_page():
    cards = []
    n = 0
    for slug, fname, title, sub in BANNERS:
        n += 1
        subline = '\n          <p>%s</p>' % sub if sub else ''
        eager = n <= 2
        cards.append(CARD.format(slug=slug, title=title, subline=subline,
                                 load='eager' if eager else 'lazy',
                                 prio='high' if eager else 'low'))
    html = HEAD + ''.join(cards) + FOOT
    out = os.path.join(SITE, 'museum.html')
    io.open(out, 'w', encoding='utf-8').write(html)
    print('كُتبت الصفحة بـ', n, 'لوحة')


if __name__ == '__main__':
    build_page()
