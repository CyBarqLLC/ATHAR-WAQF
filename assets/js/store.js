/* ============================================================
   متجر أثر، السلوك
   عرض الكتالوج، الطلب المباشر عبر واتساب، وسلة الطلبات.
   Vanilla JS، بلا مكتبات. البيانات في store-data.js
   ============================================================ */
(function () {
  'use strict';

  var S = window.ATHAR_STORE;
  var catalog = document.getElementById('catalog');
  if (!S || !catalog) return;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var CUR = S.currency;
  var KEY = 'athar-store-cart-v1';
  var byId = {};
  S.products.forEach(function (p) { byId[p.id] = p; });

  /* ---------- أدوات ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n) { n = Math.round(n * 100) / 100; return n % 1 ? n.toFixed(2) : String(n); }
  /* الأرقام والمدى العددي تُعزل لتبقى سليمة الاتجاه داخل النص العربي */
  function nums(s) {
    return esc(s).replace(/\d+(?:[.,]\d+)?(?:\s?[–-]\s?\d+(?:[.,]\d+)?)?/g, '<span class="num">$&</span>');
  }
  function clampQty(v) { v = parseInt(v, 10); return isNaN(v) ? 1 : Math.max(1, Math.min(999, v)); }
  function waUrl(text) { return 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(text); }

  var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.2-.7l.5-.6c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.1-.6 3.5.7 1.6 2 3.3 3.8 4.5 2.3 1.5 3.3 1.6 4.3 1.4.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.2-.3-.2-.4-.3z"/></svg>';

  /* ---------- رسالة واتساب ---------- */
  function itemBlock(p, opts, qty) {
    var L = ['▪ ' + p.name];
    (p.options || []).forEach(function (o) {
      var v = opts[o.key];
      if (v) L.push('   ' + o.label + ': ' + v);
    });
    (p.specs || []).forEach(function (s) { L.push('   ' + s.k + ': ' + s.v); });
    if (p.qty) L.push('   ' + p.qty + ': ' + qty);
    else if (qty > 1) L.push('   الكمية: ' + qty);
    L.push('   السعر: ' + fmt(p.price * qty) + ' ' + CUR);
    return L.join('\n');
  }
  function orderText(lines, total, name) {
    var t = 'السلام عليكم ورحمة الله وبركاته،\n' +
      (lines.length > 1 ? 'أودّ طلب ما يلي من متجر أثر:' : 'أودّ طلب الخدمة التالية من متجر أثر:') +
      '\n\n' + lines.join('\n\n') + '\n\nالإجمالي: ' + fmt(total) + ' ' + CUR;
    if (name) t += '\nالاسم: ' + name;
    return t + '\n\nبانتظار تأكيدكم وطريقة الدفع، وجزاكم الله خيرًا.';
  }

  /* ---------- رسم الكتالوج ---------- */
  function optionHtml(p, o) {
    var id = 'o-' + p.id + '-' + o.key;
    if (o.type === 'text') {
      return '<label class="pr-opt" for="' + id + '"><span>' + esc(o.label) + '</span>' +
        '<input type="text" id="' + id + '" data-opt="' + o.key + '" maxlength="80" placeholder="' + esc(o.placeholder || '') + '" autocomplete="off"></label>';
    }
    if (o.choices.length === 1) {
      return '<div class="pr-opt pr-opt--fixed"><span>' + esc(o.label) + '</span><b>' + esc(o.choices[0]) + '</b>' +
        '<input type="hidden" data-opt="' + o.key + '" value="' + esc(o.choices[0]) + '"></div>';
    }
    var opts = '<option value="">اختر ' + esc(o.label) + '</option>' + o.choices.map(function (c) {
      return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
    }).join('');
    return '<label class="pr-opt" for="' + id + '"><span>' + esc(o.label) + '</span>' +
      '<select id="' + id + '" data-opt="' + o.key + '" data-required>' + opts + '</select>' +
      '<em class="pr-need" role="alert">اختر ' + esc(o.label) + ' أولًا</em></label>';
  }

  var RINGS = '<svg class="rings" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="200" cy="150" r="46"/><circle cx="200" cy="150" r="84"/><circle cx="200" cy="150" r="122"/><circle cx="200" cy="150" r="160"/><circle cx="200" cy="150" r="198"/></g></svg>';

  function mediaHtml(p, tone) {
    if (p.image) {
      return '<div class="media"><img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.name) + '" width="960" height="720" loading="lazy" decoding="async"><span class="mark" aria-hidden="true"></span></div>';
    }
    if (p.tile) {
      return '<div class="media media--tile" aria-hidden="true">' + RINGS +
        '<b class="tile-n num">' + esc(p.tile.n) + '</b><span class="tile-u">' + esc(p.tile.u || S.tileLabel || 'متراً · عمق البئر') + '</span><span class="mark"></span></div>';
    }
    return '';
  }

  function specsHtml(list) {
    if (!list.length) return '';
    return '<dl class="pr-specs">' + list.map(function (s) {
      return '<div><dt>' + esc(s.k) + '</dt><dd>' + nums(s.v) + '</dd></div>';
    }).join('') + '</dl>';
  }

  /* رقم البطاقة ضمن القائمة، ونقش حلقات خافت يملأ الفراغ بهوية أثر */
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function bodyDeco(i) {
    return RINGS.replace('class="rings"', 'class="rings pr-deco"') +
      '<span class="pr-idx" aria-hidden="true"><span class="num">' + pad2(i + 1) + ' / ' + pad2(items.length) + '</span></span>';
  }

  function rowHtml(p, i, tone) {
    var h = '<article class="pr t' + tone + '" id="' + p.id + '" data-id="' + p.id + '" style="--i:' + i + '">';
    h += mediaHtml(p, tone);
    h += '<div class="pr-body">' + bodyDeco(i) + '<h3 class="pr-name">' + esc(p.name) + '</h3><p class="pr-desc">' + esc(p.desc) + '</p>';
    h += specsHtml((p.specs || []).filter(function (s) { return !(p.tile && s.k === 'العمق'); }));
    if (p.options && p.options.length) {
      h += '<div class="pr-opts">' + p.options.map(function (o) { return optionHtml(p, o); }).join('') + '</div>';
    }
    h += '</div><div class="pr-buy"><div class="pr-row"><div class="pr-price"><b class="num">' + fmt(p.price) + '</b><span>' + esc(CUR) + '</span>' +
      (p.per ? '<small>' + esc(p.per) + '</small>' : '') + '</div>';
    if (p.qty) {
      h += '<div class="pr-qty"><span>' + esc(p.qty) + '</span>' + stepper(p.qtyDefault || 1, 'عدد: ' + p.name) + '</div>';
    }
    h += '</div><a class="btn pr-order" href="#" target="_blank" rel="noopener">' + WA_ICON + '<span>اطلب عبر واتساب<span class="vh">، ' + esc(p.name) + '</span></span></a>' +
      '<button type="button" class="pr-add">أضف إلى طلبي<span class="vh">، ' + esc(p.name) + '</span></button></div></article>';
    return h;
  }

  /* بطاقة الآبار في المتجر: بوابة إلى صفحتها المستقلة */
  function gateHtml(g, i) {
    return '<article class="pr pr--gate t3" id="' + g.id + '" data-id="' + g.id + '" style="--i:' + i + '">' + mediaHtml(g) +
      '<div class="pr-body">' + bodyDeco(i) + '<h3 class="pr-name">' + esc(g.name) + '</h3><p class="pr-desc">' + esc(g.desc) + '</p>' + specsHtml(g.specs || []) + '</div>' +
      '<div class="pr-buy"><div class="pr-row"><div class="pr-price"><small>تبدأ من</small><b class="num">' + fmt(g.price) + '</b><span>' + esc(CUR) + '</span></div></div>' +
      '<a class="btn pr-go" href="' + esc(g.href) + '"><span>' + esc(g.cta) + '</span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></a></div></article>';
  }

  function stepper(val, label) {
    return '<div class="qty"><button type="button" class="qty-b" data-step="-1" aria-label="إنقاص">−</button>' +
      '<input type="number" class="qty-i num" inputmode="numeric" min="1" max="999" value="' + val + '" aria-label="' + esc(label) + '">' +
      '<button type="button" class="qty-b" data-step="1" aria-label="زيادة">+</button></div>';
  }

  /* ---------- بحث وتصفية وترتيب ---------- */
  /* توحيد الحروف العربية ليجد البحث الكلمة بأي رسم: همزات، تاء مربوطة، ياء، تشكيل */
  function norm(t) {
    return String(t).toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[^\w؀-ۿ\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function hay(p) {
    var t = [p.name, p.desc, p.kw || '', (p.chips || []).join(' ')];
    (p.specs || []).forEach(function (s) { t.push(s.k, s.v); });
    (p.options || []).forEach(function (o) { t.push(o.label); (o.choices || []).forEach(function (c) { t.push(c); }); });
    return norm(t.join(' '));
  }

  var page = catalog.getAttribute('data-page') || 'store';
  var conf = (S.pages && S.pages[page]) || { cats: ['khayr'] };
  var items = S.products.filter(function (p) { return conf.cats.indexOf(p.cat) > -1; });
  if (page === 'store' && S.gateway) items = items.concat([S.gateway]);

  var chipList = [];
  items.forEach(function (p) { (p.chips || []).forEach(function (c) { if (chipList.indexOf(c) < 0) chipList.push(c); }); });
  var countries = [];
  if (conf.country) items.forEach(function (p) {
    (p.options || []).forEach(function (o) {
      if (o.key === 'country') o.choices.forEach(function (c) { if (countries.indexOf(c) < 0) countries.push(c); });
    });
  });

  var SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
  var tb = '<div class="tb"><div class="tb-top">' +
    '<div class="search"><label class="vh" for="q">ابحث في المتجر</label>' + SEARCH_ICON +
    '<input id="q" type="search" placeholder="' + (page === 'wells' ? 'ابحث عن بلد أو نوع بئر' : 'ابحث عن خدمة أو بلد') + '" autocomplete="off" enterkeyhint="search">' +
    '<button type="button" class="search-x" id="qx" hidden aria-label="مسح البحث"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
  if (countries.length) {
    tb += '<label class="sel"><span>الدولة</span><select id="fCountry"><option value="">كل الدول</option>' +
      countries.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></label>';
  }
  tb += '<label class="sel"><span>الترتيب</span><select id="fSort"><option value="">الافتراضي</option>' +
    '<option value="asc">الأقل سعرًا</option><option value="desc">الأعلى سعرًا</option></select></label></div>';
  if (chipList.length > 1) {
    tb += '<div class="tb-chips" id="fChips" role="group" aria-label="تصفية حسب النوع"><button type="button" class="fchip" data-f="" aria-pressed="true">الكل</button>' +
      chipList.map(function (c) { return '<button type="button" class="fchip" data-f="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>'; }).join('') + '</div>';
  }
  tb += '<p class="tb-count" id="fCount" role="status" aria-live="polite"></p></div>';

  var html = '<section class="shop" id="shop"><div class="container">' + tb + '<div class="shop-grid" id="shopGrid">' +
    items.map(function (p, i) { return p === S.gateway ? gateHtml(p, i) : rowHtml(p, i, (i % 3) + 1); }).join('') +
    '</div><div class="shop-none" id="shopNone" hidden><p>لا نتيجة تطابق بحثك.</p><button type="button" class="link-btn" id="shopReset">عرض كل المنتجات</button></div></div></section>';
  catalog.innerHTML = html;

  var grid = $('#shopGrid'), qEl = $('#q'), qx = $('#qx'), cEl = $('#fCount'), noneEl = $('#shopNone');
  var cardEls = $$('.pr', grid);
  var state = { f: '', q: '', c: '', s: '' };
  var model = items.map(function (p, i) {
    return { p: p, el: cardEls[i], hay: hay(p), i: i,
      countries: conf.country ? (p.options || []).reduce(function (a, o) { return o.key === 'country' ? a.concat(o.choices) : a; }, []) : [] };
  });

  var stackReady = false;
  function applyFilters() {
    var toks = norm(state.q).split(' ').filter(Boolean), shown = 0;
    model.forEach(function (m) {
      var ok = (!state.f || (m.p.chips || []).indexOf(state.f) > -1) &&
               (!state.c || m.countries.indexOf(state.c) > -1) &&
               toks.every(function (t) { return m.hay.indexOf(t) > -1; });
      m.el.hidden = !ok;
      if (ok) shown++;
      var rank = m.i;
      if (state.s) rank = (state.s === 'asc' ? m.p.price : -m.p.price) * 1000 + m.i;
      m.el.style.order = rank;
    });
    /* ترتيب الطبقات يتبع الترتيب المرئي: البطاقة اللاحقة تغطي السابقة */
    var vis = model.filter(function (m) { return !m.el.hidden; });
    vis.sort(function (a, b) { return (parseFloat(a.el.style.order) || 0) - (parseFloat(b.el.style.order) || 0); });
    vis.forEach(function (m, k) { m.el.style.zIndex = k + 1; });
    noneEl.hidden = shown > 0;
    if (stackReady) layoutStack();
    grid.hidden = shown === 0;
    cEl.innerHTML = shown === model.length ? '<span class="num">' + shown + '</span> ' + (page === 'wells' ? 'تصاميم' : 'خدمات')
      : 'يُعرض <span class="num">' + shown + '</span> من <span class="num">' + model.length + '</span>';
    qx.hidden = !state.q;
  }
  function setChip(f) {
    state.f = f;
    $$('.fchip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f)); });
  }
  qEl.addEventListener('input', function () { state.q = qEl.value; applyFilters(); });
  qx.addEventListener('click', function () { qEl.value = ''; state.q = ''; applyFilters(); qEl.focus(); });
  var chipsEl = $('#fChips');
  if (chipsEl) chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.fchip');
    if (b) { setChip(b.getAttribute('data-f')); applyFilters(); }
  });
  var cSel = $('#fCountry');
  if (cSel) cSel.addEventListener('change', function () {
    state.c = cSel.value; applyFilters();
    /* اختيار الدولة هنا يعبّئها تلقائيًا في بطاقات الآبار */
    if (state.c) model.forEach(function (m) {
      var sel = $('select[data-opt="country"]', m.el);
      if (sel && m.countries.indexOf(state.c) > -1) { sel.value = state.c; syncRow(m.el); }
    });
  });
  $('#fSort').addEventListener('change', function (e) { state.s = e.target.value; applyFilters(); });
  $('#shopReset').addEventListener('click', function () {
    qEl.value = ''; state = { f: '', q: '', c: '', s: state.s }; if (cSel) cSel.value = ''; setChip(''); applyFilters();
  });
  applyFilters();

  /* ---------- تكديس البطاقات عند التمرير ----------
     كل بطاقة تثبت في أعلى الشاشة، وتنزلق التالية فوقها.
     يُحسب موضع التثبيت من ارتفاع البطاقة نفسها، فتظهر كاملةً دون أن يُقصّ شيءٌ من تفاصيلها.
     إن كانت البطاقة أطول من الشاشة (شاشاتٌ قصيرة) يُترك التمرير العادي. */
  var hdr = document.getElementById('header');
  function layoutStack() {
    var vh = window.innerHeight, tall = 0;
    var TOP = hdr ? Math.round(hdr.getBoundingClientRect().bottom) + 12 : 96;
    model.forEach(function (m) { m.el.style.minHeight = ''; });
    var visible = model.filter(function (m) { return !m.el.hidden; });
    visible.forEach(function (m) { tall = Math.max(tall, m.el.offsetHeight); });
    var ok = tall > 0 && tall <= vh * 1.35;
    grid.classList.toggle('is-stack', ok);
    if (!ok) return;
    visible.forEach(function (m) {
      m.el.style.minHeight = tall + 'px';
      m.el.style.top = Math.min(TOP, Math.round(vh - tall - 16)) + 'px';
    });
  }
  var stackTimer = 0;
  function queueStack() { clearTimeout(stackTimer); stackTimer = setTimeout(layoutStack, 60); }
  window.addEventListener('resize', queueStack);
  window.addEventListener('load', layoutStack);
  grid.addEventListener('change', queueStack);
  grid.addEventListener('input', queueStack);
  grid.addEventListener('click', queueStack);
  $$('img', grid).forEach(function (im) { im.addEventListener('load', queueStack); });
  stackReady = true;
  layoutStack();

  var hashId = location.hash.replace('#', '');
  if (hashId && document.getElementById(hashId)) {
    setTimeout(function () { document.getElementById(hashId).scrollIntoView({ block: 'center' }); }, 300);
  }

  /* ---------- حالة صف المنتج ---------- */
  function readRow(row) {
    var p = byId[row.getAttribute('data-id')];
    var opts = {}, missing = null;
    $$('[data-opt]', row).forEach(function (el) {
      var v = (el.value || '').trim();
      opts[el.getAttribute('data-opt')] = v;
      if (!v && el.hasAttribute('data-required') && !missing) missing = el;
    });
    var qi = $('.qty-i', row);
    return { p: p, opts: opts, qty: qi ? clampQty(qi.value) : 1, missing: missing };
  }
  function syncRow(row) {
    var s = readRow(row);
    $('.pr-order', row).href = waUrl(orderText([itemBlock(s.p, s.opts, s.qty)], s.p.price * s.qty));
    $$('.pr-opt.is-missing', row).forEach(function (o) { if (!s.missing || !o.contains(s.missing)) o.classList.remove('is-missing'); });
  }
  function flagMissing(row, el) {
    var wrap = el.closest('.pr-opt');
    if (wrap) wrap.classList.add('is-missing');
    el.focus();
  }
  $$('.pr:not(.pr--gate)', catalog).forEach(syncRow);

  catalog.addEventListener('input', function (e) { var r = e.target.closest('.pr'); if (r) syncRow(r); });
  catalog.addEventListener('change', function (e) {
    var r = e.target.closest('.pr');
    if (!r) return;
    if (e.target.classList.contains('qty-i')) e.target.value = clampQty(e.target.value);
    syncRow(r);
  });
  catalog.addEventListener('click', function (e) {
    var row = e.target.closest('.pr');
    if (!row) return;

    var step = e.target.closest('.qty-b');
    if (step) {
      var qi = $('.qty-i', row);
      qi.value = clampQty(clampQty(qi.value) + parseInt(step.getAttribute('data-step'), 10));
      syncRow(row);
      return;
    }
    var order = e.target.closest('.pr-order');
    if (order) {
      var s1 = readRow(row);
      if (s1.missing) { e.preventDefault(); flagMissing(row, s1.missing); }
      return;
    }
    var add = e.target.closest('.pr-add');
    if (add) {
      var s2 = readRow(row);
      if (s2.missing) { flagMissing(row, s2.missing); return; }
      addToCart(s2.p.id, s2.opts, s2.qty);
      var label = add.firstChild;
      add.classList.add('is-done');
      label.nodeValue = 'تمت الإضافة';
      setTimeout(function () { add.classList.remove('is-done'); label.nodeValue = 'أضف إلى طلبي'; }, 1700);
    }
  });

  /* ---------- السلة ---------- */
  var cart = [];
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (Array.isArray(saved)) {
      cart = saved.filter(function (it) { return it && byId[it.pid] && it.opts && typeof it.opts === 'object'; })
                  .map(function (it) { return { pid: it.pid, opts: it.opts, qty: clampQty(it.qty) }; });
    }
  } catch (err) { cart = []; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (err) {} }

  var fab = $('#cartFab'), drawer = $('#cart'), scrim = $('#cartScrim'),
      body = $('#cartBody'), foot = $('#cartFoot'), sendBtn = $('#cartSend'),
      totalEl = $('#cartTotal'), nameEl = $('#cartName');
  var lastFocus = null;

  function addToCart(pid, opts, qty) {
    var sig = JSON.stringify(opts);
    var hit = cart.filter(function (it) { return it.pid === pid && JSON.stringify(it.opts) === sig; })[0];
    if (hit) hit.qty = clampQty(hit.qty + qty); else cart.push({ pid: pid, opts: opts, qty: qty });
    persist(); renderCart(true);
  }
  function cartTotal() {
    return cart.reduce(function (t, it) { return t + byId[it.pid].price * it.qty; }, 0);
  }
  function optSummary(it) {
    var p = byId[it.pid];
    return (p.options || []).map(function (o) { return it.opts[o.key] ? o.label + ': ' + it.opts[o.key] : ''; })
      .filter(Boolean).join('، ');
  }
  function renderCart(bump) {
    var count = cart.reduce(function (n, it) { return n + 1 * (it.qty > 0); }, 0);
    var total = cartTotal();

    fab.hidden = !cart.length;
    $('.cnt', fab).textContent = cart.length;
    $('.tot', fab).innerHTML = '<span class="num">' + fmt(total) + '</span> ' + esc(CUR);
    if (bump && cart.length) {
      fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    }

    if (!cart.length) {
      body.innerHTML = '<p class="cart-empty">لم تُضف شيئًا إلى طلبك بعد.</p>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = cart.map(function (it, i) {
      var p = byId[it.pid], sum = optSummary(it);
      return '<div class="ci" data-i="' + i + '"><div class="ci-main"><h3 class="ci-name">' + esc(p.name) + '</h3>' +
        (sum ? '<p class="ci-sum">' + esc(sum) + '</p>' : '') +
        '<div class="ci-ctl">' + stepper(it.qty, 'الكمية: ' + p.name) + '<span class="ci-price"><span class="num">' + fmt(p.price * it.qty) + '</span> ' + esc(CUR) + '</span></div></div>' +
        '<button type="button" class="ci-x" data-rm aria-label="حذف ' + esc(p.name) + ' من الطلب">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    }).join('');
    totalEl.innerHTML = '<span class="num">' + fmt(total) + '</span> ' + esc(CUR);
    syncSend();
  }
  function syncSend() {
    if (!cart.length) return;
    var lines = cart.map(function (it) { return itemBlock(byId[it.pid], it.opts, it.qty); });
    sendBtn.href = waUrl(orderText(lines, cartTotal(), nameEl.value.trim()));
  }

  body.addEventListener('click', function (e) {
    var item = e.target.closest('.ci');
    if (!item) return;
    var it = cart[parseInt(item.getAttribute('data-i'), 10)];
    if (!it) return;
    if (e.target.closest('[data-rm]')) {
      cart.splice(cart.indexOf(it), 1);
    } else if (e.target.closest('.qty-b')) {
      it.qty = clampQty(it.qty + parseInt(e.target.closest('.qty-b').getAttribute('data-step'), 10));
    } else return;
    persist(); renderCart();
  });
  body.addEventListener('change', function (e) {
    if (!e.target.classList.contains('qty-i')) return;
    var item = e.target.closest('.ci'), it = cart[parseInt(item.getAttribute('data-i'), 10)];
    if (it) { it.qty = clampQty(e.target.value); persist(); renderCart(); }
  });
  nameEl.addEventListener('input', syncSend);
  $('#cartClear').addEventListener('click', function () { cart = []; persist(); renderCart(); });

  /* فتح السلة وإغلاقها */
  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false; requestAnimationFrame(function () { scrim.classList.add('is-open'); });
    document.documentElement.style.overflow = 'hidden';
    $('#cartClose').focus();
  }
  function closeCart() {
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('is-open');
    setTimeout(function () { if (!scrim.classList.contains('is-open')) scrim.hidden = true; }, 400);
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  fab.addEventListener('click', openCart);
  scrim.addEventListener('click', closeCart);
  $('#cartClose').addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeCart(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('a[href], button:not([disabled]), input, select', drawer).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  renderCart();

  /* ---------- طلب التقدير الهندسي ---------- */
  var est = $('#estimate');
  if (est) {
    var estLink = $('#estSend'), estNote = $('#estNote');
    var syncEst = function () {
      var kind = $('input[name="estKind"]:checked', est);
      var t = 'السلام عليكم ورحمة الله وبركاته،\nأرغب بالحصول على تقدير هندسي ومالي لمشروعي.\n';
      if (kind) t += '\nنوع المشروع: ' + kind.value;
      if (estNote.value.trim()) t += '\nالموقع أو فكرة المشروع: ' + estNote.value.trim();
      t += '\n\nبانتظار المخططات والتكلفة المقدّرة، وجزاكم الله خيرًا.';
      estLink.href = waUrl(t);
    };
    est.addEventListener('change', syncEst);
    est.addEventListener('input', syncEst);
    syncEst();
  }
})();
