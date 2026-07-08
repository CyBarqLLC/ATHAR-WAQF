/* ============================================================
   مؤسسة أثر — سكربت الصفحة الرئيسية
   (المكونات المشتركة في site.js)
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SVG icon set ---------- */
  const ICONS = {
    report: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    search: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    book: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    research: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/><circle cx="11" cy="14" r="2.6"/><path d="M13 16l2.5 2.5"/></svg>',
    film: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 5v14M16 5v14M3 10h5M3 14h5M16 10h5M16 14h5"/></svg>',
    production: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="12" rx="3"/><path d="M16 11l5-3v8l-5-3"/></svg>',
    education: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z"/><path d="M6.5 11v5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-5"/></svg>',
    play: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>',
  };

  /* ============================================================
     1. Content renderers (data.js)
     ============================================================ */
  if (typeof ATHAR !== 'undefined') {

    /* Work cards */
    const workGrid = $('#workGrid');
    if (workGrid) {
      workGrid.innerHTML = ATHAR.work.map((w) => `
        <article class="work-card">
          <div class="icon" aria-hidden="true">${ICONS[w.icon] || ICONS.report}</div>
          <h3>${w.title}</h3>
          <p>${w.desc}</p>
        </article>`).join('');
    }

    /* Story cards */
    const storiesGrid = $('#storiesGrid');
    if (storiesGrid) {
      storiesGrid.innerHTML = ATHAR.stories.map((s) => `
        <a class="story-card" href="${s.link}" aria-label="قصة ${s.title}">
          <div class="story-art" style="background:linear-gradient(150deg,${s.gradient[0]},${s.gradient[1]})">
            <div class="story-pattern"></div>
          </div>
          <div class="story-body">
            <span class="story-tag">${s.tag}</span>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
            <span class="story-link">اقرأ الحكاية ←</span>
          </div>
        </a>`).join('');
    }

    /* Books slider */
    const booksTrack = $('#booksTrack');
    if (booksTrack) {
      booksTrack.innerHTML = ATHAR.books.map((b) => `
        <article class="book-card">
          <div class="book-cover" style="background:linear-gradient(160deg,${b.gradient[0]},${b.gradient[1]})">
            <div class="motif" aria-hidden="true"></div>
            <span class="b-kicker">من إصدارات أثر</span>
            <h3>${b.title}</h3>
          </div>
          <div class="book-meta">
            <span class="num">${b.year}</span>
            <span class="state">${b.state}</span>
          </div>
        </article>`).join('');

      const step = () => Math.min(booksTrack.clientWidth * 0.8, 560);
      $('#booksNext') && $('#booksNext').addEventListener('click', () => booksTrack.scrollBy({ left: -step(), behavior: 'smooth' }));
      $('#booksPrev') && $('#booksPrev').addEventListener('click', () => booksTrack.scrollBy({ left: step(), behavior: 'smooth' }));
    }

    /* Videos */
    const videoGrid = $('#videoGrid');
    if (videoGrid) {
      const frame = (v) => `
        <div class="video-frame" data-yt="${v.youtubeId || ''}" role="button" tabindex="0"
             aria-label="تشغيل ${v.title}">
          <div class="video-thumb">
            <span class="play-btn" aria-hidden="true">${ICONS.play}</span>
            <p class="v-title">${v.title}</p>
            <p class="v-ep">${v.ep}</p>
          </div>
        </div>`;
      const featured = ATHAR.episodes[0];
      const rest = ATHAR.episodes.slice(1);
      videoGrid.innerHTML = `
        <div class="video-featured reveal in">${frame(featured)}</div>
        <div class="video-side">${rest.map((v) => `<div class="reveal in">${frame(v)}</div>`).join('')}</div>`;

      videoGrid.addEventListener('click', (e) => {
        const f = e.target.closest('.video-frame');
        if (f) playVideo(f);
      });
      videoGrid.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('video-frame')) {
          e.preventDefault();
          playVideo(e.target);
        }
      });
      function playVideo(f) {
        const id = f.dataset.yt;
        if (!id) {
          window.open('https://www.youtube.com/@atharWaqf', '_blank', 'noopener');
          return;
        }
        f.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0"
          title="مشغل يوتيوب" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      }
    }

    /* Gallery masonry */
    const galleryGrid = $('#galleryGrid');
    if (galleryGrid) {
      galleryGrid.innerHTML = ATHAR.gallery.map((g) => {
        if (g.tile) {
          return `
            <div class="masonry-item">
              <div class="masonry-tile" style="background:linear-gradient(150deg,${g.gradient[0]},${g.gradient[1]})">
                <div><h3>${g.title}</h3><p>${g.text}</p></div>
              </div>
            </div>`;
        }
        return `
          <figure class="masonry-item" style="margin:0 0 18px;">
            <img src="${g.img}" alt="${g.cap}" loading="lazy" width="600" height="600">
            <figcaption class="cap">${g.cap}</figcaption>
          </figure>`;
      }).join('');
    }

    /* News */
    const newsGrid = $('#newsGrid');
    if (newsGrid) {
      newsGrid.innerHTML = ATHAR.news.map((n) => `
        <a class="news-card" href="${n.link}">
          <div class="news-media">
            <div class="art" style="background:
              radial-gradient(circle at 75% 25%, rgba(255,255,255,.22), transparent 55%),
              linear-gradient(150deg,${n.gradient[0]},${n.gradient[1]})"></div>
          </div>
          <div class="news-body">
            <span class="news-date">${n.date}</span>
            <h3>${n.title}</h3>
            <p>${n.desc}</p>
            <span class="news-more">اقرأ المزيد ←</span>
          </div>
        </a>`).join('');
    }

  }

  /* ============================================================
     Seamless infinite marquee — rebuilt with requestAnimationFrame
     ------------------------------------------------------------
     The complete item list is duplicated so the track holds TWO
     identical sequences. A rAF loop translates the whole track with
     translate3d() and, the instant the offset reaches exactly one
     sequence width, it adds that width back — because sequence #2 is
     pixel-identical to sequence #1 and sits directly after it, the
     wrap is invisible. There is no keyframe, no reset, no pause, no
     jump, no fade, and never any empty space. Runs forever.
     ============================================================ */
  function initSeamlessMarquee(track, pxPerSec) {
    if (!track) return;
    const originals = Array.from(track.children);
    const count = originals.length;
    if (!count) return;

    // Append one more copy of the ORIGINAL list to the track
    const appendCopy = () => {
      const frag = document.createDocumentFragment();
      originals.forEach((node) => frag.appendChild(node.cloneNode(true)));
      track.appendChild(frag);
    };
    // Exact width of one list-cycle: stride from item[0] to its first clone
    const cycleWidth = () =>
      track.children.length > count
        ? track.children[count].offsetLeft - track.children[0].offsetLeft
        : 0;
    const viewport = () =>
      track.parentElement ? track.parentElement.clientWidth : window.innerWidth;

    // Wrap distance L = ONE original list-cycle → shifting by L lands a clone
    // exactly onto its original (pixel-identical), so the loop is seamless.
    // Add as many identical copies as needed so content always fills the view
    // (never any empty space), while the wrap distance stays a single cycle.
    let L = 0;
    const ensure = () => {
      if (track.children.length <= count) appendCopy();
      L = cycleWidth();
      let safety = 0;
      while (L > 0 && (track.children.length / count - 1) * L < viewport() && safety++ < 24) {
        appendCopy();
        L = cycleWidth();
      }
    };
    ensure();

    // (Re)start any videos, including every clone
    $$('video', track).forEach((v) => {
      v.muted = true;
      const play = () => v.play().catch(() => {});
      if (v.readyState >= 2) play();
      else v.addEventListener('loadeddata', play, { once: true });
    });

    window.addEventListener('resize', ensure, { passive: true });
    $$('img, video', track).forEach((m) => {
      m.addEventListener('load', ensure);
      m.addEventListener('loadedmetadata', ensure);
    });

    let x = 0, last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05; // clamp big gaps (e.g. tab was backgrounded)
      if (L > 0) {
        x -= pxPerSec * dt;
        while (x <= -L) x += L; // seamless wrap — no reset, no jump
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      } else {
        L = cycleWidth();
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if (!reduceMotion) {
    initSeamlessMarquee($('#showcaseTrack'), 30);
    initSeamlessMarquee($('#marqueeTrack'), 26);
  }

  /* ============================================================
     2. Animated counters (English numerals)
     ============================================================ */
  const counters = $$('[data-count]');
  if (counters.length) {
    const runCounter = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1800;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ============================================================
     3. Timeline — the scroll animates the years, one after another
     ============================================================ */
  const timelineEl = $('#timelineEl');
  if (timelineEl) {
    const items = $$('.tl-item', timelineEl);
    const update = () => {
      const rect = timelineEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(Math.max((vh * 0.72 - rect.top) / rect.height, 0), 1);
      timelineEl.style.setProperty('--line-progress', progress.toFixed(3));
      const reach = progress * rect.height;
      items.forEach((item) => {
        item.classList.toggle('lit', reach >= item.offsetTop + 24);
      });
    };
    if (reduceMotion) {
      timelineEl.style.setProperty('--line-progress', 1);
      items.forEach((i) => i.classList.add('lit'));
    } else {
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
    }
  }

  /* ============================================================
     4. Hero parallax (mouse)
     ============================================================ */
  const orbs = $$('[data-parallax]');
  if (orbs.length && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0, raf = null;
    const render = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      orbs.forEach((o) => {
        const f = parseFloat(o.dataset.parallax) * 1000;
        o.style.transform = `translate(${cx * f}px, ${cy * f}px)`;
      });
      if (Math.abs(mx - cx) > 0.001 || Math.abs(my - cy) > 0.001) {
        raf = requestAnimationFrame(render);
      } else { raf = null; }
    };
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });
  }

})();
