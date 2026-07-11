import { useState } from 'react'

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
]

const RANKS = [
  { label: 'مدني', age: 60 },
  { label: 'جندي', age: 44 },
  { label: 'جندي أول', age: 44 },
  { label: 'ملازم', age: 44 },
  { label: 'ملازم أول', age: 44 },
  { label: 'عريف', age: 46 },
  { label: 'نقيب طيار', age: 46 },
  { label: 'نقيب', age: 48 },
  { label: 'رائد طيار', age: 48 },
  { label: 'وكيل رقيب', age: 48 },
  { label: 'رقيب', age: 50 },
  { label: 'رقيب أول', age: 50 },
  { label: 'مقدم طيار', age: 50 },
  { label: 'رائد', age: 50 },
  { label: 'رئيس رقباء', age: 52 },
  { label: 'مقدم', age: 52 },
  { label: 'عقيد طيار', age: 52 },
  { label: 'عقيد', age: 54 },
  { label: 'عميد', age: 56 },
  { label: 'لواء', age: 58 },
  { label: 'فريق', age: 60 },
  { label: 'فريق أول وأعلى', age: 60 },
]

function getCurrentHijri() {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric', month: 'numeric', day: 'numeric',
    }).formatToParts(new Date())
    return {
      year:  +parts.find(p => p.type === 'year').value,
      month: +parts.find(p => p.type === 'month').value,
      day:   +parts.find(p => p.type === 'day').value,
    }
  } catch {
    const g = new Date()
    return { year: Math.floor((g.getFullYear() - 622) * (354.367 / 365.25)), month: 1, day: 1 }
  }
}

// Fully-controlled component — parent owns all state so both panels stay in sync
export function RetirementCalc({ day, month, year, text, rank, onChange }) {
  const [showPicker, setShowPicker] = useState(false)
  const nowH = getCurrentHijri()

  function handleText(val) {
    const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (m) {
      onChange({ day: m[1], month: m[2], year: m[3], text: val, rank })
    } else {
      onChange({ day, month, year, text: val, rank })
    }
  }

  function handlePicker(d, mo, y) {
    const t = d && mo && y
      ? `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}`
      : text
    onChange({ day: d, month: mo, year: y, text: t, rank })
  }

  const bDay = parseInt(day); const bMonth = parseInt(month); const bYear = parseInt(year)
  const valid = bDay >= 1 && bDay <= 30 && bMonth >= 1 && bMonth <= 12 && bYear >= 1300 && bYear <= nowH.year

  let age = null
  if (valid) {
    let years = nowH.year - bYear
    let months = nowH.month - bMonth
    if (nowH.day < bDay) months--
    if (months < 0) { years--; months += 12 }
    if (years >= 0) age = { years, months }
  }

  const selectedRank = RANKS.find(r => r.label === rank)

  let result = null
  if (age && selectedRank) {
    const rem = selectedRank.age * 12 - (age.years * 12 + age.months)
    result = rem > 0
      ? { years: Math.floor(rem / 12), months: rem % 12, total: rem }
      : { reached: true }
  }

  const s = { color: 'var(--text2)' }
  const divider = { borderTop: '1px solid var(--border)', margin: '6px 0' }

  return (
    <>
      {/* Birth date */}
      <div className="field">
        <label>تاريخ الميلاد (هجري)</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={text}
            onChange={e => handleText(e.target.value)}
            placeholder="يوم/شهر/سنة  مثال: 15/08/1400"
            dir="ltr"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={() => setShowPicker(v => !v)}
            title="اختر من التقويم"
            style={{
              padding: '0 12px',
              background: showPicker ? 'var(--accent)' : 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              color: showPicker ? '#fff' : 'inherit',
              transition: 'background 0.2s',
            }}
          >
            📅
          </button>
        </div>

        {showPicker && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <select value={day} onChange={e => handlePicker(e.target.value, month, year)} style={{ flex: 1 }}>
              <option value="">يوم</option>
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
              ))}
            </select>
            <select value={month} onChange={e => handlePicker(day, e.target.value, year)} style={{ flex: 2 }}>
              <option value="">الشهر</option>
              {HIJRI_MONTHS.map((m, i) => (
                <option key={i + 1} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={e => handlePicker(day, month, e.target.value)} style={{ flex: 2 }}>
              <option value="">السنة</option>
              {Array.from({ length: nowH.year - 1339 }, (_, i) => {
                const y = nowH.year - i
                return <option key={y} value={String(y)}>{y}</option>
              })}
            </select>
          </div>
        )}
      </div>

      {/* Rank */}
      <div className="field">
        <label>الرتبة / الجهة</label>
        <select value={rank} onChange={e => onChange({ day, month, year, text, rank: e.target.value })}>
          <option value="">— اختر الرتبة —</option>
          {RANKS.map(r => (
            <option key={r.label} value={r.label}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Result */}
      {age && selectedRank && (
        <div style={{
          padding: '12px 14px',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          fontSize: '13px',
          lineHeight: 1.9,
          marginTop: '2px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={s}>العمر الحالي</span>
            <strong>{age.years} سنة{age.months > 0 ? ` و${age.months} شهر` : ''}</strong>
          </div>
          <div style={divider} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={s}>سن التقاعد للرتبة</span>
            <strong>{selectedRank.age} سنة</strong>
          </div>
          <div style={divider} />
          {result.reached ? (
            <div style={{ textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>
              بلغ سن التقاعد
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={s}>المتبقي للتقاعد</span>
              <strong style={{ color: 'var(--accent)' }}>
                {result.years > 0 ? `${result.years} سنة ` : ''}
                {result.months > 0 ? `و${result.months} شهر ` : ''}
                <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({result.total} شهر)</span>
              </strong>
            </div>
          )}
        </div>
      )}
    </>
  )
}
