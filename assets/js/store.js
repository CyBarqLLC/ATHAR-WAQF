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

  function rowHtml(p, n, i) {
    var h = '<article class="pr' + (p.image ? ' pr--img' : '') + '" id="' + p.id + '" data-id="' + p.id + '" style="--i:' + i + '">';
    h += '<span class="pr-n num" aria-hidden="true">' + (n < 10 ? '0' + n : n) + '</span>';
    if (p.image) {
      h += '<figure class="pr-fig"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" width="800" height="1000" loading="lazy" decoding="async"></figure>';
    }
    h += '<div class="pr-body"><h3 class="pr-name">' + esc(p.name) + '</h3><p class="pr-desc">' + esc(p.desc) + '</p>';
    if (p.specs && p.specs.length) {
      h += '<dl class="pr-specs">' + p.specs.map(function (s) {
        return '<div><dt>' + esc(s.k) + '</dt><dd>' + nums(s.v) + '</dd></div>';
      }).join('') + '</dl>';
    }
    if (p.options && p.options.length) {
      h += '<div class="pr-opts">' + p.options.map(function (o) { return optionHtml(p, o); }).join('') + '</div>';
    }
    h += '</div><div class="pr-buy"><div class="pr-price"><b class="num">' + fmt(p.price) + '</b><span>' + esc(CUR) + '</span>' +
      (p.per ? '<small>' + esc(p.per) + '</small>' : '') + '</div>';
    if (p.qty) {
      h += '<div class="pr-qty"><span>' + esc(p.qty) + '</span>' + stepper(p.qtyDefault || 1, 'عدد: ' + p.name) + '</div>';
    }
    h += '<a class="btn pr-order" href="#" target="_blank" rel="noopener">' + WA_ICON + '<span>اطلب عبر واتساب<span class="vh">، ' + esc(p.name) + '</span></span></a>' +
      '<button type="button" class="pr-add">أضف إلى طلبي<span class="vh">، ' + esc(p.name) + '</span></button></div></article>';
    return h;
  }

  function stepper(val, label) {
    return '<div class="qty"><button type="button" class="qty-b" data-step="-1" aria-label="إنقاص">−</button>' +
      '<input type="number" class="qty-i num" inputmode="numeric" min="1" max="999" value="' + val + '" aria-label="' + esc(label) + '">' +
      '<button type="button" class="qty-b" data-step="1" aria-label="زيادة">+</button></div>';
  }

  var counter = 0, html = '';
  S.categories.forEach(function (c, ci) {
    var items = S.products.filter(function (p) { return p.cat === c.id; });
    if (!items.length) return;
    html += '<section class="section store-sec' + (ci % 2 ? ' section--sand' : '') + '" id="' + c.id + '" data-cat="' + c.id + '">' +
      '<div class="container"><div class="cat-head' + (c.image ? ' has-fig' : '') + '"><div class="section-head"><span class="eyebrow">' + esc(c.eyebrow) + '</span>' +
      '<h2 class="title">' + esc(c.title) + '</h2><p class="lead">' + esc(c.lead) + '</p></div>' +
      (c.image ? '<figure class="cat-fig"><img src="' + esc(c.image) + '" alt="' + esc(c.imageAlt || c.title) + '" width="800" height="1000" loading="lazy" decoding="async"></figure>' : '') +
      '</div>' +
      '<div class="pr-list">' + items.map(function (p, i) { return rowHtml(p, i + 1, counter++); }).join('') + '</div></div></section>';
  });
  catalog.innerHTML = html;

  /* ---------- التبويبات ---------- */
  var tabsEl = $('#storeTabs');
  if (tabsEl) {
    tabsEl.innerHTML = '<button type="button" class="store-tab" data-f="all" aria-pressed="true">الكل</button>' +
      S.categories.map(function (c) {
        return '<button type="button" class="store-tab" data-f="' + c.id + '" aria-pressed="false">' + esc(c.tab) + '</button>';
      }).join('');
    var setFilter = function (f) {
      $$('.store-tab', tabsEl).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f)); });
      $$('.store-sec', catalog).forEach(function (s) { s.hidden = !(f === 'all' || s.getAttribute('data-cat') === f); });
    };
    tabsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.store-tab');
      if (b) setFilter(b.getAttribute('data-f'));
    });
    var h = location.hash.replace('#', '');
    if (h && byId[h]) {
      /* رابط مباشر إلى منتج بعينه */
      var tgt = document.getElementById(h);
      if (tgt) setTimeout(function () { tgt.scrollIntoView({ block: 'center' }); }, 300);
    } else if (h && S.categories.some(function (c) { return c.id === h; })) {
      setFilter(h);
    }
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
  $$('.pr', catalog).forEach(syncRow);

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
