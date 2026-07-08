/* ============================================================
   مؤسسة أثر — المكونات المشتركة بين الصفحات
   الترويسة + التذييل الموحد + حركات الظهور
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header ---------- */
  const header = $('#header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile dropdown nav ---------- */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  if (navToggle && navLinks) {
    const isOpen = () => navLinks.classList.contains('open');

    const open = () => {
      navLinks.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'إغلاق القائمة');
    };

    const close = () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'فتح القائمة');
    };

    navToggle.addEventListener('click', () => { isOpen() ? close() : open(); });
    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !e.target.closest('.header')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
    // If the viewport grows past the mobile breakpoint while open, tidy up
    window.addEventListener('resize', () => {
      if (isOpen() && window.innerWidth > 960) close();
    }, { passive: true });
  }

  /* ---------- Unified footer component ---------- */
  const footerMount = $('#siteFooter');
  if (footerMount) {
    footerMount.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="assets/img/logo-h.svg" alt="مؤسسة أثر للإعلام الوقفي" loading="lazy" width="220" height="47">
          <p>
            أول مؤسسة إعلامية متخصصة في التوعية بالوقف وتوثيق قصصه الملهمة
            في العالم العربي والإسلامي.
          </p>
        </div>
        <div>
          <h4>المؤسسة</h4>
          <nav class="footer-nav" aria-label="روابط المؤسسة">
            <a href="index.html#about">عن المؤسسة</a>
            <a href="index.html#timeline">رحلتنا</a>
            <a href="index.html#work">أعمالنا</a>
            <a href="index.html#gm">الإدارة</a>
          </nav>
        </div>
        <div>
          <h4>المحتوى</h4>
          <nav class="footer-nav" aria-label="روابط المحتوى">
            <a href="index.html#videos">برامج أثر</a>
            <a href="index.html#vmv">رؤيتنا ورسالتنا</a>
          </nav>
        </div>
        <div>
          <h4>مبادرات</h4>
          <nav class="footer-nav" aria-label="روابط المبادرات">
            <a href="certificate.html">الوقف المعنوي</a>
            <a href="index.html#calendar">رزنامة أثر</a>
            <a href="index.html#contact">تواصل معنا</a>
          </nav>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span class="num">${new Date().getFullYear()}</span> مؤسسة أثر للإعلام الوقفي — جميع الحقوق محفوظة</span>
      </div>
    </div>`;
  }

  /* ---------- Scroll reveal (shared) ---------- */
  const revealEls = $$('.reveal, .reveal-r, .reveal-l, .reveal-img, [data-stagger]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          if (en.target.hasAttribute('data-stagger')) {
            $$(':scope > *', en.target).forEach((child, i) => {
              child.style.transitionDelay = `${Math.min(i * 90, 540)}ms`;
            });
          }
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }
})();
