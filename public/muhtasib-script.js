// ============================================================
// Arabic-to-Latin digit conversion
// ============================================================
(function(){
  function toEn(s){ return s.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)) }
  document.addEventListener('input', function(e){
    if(e.target.tagName==='INPUT' && e.target.type!=='checkbox'){
      const v=toEn(e.target.value)
      if(v!==e.target.value){ const p=e.target.selectionStart; e.target.value=v; e.target.setSelectionRange(p,p) }
    }
  }, true)
})();

// ============================================================
// TABS
// ============================================================
document.getElementById('tab1').addEventListener('click',()=>{
  document.getElementById('tab1').classList.add('active');
  document.getElementById('tab2').classList.remove('active');
  document.getElementById('panelPersonal').style.display='';
  document.getElementById('panelFincPln').style.display='none';
});
document.getElementById('tab2').addEventListener('click',()=>{
  document.getElementById('tab2').classList.add('active');
  document.getElementById('tab1').classList.remove('active');
  document.getElementById('panelPersonal').style.display='none';
  document.getElementById('panelFincPln').style.display='';
});

// ============================================================
// UTILS
// ============================================================
function fmt(v,d=2){return (+v).toFixed(d);}
function band(s){return s>=25000?'high':s>=15000?'mid':'low';}
function bandLabel(s){return s>=25000?'عالي (25k+)':s>=15000?'متوسط (15k+)':'منخفض (<15k)';}
function showEl(el){if(el)el.style.display='';}
function hideEl(el){if(el)el.style.display='none';}
function showModal(id){document.getElementById(id).classList.add('show');}

// ============================================================
// COMMIT CARD BUILDER
// ============================================================
function buildCommitCard(prefix, idx, opts, hintText){
  const id = `${prefix}_c${idx}`;
  const tid = `${prefix}_t${idx}`;
  const wid = `${prefix}_w${idx}`;
  const iid = `${prefix}_i${idx}`;
  const pid = `${prefix}_p${idx}`;
  const div = document.createElement('div');
  div.className='commit-card'; div.id=`${prefix}_card${idx}`;
  div.innerHTML=`
    <div class="commit-head">
      <span class="commit-label">الالتزام ${['الأول','الثاني','الثالث'][idx-1]}</span>
      <span class="impact-badge" id="${iid}"></span>
    </div>
    <div class="commit-row">
      <input id="${id}" type="number" min="0" step="0.01" placeholder="المبلغ" value="0" inputmode="decimal"/>
      <select id="${tid}"></select>
    </div>
    <div class="commit-pct-hint" style="font-size:11px;color:var(--text2);margin-top:5px">
      نسبة: <span id="${pid}">0%</span>
    </div>
    <div class="warn-msg" id="${wid}"></div>
    <div class="commit-hint">${hintText}</div>`;
  const sel = div.querySelector(`#${tid}`);
  opts.forEach(o=>{const op=document.createElement('option');op.value=op.textContent=o;sel.appendChild(op);});
  return div;
}

// ============================================================
// ============================================================
// PERSONAL CALCULATOR
// ============================================================
// ============================================================
(function(){
  const PREFIX='p';
  const OPTS_ALL = ["لا يوجد","تمويل شخصي","تمويل استهلاكي","عقاري مدعوم","عقاري غير مدعوم"];
  const HINT = 'الاستهلاكي = مجموع الالتزامات غير الشخصي والعقاري (بطاقات، سيارة، شركات تمويل، بنك تنمية)';

  const salaryEl=document.getElementById('p_salary');
  const empEl=document.getElementById('p_emp');
  const retEl=document.getElementById('p_ret');
  const monthsEl=document.getElementById('p_months');
  const rateEl=document.getElementById('p_rate');
  const wrap=document.getElementById('p_commitsWrap');
  let numCommits=1;
  const MAX=3;

  function isRet(){return retEl.checked;}
  function personalCap(){return isRet()?25:33.33;}
  function getSelectedRate(){
    const s=+salaryEl.value||0;
    const cb=document.getElementById('p_use75');
    return (cb&&cb.checked&&s>=25000)?75:45;
  }
  function getConsumerThreshold(sr=45){return isRet()?20:(sr===75?41.67:11.67);}
  function getComboThreshold(){return isRet()?30:21.67;}
  function getReEstateCombinedThreshold(){return isRet()?40:31.67;}

  function buildCommits(){
    wrap.innerHTML='';
    for(let i=1;i<=MAX;i++){
      const card=buildCommitCard(PREFIX,i,OPTS_ALL,HINT);
      if(i>1)card.style.display='none';
      wrap.appendChild(card);
      // listeners
      document.getElementById(`p_c${i}`).addEventListener('input',()=>{updateSum();updateImpactChips();checkWarn(i);});
      document.getElementById(`p_t${i}`).addEventListener('change',()=>{
        const v=document.getElementById(`p_t${i}`).value;
        if(v==='لا يوجد')document.getElementById(`p_c${i}`).value=0;
        updateSum();updateImpactChips();checkWarn(i);
      });
    }
  }
  buildCommits();

  document.getElementById('p_addBtn').addEventListener('click',()=>{
    if(numCommits<MAX){
      numCommits++;
      document.getElementById(`p_card${numCommits}`).style.display='';
      if(numCommits===MAX)hideEl(document.getElementById('p_addBtn'));
      showEl(document.getElementById('p_removeBtn'));
      updateImpactChips();
    }
  });
  document.getElementById('p_removeBtn').addEventListener('click',()=>{
    if(numCommits>1){
      document.getElementById(`p_card${numCommits}`).style.display='none';
      document.getElementById(`p_t${numCommits}`).value='لا يوجد';
      document.getElementById(`p_c${numCommits}`).value=0;
      numCommits--;
      showEl(document.getElementById('p_addBtn'));
      if(numCommits===1)hideEl(document.getElementById('p_removeBtn'));
      updateSum();updateImpactChips();
    }
  });

  empEl.addEventListener('change',()=>{if(empEl.checked)retEl.checked=false;updateSum();});
  retEl.addEventListener('change',()=>{if(retEl.checked)empEl.checked=false;updateSum();});
  salaryEl.addEventListener('input',()=>{
    const s=+salaryEl.value||0;
    document.getElementById('p_bandLabel').textContent=s?bandLabel(s):'—';
    const optCard=document.getElementById('p_optionsCard');
    if(s>=25000) optCard.classList.add('show'); else optCard.classList.remove('show');
    updateSum();updateImpactChips();
  });

  document.getElementById('p_finOpt').addEventListener('change',()=>{
    const v=document.getElementById('p_finOpt').value;
    const w=document.getElementById('p_customWrap');
    if(v==='full')hideEl(w); else showEl(w);
    document.getElementById('p_customVal').placeholder=v==='customAmount'?'أدخل مبلغ التمويل':'أدخل القسط الشهري';
  });

  function updateSum(){
    const s=+salaryEl.value||0;
    let sum=0;
    for(let i=1;i<=MAX;i++){
      const v=+(document.getElementById(`p_c${i}`)?.value||0);
      sum+=v;
      const pEl=document.getElementById(`p_p${i}`);
      if(pEl)pEl.textContent=s?fmt((v/s)*100,2)+'%':'0%';
    }
    document.getElementById('p_sumAmt').textContent=fmt(sum,2);
    document.getElementById('p_sumPct').textContent=s?fmt((sum/s)*100,2)+'%':'0%';
  }

  function checkWarn(i){
    const amt=+(document.getElementById(`p_c${i}`)?.value||0);
    const typ=document.getElementById(`p_t${i}`)?.value;
    const w=document.getElementById(`p_w${i}`);
    if(!w)return false;
    if(typ==='لا يوجد'&&amt>0){w.textContent='يجب اختيار نوع الالتزام';w.style.display='block';return true;}
    if(typ!=='لا يوجد'&&amt<=0){w.textContent='يجب إدخال مبلغ';w.style.display='block';return true;}
    w.style.display='none';return false;
  }
  function checkAllWarns(){let a=false;for(let i=1;i<=MAX;i++){if(i<=numCommits&&checkWarn(i))a=true;}return a;}

  function getCommitData(){
    const types=[],amounts=[];
    for(let i=1;i<=MAX;i++){
      types.push(document.getElementById(`p_t${i}`)?.value||'لا يوجد');
      amounts.push(+(document.getElementById(`p_c${i}`)?.value||0));
    }
    return {types,amounts};
  }
  function sumBy(name,types,amounts){
    return amounts.reduce((a,v,i)=>a+(types[i]===name?v:0),0);
  }

  // ---- CLASSIFY LOGIC — PERSONAL ----
  // حدود التأثير:
  // استهلاكي → شخصي:        11.67% (موظف) / 20% (متقاعد)
  // غير مدعوم → استهلاكي:   10%
  // مدعوم → استهلاكي:        20%
  // عقاري + استهلاكي → شخصي (الشرط المزدوج):
  //   إذا أثّر العقاري على الاستهلاكي (تجاوز 10% أو 20%)
  //   و مجموع (عقاري% + استهلاكي%) > 31.67% → احتسب 65%، كلاهما مؤثر
  // نسبة عالية (75%): شرط واحد فقط — مجموع كل الالتزامات > (75% - 33.33% = 41.67%)

  function classifyLow(consPct,nonPct,subPct,sr){
    const totalPct=consPct+nonPct+subPct;
    // حالة النسبة العالية: شرط واحد يلغي كل شيء
    if(sr>45){
      const threshold=sr-personalCap(); // 75-33.33=41.67
      const highInf=totalPct>threshold;
      return{
        consInf:highInf,nonInf:highInf,subInf:highInf,
        highRateActive:highInf,highRateThreshold:threshold,
        retireeForcePersonal:false,makeConsInfluentialFor55:false,makeConsInfluentialFor65:false,
        hasRealEstate:(nonPct+subPct)>0,hasConsumer:consPct>0,
        hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0
      };
    }
    const cth=getConsumerThreshold(sr); // 11.67% موظف / 20% متقاعد
    const consInf=consPct>cth;
    // غير مدعوم (nonPct): حد التأثير على الاستهلاكي = 10%
    const nonAffectsCons=nonPct>10;
    const nonDirect=nonAffectsCons&&consInf; // عقاري غير مدعوم مؤثر مباشر مع استهلاكي مؤثر
    const nonCombo=nonAffectsCons&&!consInf&&(nonPct+consPct)>getComboThreshold(); // شرط مزدوج → 55%
    // الشرط المزدوج الجديد: غير مدعوم أثّر على استهلاكي + المجموع > 31.67% → 65%
    const nonDoubleCombo=nonAffectsCons&&(nonPct+consPct)>31.67;
    const nonTriggers55=nonDirect||nonCombo;
    // مدعوم (subPct): حد التأثير على الاستهلاكي = 20%
    const subAffectsCons=subPct>20;
    const subDirect=subPct>31.67; // تجاوز حد الشخصي مباشرة
    // الشرط المزدوج: مدعوم أثّر على استهلاكي + مجموع > 31.67% → 65%
    const subDoubleCombo=subAffectsCons&&(subPct+consPct)>31.67;
    let subTriggers65=false,retireeForce=false,makeConsFor65=false;
    if(isRet()&&(subAffectsCons||nonAffectsCons)&&!consInf){
      const comboSum=(subPct+nonPct+consPct);
      if(comboSum>40){subTriggers65=true;makeConsFor65=true;}
      else retireeForce=true;
    } else {
      subTriggers65=subDirect||subDoubleCombo;
      if(subDoubleCombo||subDirect)makeConsFor65=true;
    }
    // غير مدعوم يصل 65% بالشرط المزدوج أيضاً
    const nonTriggers65=!isRet()&&nonDoubleCombo;
    return{
      consInf,
      nonInf:nonTriggers55||nonTriggers65, // يشمل 55% و65%
      nonInf55:nonTriggers55,
      nonInf65:nonTriggers65,
      subInf:subTriggers65,
      retireeForcePersonal:retireeForce,
      makeConsInfluentialFor55:nonCombo,
      makeConsInfluentialFor65:makeConsFor65||(nonTriggers65&&consPct>0),
      hasRealEstate:(nonPct+subPct)>0,hasConsumer:consPct>0,
      hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0
    };
  }

  function classifyMid(consPct,nonPct,subPct,sr){
    const totalPct=consPct+nonPct+subPct;
    // حالة النسبة العالية
    if(sr>45){
      const threshold=sr-personalCap();
      const highInf=totalPct>threshold;
      return{
        consInf:highInf,trigger65:highInf,highRateActive:highInf,
        rePct:nonPct+subPct,totalCommitments:totalPct,
        reAffectsCons:highInf,retireeForcePersonal:false,
        hasRealEstate:(nonPct+subPct)>0,hasConsumer:consPct>0,
        hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0,
        nonInf:highInf,subInf:highInf
      };
    }
    const cth=getConsumerThreshold(sr);
    const consInf=consPct>cth;
    const rePct=nonPct+subPct;
    // حد تأثير العقاري على الاستهلاكي في mid = 20% (مدعوم) و 10% (غير مدعوم)
    // لكن في mid يُجمع العقاري معاً
    const reAffectsCons=rePct>20;
    const nonInf=nonPct>31.67;
    const subInf=subPct>31.67;
    // الشرط المزدوج: عقاري أثّر على استهلاكي + مجموعهم > 31.67% → 65%
    const doubleCombo=reAffectsCons&&(rePct+consPct)>31.67;
    let trigger65=false,retireeForce=false;
    if(isRet()&&reAffectsCons&&!consInf){
      if((rePct+consPct)>40)trigger65=true; else retireeForce=true;
    } else {
      trigger65=doubleCombo; // الشرط المزدوج الصحيح
    }
    return{
      consInf,rePct,totalCommitments:consPct+rePct,reAffectsCons,trigger65,
      retireeForcePersonal:retireeForce,hasRealEstate:rePct>0,hasConsumer:consPct>0,
      hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0,nonInf,subInf
    };
  }

  function decideFinalPct(b,flags,sr){
    if(flags.retireeForcePersonal)return personalCap();
    // نسبة عالية: شرط واحد فقط
    if(sr>45&&flags.highRateActive)return sr;
    let c=[personalCap()];
    if(b==='low'){
      if(flags.consInf)c.push(45);
      if(flags.nonInf55)c.push(55);
      if(flags.nonInf65||flags.subInf)c.push(65);
      // غير مدعوم أو مدعوم بالشرط المزدوج → 65%
    } else {
      const{hasRealEstate:hR,hasConsumer:hC,hasSupportedRealEstate:hS,hasUnsupportedRealEstate:hU}=flags;
      if(hR&&hC){
        if(flags.trigger65)c.push(65);
        else if(flags.consInf)c.push(45);
      } else if(hC&&!hR){
        if(flags.consInf)c.push(45);
      } else if(hR&&!hC){
        if((hU&&flags.subInf)||(hS&&flags.nonInf))c.push(65);
        else if(flags.trigger65)c.push(65);
      } else {
        if(flags.trigger65)c.push(65);
        else if(flags.consInf)c.push(45);
      }
    }
    return Math.max(...c);
  }

  function typeIsInfluential(b,flags,type){
    // نسبة عالية: الكل مؤثر إذا تجاوز المجموع الحد
    if(flags.highRateActive)return true;
    if(b==='low'){
      if(type==='تمويل شخصي')return true;
      if(type==='تمويل استهلاكي')return(flags.consInf||flags.makeConsInfluentialFor55||flags.makeConsInfluentialFor65);
      if(type==='عقاري غير مدعوم')return flags.nonInf;
      if(type==='عقاري مدعوم')return flags.subInf;
    } else {
      if(flags.trigger65)return(type==='تمويل استهلاكي'||type==='عقاري غير مدعوم'||type==='عقاري مدعوم'||type==='تمويل شخصي');
      if(flags.consInf&&!flags.reAffectsCons)return(type==='تمويل استهلاكي'||type==='تمويل شخصي');
      return type==='تمويل شخصي';
    }
    return false;
  }

  function updateImpactChips(){
    const s=+salaryEl.value||0;
    const b=band(s);
    const sr=getSelectedRate();
    const{types,amounts}=getCommitData();
    const pCons=sumBy('تمويل استهلاكي',types,amounts);
    const pNon=sumBy('عقاري غير مدعوم',types,amounts);
    const pSub=sumBy('عقاري مدعوم',types,amounts);
    const consPct=s?(pCons/s)*100:0;
    const nonPct=s?(pNon/s)*100:0;
    const subPct=s?(pSub/s)*100:0;
    const flags=b==='low'?classifyLow(consPct,nonPct,subPct,sr):classifyMid(consPct,nonPct,subPct,sr);
    for(let i=1;i<=MAX;i++){
      const badge=document.getElementById(`p_i${i}`);
      if(!badge)continue;
      const card=document.getElementById(`p_card${i}`);
      const visible=card&&card.style.display!=='none';
      const typ=types[i-1];const amt=amounts[i-1];
      const show=visible&&typ!=='لا يوجد'&&amt>0;
      if(!show){badge.className='impact-badge';continue;}
      const inf=typeIsInfluential(b,flags,typ);
      badge.className='impact-badge '+(inf?'inf':'ok');
      badge.textContent=inf?'مؤثر':'غير مؤثر';
    }
  }

  function buildExplanation(b,flags,finalPct,types,amounts){
    const labels=['الأول','الثاني','الثالث'];
    const comms=[];
    for(let i=0;i<MAX;i++){
      const t=types[i],a=amounts[i];
      if(t!=='لا يوجد'&&a>0)comms.push({label:labels[i],type:t,inf:typeIsInfluential(b,flags,t)});
    }
    const inf=comms.filter(c=>c.inf);
    const ninf=comms.filter(c=>!c.inf);
    let ex=`تم احتساب النسبة ${fmt(finalPct,2)}%`;
    if(inf.length===0&&ninf.length>0)ex+=' لأن الالتزامات غير مؤثرة';
    else if(inf.length>0&&ninf.length>0){
      ex+=` لأن الالتزام ${inf.map(c=>c.label).join(' و')} ${inf.length===1?'مؤثر':'مؤثرة'}`;
      ex+=` والالتزام ${ninf.map(c=>c.label).join(' و')} ${ninf.length===1?'غير مؤثر':'غير مؤثرة'}`;
    } else if(inf.length>0){
      ex+=` لأن الالتزام ${inf.map(c=>c.label).join(' و')} ${inf.length===1?'مؤثر':'مؤثرة'}`;
    }
    return ex+'.';
  }

  function doCalculate(){
    // hide errors
    document.querySelectorAll('#panelPersonal .err-msg').forEach(e=>e.style.display='none');
    document.querySelectorAll('#panelPersonal input.err').forEach(e=>e.classList.remove('err'));
    if(checkAllWarns())return;

    const nameVal=document.getElementById('p_name').value.trim();
    if(!nameVal){
      const e=document.getElementById('p_nameErr');e.textContent='يرجى إدخال اسم العميل';e.style.display='block';
      document.getElementById('p_name').classList.add('err');return;
    }
    const s=+salaryEl.value;
    if(!s||s<=0){const e=document.getElementById('p_salaryErr');e.textContent='يرجى إدخال الراتب';e.style.display='block';salaryEl.classList.add('err');return;}
    const months=parseInt(monthsEl.value);
    if(!months||months<6||months>60){const e=document.getElementById('p_monthsErr');e.textContent='المدة من 6 إلى 60 شهراً';e.style.display='block';monthsEl.classList.add('err');return;}
    const rate=parseFloat(rateEl.value);
    if(isNaN(rate)||rate<0){const e=document.getElementById('p_rateErr');e.textContent='يرجى إدخال نسبة الفائدة';e.style.display='block';rateEl.classList.add('err');return;}

    const payoff=+document.getElementById('p_payoff').value||0;
    const b=band(s);
    const sr=getSelectedRate();
    const{types,amounts}=getCommitData();
    const pCons=sumBy('تمويل استهلاكي',types,amounts);
    const pNon=sumBy('عقاري غير مدعوم',types,amounts);
    const pSub=sumBy('عقاري مدعوم',types,amounts);
    const pPers=sumBy('تمويل شخصي',types,amounts);
    const consPct=s?(pCons/s)*100:0;
    const nonPct=s?(pNon/s)*100:0;
    const subPct=s?(pSub/s)*100:0;
    const flags=b==='low'?classifyLow(consPct,nonPct,subPct,sr):classifyMid(consPct,nonPct,subPct,sr);
    const finalPct=decideFinalPct(b,flags,sr);
    let ceiling=s*(finalPct/100);

    let infTotal=pPers;
    if(b==='low'){
      if(flags.consInf||flags.makeConsInfluentialFor55||flags.makeConsInfluentialFor65)infTotal+=pCons;
      if(flags.nonInf)infTotal+=pNon;
      if(flags.subInf)infTotal+=pSub;
    } else {
      if(flags.trigger65)infTotal+=(pNon+pSub+pCons);
      else if(flags.consInf&&!flags.reAffectsCons)infTotal+=pCons;
    }

    let maxMonthly=Math.max(0,ceiling-infTotal);
    const maxFinTotal=maxMonthly*months;
    const maxNet=maxFinTotal/(1+(rate*months)/1200);

    // custom option
    const opt=document.getElementById('p_finOpt').value;
    const customVal=+(document.getElementById('p_customVal').value||0);
    let selectedNet=maxNet, selectedMonthly=maxMonthly;
    if(opt==='customAmount'&&customVal>0){
      if(customVal>maxNet){
        const e=document.getElementById('p_customErr');
        e.textContent=`المبلغ (${fmt(customVal)}) يتجاوز الحد (${fmt(maxNet)})`;e.style.display='block';return;
      }
      selectedNet=customVal;
    } else if(opt==='customInstallment'&&customVal>0){
      if(customVal>maxMonthly){
        const e=document.getElementById('p_customErr');
        e.textContent=`القسط (${fmt(customVal)}) يتجاوز الحد (${fmt(maxMonthly)})`;e.style.display='block';return;
      }
      selectedMonthly=customVal;
    }

    let net,interestAmt,finTotal,monthly;
    const totalRateCalc=rate*(months/12);
    if(opt==='customInstallment'&&customVal>0){
      monthly=selectedMonthly;finTotal=monthly*months;
      net=finTotal/(1+(rate*months)/1200);
      interestAmt=net*(totalRateCalc/100);
    } else {
      net=selectedNet;interestAmt=net*(totalRateCalc/100);
      finTotal=net+interestAmt;monthly=finTotal/months;
    }
    const feeRaw=net*0.005;
    const adminFee=Math.min(feeRaw,2500);
    const vat=adminFee*0.15;
    const totalFees=adminFee+vat;

    // explanation
    const expl=buildExplanation(b,flags,finalPct,types,amounts);
    const eb=document.getElementById('p_explain');
    eb.textContent=expl;eb.classList.add('show');

    // render table
    const rows=[
      ['الاسم',nameVal],
      ['صافي مبلغ التمويل',fmt(net)+' ريال','highlight'],
      ['مبلغ الفائدة',fmt(interestAmt)+' ريال'],
      ['التمويل شامل الفائدة',fmt(finTotal)+' ريال'],
      ['الرسوم الإدارية (شامل الضريبة)',fmt(totalFees)+' ريال'],
      ['القسط الشهري',fmt(monthly)+' ريال','accent'],
      ['المدة بالأشهر',months+' شهر'],
      ['الصافي بعد السداد',fmt(net-totalFees-payoff)+' ريال'],
    ];
    const tbl=document.getElementById('p_table');
    tbl.innerHTML=rows.map(r=>`
      <div class="rt-row">
        <div class="rt-key">${r[0]}</div>
        <div class="rt-val ${r[2]||''}">${r[1]}</div>
      </div>`).join('');
    document.getElementById('p_results').classList.add('show');

    if(net<5000)showModal('eligModal');

    updateImpactChips();
  }

  document.getElementById('p_calcBtn').addEventListener('click',doCalculate);
  document.getElementById('p_recalcBtn').addEventListener('click',doCalculate);

  document.getElementById('p_clearBtn').addEventListener('click',()=>{
    document.getElementById('p_name').value='';
    document.getElementById('p_mobile').value='';
    document.getElementById('p_payoff').value='';
    salaryEl.value='';monthsEl.value='';rateEl.value='';
    for(let i=1;i<=MAX;i++){
      document.getElementById(`p_c${i}`).value=0;
      document.getElementById(`p_t${i}`).value='لا يوجد';
      document.getElementById(`p_w${i}`).style.display='none';
      document.getElementById(`p_i${i}`).className='impact-badge';
    }
    numCommits=1;
    for(let i=2;i<=MAX;i++)document.getElementById(`p_card${i}`).style.display='none';
    showEl(document.getElementById('p_addBtn'));hideEl(document.getElementById('p_removeBtn'));
    document.getElementById('p_explain').classList.remove('show');
    document.getElementById('p_results').classList.remove('show');
    document.getElementById('p_optionsCard').classList.remove('show');
    document.getElementById('p_bandLabel').textContent='—';
    updateSum();
  });

  // share btn
  document.getElementById('p_shareBtn').addEventListener('click',async()=>{
    const el=document.getElementById('p_results');
    if(!el)return;
    try{
      const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      document.head.appendChild(s);
      await new Promise(r=>{s.onload=r;s.onerror=r;});
      const canvas=await html2canvas(el,{scale:2,backgroundColor:'#0f1117',useCORS:true});
      const a=document.createElement('a');
      a.href=canvas.toDataURL('image/png');
      a.download=`${document.getElementById('p_name').value||'عميل'}-التمويل.png`;
      a.click();
    }catch(e){alert('تعذّر إنشاء الصورة');}
  });

  updateSum();
})();

// ============================================================
// ============================================================
// FINC PLAN CALCULATOR
// ============================================================
// ============================================================
(function(){
  const PREFIX='f';
  const OPTS = ["لا يوجد","تمويل استهلاكي","عقاري مدعوم","عقاري غير مدعوم"];
  const HINT = 'الاستهلاكي = مجموع كل الالتزامات غير العقاري (التمويل الشخصي من البنوك+شركات التمويل+بطاقات+سيارة+بنك تنمية)';

  const salaryEl=document.getElementById('f_salary');
  const empEl=document.getElementById('f_emp');
  const retEl=document.getElementById('f_ret');
  const monthsEl=document.getElementById('f_months');
  const rateEl=document.getElementById('f_rate');
  const wrap=document.getElementById('f_commitsWrap');
  let numCommits=1;
  const MAX=3;

  function isRet(){return retEl.checked;}
  function baseCap(){return isRet()?25:45;}
  function getSelectedRate(){
    const cbs=document.querySelectorAll('.f_deductCb:checked');
    return cbs.length>0?parseInt(cbs[0].value,10):45;
  }
  function getConsumerThreshold(sr=45){return isRet()?20:Math.max(0,sr-45);}
  function getComboThreshold(){return isRet()?30:10;}
  function getReEstateCombinedThreshold(){return isRet()?40:31.67;}

  function buildCommits(){
    wrap.innerHTML='';
    for(let i=1;i<=MAX;i++){
      const card=buildCommitCard(PREFIX,i,OPTS,HINT);
      if(i>1)card.style.display='none';
      wrap.appendChild(card);
      document.getElementById(`f_c${i}`).addEventListener('input',()=>{
        normalizeDecimal(document.getElementById(`f_c${i}`));
        updateSum();updateImpactChips();checkWarn(i);
      });
      document.getElementById(`f_t${i}`).addEventListener('change',()=>{
        if(document.getElementById(`f_t${i}`).value==='لا يوجد')document.getElementById(`f_c${i}`).value=0;
        updateSum();updateImpactChips();checkWarn(i);
      });
    }
  }
  buildCommits();

  function normalizeDecimal(el){
    if(!el)return;
    const v=el.value||'';
    const n=v.replace(/,/g,'.');
    if(n!==v)el.value=n;
  }
  salaryEl.addEventListener('input',()=>{normalizeDecimal(salaryEl);onSalaryChange();});
  rateEl.addEventListener('input',()=>{normalizeDecimal(rateEl);});

  function onSalaryChange(){
    const s=+salaryEl.value||0;
    document.getElementById('f_bandLabel').textContent=s?bandLabel(s):'—';
    updateDeductAvail(s);
    updateSum();updateImpactChips();
  }

  function updateDeductAvail(s){
    document.querySelectorAll('.f_deductCb').forEach(cb=>{
      const v=parseInt(cb.value);
      cb.disabled=(v===70&&s<1000)||(v>=75&&s<25000);
      if(cb.disabled)cb.checked=false;
    });
    // show options card if salary entered
    const oc=document.getElementById('f_optionsCard');
    if(s>0)oc.classList.add('show'); else oc.classList.remove('show');
  }

  // mutual exclusive checkboxes
  document.querySelectorAll('.f_deductCb').forEach(cb=>{
    cb.addEventListener('change',()=>{
      if(cb.checked)document.querySelectorAll('.f_deductCb').forEach(c=>{if(c!==cb)c.checked=false;});
      updateImpactChips();
    });
  });

  empEl.addEventListener('change',()=>{if(empEl.checked)retEl.checked=false;updateSum();});
  retEl.addEventListener('change',()=>{if(retEl.checked)empEl.checked=false;updateSum();});

  document.getElementById('f_addBtn').addEventListener('click',()=>{
    if(numCommits<MAX){
      numCommits++;
      document.getElementById(`f_card${numCommits}`).style.display='';
      if(numCommits===MAX)hideEl(document.getElementById('f_addBtn'));
      showEl(document.getElementById('f_removeBtn'));
      updateImpactChips();
    }
  });
  document.getElementById('f_removeBtn').addEventListener('click',()=>{
    if(numCommits>1){
      document.getElementById(`f_card${numCommits}`).style.display='none';
      document.getElementById(`f_t${numCommits}`).value='لا يوجد';
      document.getElementById(`f_c${numCommits}`).value=0;
      numCommits--;
      showEl(document.getElementById('f_addBtn'));
      if(numCommits===1)hideEl(document.getElementById('f_removeBtn'));
      updateSum();updateImpactChips();
    }
  });

  document.getElementById('f_finOpt').addEventListener('change',()=>{
    const v=document.getElementById('f_finOpt').value;
    const w=document.getElementById('f_customWrap');
    if(v==='full')hideEl(w); else showEl(w);
    document.getElementById('f_customVal').placeholder=v==='customAmount'?'أدخل مبلغ التمويل':'أدخل القسط الشهري';
  });

  function updateSum(){
    const s=+salaryEl.value||0;
    let sum=0;
    for(let i=1;i<=MAX;i++){
      const v=+(document.getElementById(`f_c${i}`)?.value||0);
      sum+=v;
      const p=document.getElementById(`f_p${i}`);
      if(p)p.textContent=s?fmt((v/s)*100,2)+'%':'0%';
    }
    document.getElementById('f_sumAmt').textContent=fmt(sum,2);
    document.getElementById('f_sumPct').textContent=s?fmt((sum/s)*100,2)+'%':'0%';
  }

  function checkWarn(i){
    const amt=+(document.getElementById(`f_c${i}`)?.value||0);
    const typ=document.getElementById(`f_t${i}`)?.value;
    const w=document.getElementById(`f_w${i}`);
    if(!w)return false;
    if(typ==='لا يوجد'&&amt>0){w.textContent='يجب اختيار نوع الالتزام';w.style.display='block';return true;}
    if(typ!=='لا يوجد'&&amt<=0){w.textContent='يجب إدخال مبلغ';w.style.display='block';return true;}
    w.style.display='none';return false;
  }
  function checkAllWarns(){let a=false;for(let i=1;i<=MAX;i++){if(i<=numCommits&&checkWarn(i))a=true;}return a;}

  function getCommitData(){
    const types=[],amounts=[];
    for(let i=1;i<=MAX;i++){
      types.push(document.getElementById(`f_t${i}`)?.value||'لا يوجد');
      amounts.push(+(document.getElementById(`f_c${i}`)?.value||0));
    }
    return{types,amounts};
  }
  function sumBy(name,types,amounts){return amounts.reduce((a,v,i)=>a+(types[i]===name?v:0),0);}

  // ---- CLASSIFY LOGIC — شركات التمويل ----
  // الشرط المزدوج: عقاري أثّر على استهلاكي + مجموع > 31.67% → 65%
  // نسبة عالية (70/75/80%): مجموع كل الالتزامات > (نسبة - 33.33%)

  function classifyLow(consPct,nonPct,subPct,sr){
    const totalPct=consPct+nonPct+subPct;
    if(sr>45){
      const threshold=sr-33.33;
      const highInf=totalPct>threshold;
      return{consInf:highInf,nonInf:highInf,nonInf55:false,nonInf65:highInf,subInf:highInf,
        highRateActive:highInf,retireeForcePersonal:false,
        makeConsInfluentialFor55:false,makeConsInfluentialFor65:highInf,
        hasRealEstate:(nonPct+subPct)>0,hasConsumer:consPct>0,
        hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0};
    }
    const cth=getConsumerThreshold(sr);
    const consInf=consPct>cth;
    const nonAffectsCons=nonPct>10;
    const nonDirect=nonAffectsCons&&consInf;
    const nonCombo=nonAffectsCons&&!consInf&&(nonPct+consPct)>getComboThreshold();
    const nonDoubleCombo=nonAffectsCons&&(nonPct+consPct)>31.67;
    const nonTriggers55=nonDirect||nonCombo;
    const subAffectsCons=subPct>20;
    const subDirect=subPct>20;
    const subDoubleCombo=subAffectsCons&&(subPct+consPct)>31.67;
    let subTriggers65=false,retireeForce=false,makeConsFor65=false;
    if(isRet()&&(subAffectsCons||nonAffectsCons)&&!consInf){
      if((subPct+nonPct+consPct)>40){subTriggers65=true;makeConsFor65=true;}
      else retireeForce=true;
    } else {
      subTriggers65=subDirect||subDoubleCombo;
      if(subDoubleCombo||subDirect)makeConsFor65=true;
    }
    const nonTriggers65=!isRet()&&nonDoubleCombo;
    return{consInf,nonInf:nonTriggers55||nonTriggers65,nonInf55:nonTriggers55,nonInf65:nonTriggers65,
      subInf:subTriggers65,retireeForcePersonal:retireeForce,
      makeConsInfluentialFor55:nonCombo,makeConsInfluentialFor65:makeConsFor65||(nonTriggers65&&consPct>0),
      hasRealEstate:(nonPct+subPct)>0,hasConsumer:consPct>0,
      hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0};
  }

  function classifyMid(consPct,nonPct,subPct,sr){
    const totalPct=consPct+nonPct+subPct;
    if(sr>45){
      const threshold=sr-33.33;
      const highInf=totalPct>threshold;
      return{consInf:highInf,trigger65:highInf,highRateActive:highInf,
        rePct:nonPct+subPct,totalCommitments:totalPct,reAffectsCons:highInf,
        retireeForcePersonal:false,hasRealEstate:(nonPct+subPct)>0,hasConsumer:consPct>0,
        hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0,
        nonInf:highInf,subInf:highInf};
    }
    const cth=getConsumerThreshold(sr);
    const consInf=consPct>cth;
    const rePct=nonPct+subPct;
    const reAffectsCons=rePct>20;
    const nonInf=nonPct>20;
    const subInf=subPct>20;
    const doubleCombo=reAffectsCons&&(rePct+consPct)>31.67;
    let trigger65=false,retireeForce=false;
    if(isRet()&&reAffectsCons&&!consInf){
      if((rePct+consPct)>40)trigger65=true; else retireeForce=true;
    } else {
      trigger65=doubleCombo;
    }
    return{consInf,rePct,totalCommitments:consPct+rePct,reAffectsCons,trigger65,
      retireeForcePersonal:retireeForce,hasRealEstate:rePct>0,hasConsumer:consPct>0,
      hasSupportedRealEstate:nonPct>0,hasUnsupportedRealEstate:subPct>0,nonInf,subInf};
  }

  function decideFinalPct(b,flags,sr){
    if(flags.retireeForcePersonal)return baseCap();
    if(sr>45&&flags.highRateActive)return sr;
    let c=[baseCap()];
    if(b==='low'){
      if(flags.consInf)c.push(45);
      if(flags.nonInf55)c.push(55);
      if(flags.nonInf65||flags.subInf)c.push(65);
    } else {
      const{hasRealEstate:hR,hasConsumer:hC,hasSupportedRealEstate:hS,hasUnsupportedRealEstate:hU}=flags;
      if(hR&&!hC)c.push(65);
      if(hR&&hC){
        if(flags.trigger65)c.push(65); else if(flags.consInf)c.push(45);
      } else if(hC&&!hR){
        if(flags.consInf)c.push(45);
      } else if(hR&&!hC){
        if((hU&&flags.subInf)||(hS&&flags.nonInf)||flags.trigger65)c.push(65);
      } else {
        if(flags.trigger65)c.push(65); else if(flags.consInf)c.push(45);
      }
    }
    return Math.max(...c);
  }

  function typeIsInfluential(b,flags,type){
    if(flags.highRateActive)return true;
    if(b==='low'){
      if(type==='تمويل استهلاكي')return(flags.consInf||flags.makeConsInfluentialFor65||flags.makeConsInfluentialFor55);
      if(type==='عقاري مدعوم')return flags.subInf||false;
      if(type==='عقاري غير مدعوم')return flags.nonInf||false;
    } else if(b==='mid'){
      if(flags.trigger65)return(type==='تمويل استهلاكي'||type==='عقاري مدعوم'||type==='عقاري غير مدعوم');
      if(flags.consInf&&!flags.reAffectsCons)return(type==='تمويل استهلاكي');
      return false;
    } else {return(flags&&flags.othersInf)||false;}
    return false;
  }

  function updateImpactChips(){
    const s=+salaryEl.value||0;
    const b=band(s);
    const sr=getSelectedRate();
    const{types,amounts}=getCommitData();
    const pCons=sumBy('تمويل استهلاكي',types,amounts);
    const pS=sumBy('عقاري مدعوم',types,amounts);
    const pU=sumBy('عقاري غير مدعوم',types,amounts);
    const consPct=s?(pCons/s)*100:0;
    const sPct=s?(pS/s)*100:0;
    const uPct=s?(pU/s)*100:0;
    const flags=b==='low'?classifyLow(consPct,uPct,sPct,sr):classifyMid(consPct,sPct,uPct,sr);
    for(let i=1;i<=MAX;i++){
      const badge=document.getElementById(`f_i${i}`);
      if(!badge)continue;
      const card=document.getElementById(`f_card${i}`);
      const visible=card&&card.style.display!=='none';
      const typ=types[i-1];const amt=amounts[i-1];
      const show=visible&&typ!=='لا يوجد'&&amt>0;
      if(!show){badge.className='impact-badge';continue;}
      const inf=typeIsInfluential(b,flags,typ);
      badge.className='impact-badge '+(inf?'inf':'ok');
      badge.textContent=inf?'مؤثر':'غير مؤثر';
    }
  }

  function buildExplanation(b,flags,finalPct,types,amounts){
    const labels=['الأول','الثاني','الثالث'];
    const comms=[];
    for(let i=0;i<MAX;i++){
      const t=types[i],a=amounts[i];
      if(t!=='لا يوجد'&&a>0)comms.push({label:labels[i],type:t,inf:typeIsInfluential(b,flags,t)});
    }
    const inf=comms.filter(c=>c.inf);
    const ninf=comms.filter(c=>!c.inf);
    let ex=`تم احتساب النسبة ${fmt(finalPct,2)}%`;
    if(inf.length===0&&ninf.length>0)ex+=' لأن الالتزامات غير مؤثرة';
    else if(inf.length>0&&ninf.length>0){
      ex+=` لأن الالتزام ${inf.map(c=>c.label).join(' و')} ${inf.length===1?'مؤثر':'مؤثرة'}`;
      ex+=` والالتزام ${ninf.map(c=>c.label).join(' و')} ${ninf.length===1?'غير مؤثر':'غير مؤثرة'}`;
    } else if(inf.length>0){
      ex+=` لأن الالتزام ${inf.map(c=>c.label).join(' و')} ${inf.length===1?'مؤثر':'مؤثرة'}`;
    }
    return ex+'.';
  }

  function doCalculate(){
    document.querySelectorAll('#panelFincPln .err-msg').forEach(e=>e.style.display='none');
    document.querySelectorAll('#panelFincPln input.err').forEach(e=>e.classList.remove('err'));
    if(checkAllWarns())return;

    const nameVal=document.getElementById('f_name').value.trim();
    if(!nameVal){
      const e=document.getElementById('f_nameErr');e.textContent='يرجى إدخال اسم العميل';e.style.display='block';
      document.getElementById('f_name').classList.add('err');return;
    }
    const s=+salaryEl.value;
    if(!s||s<=0){const e=document.getElementById('f_salaryErr');e.textContent='يرجى إدخال الراتب';e.style.display='block';salaryEl.classList.add('err');return;}
    const months=parseInt(monthsEl.value);
    if(!months||months<6||months>60){const e=document.getElementById('f_monthsErr');e.textContent='المدة من 6 إلى 60 شهراً';e.style.display='block';monthsEl.classList.add('err');return;}
    const rate=parseFloat(rateEl.value);
    if(isNaN(rate)||rate<0){const e=document.getElementById('f_rateErr');e.textContent='يرجى إدخال نسبة الفائدة';e.style.display='block';rateEl.classList.add('err');return;}

    const payoff=+document.getElementById('f_payoff').value||0;
    const b=band(s);
    const sr=getSelectedRate();
    const{types,amounts}=getCommitData();

    // check easy financing (no commitments)
    const isEasy=types.every(t=>t==='لا يوجد')&&amounts.every(a=>a===0);

    const pCons=sumBy('تمويل استهلاكي',types,amounts);
    const pS=sumBy('عقاري مدعوم',types,amounts);
    const pU=sumBy('عقاري غير مدعوم',types,amounts);
    const consPct=s?(pCons/s)*100:0;
    const sPct=s?(pS/s)*100:0;
    const uPct=s?(pU/s)*100:0;
    const flags=b==='low'?classifyLow(consPct,uPct,sPct,sr):classifyMid(consPct,sPct,uPct,sr);
    const finalPct=decideFinalPct(b,flags,sr);
    let ceiling=s*(finalPct/100);

    // influential total
    let infTotal=0;
    if(b==='low'){
      if(flags.consInf||flags.makeConsInfluentialFor55||flags.makeConsInfluentialFor65)infTotal+=pCons;
      if(flags.nonInf)infTotal+=pU;
      if(flags.subInf)infTotal+=pS;
    } else {
      if(flags.trigger65)infTotal+=(pS+pU+pCons);
      else if(flags.consInf&&!flags.reAffectsCons)infTotal+=pCons;
    }

    let maxMonthly=Math.max(0,ceiling-infTotal);
    if(isEasy)maxMonthly=Math.min(maxMonthly,s*0.45);
    const maxNet=( maxMonthly*months)/(1+(rate*months)/1200);

    const opt=document.getElementById('f_finOpt').value;
    const customVal=+(document.getElementById('f_customVal').value||0);
    let selectedNet=maxNet,selectedMonthly=maxMonthly;
    if(opt==='customAmount'&&customVal>0){
      if(customVal>maxNet){
        const e=document.getElementById('f_customErr');
        e.textContent=`المبلغ (${fmt(customVal)}) يتجاوز الحد (${fmt(maxNet)})`;e.style.display='block';return;
      }
      selectedNet=customVal;
    } else if(opt==='customInstallment'&&customVal>0){
      if(customVal>maxMonthly){
        const e=document.getElementById('f_customErr');
        e.textContent=`القسط (${fmt(customVal)}) يتجاوز الحد (${fmt(maxMonthly)})`;e.style.display='block';return;
      }
      selectedMonthly=customVal;
    }

    let net,interestAmt,finTotal,monthly;
    const totalRateCalc=rate*(months/12);
    if(opt==='customInstallment'&&customVal>0){
      monthly=selectedMonthly;finTotal=monthly*months;
      net=finTotal/(1+(rate*months)/1200);
      interestAmt=net*(totalRateCalc/100);
    } else {
      net=selectedNet;interestAmt=net*(totalRateCalc/100);
      finTotal=net+interestAmt;monthly=finTotal/months;
    }
    const adminFee=Math.min(net*0.005,2500);
    const totalFees=adminFee*1.15;

    const expl=buildExplanation(b,flags,finalPct,types,amounts);
    const eb=document.getElementById('f_explain');
    eb.textContent=expl;eb.classList.add('show');

    const rows=[
      ['الاسم',nameVal],
      ['صافي مبلغ التمويل',fmt(net)+' ريال','highlight'],
      ['مبلغ الفائدة',fmt(interestAmt)+' ريال'],
      ['التمويل شامل الفائدة',fmt(finTotal)+' ريال'],
      ['الرسوم الإدارية (شامل الضريبة)',fmt(totalFees)+' ريال'],
      ['القسط الشهري',fmt(monthly)+' ريال','accent'],
      ['المدة بالأشهر',months+' شهر'],
      ['الصافي بعد السداد',fmt(net-totalFees-payoff)+' ريال'],
    ];
    const tbl=document.getElementById('f_table');
    tbl.innerHTML=rows.map(r=>`
      <div class="rt-row">
        <div class="rt-key">${r[0]}</div>
        <div class="rt-val ${r[2]||''}">${r[1]}</div>
      </div>`).join('');
    document.getElementById('f_results').classList.add('show');

    if(isEasy)showModal('easyModal');
    if(net<5000)showModal('eligModal');
    updateImpactChips();
  }

  document.getElementById('f_calcBtn').addEventListener('click',doCalculate);
  document.getElementById('f_recalcBtn').addEventListener('click',doCalculate);

  document.getElementById('f_clearBtn').addEventListener('click',()=>{
    document.getElementById('f_name').value='';
    document.getElementById('f_mobile').value='';
    document.getElementById('f_payoff').value='';
    salaryEl.value='';monthsEl.value='';rateEl.value='';
    for(let i=1;i<=MAX;i++){
      document.getElementById(`f_c${i}`).value=0;
      document.getElementById(`f_t${i}`).value='لا يوجد';
      document.getElementById(`f_w${i}`).style.display='none';
      document.getElementById(`f_i${i}`).className='impact-badge';
    }
    numCommits=1;
    for(let i=2;i<=MAX;i++)document.getElementById(`f_card${i}`).style.display='none';
    showEl(document.getElementById('f_addBtn'));hideEl(document.getElementById('f_removeBtn'));
    document.getElementById('f_explain').classList.remove('show');
    document.getElementById('f_results').classList.remove('show');
    document.getElementById('f_optionsCard').classList.remove('show');
    document.getElementById('f_bandLabel').textContent='—';
    document.querySelectorAll('.f_deductCb').forEach(c=>c.checked=false);
    updateSum();
  });

  document.getElementById('f_shareBtn').addEventListener('click',async()=>{
    const el=document.getElementById('f_results');
    if(!el)return;
    try{
      const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      document.head.appendChild(s);
      await new Promise(r=>{s.onload=r;s.onerror=r;});
      const canvas=await html2canvas(el,{scale:2,backgroundColor:'#0f1117',useCORS:true});
      const a=document.createElement('a');
      a.href=canvas.toDataURL('image/png');
      a.download=`${document.getElementById('f_name').value||'عميل'}-إمكان.png`;
      a.click();
    }catch(e){alert('تعذّر إنشاء الصورة');}
  });

  updateSum();
})();
