
const employee = document.getElementById('employee');
const retired = document.getElementById('retired');
const salaryEl = document.getElementById('salary');
const clientTypeEl = document.getElementById('clientType');
const type1El = document.getElementById('type1');
const type2El = document.getElementById('type2');
const type3El = document.getElementById('type3');
const c1 = document.getElementById('commitment1');
const c2 = document.getElementById('commitment2');
const c3 = document.getElementById('commitment3');
const monthsEl = document.getElementById('months');
const rateEl = document.getElementById('rate');
const customerMobileEl = document.getElementById('customerMobile');
const amountToPayEl = document.getElementById('amountToPay');
const addCommitBtn = document.getElementById('addCommitBtn');
const removeCommitBtn = document.getElementById('removeCommitBtn');
const commit2Wrap = document.getElementById('commitment2Wrap');
const commit3Wrap = document.getElementById('commitment3Wrap');
const calcBtn = document.getElementById('calcBtn');
const financingOption = document.getElementById('financingOption');
const customInputWrapper = document.getElementById('customInputWrapper');
const customValue = document.getElementById('customValue');

// Normalize decimal entry: allow users to type comma and convert to dot
function attachDecimalNormalization(el) {
  if (!el) return;
  el.addEventListener('input', () => {
    try {
      const v = el.value || '';
      const newv = v.replace(/,/g, '.');
      if (newv !== v) {
        const pos = (el.selectionStart || 0);
        el.value = newv;
        try { el.setSelectionRange(pos, pos); } catch (e) { }
      }
    } catch (e) { }
  });
}

// Attach to decimal fields (salary, commitments, rate). months stays integer-only.
attachDecimalNormalization(salaryEl);
attachDecimalNormalization(c1);
attachDecimalNormalization(c2);
attachDecimalNormalization(c3);
attachDecimalNormalization(rateEl);

// Enforce integer-only for months input
if (monthsEl) {
  monthsEl.addEventListener('input', () => {
    try { monthsEl.value = (monthsEl.value || '').replace(/[^0-9]/g, ''); } catch (e) { }
  });
}

if (customerMobileEl) {
  customerMobileEl.addEventListener('input', () => {
    try { customerMobileEl.value = (customerMobileEl.value || '').replace(/[^0-9]/g, ''); } catch (e) { }
  });
}
if (amountToPayEl) {
  amountToPayEl.addEventListener('input', () => {
    try { amountToPayEl.value = (amountToPayEl.value || '').replace(/[^0-9.]/g, ''); } catch (e) { }
  });
}

const impact1 = document.getElementById('impact1');
const impact2 = document.getElementById('impact2');
const impact3 = document.getElementById('impact3');
const hint1 = document.getElementById('hint1');
const hint2 = document.getElementById('hint2');
const hint3 = document.getElementById('hint3');

const LOW_OPTIONS = ['لا يوجد', 'تمويل استهلاكي', 'عقاري مدعوم', 'عقاري غير مدعوم'];
const MID_OPTIONS = ['لا يوجد', 'تمويل استهلاكي', 'عقاري مدعوم', 'عقاري غير مدعوم'];
const FincPln_HIGH_OPTIONS = ['لا يوجد', 'تمويل استهلاكي', 'عقاري مدعوم', 'عقاري غير مدعوم'];

employee.addEventListener('change', () => { if (employee.checked) { retired.checked = false; } updateBadges(); updateOptions(); });
retired.addEventListener('change', () => { if (retired.checked) { employee.checked = false; } updateBadges(); updateOptions(); });
if (clientTypeEl) clientTypeEl.addEventListener('change', () => { updateBadges(); updateOptions(); });

function setSelectOptions(selectEl, options, defaultValue = "لا يوجد") {
  selectEl.innerHTML = "";
  options.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
  // If the desired default exists in the new options, select it. Otherwise keep the first option.
  const hasDefault = [...selectEl.options].some(o => o.value === defaultValue);
  if (hasDefault) selectEl.value = defaultValue;
  else if (selectEl.options.length > 0) selectEl.selectedIndex = 0;
}

function optionsForSalary(s) {
  if (s >= 15000) return MID_OPTIONS;
  return LOW_OPTIONS;
}

function normalizeLegacyRealOption(value, opts) {
  if (value === 'تمويل عقاري' && Array.isArray(opts) && opts.includes('عقاري غير مدعوم')) {
    return 'عقاري غير مدعوم';
  }
  if ((value === 'عقاري مدعوم' || value === 'عقاري غير مدعوم') && Array.isArray(opts) && opts.includes('تمويل عقاري')) {
    return 'تمويل عقاري';
  }
  // Handle legacy naming from old saved data
  if (value === 'تمويل عقاري مدعوم') return 'عقاري مدعوم';
  if (value === 'تمويل عقاري غير مدعوم') return 'عقاري غير مدعوم';
  return value;
}

function updateOptions() {
  const s = +salaryEl.value || 0;
  const opts = optionsForSalary(s);
  // preserve each select's previous value when possible
  const desired1 = normalizeLegacyRealOption(type1El && type1El.value ? type1El.value : 'لا يوجد', opts);
  const desired2 = normalizeLegacyRealOption(type2El && type2El.value ? type2El.value : 'لا يوجد', opts);
  const desired3 = normalizeLegacyRealOption(type3El && type3El.value ? type3El.value : 'لا يوجد', opts);
  setSelectOptions(type1El, opts, desired1);
  setSelectOptions(type2El, opts, desired2);
  setSelectOptions(type3El, opts, desired3);

  // تحديث توفر النسب حسب الراتب
  updateDeductionRateAvailability(s);

  updateSum();
  updateImpactChips();
}

function updateDeductionRateAvailability(salary) {
  // 70% متاح من 1000 فما فوق
  // 75% و 80% متاح من 25000 فما فوق
  const rate70 = document.querySelector('input.deductionRateCheckbox[value="70"]');
  const rate75 = document.querySelector('input.deductionRateCheckbox[value="75"]');
  const rate80 = document.querySelector('input.deductionRateCheckbox[value="80"]');

  if (rate70) {
    rate70.disabled = salary < 1000;
  }

  if (rate75) {
    rate75.disabled = salary < 25000;
  }
  if (rate80) {
    rate80.disabled = salary < 25000;
  }

  const selectedRate = document.querySelector('input.deductionRateCheckbox:checked');
  if (selectedRate && selectedRate.disabled) {
    selectedRate.checked = false;
  }
}

function attachDeductionRateToggle() {
  const checkboxes = Array.from(document.querySelectorAll('input.deductionRateCheckbox'));
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        // إذا تم اختيار هذا الخيار، إلغاء جميع الخيارات الأخرى
        checkboxes.forEach(cb => {
          if (cb !== checkbox) {
            cb.checked = false;
          }
        });
      }
      updateImpactChips();
    });
  });
}

salaryEl.addEventListener('input', () => { updateOptions(); });
attachDeductionRateToggle();

// التحكم في إظهار/إخفاء حقل الإدخال المخصص
if (financingOption && customInputWrapper) {
  financingOption.addEventListener('change', () => {
    const option = financingOption.value;
    if (option === 'full') {
      customInputWrapper.classList.add('hidden');
      customValue.value = '';
    } else {
      customInputWrapper.classList.remove('hidden');
      if (option === 'customAmount') {
        customValue.placeholder = 'أدخل مبلغ التمويل';
      } else if (option === 'customInstallment') {
        customValue.placeholder = 'أدخل القسط الشهري';
      }
    }
  });
}

// إمكان: تنسيق رقم
function format(v, f = 2) { return (+v).toFixed(f); }

// أساس إمكان: بشكل افتراضي 45%.
// استثناء: إن كان "نوع العميل" = 'عميل جديد' والراتب < 25000 فإن السقف الأساسي يصبح 11.67%.
function FincPlnBaseCap() {
  try {
    const s = +((salaryEl && salaryEl.value) ? salaryEl.value : 0) || 0;
    const clientVal = (clientTypeEl && clientTypeEl.value) ? clientTypeEl.value : (document.getElementById('clientType') || {}).value;
    // يطبق فقط إذا كان المستخدم قد اختار "موظف" (لا يشمل المتقاعدين)
    if (clientVal === 'عميل جديد' && s < 25000 && employee && employee.checked) return 11.67;
  } catch (e) { }
  return 45;
}

// الاستهلاكي مؤثّر دائمًا (أي >0) ⇒ العتبة 0%
function consumerThreshold() { return 0; }

// عتبات التأثير ديناميكية حسب selectedRate
function getConsumerThreshold(selectedRate = 45) {
  return retired.checked ? 20 : Math.max(0, selectedRate - 45);
}
function getComboThreshold(selectedRate = 45) {
  return retired.checked ? 30 : 10;
}
function getReEstateCombinedThreshold(selectedRate = 45) {
  return retired.checked ? 40 : 31.67;
}


// لا نستخدم "comboUnsupportedConsumer/othersThresholdHigh" في <15k
// إن كانت موجودة اتركها كما هي، لن تُستدعى في low.

// تحديث شارات البادج
function updateBadges() {
  const capBadge = document.getElementById('capBadge');
  const consCapBadge = document.getElementById('consCapBadge');
  const comboCapBadge = document.getElementById('comboCapBadge');
  if (capBadge) capBadge.textContent = FincPlnBaseCap().toFixed(2) + '%';
  if (consCapBadge) consCapBadge.textContent = consumerThreshold().toFixed(2) + '%';
  // ملاحظة: comboCapBadge في هذا النطاق غير مستخدمة فعليًا لكن نحدّثها للاتساق
  if (comboCapBadge) comboCapBadge.textContent = '10%-20%'; // غير المدعوم 10% والمدعوم 20% تحت 15k
}


function band(s) {
  if (s >= 25000) return 'high';
  if (s >= 15000) return 'mid';
  return 'low';
}

function isRetired() { return !!(retired && retired.checked); }
function retireeCap() { return 25; } // سقف المتقاعد المطلق

function classifyInfluenceLow(consPct, nonPct, subPct, selectedRate = 45) {
  const cth = getConsumerThreshold(selectedRate);
  const consInf = consPct > cth;
  const nonDirect = (nonPct > 10) && consInf;
  const combinedTh = getComboThreshold(selectedRate);
  const nonCombo = (nonPct > 10) && !consInf && (nonPct + consPct) > combinedTh;
  const nonTriggers55 = nonDirect || nonCombo;
  const reAffectsCons_sub = subPct > 20;
  const subDirect = subPct > 20;
  const subCombo = reAffectsCons_sub && ((subPct + consPct) > 20);
  let subTriggers65 = false;
  let retireeForcePersonal = false;
  let makeConsInfluentialFor65 = false;
  if (retired.checked && reAffectsCons_sub && !consInf) {
    if ((subPct + consPct) > 40) { subTriggers65 = true; makeConsInfluentialFor65 = true; }
    else { retireeForcePersonal = true; }
  } else {
    subTriggers65 = subDirect || subCombo;
    if (subCombo) makeConsInfluentialFor65 = true;
  }
  const hasRealEstate = (nonPct + subPct) > 0;
  const hasConsumer = consPct > 0;
  const hasSupportedRealEstate = nonPct > 0;
  const hasUnsupportedRealEstate = subPct > 0;
  return {
    consInf,
    nonInf: nonTriggers55,
    subInf: subTriggers65,
    retireeForcePersonal,
    makeConsInfluentialFor55: nonCombo,
    makeConsInfluentialFor65,
    hasRealEstate,
    hasConsumer,
    hasSupportedRealEstate,
    hasUnsupportedRealEstate
  };
}



function classifyInfluenceMid(consPct, nonPct, subPct, selectedRate = 45) {
  const cth = getConsumerThreshold(selectedRate);
  const consInf = consPct > cth;
  const rePct = nonPct + subPct;
  const reAffectsCons = rePct > 20;
  const hasRealEstate = rePct > 0;
  const hasConsumer = consPct > 0;
  const hasSupportedRealEstate = nonPct > 0;
  const hasUnsupportedRealEstate = subPct > 0;
  // تحقق من تجاوز حد التأثير للعقاري
  const nonInf = nonPct > 20;  // العقاري المدعوم يتجاوز حد التأثير
  const subInf = subPct > 20;  // العقاري غير المدعوم يتجاوز حد التأثير
  let trigger65 = false;
  let retireeForcePersonal = false;
  if (retired.checked && reAffectsCons && !consInf) {
    if ((rePct + consPct) > 40) trigger65 = true; else retireeForcePersonal = true;
  } else {
    const combineThreshold = getReEstateCombinedThreshold(selectedRate);
    const combo3167 = (rePct + consPct) >= combineThreshold;
    trigger65 = reAffectsCons && combo3167;
  }
  return { consInf, rePct, totalCommitments: consPct + rePct, reAffectsCons, trigger65, retireeForcePersonal, hasRealEstate, hasConsumer, hasSupportedRealEstate, hasUnsupportedRealEstate, nonInf, subInf };
}


function classifyInfluenceHigh(othersPct) {
  if (isRetired()) {
    // متقاعد: 3 حالات
    const band = (othersPct >= 55) ? 'ge55' : (othersPct >= 20 ? 'ge20' : 'lt20');
    return { retiree: true, othersPct, band };
  } else {
    // موظف: حد التأثير 35% (يصبح مفعلاً لاحتساب السقف 45%)
    const othersInf = (othersPct >= 35);
    return { retiree: false, othersPct, othersInf };
  }
}


function decideFinalPercentage(b, flags, selectedRate = 45) {
  if (flags.retireeForcePersonal) return FincPlnBaseCap();
  let candidates = [FincPlnBaseCap()];
  if (b === 'low') {
    if (flags.consInf) candidates.push(45);
    if (flags.nonInf) candidates.push(55);
    if (flags.subInf) candidates.push(65);
  } else if (b === 'mid' || b === 'high') {
    const hasRealEstate = flags.hasRealEstate || false;
    const hasConsumer = flags.hasConsumer || false;
    const hasSupportedRealEstate = flags.hasSupportedRealEstate || false;
    const hasUnsupportedRealEstate = flags.hasUnsupportedRealEstate || false;

    // الرواتب من 15 فأعلى للعقاري تُحصل على 65% كحد أدنى، سواء مدعوم أو غير مدعوم.
    if (hasRealEstate && !hasConsumer) {
      candidates.push(65);
    }

    // إذا كان الاختيار 70% أو 75% أو 80%، يتم تطبيقه إذا تجاوز مجموع الالتزامات الحد
    if (selectedRate > 45 && (flags.totalCommitments || 0) > (selectedRate - 45)) {
      candidates.push(selectedRate);
    } else {
      // المنطق العادي لـ75% و80%
      if (hasRealEstate && hasConsumer) {
        // الاثنين معا: 75% أو 80% فقط (مع التحقق من التأثير)
        if (flags.consInf && flags.reAffectsCons) {
          candidates.push(selectedRate);
        }
      } else if (hasConsumer && !hasRealEstate) {
        // استهلاكي فقط: تحقق من التأثير قبل تطبيق النسبة
        if (flags.consInf) {
          candidates.push(selectedRate);
        }
      } else if (hasRealEstate && !hasConsumer) {
        // عقاري فقط - تحقق من تجاوز حد التأثير قبل تطبيق النسب
        const nonInf = flags.nonInf || false;  // العقاري المدعوم يتجاوز 31.67%
        const subInf = flags.subInf || false;  // العقاري غير المدعوم يتجاوز 31.67%

        if ((hasUnsupportedRealEstate && subInf) || (hasSupportedRealEstate && nonInf)) {
          // أي نوع من العقاري يتجاوز حد التأثير
          candidates.push(selectedRate);
        }
      } else {
        // لا يوجد تمويل عقاري أو استهلاكي
        if (flags.trigger65) {
          candidates.push(selectedRate);
        } else if (flags.consInf && !flags.reAffectsCons) {
          candidates.push(45);
        }
      }
    }
  }
  return Math.max(...candidates);
}


function updateSum() {
  const s = +salaryEl.value || 0;
  const n1 = +c1.value || 0, n2 = +c2.value || 0, n3 = +c3.value || 0;
  const sum = n1 + n2 + n3;
  document.getElementById('sumAmt').textContent = format(sum, 2);
  document.getElementById('sumPct').textContent = s ? format((sum / s) * 100, 2) + '%' : '0%';
  document.getElementById('p1').textContent = ` ( ${format((s ? (n1 / s) * 100 : 0), 2)}% )`;
  document.getElementById('p2').textContent = ` ( ${format((s ? (n2 / s) * 100 : 0), 2)}% )`;
  document.getElementById('p3').textContent = ` ( ${format((s ? (n3 / s) * 100 : 0), 2)}% )`;
  updateBadges();
}
[c1, c2, c3, type1El, type2El, type3El, employee, retired, clientTypeEl].forEach(el => { if (!el) return; el.addEventListener('input', () => { updateSum(); updateImpactChips(); }); });

function updateCommitWarnings() {
  // show/hide warnings when an amount exists but type is 'لا يوجد'
  let anyWarn = false;
  try {
    [[c1, type1El, 'warn1'], [c2, type2El, 'warn2'], [c3, type3El, 'warn3']].forEach(([amtEl, typeEl, warnId]) => {
      const warn = document.getElementById(warnId);
      if (!amtEl || !typeEl || !warn) return;
      const v = +amtEl.value || 0;
      if (typeEl.value === 'لا يوجد' && v > 0) {
        warn.textContent = 'يجب اختيار التزام';
        warn.classList.remove('hidden');
        warn.classList.add('show');
        anyWarn = true;
      } else if (typeEl.value !== 'لا يوجد' && v <= 0) {
        warn.textContent = 'يجب إدخال مبلغ';
        warn.classList.remove('hidden');
        warn.classList.add('show');
        anyWarn = true;
      } else {
        warn.classList.add('hidden');
        warn.classList.remove('show');
      }
    });
  } catch (e) { }
  return anyWarn;
}

// expose warnings check to be used before calculate

function showImpact(el, show, influential) {
  if (!show) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.classList.remove('ok', 'inf');
  if (influential) { el.classList.add('inf'); el.textContent = 'مؤثر'; }
  else { el.classList.add('ok'); el.textContent = 'غير مؤثر'; }
}

function updateConsumerHints() {
  // العبارة ظاهرة دائماً الآن - لا حاجة للتبديل
}

function updateImpactChips() {
  const s = +salaryEl.value || 0;
  const b = band(s);

  const t = [type1El.value, type2El.value, type3El.value];
  const n = [+c1.value || 0, +c2.value || 0, +c3.value || 0];

  const sumBy = (name) => n.reduce((acc, amt, idx) => acc + (t[idx] === name ? amt : 0), 0);
  const pCons = sumBy('تمويل استهلاكي');
  const pRealSupported = sumBy('عقاري مدعوم');
  const pRealUnsupportedRaw = sumBy('عقاري غير مدعوم');
  const pRealLegacy = sumBy('تمويل عقاري');
  const pRealUnsupported = pRealUnsupportedRaw + pRealLegacy; // legacy "تمويل عقاري" يُعامل كغير مدعوم
  const pReal = pRealSupported + pRealUnsupported;

  const consPct = s ? (pCons / s) * 100 : 0;
  const realPctSupported = s ? (pRealSupported / s) * 100 : 0;
  const realPctUnsupported = s ? (pRealUnsupported / s) * 100 : 0;
  const realPct = s ? (pReal / s) * 100 : 0;

  // ✅ مجموع جميع الالتزامات (بغض النظر عن النوع)
  const sumAll = (() => {
    let tot = 0;
    for (let i = 1; i <= 3; i++) {
      const c = document.getElementById('c' + i);
      const alt = document.getElementById('commitment' + i);
      const v = (c && c.value ? Number(c.value) || 0 : 0) || (alt && alt.value ? Number(alt.value) || 0 : 0);
      tot += v;
    }
    return tot;
  })();

  const othersPct = s ? (sumAll / s) * 100 : 0;

  const selectedRate = (() => {
    const checkboxes = document.querySelectorAll('input.deductionRateCheckbox:checked');
    return checkboxes.length > 0 ? parseInt(checkboxes[0].value, 10) : 45;
  })();
  let flags = {};
  if (b === 'low') {
    flags = classifyInfluenceLow(consPct, realPctUnsupported, realPctSupported, selectedRate);
  } else {
    flags = classifyInfluenceMid(consPct, realPctSupported, realPctUnsupported, selectedRate);
  }
  // إذا كان "عميل جديد" والراتب <25k: سنطبّق تجاوزًا بصريًا لإظهار الالتزامات غير مؤثرة
  const isClientNew = (clientTypeEl && clientTypeEl.value === 'عميل جديد' && s < 25000 && employee && employee.checked);
  // لكن نفعل ذلك فقط عندما يكون السقف الاعتيادي أكبر أو يساوي 11.67% — وإلا نعرض المؤثرات كالمعتاد
  if (isClientNew) {
    const normalPct = decideFinalPercentage(b, flags, selectedRate);
    const normalCeiling = s * (normalPct / 100);
    const newCapAmount = s * 0.1167;
    // نحسب المجموع المؤثر بافتراض القواعد الاعتيادية
    let normalInfluentialTotal = 0;
    if (b === 'low') {
      if (!isRetired()) {
        const realDeduct = (flags.realInfSupported ? pRealSupported : 0) + (flags.realInfUnsupported ? pRealUnsupported : 0);
        normalInfluentialTotal = pCons + realDeduct;
      } else {
        const deductCons = (flags.consInf || flags.sumInf);
        const deductReal = (flags.realInf && flags.sumInf);
        const realDeduct = deductReal ? ((flags.realInfSupported ? pRealSupported : 0) + (flags.realInfUnsupported ? pRealUnsupported : 0)) : 0;
        normalInfluentialTotal = (deductCons ? pCons : 0) + realDeduct;
      }
    } else if (b === 'mid') {
      normalInfluentialTotal = (!isRetired()) ? (pCons + (flags.realInf ? pReal : 0)) : ((flags.consInf || flags.sumInf) ? pCons : 0) + ((flags.realInf && flags.sumInf) ? pReal : 0);
    } else {
      normalInfluentialTotal = (!isRetired()) ? sumAll : ((othersPct < 20) ? 0 : sumAll);
    }
    const normalRemaining = Math.max(0, normalCeiling - normalInfluentialTotal);
    const shouldOverride = normalRemaining >= newCapAmount;
    if (shouldOverride) {
      flags.consInf = false;
      flags.realInf = false;
      flags.realInfSupported = false;
      flags.realInfUnsupported = false;
      flags.sumInf = false;
      flags.subInf = false;
      flags.othersInf = false;
    }
  }

  // وسم الاستهلاكي
  const consTag = document.getElementById('consTag');
  if (consTag) {
    if (isClientNew && typeof flags.consInf !== 'undefined') {
      consTag.textContent = flags.consInf ? 'مؤثر' : 'غير مؤثر';
      consTag.classList.toggle('inf', flags.consInf);
      consTag.classList.toggle('ok', !flags.consInf);
    } else {
      consTag.textContent = (consPct > 0) ? 'مؤثر' : 'غير مؤثر';
      consTag.classList.toggle('inf', consPct > 0);
      consTag.classList.toggle('ok', !(consPct > 0));
    }
  }

  // وسم العقاري (تحديث العلامة إن وُجدت)
  const realTag = document.getElementById('realTag');
  if (realTag) {
    const realInfLow = (realPctSupported >= 20) || (realPctUnsupported >= 10);
    const realInfMid = (realPct >= 20);
    const realInfDisp = (b === 'low') ? realInfLow : (b === 'mid' ? realInfMid : false);
    if (isClientNew && typeof flags.realInf !== 'undefined') {
      realTag.textContent = flags.realInf ? 'مؤثر' : 'غير مؤثر';
      realTag.classList.toggle('inf', flags.realInf);
      realTag.classList.toggle('ok', !flags.realInf);
    } else {
      realTag.textContent = realInfDisp ? 'مؤثر' : 'غير مؤثر';
      realTag.classList.toggle('inf', realInfDisp);
      realTag.classList.toggle('ok', !realInfDisp);
    }
  }

  // تحديث وسوم كل التزام (مؤثر / غير مؤثر) — شغال دائماً، بنفس منطق العرض في personal.js
  try {
    const impacts = [impact1, impact2, impact3];
    const typeIsInfluential = (type) => {
      if (b === 'low') {
        if (type === 'لا يوجد') return false;
        if (type === 'تمويل استهلاكي') return flags.consInf || (flags.makeConsInfluentialFor65 || flags.makeConsInfluentialFor55);
        if (type === 'عقاري مدعوم') return flags.realInfSupported || flags.sumInf;
        if (type === 'عقاري غير مدعوم') return flags.realInfUnsupported || flags.sumInf;
        if (type === 'تمويل عقاري') return flags.realInfUnsupported || flags.sumInf; // legacy label
        return false;
      } else if (b === 'mid') {
        if (flags && (flags.realInf || flags.subInf)) return true;
        return flags.consInf;
      } else { // high
        return (flags && flags.othersInf) || false;
      }
    };

    [0, 1, 2].forEach(i => {
      const typeVal = (t[i] || '').trim();
      const wrapVisible = [true, !commit2Wrap.classList.contains('hidden'), !commit3Wrap.classList.contains('hidden')][i];
      const show = (typeVal !== 'لا يوجد' && n[i] > 0 && wrapVisible);
      const influential = show ? typeIsInfluential(typeVal) : false;
      showImpact(impacts[i], show, influential);
    });
  } catch (e) { }


  updateConsumerHints();
  updateBadges();

  // ✅ لا تُنهِ الدالة قبل بناء الوسوم
  return { s, b, flags, consPct, realPct, pCons, pReal, pRealSupported, pRealUnsupported, sumAll, othersPct };
}


function calculate() {
  // إخفاء جميع الأخطاء السابقة
  document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
  document.querySelectorAll('input.error').forEach(el => el.classList.remove('error'));

  // التحقق من الالتزامات
  if (updateCommitWarnings()) {
    return;
  }

  const s = +salaryEl.value;
  const months = parseInt(monthsEl.value);
  const rate = parseFloat(rateEl.value);
  const customerName = document.getElementById('customerName').value.trim();
  const amountToPay = +document.getElementById('amountToPay').value || 0;

  // التحقق من الحقول الإلزامية
  if (!customerName) {
    const errorEl = document.getElementById('customerNameError') || document.createElement('div');
    errorEl.id = 'customerNameError';
    errorEl.className = 'error-message';
    errorEl.textContent = 'يرجى إدخال اسم العميل';
    errorEl.style.display = 'block';
    document.getElementById('customerName').parentNode.appendChild(errorEl);
    document.getElementById('customerName').classList.add('error');
    document.getElementById('customerName').focus();
    return;
  }
  if (!s || s <= 0) {
    const errorEl = document.getElementById('salaryError');
    errorEl.textContent = 'يرجى إدخال الراتب';
    errorEl.style.display = 'block';
    salaryEl.classList.add('error');
    salaryEl.focus();
    return;
  }
  if (!months || months < 6 || months > 60) {
    const errorEl = document.getElementById('monthsError');
    errorEl.textContent = 'يرجى إدخال المدة بالأشهر (من 6 إلى 60)';
    errorEl.style.display = 'block';
    monthsEl.classList.add('error');
    monthsEl.focus();
    return;
  }
  if (isNaN(rate) || rate < 0) {
    const errorEl = document.getElementById('rateError');
    errorEl.textContent = 'يرجى إدخال نسبة الفائدة السنوية';
    errorEl.style.display = 'block';
    rateEl.classList.add('error');
    rateEl.focus();
    return;
  }

  const b = band(s);

  // تحقق من التمويل الميسر (لا يوجد التزام شخصي)
  let isEasyFinancing = false;
  try {
    const t1 = type1El ? type1El.value : 'لا يوجد';
    const t2 = type2El ? type2El.value : 'لا يوجد';
    const t3 = type3El ? type3El.value : 'لا يوجد';
    const a1 = +(c1?.value || 0);
    const a2 = +(c2?.value || 0);
    const a3 = +(c3?.value || 0);

    // إذا كانت جميع الالتزامات = "لا يوجد" والمبالغ = 0
    if (t1 === 'لا يوجد' && t2 === 'لا يوجد' && t3 === 'لا يوجد' &&
      a1 === 0 && a2 === 0 && a3 === 0) {
      isEasyFinancing = true;
    }
  } catch (e) { }

  // تحقق من اختيار نوع العميل
  try {
    const clientTypeWarn = document.getElementById('clientTypeWarn');
    if (clientTypeEl && clientTypeEl.value === 'اختر') {
      if (clientTypeWarn) { clientTypeWarn.classList.remove('hidden'); }
      // اسحب رؤية المستخدم إلى مكان الاختيار
      clientTypeEl && clientTypeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    } else if (clientTypeWarn) { clientTypeWarn.classList.add('hidden'); }
  } catch (e) { }

  // تحقق من تحذيرات الالتزامات: إذا يوجد مبلغ ومُختار 'لا يوجد' فنعرض تحذير ونوقف الحساب
  try {
    const commitWarn = updateCommitWarnings();
    if (commitWarn) {
      // اسحب رؤية المستخدم إلى أول تحذير
      const first = document.querySelector('.warn:not(.hidden)');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  } catch (e) { }

  const t1 = type1El.value, t2 = type2El.value, t3 = type3El.value;
  const n1 = +c1.value || 0, n2 = +c2.value || 0, n3 = +c3.value || 0;

  const types = [t1, t2, t3];
  const amounts = [n1, n2, n3];
  const sumBy = (name) => amounts.reduce((acc, amt, idx) => acc + (types[idx] === name ? amt : 0), 0);

  const pCons = sumBy('تمويل استهلاكي');
  const pRealSupported = sumBy('عقاري مدعوم');
  const pRealUnsupportedRaw = sumBy('عقاري غير مدعوم');
  const pRealLegacy = sumBy('تمويل عقاري');
  const pRealUnsupported = pRealUnsupportedRaw + pRealLegacy; // legacy "تمويل عقاري" يُعامل كغير مدعوم
  const pReal = pRealSupported + pRealUnsupported;


  const consPct = s ? (pCons / s) * 100 : 0;
  const realPctSupported = s ? (pRealSupported / s) * 100 : 0;
  const realPctUnsupported = s ? (pRealUnsupported / s) * 100 : 0;
  const realPct = s ? (pReal / s) * 100 : 0;

  const selectedRate = (() => {
    const checkboxes = document.querySelectorAll('input.deductionRateCheckbox:checked');
    return checkboxes.length > 0 ? parseInt(checkboxes[0].value, 10) : 45;
  })();
  let flags = {};
  if (b === 'low') {
    flags = classifyInfluenceLow(consPct, realPctUnsupported, realPctSupported, selectedRate);
  } else {
    flags = classifyInfluenceMid(consPct, realPctSupported, realPctUnsupported, selectedRate);
  }

  // نحدد السقف الاعتيادي أولًا بحسب القواعد الحالية
  const normalPct = decideFinalPercentage(b, flags, selectedRate);
  const normalCeiling = s * (normalPct / 100);
  const isClientNewCalc = (clientTypeEl && clientTypeEl.value === 'عميل جديد' && s < 25000 && employee && employee.checked);
  const newCapAmount = s * 0.1167; // 11.67%

  // نحسب أولًا مجموع المبالغ المؤثرة حسب القواعد الاعتيادية (بدون أي تجاوز خاص بالعميل الجديد)
  let normalInfluentialTotal = 0;
  if (b === 'low') {
    if (!isRetired()) {
      const realDeduct = (flags.realInfSupported ? pRealSupported : 0) + (flags.realInfUnsupported ? pRealUnsupported : 0);
      normalInfluentialTotal = pCons + realDeduct;
    } else {
      const deductCons = (flags.consInf || flags.sumInf);
      const deductReal = (flags.realInf && flags.sumInf);
      const realDeduct = deductReal ? ((flags.realInfSupported ? pRealSupported : 0) + (flags.realInfUnsupported ? pRealUnsupported : 0)) : 0;
      normalInfluentialTotal = (deductCons ? pCons : 0) + realDeduct;
    }
  } else if (b === 'mid') {
    if (!isRetired()) {
      normalInfluentialTotal = pCons + (flags.realInf ? pReal : 0);
    } else {
      const deductCons = (flags.consInf || flags.sumInf);
      const deductReal = (flags.realInf && flags.sumInf);
      normalInfluentialTotal = (deductCons ? pCons : 0) + (deductReal ? pReal : 0);
    }
  } else if (b === 'high') {
    // للرواتب >= 25000، نطرح الالتزامات فقط إذا كانت مؤثرة
    if (flags.othersInf) {
      normalInfluentialTotal = sumAllCommitments();
    } else {
      normalInfluentialTotal = 0;
    }
  }

  const normalRemaining = Math.max(0, normalCeiling - normalInfluentialTotal);

  let finalPct = normalPct;
  let ceiling = normalCeiling;
  let influentialTotal = normalInfluentialTotal;

  if (isClientNewCalc) {
    if (normalRemaining >= newCapAmount) {
      // يوجد متبقي كافٍ داخل السقف الاعتيادي ليُمنح العميل الجديد 11.67% دون طرح الالتزامات
      finalPct = 11.67;
      ceiling = newCapAmount;
      influentialTotal = 0; // لا نطرح الالتزامات من سقف الـ11.67%
    } else {
      // المتبقي من السقف الاعتيادي أقل من 11.67% => نحتسب بناءً عليه
      ceiling = normalRemaining;
      finalPct = s ? (ceiling / s) * 100 : 0;
      // لا نطرح الالتزامات مرة أخرى لأن normalRemaining هو المتبقي بعد طرحها
      influentialTotal = 0;
    }
  }

  let maxMonthlyInstallment = Math.max(0, ceiling - influentialTotal);

  // تطبيق التمويل الميسر إذا لزم الأمر

  if (isEasyFinancing) {
    // حد أقصى 25000 ومدة 24 شهر
    const easyFinancingCap = s * 0.45; // 45% 
    maxMonthlyInstallment = Math.min(maxMonthlyInstallment, easyFinancingCap);
  }

  // حساب الحد الأقصى لصافي التمويل من القسط الشهري الأقصى
  const maxFinancingTotal = maxMonthlyInstallment * months;
  const totalRate = rate * (months / 12);
  const maxNetFinancing = maxFinancingTotal / (1 + (rate * months) / 1200);

  // التحقق من خيار التمويل المحدد
  const option = financingOption ? financingOption.value : 'full';
  const customVal = +(customValue?.value || 0);

  let selectedNet = maxNetFinancing;
  let selectedMonthly = maxMonthlyInstallment;

  if (option === 'customAmount' && customVal > 0) {
    if (customVal > maxNetFinancing) {
      const errorEl = document.getElementById('customValueError');
      errorEl.textContent = `المبلغ المطلوب (${format(customVal)}) يتجاوز الحد الأقصى المتاح (${format(maxNetFinancing)})`;
      errorEl.style.display = 'block';
      customValue.classList.add('error');
      return;
    }
    selectedNet = customVal;
  } else if (option === 'customInstallment' && customVal > 0) {
    if (customVal > maxMonthlyInstallment) {
      const errorEl = document.getElementById('customValueError');
      errorEl.textContent = `القسط المطلوب (${format(customVal)}) يتجاوز الحد الأقصى المتاح (${format(maxMonthlyInstallment)})`;
      errorEl.style.display = 'block';
      customValue.classList.add('error');
      return;
    }
    selectedMonthly = customVal;
  }

  const errorEl = document.getElementById('customValueError');
  if (errorEl) errorEl.style.display = 'none';
  if (customValue) customValue.classList.remove('error');

  const remaining = maxMonthlyInstallment;

  // عرض النسبة الظاهرة للمستخدم: عادة نعرض نسبة القاعدة (السياسة) مثل 45/55/65/80.
  // استثناء: إن كنا نمنح عميل جديد (موظف) سقف 11.67% بالكامل (أي normalRemaining >= newCapAmount)،
  // عندها نعرض 11.67% بدلًا من normalPct.
  let displayPct = normalPct;
  try {
    const isClientNewCalc = (clientTypeEl && clientTypeEl.value === 'عميل جديد' && s < 25000 && employee && employee.checked);
    const newCapAmount = s * 0.1167;
    // نعيد حساب normalRemaining هنا إن لم يكن في النطاق
    // (normalRemaining تم حسابه سابقًا في نفس الدالة)
    if (isClientNewCalc && typeof normalRemaining !== 'undefined' && normalRemaining >= newCapAmount) {
      displayPct = 11.67;
    }
  } catch (e) { }
  // بناء شرح مباشر وبسيط
  const commitments = [];
  const labels = ['الأول', 'الثاني', 'الثالث'];

  [0, 1, 2].forEach(i => {
    const typeEl = [type1El, type2El, type3El][i];
    const amtEl = [c1, c2, c3][i];
    const type = typeEl ? typeEl.value : 'لا يوجد';
    const amount = amtEl ? (+amtEl.value || 0) : 0;

    if (type !== 'لا يوجد' && amount > 0) {
      let isInfluential = false;

      // تحديد ما إذا كان الالتزام مؤثر بناءً على المنطق الحالي
      if (b === 'low') {
        if (!isRetired()) {
          if (type === 'تمويل استهلاكي') isInfluential = true;
          else if (type === 'عقاري مدعوم') isInfluential = flags.realInfSupported;
          else if (type === 'عقاري غير مدعوم') isInfluential = flags.realInfUnsupported;
        } else {
          const deductCons = (flags.consInf || flags.sumInf);
          const deductReal = (flags.realInf && flags.sumInf);
          if (type === 'تمويل استهلاكي') isInfluential = deductCons;
          else if (type === 'عقاري مدعوم' || type === 'عقاري غير مدعوم') isInfluential = deductReal;
        }
      } else if (b === 'mid') {
        if (!isRetired()) {
          if (type === 'تمويل استهلاكي' || type === 'عقاري مدعوم' || type === 'عقاري غير مدعوم') {
            isInfluential = flags.reAffectsCons;
          }
        } else {
          if (type === 'تمويل استهلاكي') isInfluential = (flags.consInf && !flags.reAffectsCons);
          else if (type === 'عقاري مدعوم' || type === 'عقاري غير مدعوم') isInfluential = flags.trigger65;
        }
      } else {
        isInfluential = (type === 'مجموع الالتزامات' && flags.othersInf);
      }

      commitments.push({
        label: labels[i],
        type: type,
        isInfluential: isInfluential
      });
    }
  });

  const influential = commitments.filter(c => c.isInfluential);
  const nonInfluential = commitments.filter(c => !c.isInfluential);

  let explanation = `تم احتساب النسبة ${displayPct.toFixed(2)}%`;

  // إذا كانت جميع الالتزامات غير مؤثرة
  if (influential.length === 0 && nonInfluential.length > 0) {
    explanation += ' لأن الالتزامات غير مؤثرة';
  }
  // إذا كان هناك التزامات مؤثرة وغير مؤثرة
  else if (influential.length > 0 && nonInfluential.length > 0) {
    explanation += ' لأن الالتزام ';
    explanation += influential.map(c => c.label).join(' و');
    explanation += influential.length === 1 ? ' مؤثر' : ' مؤثرة';
    explanation += ' والالتزام ';
    explanation += nonInfluential.map(c => c.label).join(' و');
    explanation += nonInfluential.length === 1 ? ' غير مؤثر' : ' غير مؤثرة';
  }
  // إذا كانت جميع الالتزامات مؤثرة
  else if (influential.length > 0) {
    explanation += ' لأن الالتزام ';
    explanation += influential.map(c => c.label).join(' و');
    explanation += influential.length === 1 ? ' مؤثر' : ' مؤثرة';
  }

  explanation += '.';

  document.getElementById('explainFriendly').textContent = explanation;
  const tech = [];
  document.getElementById('explain').textContent = tech.join(' — ');

  let financeHTML = '<td data-label="صافي مبلغ التمويل">-</td><td data-label="مبلغ الفائدة">-</td><td data-label="التمويل شامل الفائدة">-</td><td data-label="الرسوم الإدارية">-</td><td data-label="ضريبة الرسوم (15%)">-</td><td data-label="إجمالي الرسوم">-</td><td data-label="القسط الشهري">-</td><td data-label="المدة بالأشهر">-</td>';
  if (true) {
    let financingTotal, net, interestAmount, monthly;
    const totalRateCalc = rate * (months / 12);

    if (option === 'customInstallment' && customVal > 0) {
      monthly = selectedMonthly;
      financingTotal = monthly * months;
      net = financingTotal / (1 + (rate * months) / 1200);
      interestAmount = net * (totalRateCalc / 100);
    } else {
      net = selectedNet;
      interestAmount = net * (totalRateCalc / 100);
      financingTotal = net + interestAmount;
      monthly = financingTotal / months;
    }

    // (debug logs removed)

    const feeRaw = net * 0.005; // 1% من صافي مبلغ التمويل
    const adminFeeCapped = Math.min(feeRaw, 2500);
    const vatOnFee = adminFeeCapped * 0.15;
    const totalFees = adminFeeCapped + vatOnFee;

    financeHTML = `
          <tr><td class="label-cell">صافي مبلغ التمويل</td><td class="value-cell">${format(net)}</td></tr>
          <tr><td class="label-cell">مبلغ الفائدة</td><td class="value-cell">${format(interestAmount)}</td></tr>
          <tr><td class="label-cell">التمويل شامل الفائدة</td><td class="value-cell">${format(financingTotal)}</td></tr>
          <tr><td class="label-cell">الرسوم الإدارية <span class="small-hint">(شامل الضريبة)</span></td><td class="value-cell">${format(totalFees)}</td></tr>
          <tr><td class="label-cell">القسط الشهري</td><td class="value-cell">${format(monthly)}</td></tr>
          <tr><td class="label-cell">المدة بالأشهر</td><td class="value-cell">${months}</td></tr>
          <tr><td class="label-cell">الصافي بعد السداد</td><td class="value-cell">${format(net - totalFees - amountToPay)}</td></tr>`;

    // عرض نافذة التمويل الميسر إذا لزم الأمر
    if (isEasyFinancing) {
      try {
        const easyFinancingModal = document.getElementById('easyFinancingModal');
        const easyFinancingClose = document.getElementById('easyFinancingClose');
        if (easyFinancingModal) {
          easyFinancingModal.classList.add('show');
        }
        if (easyFinancingClose && easyFinancingModal) {
          easyFinancingClose.onclick = () => easyFinancingModal.classList.remove('show');
        }
      } catch (e) { }
    }

    // سياسة الاستحقاق: إن كان صافي مبلغ التمويل أقل من 5000 => لا يستحق
    try {
      const eligModal = document.getElementById('eligModal');
      const eligClose = document.getElementById('eligClose');
      if (net < 5000) {
        eligModal && eligModal.classList.add('show');
      }
      if (eligClose && eligModal) {
        eligClose.onclick = () => eligModal.classList.remove('show');
      }
    } catch (e) { }
  }
  document.getElementById('financeRow').innerHTML = financeHTML;
  const expBtn = document.getElementById('exportBtn'); if (expBtn) { expBtn.classList.remove('hidden'); }
  const financingOptionsCard = document.getElementById('financingOptionsCard'); if (financingOptionsCard) { financingOptionsCard.classList.remove('hidden'); }
}

calcBtn.addEventListener('click', (e) => { e.preventDefault(); calculate(); updateImpactChips(); });

// زر مسح الكاش
const clearCacheBtn = document.getElementById('clearCacheBtn');
if (clearCacheBtn) {
  clearCacheBtn.addEventListener('click', () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات المخزنة؟ سيتم إعادة تحميل الصفحة.')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        location.reload(true);
      } catch (e) {
        alert('حدث خطأ أثناء مسح البيانات');
      }
    }
  });
}
document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('financeRow').innerHTML = '';
  const _m = document.getElementById('eligModal'); if (_m) { _m.classList.remove('show'); }
  const _easyModal = document.getElementById('easyFinancingModal'); if (_easyModal) { _easyModal.classList.remove('show'); }
  const expBtn2 = document.getElementById('exportBtn'); if (expBtn2) { expBtn2.classList.add('hidden'); }
  const financingOptionsCard2 = document.getElementById('financingOptionsCard'); if (financingOptionsCard2) { financingOptionsCard2.classList.add('hidden'); }
  document.getElementById('explain').textContent = '';
  document.getElementById('explainFriendly').textContent = '';
  salaryEl.value = ''; monthsEl.value = ''; rateEl.value = '';
  [c1, c2, c3].forEach(el => el.value = 0);
  updateOptions();
  commit2Wrap.classList.add('hidden');
  commit3Wrap.classList.add('hidden');
  removeCommitBtn.classList.add('hidden');
  document.getElementById('addCommitBtn').classList.remove('hidden');
  updateSum();
  updateImpactChips();
});

addCommitBtn.addEventListener('click', () => {
  if (commit2Wrap.classList.contains('hidden')) {
    commit2Wrap.classList.remove('hidden');
    removeCommitBtn.classList.remove('hidden');
  } else if (commit3Wrap.classList.contains('hidden')) {
    commit3Wrap.classList.remove('hidden');
    document.getElementById('addCommitBtn').classList.add('hidden');
  }
  updateImpactChips();
});
removeCommitBtn.addEventListener('click', () => {
  if (!commit3Wrap.classList.contains('hidden')) {
    commit3Wrap.classList.add('hidden');
    type3El.value = 'لا يوجد'; c3.value = 0;
    document.getElementById('addCommitBtn').classList.remove('hidden');
  } else if (!commit2Wrap.classList.contains('hidden')) {
    commit2Wrap.classList.add('hidden');
    type2El.value = 'لا يوجد'; c2.value = 0;
    removeCommitBtn.classList.add('hidden');
    document.getElementById('addCommitBtn').classList.remove('hidden');
  }
  updateSum();
  updateImpactChips();
});

[type1El, type2El, type3El].forEach((sel, idx) => {
  const el = [c1, c2, c3][idx];
  sel.addEventListener('change', () => {
    if (sel.value === 'لا يوجد') { el.value = 0; }
    updateSum();
    updateImpactChips();
    updateCommitWarnings();
  });
});

// Ensure warning state updates when commitments inputs change
[c1, c2, c3, type1El, type2El, type3El].forEach(el => { if (!el) return; el.addEventListener('input', () => { updateCommitWarnings(); }); });

updateOptions(); updateSum(); updateBadges(); updateImpactChips();
// تأكيد الحالة عند التحميل
if (employee.checked && retired.checked) { retired.checked = false; }

// إجبار ظهور عبارات التنبيه - تنفيذ فوري
setTimeout(() => {
  [hint1, hint2, hint3].forEach(h => {
    if (h) {
      h.classList.remove('hidden');
      h.style.display = 'block';
    }
  });
}, 100);




// Theme toggle behavior with persistence
// ملاحظة: إدارة النمط الليلي تتم من index.html لتجنب التكرار

// Export PNG
(function () {
  const btn = document.getElementById('exportBtn');
  const target = document.getElementById('exportArea');
  const toggleBtn = document.getElementById('togglePoliciesBtn');
  const policiesSection = document.getElementById('policiesSection');
  if (btn && target) {
    btn.addEventListener('click', async () => {
      // إخفاء زر المشاركة وزر وجدول السياسات مؤقتاً
      const exportBtnDisplay = btn.style.display;
      const policiesBtnDisplay = toggleBtn ? toggleBtn.style.display : '';
      const policiesSectionDisplay = policiesSection ? policiesSection.style.display : '';
      btn.style.display = 'none';
      if (toggleBtn) toggleBtn.style.display = 'none';
      if (policiesSection) policiesSection.style.display = 'none';

      // إضافة هوامش مؤقتة
      const originalPadding = target.style.padding;
      target.style.padding = '2px';

      const origBg = target.style.backgroundColor;
      try {
        target.style.backgroundColor = '#ffffff';

        // إصلاح: التأكد من ظهور الجداول بشكل صحيح
        const tables = target.querySelectorAll('table');
        const rows = target.querySelectorAll('tr');
        const cells = target.querySelectorAll('td, th');

        const originalStyles = {
          tables: [],
          rows: [],
          cells: []
        };

        // حفظ الأنماط الأصلية
        tables.forEach((table, i) => {
          originalStyles.tables[i] = {
            border: table.style.border,
            borderCollapse: table.style.borderCollapse,
            width: table.style.width,
            borderRadius: table.style.borderRadius
          };
          table.style.borderCollapse = 'collapse';
          table.style.width = '100%';
          table.style.borderRadius = '12px';
          table.style.overflow = 'hidden';
        });

        // إزالة border-radius من الصفوف والخلايا
        rows.forEach((row, i) => {
          originalStyles.rows[i] = {
            borderRadius: row.style.borderRadius,
            border: row.style.border
          };
          row.style.borderRadius = '0';
          row.style.border = 'none';
        });

        cells.forEach((cell, i) => {
          originalStyles.cells[i] = {
            border: cell.style.border,
            padding: cell.style.padding,
            borderRadius: cell.style.borderRadius
          };
          cell.style.border = '1px solid #cbd5e1';
          cell.style.padding = '12px';
          cell.style.borderRadius = '0';
        });

        const canvas = await html2canvas(target, {
          scale: 3,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true
        });

        // إعادة الأنماط الأصلية
        tables.forEach((table, i) => {
          if (originalStyles.tables[i]) {
            Object.assign(table.style, originalStyles.tables[i]);
          }
        });

        rows.forEach((row, i) => {
          if (originalStyles.rows[i]) {
            Object.assign(row.style, originalStyles.rows[i]);
          }
        });

        cells.forEach((cell, i) => {
          if (originalStyles.cells[i]) {
            Object.assign(cell.style, originalStyles.cells[i]);
          }
        });

        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        const customerName = document.getElementById('customerName')?.value?.trim() || 'عميل';
        a.download = `${customerName}-إمكان.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        alert('تعذّر إنشاء الصورة، حاول بعد تعبئة البيانات وحساب النتيجة.');
      } finally {
        try { target.style.backgroundColor = origBg || ''; } catch (e) { }
        btn.style.display = exportBtnDisplay;
        if (toggleBtn) toggleBtn.style.display = policiesBtnDisplay;
        if (policiesSection) policiesSection.style.display = policiesSectionDisplay;
        target.style.padding = originalPadding;
      }
    });
  }
})();

// تحميل وعرض جدول السياسات
(function () {
  const toggleBtn = document.getElementById('togglePoliciesBtn');
  const policiesSection = document.getElementById('policiesSection');
  const policiesBody = document.getElementById('policiesBody');
  const policiesTitle = document.getElementById('policiesTitle');
  let policiesLoaded = false;
  let policiesLoading = false;

  if (!toggleBtn || !policiesSection || !policiesBody) return;

  // تحميل السياسات من ملف JSON
  async function loadPolicies() {
    // منع التحميل المتكرر
    if (policiesLoaded || policiesLoading) return;

    policiesLoading = true;
    try {
      const response = await fetch('policies-FincPln.json');
      if (!response.ok) {
        throw new Error('فشل تحميل ملف السياسات');
      }

      const policiesData = await response.json();

      // تحديث عنوان الجدول
      if (policiesTitle && policiesData.title) {
        policiesTitle.textContent = policiesData.title;
      }

      // بناء محتوى الجدول
      let html = '';
      policiesData.policies.forEach(policy => {
        html += `<tr><td class="policy-cell">${policy.policy}</td><td class="explanation-cell">${policy.explanation}</td></tr>`;
      });

      policiesBody.innerHTML = html;
      policiesLoaded = true;
    } catch (error) {
      console.error('خطأ في تحميل السياسات:', error);
      policiesBody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: #b91c1c;">فشل تحميل السياسات. تأكد من تشغيل الملف عبر Live Server.</td></tr>';
    } finally {
      policiesLoading = false;
    }
  }

  // إظهار/إخفاء الجدول
  toggleBtn.addEventListener('click', function () {
    if (policiesSection.classList.contains('hidden')) {
      // تحميل السياسات فقط عند أول فتح
      if (!policiesLoaded) {
        loadPolicies();
      }
      policiesSection.classList.remove('hidden');
      toggleBtn.textContent = 'إخفاء جدول السياسات';
    } else {
      policiesSection.classList.add('hidden');
      toggleBtn.textContent = 'إظهار جدول السياسات';
    }
  });
})();


function rebuildFincPlnOptions() {
  try {
    const s = Number((document.getElementById('salary') || {}).value || 0);
    const opts = optionsForSalary(s);

    ['type1', 'type2', 'type3'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const prev = sel.value;
      const desired = normalizeLegacyRealOption(prev, opts);
      sel.innerHTML = '';
      opts.forEach(t => { const o = document.createElement('option'); o.textContent = t; sel.appendChild(o); });
      sel.value = ([...sel.options].some(o => o.textContent === desired) ? desired : 'لا يوجد');
    });
  } catch (e) { }
}

function sumAllCommitments() {
  let tot = 0;
  for (let i = 1; i <= 3; i++) {
    const c = document.getElementById('c' + i);
    const alt = document.getElementById('commitment' + i);
    const v = (c && c.value ? Number(c.value) || 0 : 0) || (alt && alt.value ? Number(alt.value) || 0 : 0);
    tot += v;
  }
  return tot;
}

try {
  // 3) هنا تضيف أسطر الربط (خارج أي دالة)
  document.addEventListener('DOMContentLoaded', () => {
    rebuildFincPlnOptions();
    // إجبار ظهور عبارات التنبيه
    [hint1, hint2, hint3].forEach(h => { if (h) h.classList.remove('hidden'); });
  });

  // لو السكربت محمّل بتأخير defer وقد تكون الصفحة جاهزة بالفعل:
  if (document.readyState !== 'loading') {
    rebuildFincPlnOptions();
    [hint1, hint2, hint3].forEach(h => { if (h) h.classList.remove('hidden'); });
  }

  if (salaryEl) salaryEl.addEventListener('input', rebuildFincPlnOptions);
} catch (e) { }