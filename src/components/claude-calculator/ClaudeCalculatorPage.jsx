import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { muhtasibCSS } from './muhtasibStyles.js'
import { useCalculations } from '../../hooks/useCalculations'
import { useClients } from '../../hooks/useClients'

export function ClaudeCalculatorPage() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { saveCalculation } = useCalculations()
  const { clients } = useClients()

  const [selectedClient, setSelectedClient] = useState(null)
  const [clientSearch, setClientSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [savedCalc, setSavedCalc] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Auto-select client when navigated from ClientsTable
  useEffect(() => {
    const client = location.state?.client
    if (client) {
      setSelectedClient(client)
      setClientSearch(client.name)
    }
  }, [])

  // Load CSS + JS
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

  // Fill client name/phone into DOM when client selected; make read-only
  useEffect(() => {
    const ids = ['p_name', 'p_mobile', 'f_name', 'f_mobile']
    if (!selectedClient) {
      ids.forEach(id => {
        const el = document.getElementById(id)
        if (!el) return
        el.readOnly = false
        el.style.opacity = ''
        el.style.cursor = ''
      })
      return
    }
    const vals = { p_name: selectedClient.name, p_mobile: selectedClient.phone || '', f_name: selectedClient.name, f_mobile: selectedClient.phone || '' }
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      el.value = vals[id]
      el.readOnly = true
      el.style.opacity = '0.7'
      el.style.cursor = 'not-allowed'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }, [selectedClient])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSave(calcType) {
    const prefix = calcType === 'personal' ? 'p' : 'f'
    const name = document.getElementById(`${prefix}_name`)?.value?.trim()
    const phone = document.getElementById(`${prefix}_mobile`)?.value?.trim()
    const salary = document.getElementById(`${prefix}_salary`)?.value
    const months = document.getElementById(`${prefix}_months`)?.value
    const rate = document.getElementById(`${prefix}_rate`)?.value
    const payoff = document.getElementById(`${prefix}_payoff`)?.value

    if (!name) { showToast('يرجى إدخال اسم العميل أولاً'); return }

    const resultsEl = document.getElementById(`${prefix}_results`)
    if (!resultsEl?.classList.contains('show')) {
      showToast('يرجى إجراء الحساب أولاً قبل الحفظ')
      return
    }

    const result = {}
    document.querySelectorAll(`#${prefix}_table .rt-row`).forEach(row => {
      const key = row.querySelector('.rt-key')?.textContent?.trim()
      const val = row.querySelector('.rt-val')?.textContent?.trim()
      if (key && val) result[key] = val
    })

    setSaving(true)
    try {
      const saved = await saveCalculation({
        client_id: selectedClient?.id || null,
        client_name: name,
        client_phone: phone || null,
        calc_type: calcType,
        inputs: { salary, months, rate, payoff },
        result,
      })
      setSavedCalc({ ...saved, payoff })
      showToast('✓ تم حفظ الحسبة بنجاح')
    } catch {
      showToast('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const filteredClients = clientSearch.trim()
    ? clients.filter(c => c.name.includes(clientSearch) || (c.phone || '').includes(clientSearch))
    : []

  function handleSelectClient(client) {
    setSelectedClient(client)
    setClientSearch(client.name)
    setShowDropdown(false)
    setSavedCalc(null)
  }

  function handleClearClient() {
    setSelectedClient(null)
    setClientSearch('')
    setSavedCalc(null)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Client search */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 ابحث عن عميل لربط الحسبة به (اختياري)"
          value={clientSearch}
          onChange={e => { setClientSearch(e.target.value); setShowDropdown(true); if (!e.target.value) setSelectedClient(null) }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          dir="rtl"
        />
        {showDropdown && filteredClients.length > 0 && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl max-h-52 overflow-y-auto">
            {filteredClients.map(client => (
              <button
                key={client.id}
                onMouseDown={() => handleSelectClient(client)}
                className="w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{client.name}</span>
                <span className="text-gray-400 text-xs">{client.phone}</span>
              </button>
            ))}
          </div>
        )}
        {selectedClient && (
          <div className="mt-1.5 flex items-center gap-2 text-sm px-1 flex-wrap">
            <span className="text-blue-600 dark:text-blue-400">✓ مرتبط بـ: <strong>{selectedClient.name}</strong></span>
            <button
              onClick={() => navigate(`/edit-client/${selectedClient.id}`)}
              className="text-xs text-blue-500 dark:text-blue-400 underline hover:text-blue-700"
            >
              تعديل ملف العميل
            </button>
            <button onClick={handleClearClient} className="text-gray-400 hover:text-red-500 text-xs">✕ إلغاء</button>
          </div>
        )}
      </div>

      {/* Muhtasib */}
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
                  <button className="btn-ghost sm" id="p_saveBtn" onClick={() => handleSave('personal')} disabled={saving}>
                    {saving ? '...' : '💾 حفظ'}
                  </button>
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
                  <button className="btn-ghost sm" id="f_saveBtn" onClick={() => handleSave('finco')} disabled={saving}>
                    {saving ? '...' : '💾 حفظ'}
                  </button>
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

      {/* Banner after save */}
      {savedCalc && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            ✓ تم حفظ الحسبة
            {selectedClient ? <> — مرتبطة بـ <strong>{selectedClient.name}</strong></> : <> لـ <strong>{savedCalc.client_name}</strong></>}
          </span>
          {!selectedClient && (
            <button
              onClick={() => navigate('/add-client', { state: { fromCalc: { name: savedCalc.client_name, phone: savedCalc.client_phone, debt_amount: savedCalc.inputs?.payoff || '' } } })}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mr-4"
            >
              ← إضافة كعميل
            </button>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl shadow-xl text-sm font-medium whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
