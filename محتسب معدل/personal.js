const employee = document.getElementById('employee');
const retired = document.getElementById('retired');
const salaryEl = document.getElementById('salary');
const type1El = document.getElementById('type1');
const type2El = document.getElementById('type2');
const type3El = document.getElementById('type3');
const c1 = document.getElementById('commitment1');
const c2 = document.getElementById('commitment2');
const c3 = document.getElementById('commitment3');
const monthsEl = document.getElementById('months');
const rateEl = document.getElementById('rate');
const addCommitBtn = document.getElementById('addCommitBtn');
const removeCommitBtn = document.getElementById('removeCommitBtn');
const commit2Wrap = document.getElementById('commitment2Wrap');
const commit3Wrap = document.getElementById('commitment3Wrap');
const calcBtn = document.getElementById('calcBtn');
const impact1 = document.getElementById('impact1');
const impact2 = document.getElementById('impact2');
const impact3 = document.getElementById('impact3');
const hint1 = document.getElementById('hint1');
const hint2 = document.getElementById('hint2');
const financingOption = document.getElementById('financingOption');
const customInputWrapper = document.getElementById('customInputWrapper');
const customValue = document.getElementById('customValue');
const customerMobileEl = document.getElementById('customerMobile');
const amountToPayEl = document.getElementById('amountToPay');
const deductionRate = document.getElementById('deductionRate');
const lowMidOptions = ["لا يوجد", "تمويل شخصي", "تمويل استهلاكي", "عقاري مدعوم", "عقاري غير مدعوم"];
const highOptions = ["لا يوجد", "تمويل شخصي", "تمويل استهلاكي", "عقاري مدعوم", "عقاري غير مدعوم"];

employee.addEventListener('change', () => { if (employee.checked) { retired.checked = false; } updateBadges(); updateOptions(); });
retired.addEventListener('change', () => { if (retired.checked) { employee.checked = false; } updateBadges(); updateOptions(); });

function setSelectOptions(selectEl, options, defaultValue = "لا يوجد") {
  selectEl.innerHTML = "";
  options.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
  selectEl.value = defaultValue;
}

function updateOptions() {
  const s = +salaryEl.value || 0;
  const opts = (s >= 25000) ? highOptions : lowMidOptions;
  setSelectOptions(type1El, opts);
  setSelectOptions(type2El, opts);
  setSelectOptions(type3El, opts);
  [type1El, type2El, type3El].forEach((sel, idx) => {
    const el = [c1, c2, c3][idx];
    if (sel.value === "لا يوجد") { el.value = 0; }
  });

  const financingOptionsCard = document.getElementById('financingOptionsCard');
  const showFinancingOptions = s >= 25000;
  if (financingOptionsCard) {
    if (showFinancingOptions) {
      financingOptionsCard.classList.remove('hidden');
    } else {
      financingOptionsCard.classList.add('hidden');
      if (deductionRate) {
        deductionRate.checked = false;
      }
    }
  }

  updateSum();
  updateImpactChips();
}
salaryEl.addEventListener('input', () => { updateOptions(); });

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

function format(v, f = 2) { return (+v).toFixed(f); }
function personalCap() { return retired.checked ? 25 : 33.33; }
// عتبات التأثير ديناميكية حسب selectedRate
function getConsumerThreshold(selectedRate = 45) { return retired.checked ? 20 : (selectedRate === 75 ? 41.67 : 11.67); }
function getComboThreshold(selectedRate = 45) { return retired.checked ? 30 : 21.67; }
function getReEstateCombinedThreshold(selectedRate = 45) { return retired.checked ? 40 : (selectedRate === 75 ? 31.67 : 31.67); }
function othersThresholdHigh() { return retired.checked ? 50 : 41.67; }

function updateBadges() {
  const capBadge = document.getElementById('capBadge');
  const consCapBadge = document.getElementById('consCapBadge');
  const comboCapBadge = document.getElementById('comboCapBadge');
  const s = +salaryEl.value || 0;
  const selectedRate = deductionRate ? ((deductionRate.checked && s >= 25000) ? 75 : 45) : 45;
  if (capBadge) capBadge.textContent = personalCap().toFixed(2) + '%';
  if (consCapBadge) consCapBadge.textContent = getConsumerThreshold(selectedRate).toFixed(2) + '%';
  if (comboCapBadge) comboCapBadge.textContent = getComboThreshold(selectedRate).toFixed(2) + '%';
}

function band(s) {
  if (s >= 25000) return 'high';
  if (s >= 15000) return 'mid';
  return 'low';
}

function classifyInfluenceLow(consPct, nonPct, subPct, selectedRate = 45) {
  const cth = getConsumerThreshold(selectedRate);
  const consInf = consPct > cth;
  const nonDirect = (nonPct > 10) && consInf;
  const combinedTh = getComboThreshold(selectedRate);
  const nonCombo = (nonPct > 10) && !consInf && (nonPct + consPct) > combinedTh;
  const nonTriggers55 = nonDirect || nonCombo;
  const reAffectsCons_sub = subPct > 20;
  const subDirect = subPct > 31.67;
  const subCombo = reAffectsCons_sub && ((subPct + consPct) > 31.67);
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
  const nonInf = nonPct > 31.67;  // العقاري المدعوم يتجاوز حد التأثير
  const subInf = subPct > 31.67;  // العقاري غير المدعوم يتجاوز حد التأثير
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

function classifyInfluenceHigh(othPct) {
  const othersInf = othPct > othersThresholdHigh();
  return { othersInf };
}

function decideFinalPercentage(b, flags, selectedRate = 45) {
  if (flags.retireeForcePersonal) return personalCap();
  let candidates = [personalCap()];
  if (b === 'low') {
    if (flags.consInf) candidates.push(45);
    if (flags.nonInf) candidates.push(55);
    if (flags.subInf) candidates.push(65);
  } else if (b === 'mid' || b === 'high') {
    const hasRealEstate = flags.hasRealEstate || false;
    const hasConsumer = flags.hasConsumer || false;
    const hasSupportedRealEstate = flags.hasSupportedRealEstate || false;
    const hasUnsupportedRealEstate = flags.hasUnsupportedRealEstate || false;

    if (hasRealEstate && hasConsumer) {
      if (selectedRate === 75) {
        // في حالة 75% للعقاري+استهلاكي، نعتمد فقط مجموع الالتزامات غير التمويل الشخصي.
        if ((flags.totalCommitments || 0) >= 41.67) {
          candidates.push(75);
        }
      } else {
        if (flags.consInf && flags.reAffectsCons) {
          candidates.push(65);
        } else if (flags.consInf) {
          candidates.push(45);
        }
      }
    } else if (hasConsumer && !hasRealEstate) {
      // استهلاكي فقط: تحقق من التأثير قبل تطبيق النسبة
      if (flags.consInf) {
        candidates.push(selectedRate === 75 ? 75 : 45);
      }
    } else if (hasRealEstate && !hasConsumer) {
      // عقاري فقط - تحقق من تجاوز حد التأثير قبل تطبيق النسب
      const nonInf = flags.nonInf || false;  // العقاري المدعوم يتجاوز 31.67%
      const subInf = flags.subInf || false;  // العقاري غير المدعوم يتجاوز 31.67%

      if ((hasUnsupportedRealEstate && subInf) || (hasSupportedRealEstate && nonInf)) {
        // أي نوع من العقاري يتجاوز حد التأثير: 65% أو 75%
        candidates.push(selectedRate === 75 ? 75 : 65);
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

function updateCommitWarnings() {
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
  } catch (e) { console.error(e); }
  return anyWarn;
}

[c1, c2, c3, type1El, type2El, type3El, employee, retired].forEach(el => {
  el.addEventListener('input', () => {
    updateSum();
    updateImpactChips();
    updateCommitWarnings();
  });
  el.addEventListener('change', () => {
    updateSum();
    updateImpactChips();
    updateCommitWarnings();
  });
});

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
  const pNon = sumBy('عقاري غير مدعوم');
  const pSub = sumBy('عقاري مدعوم');
  const pPers = sumBy('تمويل شخصي');
  const pOth = sumBy('التزامات أخرى غير الشخصي');

  const consPct = s ? (pCons / s) * 100 : 0;
  const nonPct = s ? (pNon / s) * 100 : 0;
  const subPct = s ? (pSub / s) * 100 : 0;

  const selectedRate = deductionRate ? ((deductionRate.checked && s >= 25000) ? 75 : 45) : 45;
  let flags = {};
  if (b === 'low') {
    flags = classifyInfluenceLow(consPct, nonPct, subPct, selectedRate);
  } else {
    flags = classifyInfluenceMid(consPct, nonPct, subPct, selectedRate);
  }

  const typeIsInfluential = (type) => {
    if (b === 'low') {
      if (type === 'تمويل شخصي') return true;
      if (type === 'تمويل استهلاكي') return (flags.consInf || flags.makeConsInfluentialFor55 || flags.makeConsInfluentialFor65);
      if (type === 'عقاري غير مدعوم') return flags.nonInf;
      if (type === 'عقاري مدعوم') return flags.subInf;
      if (type === 'التزامات أخرى غير الشخصي') return false;
    } else if (b === 'mid' || b === 'high') {
      if (flags.trigger65) return (type !== 'تمويل شخصي' ? (type === 'تمويل استهلاكي' || type === 'عقاري غير مدعوم' || type === 'عقاري مدعوم') : true);
      if (flags.consInf && !flags.reAffectsCons) return (type === 'تمويل استهلاكي' || type === 'تمويل شخصي');
      return (type === 'تمويل شخصي');
    }
  };

  const impacts = [impact1, impact2, impact3];
  [0, 1, 2].forEach(i => {
    const typeVal = (t[i] || '').trim();
    const wrapVisible = [true, !commit2Wrap.classList.contains('hidden'), !commit3Wrap.classList.contains('hidden')][i];
    const show = (typeVal !== 'لا يوجد' && n[i] > 0 && wrapVisible);
    const influential = show ? typeIsInfluential(t[i]) : false;
    showImpact(impacts[i], show, influential);
  });

  updateConsumerHints();
  updateCommitWarnings();
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

  const t1 = type1El.value, t2 = type2El.value, t3 = type3El.value;
  const n1 = +c1.value || 0, n2 = +c2.value || 0, n3 = +c3.value || 0;

  const types = [t1, t2, t3];
  const amounts = [n1, n2, n3];
  const sumBy = (name) => amounts.reduce((acc, amt, idx) => acc + (types[idx] === name ? amt : 0), 0);

  const pCons = sumBy('تمويل استهلاكي');
  const pNon = sumBy('عقاري غير مدعوم');
  const pSub = sumBy('عقاري مدعوم');
  const pPers = sumBy('تمويل شخصي');
  const pOth = sumBy('التزامات أخرى غير الشخصي');

  const consPct = (s ? (pCons / s) * 100 : 0), nonPct = (s ? (pNon / s) * 100 : 0), subPct = (s ? (pSub / s) * 100 : 0), othPct = (s ? (pOth / s) * 100 : 0);

  const selectedRate = deductionRate ? ((deductionRate.checked && s >= 25000) ? 75 : 45) : 45;
  let flags = {};
  if (b === 'low') {
    flags = classifyInfluenceLow(consPct, nonPct, subPct, selectedRate);
  } else {
    flags = classifyInfluenceMid(consPct, nonPct, subPct, selectedRate);
  }

  const finalPct = decideFinalPercentage(b, flags, selectedRate);
  let ceiling = s * (finalPct / 100);

  let influentialTotal = 0;
  influentialTotal += pPers;
  if (b === 'low') {
    if (flags.consInf || flags.makeConsInfluentialFor55 || flags.makeConsInfluentialFor65) influentialTotal += pCons;
    if (flags.nonInf) influentialTotal += pNon;
    if (flags.subInf) influentialTotal += pSub;
  } else {
    if (flags.trigger65) {
      influentialTotal += (pNon + pSub + pCons);
    } else if (flags.consInf && !flags.reAffectsCons) {
      influentialTotal += pCons;
    }
  }

  const maxMonthlyInstallment = Math.max(0, ceiling - influentialTotal);

  // حساب الحد الأقصى لصافي التمويل من القسط الشهري الأقصى
  const maxFinancingTotal = maxMonthlyInstallment * months;
  const totalRate = rate * (months / 12);
  const maxNetFinancing = maxFinancingTotal / (1 + (rate * months) / 1200);

  // التحقق من خيار التمويل المحدد
  const option = financingOption ? financingOption.value : 'full';
  const customVal = +(customValue?.value || 0);

  let selectedNet = maxNetFinancing; // القيمة الافتراضية
  let selectedMonthly = maxMonthlyInstallment;

  if (option === 'customAmount' && customVal > 0) {
    // مبلغ تمويل محدد
    if (customVal > maxNetFinancing) {
      const errorEl = document.getElementById('customValueError');
      errorEl.textContent = `المبلغ المطلوب (${format(customVal)}) يتجاوز الحد الأقصى المتاح (${format(maxNetFinancing)})`;
      errorEl.style.display = 'block';
      customValue.classList.add('error');
      return;
    }
    selectedNet = customVal;
  } else if (option === 'customInstallment' && customVal > 0) {
    // قسط شهري محدد
    if (customVal > maxMonthlyInstallment) {
      const errorEl = document.getElementById('customValueError');
      errorEl.textContent = `القسط المطلوب (${format(customVal)}) يتجاوز الحد الأقصى المتاح (${format(maxMonthlyInstallment)})`;
      errorEl.style.display = 'block';
      customValue.classList.add('error');
      return;
    }
    selectedMonthly = customVal;
  }

  // إخفاء رسالة الخطأ إذا كانت القيمة صحيحة
  const errorEl = document.getElementById('customValueError');
  if (errorEl) errorEl.style.display = 'none';
  if (customValue) customValue.classList.remove('error');

  // بناء شرح مباشر وبسيط
  const commitments = [];
  const labels = ['الأول', 'الثاني', 'الثالث'];

  [0, 1, 2].forEach(i => {
    const type = types[i];
    const amount = amounts[i];
    if (type !== 'لا يوجد' && amount > 0) {
      let isInfluential = false;

      if (type === 'تمويل شخصي') {
        isInfluential = true;
      } else if (b === 'low') {
        if (type === 'تمويل استهلاكي') isInfluential = (flags.consInf || flags.makeConsInfluentialFor55 || flags.makeConsInfluentialFor65);
        else if (type === 'عقاري غير مدعوم') isInfluential = flags.nonInf;
        else if (type === 'عقاري مدعوم') isInfluential = flags.subInf;
      } else if (b === 'mid' || b === 'high') {
        if (flags.trigger65) {
          isInfluential = (type === 'تمويل استهلاكي' || type === 'عقاري غير مدعوم' || type === 'عقاري مدعوم');
        } else if (flags.consInf && !flags.reAffectsCons) {
          isInfluential = (type === 'تمويل استهلاكي');
        }
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

  let explanation = `تم احتساب النسبة ${finalPct.toFixed(2)}%`;

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
      // حساب بناءً على القسط المحدد
      monthly = selectedMonthly;
      financingTotal = monthly * months;
      net = financingTotal / (1 + (rate * months) / 1200);
      interestAmount = net * (totalRateCalc / 100);
    } else {
      // حساب عادي (كامل المبلغ أو مبلغ محدد)
      net = selectedNet;
      interestAmount = net * (totalRateCalc / 100);
      financingTotal = net + interestAmount;
      monthly = financingTotal / months;
    }

    const feeRaw = net * 0.005;
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
  });
});

updateOptions(); updateSum(); updateBadges(); updateImpactChips();
// تأكيد الحالة عند التحميل
if (employee.checked && retired.checked) { retired.checked = false; }




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

      try {
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
          table.style.border = '2px solid #2563eb';
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
        a.download = `${customerName}-التمويل-الشخصي.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        alert('تعذّر إنشاء الصورة، حاول بعد تعبئة البيانات وحساب النتيجة.');
      } finally {
        // إعادة العناصر كما كانت
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
      const response = await fetch('policies-personal.json');
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
