/* ============================================================
   مؤسسة أثر، السلوك المشترك بين الصفحات
   Vanilla JS، بلا مكتبات.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- الترويسة ---------- */
  var header = $('#header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- القائمة ---------- */
  var toggle = $('#navToggle');
  var nav = $('#nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && nav.classList.contains('is-open')) setOpen(false);
    }, { passive: true });
  }

  /* ---------- الصفحة الحالية في القائمة ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  $$('#nav a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('#')[0];
    if (href && href === here) a.setAttribute('aria-current', 'page');
  });

  /* ---------- التذييل الموحد ---------- */
  var footer = $('#siteFooter');
  if (footer) {
    footer.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            '<img src="assets/img/logo-h.svg" alt="مؤسسة أثر للإعلام الوقفي" width="150" height="32" loading="lazy">' +
            '<p>أول مؤسسة إعلامية عربية متفرغة للوقف، توعيةً وتوثيقًا. من عمّان، منذ عام <span class="num">2021</span>.</p>' +
          '</div>' +
          '<div><h4>المؤسسة</h4><nav aria-label="روابط المؤسسة">' +
            '<a href="about.html">عن المؤسسة</a>' +
            '<a href="about.html#journey">رحلتنا</a>' +
            '<a href="about.html#management">الإدارة</a>' +
            '<a href="https://majednamous.com" target="_blank" rel="noopener">موقع ماجد ناموس</a>' +
          '</nav></div>' +
          '<div><h4>المحتوى</h4><nav aria-label="روابط المحتوى">' +
            '<a href="programs.html">برامج أثر</a>' +
            '<a href="programs.html#work">أعمالنا الإعلامية</a>' +
            '<a href="programs.html#calendar">رزنامة أثر</a>' +
            '<a href="museum.html">متحف أثر الوقفي</a>' +
          '</nav></div>' +
          '<div><h4>مبادرات</h4><nav aria-label="روابط المبادرات">' +
            '<a href="certificate.html">الوقف المعنوي</a>' +
            '<a href="contact.html">تواصل معنا</a>' +
            '<a href="https://wa.me/962777452266" target="_blank" rel="noopener">واتساب</a>' +
          '</nav></div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© <span class="num">' + new Date().getFullYear() + '</span> مؤسسة أثر للإعلام الوقفي، جميع الحقوق محفوظة</span>' +
          '<span class="footer-social">' +
            '<a href="https://www.instagram.com/atharwaqf" target="_blank" rel="noopener" aria-label="إنستقرام"><svg viewBox="0 0 24 24" fill-rule="evenodd" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zm0 2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2zM17.7 5.9a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg></a>' +
            '<a href="https://x.com/atharwaqf" target="_blank" rel="noopener" aria-label="إكس"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.5l-5.1-6.7L5.7 22H2.6l7.6-8.7L1.6 2h6.7l4.6 6.1L18.9 2zm-1.1 18h1.8L7.3 3.9H5.4L17.8 20z"/></svg></a>' +
            '<a href="https://www.youtube.com/@atharWaqf" target="_blank" rel="noopener" aria-label="يوتيوب"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 4 12 4 12 4s-4.6 0-7.8.2c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.4.8 11.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 7.6.2s4.6 0 7.8-.2c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.8 15.3V8.7l6.2 3.3-6.2 3.3z"/></svg></a>' +
            '<a href="https://www.facebook.com/AtharWaqf" target="_blank" rel="noopener" aria-label="فيسبوك"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V13h2.7v8h3.2z"/></svg></a>' +
            '<a href="https://wa.me/962777452266" target="_blank" rel="noopener" aria-label="واتساب"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.2-.7l.5-.6c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.1-.6 3.5.7 1.6 2 3.3 3.8 4.5 2.3 1.5 3.3 1.6 4.3 1.4.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.2-.3-.2-.4-.3z"/></svg></a>' +
          '</span>' +
        '</div>' +
      '</div>';
  }

  /* ---------- ظهور هادئ عند التمرير ---------- */
  var items = $$('[data-r], [data-r-group]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.hasAttribute('data-r-group')) {
          $$(':scope > *', el).forEach(function (child, i) {
            child.style.transitionDelay = Math.min(i * 80, 480) + 'ms';
          });
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- تشغيل المقاطع عند ظهورها فقط ---------- */
  var vids = $$('video[data-lazy]');
  if (vids.length && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { if (v.paused) v.play().catch(function () {}); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- إقفال الوسائط: لا قائمة سياق ولا سحب ولا حفظ مباشر ---------- */
  var MEDIA = 'img, video, canvas, picture, source, .strip, .gallery, .program-portrait, .figure-block, .cert-canvas, .frame, .brand, .footer-brand';
  document.addEventListener('contextmenu', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest(MEDIA)) e.preventDefault();
  }, { capture: true });
  document.addEventListener('dragstart', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'IMG' || t.tagName === 'VIDEO' || t.tagName === 'CANVAS' || (t.closest && t.closest(MEDIA)))) e.preventDefault();
  }, { capture: true });
  $$('img, video, canvas').forEach(function (el) {
    el.setAttribute('draggable', 'false');
    if (el.tagName === 'VIDEO') el.setAttribute('controlsList', 'nodownload noplaybackrate');
  });
})();
