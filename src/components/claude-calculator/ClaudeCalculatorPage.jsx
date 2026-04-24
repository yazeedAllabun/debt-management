import { useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { muhtasibCSS } from './muhtasibStyles.js'

export function ClaudeCalculatorPage() {
  const { theme } = useTheme()

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'muhtasib-css'
    style.textContent = muhtasibCSS
    document.head.appendChild(style)

    const script = document.createElement('script')
    script.id = 'muhtasib-js'
    script.src = '/muhtasib-script.js'
    document.body.appendChild(script)

    return () => {
      document.getElementById('muhtasib-css')?.remove()
      document.getElementById('muhtasib-js')?.remove()
    }
  }, [])

  return (
    <div className="muhtasib-root" data-theme={theme}>

      <nav className="tabs-bar">
        <button className="tab-btn active" id="tab1">التمويل الشخصي</button>
        <button className="tab-btn" id="tab2">شركات التمويل</button>
      </nav>

      <main className="main">

        {/* ===== PERSONAL PANEL ===== */}
        <div className="calc-panel" id="panelPersonal">

          <div className="top-grid">
            <div className="card">
              <div className="card-title">معلومات العميل</div>
              <div className="field">
                <label>اسم العميل</label>
                <input id="p_name" type="text" placeholder="أدخل الاسم" />
                <div className="err-msg" id="p_nameErr"></div>
              </div>
              <div className="field">
                <label>رقم الجوال</label>
                <input id="p_mobile" type="tel" placeholder="05xxxxxxxx" inputMode="numeric" />
              </div>
              <div className="field">
                <label>المبلغ المراد سداده</label>
                <input id="p_payoff" type="number" min="0" step="0.01" placeholder="اختياري" />
              </div>
            </div>

            <div className="card">
              <div className="card-title">معطيات التمويل</div>
              <div className="field">
                <label>الراتب <span style={{fontSize:'11px',color:'var(--text3)'}}>(مع البدلات الثابتة)</span></label>
                <input id="p_salary" type="number" placeholder="مثال: 14000" inputMode="decimal" />
                <div className="err-msg" id="p_salaryErr"></div>
                <div className="salary-hint">الفئة: <span id="p_bandLabel" className="pct-chip">—</span></div>
              </div>
              <div className="check-row">
                <label className="check-label"><input id="p_emp" type="checkbox" /> موظف</label>
                <label className="check-label"><input id="p_ret" type="checkbox" /> متقاعد</label>
              </div>
              <div className="field" style={{marginTop:'14px'}}>
                <label>المدة بالأشهر</label>
                <input id="p_months" type="number" min="6" max="60" placeholder="مثال: 48" inputMode="numeric" />
                <div className="err-msg" id="p_monthsErr"></div>
              </div>
              <div className="field">
                <label>نسبة الفائدة السنوية (%)</label>
                <input id="p_rate" type="number" min="0" step="0.01" placeholder="مثال: 9" />
                <div className="err-msg" id="p_rateErr"></div>
              </div>
            </div>
          </div>

          <div className="card section">
            <div className="card-title">الالتزامات</div>
            <div className="commits-wrap" id="p_commitsWrap"></div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'14px',flexWrap:'wrap',gap:'10px'}}>
              <div className="summary-card" style={{flex:'1',minWidth:'220px'}}>
                <div className="sum-row"><span className="sum-key">المجموع</span><span className="sum-val" id="p_sumAmt">0.00</span></div>
                <div className="sum-row" style={{border:'none'}}><span className="sum-key">نسبة الاستقطاع</span><span className="sum-val" id="p_sumPct">0%</span></div>
              </div>
              <div className="commit-actions">
                <button className="btn-ghost sm" id="p_addBtn">+ إضافة التزام</button>
                <button className="btn-ghost sm" id="p_removeBtn" style={{display:'none'}}>− حذف</button>
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn-primary" id="p_calcBtn">احسب التمويل</button>
            <button className="btn-ghost" id="p_clearBtn">مسح</button>
          </div>

          <div className="explain-box" id="p_explain"></div>

          <div className="options-card" id="p_optionsCard">
            <div className="card-title">خيارات متقدمة</div>
            <div className="field">
              <label>
                <input type="checkbox" id="p_use75" style={{accentColor:'var(--accent)',marginLeft:'6px',width:'16px',height:'16px'}} />
                {' '}احتساب على 75%
              </label>
            </div>
            <hr className="divider" style={{margin:'12px 0'}} />
            <div className="field">
              <label>نوع الحساب</label>
              <select id="p_finOpt">
                <option value="full">كامل المبلغ</option>
                <option value="customAmount">مبلغ تمويل محدد</option>
                <option value="customInstallment">قسط شهري محدد</option>
              </select>
            </div>
            <div id="p_customWrap" style={{display:'none',marginTop:'10px'}}>
              <input id="p_customVal" type="number" min="0" step="0.01" placeholder="أدخل القيمة" />
              <div className="err-msg" id="p_customErr" style={{display:'none'}}></div>
            </div>
            <div className="btn-row" style={{marginTop:'12px'}}>
              <button className="btn-primary" id="p_recalcBtn" style={{fontSize:'13px',padding:'10px 20px'}}>إعادة الحساب</button>
            </div>
          </div>

          <div className="result-section" id="p_results">
            <div className="result-header">
              <div>
                <div className="result-title">نتيجة التمويل الشخصي</div>
                <div className="result-subtitle">حسبة مبدئية — يرجى التحقق مع الجهة التمويلية</div>
              </div>
              <div className="result-actions">
                <button className="btn-ghost sm" id="p_shareBtn">📸 مشاركة</button>
                <button className="btn-ghost sm" id="p_saveBtn">💾 حفظ</button>
              </div>
            </div>
            <div className="result-table" id="p_table"></div>
          </div>

        </div>

        {/* ===== FINC PLAN PANEL ===== */}
        <div className="calc-panel" id="panelFincPln" style={{display:'none'}}>

          <div className="top-grid">
            <div className="card">
              <div className="card-title">معلومات العميل</div>
              <div className="field">
                <label>اسم العميل</label>
                <input id="f_name" type="text" placeholder="أدخل الاسم" />
                <div className="err-msg" id="f_nameErr"></div>
              </div>
              <div className="field">
                <label>رقم الجوال</label>
                <input id="f_mobile" type="tel" placeholder="05xxxxxxxx" inputMode="numeric" />
              </div>
              <div className="field">
                <label>المبلغ المراد سداده</label>
                <input id="f_payoff" type="number" min="0" step="0.01" placeholder="اختياري" />
              </div>
            </div>

            <div className="card">
              <div className="card-title">معطيات التمويل</div>
              <div className="field">
                <label>الراتب</label>
                <input id="f_salary" type="number" placeholder="مثال: 14000" inputMode="decimal" />
                <div className="err-msg" id="f_salaryErr"></div>
                <div className="salary-hint">الفئة: <span id="f_bandLabel" className="pct-chip">—</span></div>
              </div>
              <div className="check-row">
                <label className="check-label"><input id="f_emp" type="checkbox" /> موظف</label>
                <label className="check-label"><input id="f_ret" type="checkbox" /> متقاعد</label>
              </div>
              <div className="field" style={{marginTop:'14px'}}>
                <label>المدة بالأشهر</label>
                <input id="f_months" type="number" min="6" max="60" placeholder="مثال: 48" inputMode="numeric" />
                <div className="err-msg" id="f_monthsErr"></div>
              </div>
              <div className="field">
                <label>نسبة الفائدة السنوية (%)</label>
                <input id="f_rate" type="number" min="0" step="0.01" placeholder="مثال: 9" />
                <div className="err-msg" id="f_rateErr"></div>
              </div>
            </div>
          </div>

          <div className="card section">
            <div className="card-title">الالتزامات</div>
            <div className="commits-wrap" id="f_commitsWrap"></div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'14px',flexWrap:'wrap',gap:'10px'}}>
              <div className="summary-card" style={{flex:'1',minWidth:'220px'}}>
                <div className="sum-row"><span className="sum-key">المجموع</span><span className="sum-val" id="f_sumAmt">0.00</span></div>
                <div className="sum-row" style={{border:'none'}}><span className="sum-key">نسبة الاستقطاع</span><span className="sum-val" id="f_sumPct">0%</span></div>
              </div>
              <div className="commit-actions">
                <button className="btn-ghost sm" id="f_addBtn">+ إضافة التزام</button>
                <button className="btn-ghost sm" id="f_removeBtn" style={{display:'none'}}>− حذف</button>
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn-primary" id="f_calcBtn">احسب التمويل</button>
            <button className="btn-ghost" id="f_clearBtn">مسح</button>
          </div>

          <div className="explain-box" id="f_explain"></div>

          <div className="options-card" id="f_optionsCard">
            <div className="card-title">خيارات متقدمة</div>
            <div className="field">
              <label style={{fontWeight:'600',marginBottom:'10px',display:'block'}}>نسبة الاستقطاع</label>
              <div className="deduct-checks">
                <label className="deduct-lbl"><input type="checkbox" className="f_deductCb" value="70" /> 70%</label>
                <label className="deduct-lbl"><input type="checkbox" className="f_deductCb" value="75" /> 75%</label>
                <label className="deduct-lbl"><input type="checkbox" className="f_deductCb" value="80" /> 80%</label>
              </div>
            </div>
            <div className="field">
              <label>نوع الحساب</label>
              <select id="f_finOpt">
                <option value="full">كامل المبلغ</option>
                <option value="customAmount">مبلغ تمويل محدد</option>
                <option value="customInstallment">قسط شهري محدد</option>
              </select>
            </div>
            <div id="f_customWrap" style={{display:'none',marginTop:'10px'}}>
              <input id="f_customVal" type="number" min="0" step="0.01" placeholder="أدخل القيمة" />
              <div className="err-msg" id="f_customErr" style={{display:'none'}}></div>
            </div>
            <div className="btn-row" style={{marginTop:'12px'}}>
              <button className="btn-primary" id="f_recalcBtn" style={{fontSize:'13px',padding:'10px 20px'}}>إعادة الحساب</button>
            </div>
          </div>

          <div className="result-section" id="f_results">
            <div className="result-header">
              <div>
                <div className="result-title">نتيجة شركات التمويل</div>
                <div className="result-subtitle">حسبة مبدئية — يرجى التحقق مع الجهة التمويلية</div>
              </div>
              <div className="result-actions">
                <button className="btn-ghost sm" id="f_shareBtn">📸 مشاركة</button>
                <button className="btn-ghost sm" id="f_saveBtn">💾 حفظ</button>
              </div>
            </div>
            <div className="result-table" id="f_table"></div>
          </div>

        </div>

      </main>

      {/* Modals */}
      <div className="modal" id="eligModal">
        <div className="modal-box">
          <div className="modal-icon">⚠️</div>
          <div className="modal-title">العميل لا يستحق</div>
          <div className="modal-msg">صافي التمويل أقل من 5,000 ريال بسبب الالتزامات الحالية.</div>
          <button className="btn-ghost" onClick={() => document.getElementById('eligModal').classList.remove('show')}>حسناً</button>
        </div>
      </div>
      <div className="modal" id="easyModal">
        <div className="modal-box">
          <div className="modal-icon">📣</div>
          <div className="modal-title">تنبيه — تمويل ميسر</div>
          <div className="modal-msg">يرجى التحقق من سياسة جهة التمويل في حال عدم وجود تمويل شخصي.</div>
          <button className="btn-ghost" onClick={() => document.getElementById('easyModal').classList.remove('show')}>حسناً</button>
        </div>
      </div>

    </div>
  )
}
