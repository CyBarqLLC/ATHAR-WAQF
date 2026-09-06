/* ============================================================
   مولد شهادات الوقف المعنوي، يعمل بالكامل داخل المتصفح
   القوالب: assets/img/cert-male.png و cert-female.png (3508×2481)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- إعدادات مواضع النصوص على القالب ----------
     الإحداثيات مقاسة على أبعاد القالب الأصلية 3508×2481 */
  const LAYOUT = {
    width: 3508,
    height: 2481,
    name:   { x: 1760, y: 1305, maxWidth: 1580, fontSize: 150, minFontSize: 90 },
    amount: { x: 1452, y: 1637, maxWidth: 1000, fontSize: 100, minFontSize: 64 },
  };

  const TEMPLATES = {
    male:   { src: 'assets/img/cert-male.png',   textColor: '#29284a', file: 'شهادة-شكر-أثر' },
    female: { src: 'assets/img/cert-female.png', textColor: '#fdf2f7', file: 'شهادة-شكر-أثر' },
  };

  const canvas = document.getElementById('certCanvas');
  const ctx = canvas.getContext('2d');
  const form = document.getElementById('certForm');
  const nameInput = document.getElementById('hafizName');
  const amountInput = document.getElementById('amount');
  const nameLabel = document.getElementById('nameLabel');
  const msg = document.getElementById('certMsg');
  const issueBtn = document.getElementById('issueBtn');

  const images = {};
  let fontReady = false;
  let currentGender = 'male';

  /* ---------- تحميل الخط والقوالب ---------- */
  const qomra = new FontFace('Qomra', "url('assets/fonts/Qomra-Bold.otf')", { weight: '700' });
  qomra.load().then((f) => {
    document.fonts.add(f);
    fontReady = true;
    render();
  }).catch(() => { fontReady = true; render(); });

  function loadTemplate(key) {
    return new Promise((resolve, reject) => {
      if (images[key]) return resolve(images[key]);
      const img = new Image();
      img.onload = () => { images[key] = img; resolve(img); };
      img.onerror = () => reject(new Error('تعذر تحميل قالب الشهادة'));
      img.src = TEMPLATES[key].src;
    });
  }

  /* ---------- الرسم ---------- */
  function drawFitted(text, cfg, color) {
    if (!text) return;
    let size = cfg.fontSize;
    do {
      ctx.font = `700 ${size}px Qomra, Tahoma, sans-serif`;
      if (ctx.measureText(text).width <= cfg.maxWidth) break;
      size -= 6;
    } while (size > cfg.minFontSize);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.fillText(text, cfg.x, cfg.y, cfg.maxWidth);
  }

  async function render() {
    const tpl = TEMPLATES[currentGender];
    try {
      const img = await loadTemplate(currentGender);
      ctx.clearRect(0, 0, LAYOUT.width, LAYOUT.height);
      ctx.drawImage(img, 0, 0, LAYOUT.width, LAYOUT.height);
      if (fontReady) {
        drawFitted(nameInput.value.trim(), LAYOUT.name, tpl.textColor);
        drawFitted(amountInput.value.trim(), LAYOUT.amount, tpl.textColor);
      }
    } catch (e) {
      showMsg('error', e.message);
    }
  }

  /* ---------- التفاعل ---------- */
  form.addEventListener('change', (e) => {
    if (e.target.name === 'gender') {
      currentGender = e.target.value;
      nameLabel.textContent = currentGender === 'male' ? 'اسم الحافظ' : 'اسم الحافظة';
      /* تتبدل هوية الصفحة كاملةً بانسيابية مع الاختيار (طابع خاص لكل نوع) */
      form.classList.toggle('theme-female', currentGender === 'female');
      form.classList.toggle('theme-male', currentGender === 'male');
      document.body.classList.toggle('theme-female', currentGender === 'female');
      document.body.classList.toggle('theme-male', currentGender === 'male');
      render();
    }
  });
  nameInput.addEventListener('input', render);
  amountInput.addEventListener('input', render);

  function showMsg(type, text) {
    msg.className = 'cert-msg ' + type;
    msg.textContent = text;
  }

  /* ---------- الإصدار PDF ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const amount = amountInput.value.trim();
    if (!name) {
      showMsg('error', currentGender === 'male' ? 'فضلًا أدخلوا اسم الحافظ' : 'فضلًا أدخلوا اسم الحافظة');
      nameInput.focus();
      return;
    }
    if (!amount) {
      showMsg('error', 'فضلًا أدخلوا مقدار الحفظ');
      amountInput.focus();
      return;
    }
    if (!window.jspdf) {
      showMsg('error', 'يتطلب إصدار الشهادة اتصالًا بالإنترنت، أعيدوا تحميل الصفحة والمحاولة');
      return;
    }

    issueBtn.disabled = true;
    issueBtn.textContent = 'جارٍ إصدار الشهادة…';
    try {
      await render();
      // جودة عالية: JPEG 92% على الأبعاد الكاملة 3508×2481 (A4 عرضي @ 300dpi)
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pw, ph);
      pdf.save(`${TEMPLATES[currentGender].file}-${name}.pdf`);
      showMsg('success', 'صدرت الشهادة بنجاح وبدأ التحميل. بارك الله في الحافظ وأهله');
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء إصدار الشهادة، حاولوا مجددًا');
    } finally {
      issueBtn.disabled = false;
      issueBtn.textContent = 'إصدار الشهادة';
    }
  });

  render();
})();
