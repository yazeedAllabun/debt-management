export const muhtasibCSS = `
/* LIGHT MODE */
.muhtasib-root {
  --bg: #f1f5f9;
  --surface: #ffffff;
  --surface2: #f8fafc;
  --border: #e2e8f0;
  --border-bright: #cbd5e1;
  --accent: #3b82f6;
  --accent2: #6366f1;
  --accent-glow: rgba(59,130,246,0.12);
  --green: #16a34a;
  --red: #dc2626;
  --yellow: #d97706;
  --text: #0f172a;
  --text2: #64748b;
  --text3: #94a3b8;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);
}

/* DARK MODE */
.muhtasib-root[data-theme="dark"] {
  --bg: #0d1117;
  --surface: #161b22;
  --surface2: #1c2128;
  --border: #30363d;
  --border-bright: #484f58;
  --accent: #3b82f6;
  --accent2: #818cf8;
  --accent-glow: rgba(59,130,246,0.18);
  --green: #3fb950;
  --red: #f85149;
  --yellow: #d29922;
  --text: #e6edf3;
  --text2: #8b949e;
  --text3: #484f58;
  --shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.muhtasib-root *{box-sizing:border-box;margin:0;padding:0;letter-spacing:0!important}
.muhtasib-root,.muhtasib-root input,.muhtasib-root select,.muhtasib-root button,.muhtasib-root label{font-family:'Tajawal',sans-serif;}
.muhtasib-root{color:var(--text);transition:background .3s,color .3s}

/* Tabs */
.muhtasib-root .tabs-bar{
  background:var(--surface);
  border-bottom:1px solid var(--border);
  display:flex;padding:0 24px;gap:4px;
}
.muhtasib-root .tab-btn{
  padding:14px 20px;font-size:14px;font-weight:600;
  color:var(--text2);background:transparent;
  border:none;border-bottom:3px solid transparent;
  cursor:pointer;transition:all .2s;white-space:nowrap;
  font-family:inherit;
}
.muhtasib-root .tab-btn:hover{color:var(--text)}
.muhtasib-root .tab-btn.active{color:var(--accent);border-bottom-color:var(--accent)}

/* Main layout */
.muhtasib-root .main{max-width:1100px;margin:0 auto;padding:28px 20px}

/* Cards */
.muhtasib-root .card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);padding:22px;
  transition:border-color .2s;
}
.muhtasib-root .card:hover{border-color:var(--border-bright)}
.muhtasib-root .card-title{
  font-size:12px;font-weight:700;color:var(--text3);
  text-transform:uppercase;margin-bottom:14px;
}

/* Grid layouts */
.muhtasib-root .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.muhtasib-root .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
@media(max-width:768px){.muhtasib-root .grid-3,.muhtasib-root .grid-2{grid-template-columns:1fr}}

/* Inputs */
.muhtasib-root .field{margin-bottom:14px}
.muhtasib-root .field:last-child{margin-bottom:0}
.muhtasib-root label{font-size:13px;color:var(--text2);display:block;margin-bottom:6px;font-weight:500}
.muhtasib-root input[type=text],.muhtasib-root input[type=number],.muhtasib-root input[type=tel],.muhtasib-root select{
  width:100%;padding:10px 14px;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--radius-sm);color:var(--text);font-family:inherit;
  font-size:14px;transition:all .2s;outline:none;
}
.muhtasib-root input:focus,.muhtasib-root select:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow)}
.muhtasib-root input.err{border-color:var(--red)!important;box-shadow:0 0 0 3px rgba(239,68,68,.12)!important}
.muhtasib-root select{cursor:pointer}
.muhtasib-root .hint-text{font-size:11.5px;color:var(--text3);margin-top:5px;line-height:1.5}
.muhtasib-root .err-msg{font-size:12px;color:var(--red);margin-top:5px;display:none}

/* Checkboxes */
.muhtasib-root .check-row{display:flex;gap:20px;margin-top:10px}
.muhtasib-root .check-label{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;color:var(--text2)}
.muhtasib-root .check-label input{width:17px;height:17px;accent-color:var(--accent);cursor:pointer}

/* Commitments section */
.muhtasib-root .commits-wrap{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-top:14px}
.muhtasib-root .commit-card{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--radius-sm);padding:16px;transition:all .2s;
}
.muhtasib-root .commit-card:hover{border-color:var(--border-bright)}
.muhtasib-root .commit-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.muhtasib-root .commit-label{font-size:13px;font-weight:600;color:var(--text2)}
.muhtasib-root .impact-badge{
  font-size:11px;font-weight:600;padding:2px 10px;border-radius:20px;
  display:none;
}
.muhtasib-root .impact-badge.inf{background:rgba(239,68,68,.15);color:var(--red);display:inline-block}
.muhtasib-root .impact-badge.ok{background:rgba(34,197,94,.15);color:var(--green);display:inline-block}
.muhtasib-root .commit-row{display:flex;gap:8px}
.muhtasib-root .commit-row input{flex:1;min-width:0}
.muhtasib-root .commit-row select{flex:1.2;min-width:0}
.muhtasib-root .warn-msg{font-size:11.5px;color:var(--red);margin-top:6px;display:none}
.muhtasib-root .commit-hint{font-size:11px;color:var(--text3);margin-top:8px;line-height:1.5}

/* Summary card */
.muhtasib-root .summary-card{
  background:linear-gradient(135deg,var(--surface2),var(--surface));
  border:1px solid var(--border-bright);
  border-radius:var(--radius-sm);padding:16px;
}
.muhtasib-root .sum-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)}
.muhtasib-root .sum-row:last-of-type{border-bottom:none}
.muhtasib-root .sum-key{font-size:13px;color:var(--text2)}
.muhtasib-root .sum-val{font-size:15px;font-weight:700;color:var(--accent)}

/* Buttons */
.muhtasib-root .btn-row{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}
.muhtasib-root .btn-primary{
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:#fff;border:none;border-radius:var(--radius-sm);
  padding:12px 28px;font-size:15px;font-weight:600;
  cursor:pointer;transition:all .2s;font-family:inherit;
  box-shadow:0 4px 16px var(--accent-glow);
}
.muhtasib-root .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(59,130,246,.35)}
.muhtasib-root .btn-primary:active{transform:translateY(0)}
.muhtasib-root .btn-ghost{
  background:transparent;color:var(--text2);
  border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:11px 20px;font-size:14px;cursor:pointer;
  transition:all .2s;font-family:inherit;
}
.muhtasib-root .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.muhtasib-root .btn-ghost.sm{padding:6px 12px;font-size:12px}
.muhtasib-root .commit-actions{display:flex;gap:8px;margin-top:12px}

/* Explanation */
.muhtasib-root .explain-box{
  background:linear-gradient(135deg,rgba(59,130,246,.08),rgba(56,189,248,.06));
  border:1px solid rgba(59,130,246,.25);
  border-radius:var(--radius-sm);padding:14px 16px;
  margin-top:16px;font-size:14px;color:var(--text2);line-height:1.7;
  display:none;
}
.muhtasib-root .explain-box.show{display:block}

/* Options card */
.muhtasib-root .options-card{
  background:var(--surface);border:1px solid var(--accent);
  border-radius:var(--radius);padding:20px;margin-top:16px;
  display:none;box-shadow:0 0 24px var(--accent-glow);
}
.muhtasib-root .options-card.show{display:block}
.muhtasib-root .deduct-checks{display:flex;gap:16px;flex-wrap:wrap;margin:10px 0 16px}
.muhtasib-root .deduct-lbl{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:14px;font-weight:500}
.muhtasib-root .deduct-lbl input{width:17px;height:17px;accent-color:var(--accent);cursor:pointer}

/* Results table */
.muhtasib-root .result-section{margin-top:24px;display:none}
.muhtasib-root .result-section.show{display:block}
.muhtasib-root .result-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:14px;flex-wrap:wrap;gap:10px;
}
.muhtasib-root .result-title{font-size:17px;font-weight:700}
.muhtasib-root .result-subtitle{font-size:12px;color:var(--text3);margin-top:2px}
.muhtasib-root .result-actions{display:flex;gap:8px}
.muhtasib-root .result-table{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);overflow:hidden;
}
.muhtasib-root .rt-row{
  display:flex;align-items:stretch;border-bottom:1px solid var(--border);
}
.muhtasib-root .rt-row:last-child{border-bottom:none}
.muhtasib-root .rt-key{
  flex:1;padding:14px 18px;font-size:13px;color:var(--text2);
  background:var(--surface2);font-weight:500;border-left:1px solid var(--border);
  display:flex;align-items:center;
}
.muhtasib-root .rt-val{
  flex:1.2;padding:14px 18px;font-size:15px;font-weight:700;color:var(--text);
  display:flex;align-items:center;
}
.muhtasib-root .rt-val.highlight{color:var(--green);font-size:18px}
.muhtasib-root .rt-val.accent{color:var(--accent)}

/* Section spacing */
.muhtasib-root .section{margin-bottom:20px}
.muhtasib-root .section-title{
  font-size:11px;font-weight:700;color:var(--text3);
  text-transform:uppercase;
  margin-bottom:12px;display:flex;align-items:center;gap:8px;
}
.muhtasib-root .section-title::after{content:'';flex:1;height:1px;background:var(--border)}

/* Modal */
.muhtasib-root .modal{
  position:fixed;inset:0;background:rgba(0,0,0,.7);
  display:none;align-items:center;justify-content:center;z-index:999;
  backdrop-filter:blur(4px);
}
.muhtasib-root .modal.show{display:flex}
.muhtasib-root .modal-box{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);padding:28px;max-width:360px;width:90%;
  box-shadow:var(--shadow);text-align:center;
}
.muhtasib-root .modal-icon{font-size:36px;margin-bottom:12px}
.muhtasib-root .modal-title{font-size:17px;font-weight:700;margin-bottom:8px}
.muhtasib-root .modal-msg{font-size:14px;color:var(--text2);line-height:1.6;margin-bottom:20px}

/* Salary input */
.muhtasib-root .salary-hint{font-size:11px;color:var(--text3);margin-top:4px}
.muhtasib-root .pct-chip{
  display:inline-block;font-size:11px;padding:2px 8px;
  background:var(--accent-glow);color:var(--accent);
  border-radius:20px;margin-right:4px;font-weight:600;
}

/* Scrollbar */
.muhtasib-root ::-webkit-scrollbar{width:6px;height:6px}
.muhtasib-root ::-webkit-scrollbar-track{background:var(--surface)}
.muhtasib-root ::-webkit-scrollbar-thumb{background:var(--border-bright);border-radius:3px}

/* Section divider */
.muhtasib-root hr.divider{border:none;border-top:1px solid var(--border);margin:20px 0}

/* Top area */
.muhtasib-root .top-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-bottom:20px}
@media(max-width:640px){.muhtasib-root .top-grid{grid-template-columns:1fr}}

/* Fade in */
.muhtasib-root .calc-panel{animation:muhtasibFadeUp .3s ease}
@keyframes muhtasibFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`
