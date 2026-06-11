// components/ReportDrillDownModal.jsx
import { useEffect, useState } from "react";
import { FaTimes, FaChevronLeft, FaSearch, FaCalendarAlt, FaRupeeSign, FaExclamationTriangle } from "react-icons/fa";
import api from "../services/api";

const fmt     = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const METHOD_ICON  = { cash: "💵", card: "💳", upi: "📱", bank_transfer: "🏦" };
const MONTH_NAMES  = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ p }) {
  const isPartial = Number(p.due_amount) > 0;
  if (isPartial) return <span style={{ padding:"2px 8px", borderRadius:"99px", fontSize:"10px", fontWeight:700, background:"var(--yellow-bg)", color:"var(--yellow)" }}>Partial ⚠️</span>;
  if (p.status === "paid") return <span style={{ padding:"2px 8px", borderRadius:"99px", fontSize:"10px", fontWeight:700, background:"var(--green-bg)", color:"var(--green)" }}>Paid ✅</span>;
  return <span style={{ padding:"2px 8px", borderRadius:"99px", fontSize:"10px", fontWeight:700, background:"var(--red-bg)", color:"var(--red)" }}>Pending ❌</span>;
}

// ── Summary Strip ─────────────────────────────────────────────────────────────
function SummaryStrip({ payments, rangeSummary }) {
  const collected = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const pending   = payments.reduce((s, p) => s + Number(p.due_amount || 0), 0);
  const partial   = payments.filter(p => Number(p.due_amount) > 0).length;
  const members   = new Set(payments.map(p => p.member_id)).size;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", borderBottom: "1px solid var(--border-subtle)", overflowX: "auto" }}>
      {[
        { icon: "✅", label: "Collected",    value: fmt(collected), color: "var(--green)"  },
        { icon: "⚠️", label: "Pending/Due",  value: fmt(pending),   color: "var(--yellow)" },
        { icon: "👥", label: "Members",      value: members,        color: "var(--blue)"   },
        { icon: "⏳", label: "Partial",      value: partial,        color: "var(--yellow)" },
      ].map(c => (
        <div key={c.label} style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", minWidth: "80px" }}>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>{c.icon}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 800, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Payments Table ────────────────────────────────────────────────────────────
function PaymentsTable({ payments, search, filter }) {
  const filtered = payments.filter(p => {
    const q           = search.toLowerCase();
    const matchSearch = !search || p.full_name?.toLowerCase().includes(q) || p.phone?.includes(search);
    const matchFilter = filter === "all" ? true : filter === "partial" ? Number(p.due_amount) > 0 : p.status === filter;
    return matchSearch && matchFilter;
  });

  if (filtered.length === 0)
    return <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No payments found</div>;

  const grandTotal = filtered.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "600px" }}>
        <thead>
          <tr style={{ background: "var(--bg-elevated)", position: "sticky", top: 0, zIndex: 1 }}>
            {["#", "Member", "Plan / For", "Amount", "Paid", "Due", "Method", "Date", "Status"].map(h => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, idx) => (
            <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "11px" }}>{idx + 1}</td>
              <td style={{ padding: "11px 14px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.full_name}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>{p.phone}</div>
              </td>
              <td style={{ padding: "11px 14px", color: "var(--text-secondary)", fontSize: "11px" }}>
                <div style={{ fontWeight: 600 }}>{p.plan_name || "—"}</div>
                <div style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{p.payment_for?.replace(/_/g, " ")}</div>
              </td>
              <td style={{ padding: "11px 14px", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{fmt(p.amount)}</td>
              <td style={{ padding: "11px 14px", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--green)", whiteSpace: "nowrap" }}>{fmt(p.paid_amount || p.amount)}</td>
              <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                {Number(p.due_amount) > 0
                  ? <span style={{ color: "var(--yellow)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}><FaExclamationTriangle style={{ fontSize: "9px" }} />{fmt(p.due_amount)}</span>
                  : <span style={{ color: "var(--text-muted)" }}>—</span>}
              </td>
              <td style={{ padding: "11px 14px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{METHOD_ICON[p.payment_method] || "💵"} {p.payment_method?.replace(/_/g, " ")}</td>
              <td style={{ padding: "11px 14px", color: "var(--text-muted)", whiteSpace: "nowrap", fontSize: "11px" }}>{fmtDate(p.payment_date)}</td>
              <td style={{ padding: "11px 14px" }}><StatusBadge p={p} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Showing {filtered.length} of {payments.length} records</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Grand Total:</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 800, color: "var(--green)" }}>{fmt(grandTotal)}</span>
        </div>
      </div>
    </>
  );
}

// ── Year Months List ──────────────────────────────────────────────────────────
function YearMonthsList({ year, onMonthClick, title }) {
  const [months,  setMonths]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/drilldown/year/${year}`)
      .then(r => setMonths(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const totalRevenue = months.reduce((s, m) => s + Number(m.total), 0);

  return (
    <>
      <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{title} — {year}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Total: {fmt(totalRevenue)}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : months.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>No payments for {year}</div>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "420px" }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)" }}>
                {["Month", "Revenue", "Transactions", "Collected", "Due"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map(m => (
                <tr key={m.month} onClick={() => onMonthClick(m.month)}
                  style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {MONTH_NAMES[m.month]} <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "6px" }}>→ view details</span>
                  </td>
                  <td style={{ padding: "13px 16px", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--green)", fontSize: "15px" }}>{fmt(m.total)}</td>
                  <td style={{ padding: "13px 16px", color: "var(--text-secondary)" }}>{m.count}</td>
                  <td style={{ padding: "13px 16px", color: "var(--green)" }}>{fmt(m.paid)}</td>
                  <td style={{ padding: "13px 16px", color: Number(m.due) > 0 ? "var(--yellow)" : "var(--text-muted)" }}>{Number(m.due) > 0 ? fmt(m.due) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  );
}
function AllYearsList({ onYearClick }) {
  const [years,   setYears]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/reports/drilldown/all-years")
      .then(r => setYears(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
      ) : years.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>No data</div>
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "420px" }}>
          <thead>
            <tr style={{ background: "var(--bg-elevated)" }}>
              {["Year", "Total Revenue", "Transactions", "Collected", "Due"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(y => (
              <tr key={y.year} onClick={() => onYearClick(y.year)}
                style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "13px 16px", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", fontSize: "16px" }}>
                  {y.year} <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "6px" }}>→ view months</span>
                </td>
                <td style={{ padding: "13px 16px", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--green)", fontSize: "15px" }}>{fmt(y.total)}</td>
                <td style={{ padding: "13px 16px", color: "var(--text-secondary)" }}>{y.count}</td>
                <td style={{ padding: "13px 16px", color: "var(--green)" }}>{fmt(y.paid)}</td>
                <td style={{ padding: "13px 16px", color: Number(y.due) > 0 ? "var(--yellow)" : "var(--text-muted)" }}>{Number(y.due) > 0 ? fmt(y.due) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
function DateRangeView({ from, to, onBack }) {
  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    api.get("/reports/drilldown/daterange", { params: { from, to } })
      .then(r => { setPayments(r.data.data || []); setSummary(r.data.summary); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const inp = { padding: "8px 12px 8px 30px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "12px", outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <>
      {/* Date range summary strip */}
      {!loading && summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", borderBottom: "1px solid var(--border-subtle)", overflowX: "auto" }}>
          {[
            { icon: "📅", label: "Date Range",     value: `${fmtDate(from)} – ${fmtDate(to)}`,  color: "var(--purple)"  },
            { icon: "💰", label: "Total Revenue",  value: fmt(summary.collected),                color: "var(--green)"   },
            { icon: "⏳", label: "Pending",        value: fmt(summary.pending),                  color: "var(--yellow)"  },
            { icon: "🧾", label: "Transactions",   value: summary.count,                         color: "var(--blue)"    },
            { icon: "👥", label: "Members",        value: summary.unique_members,                color: "var(--cyan)"    },
          ].map(c => (
            <div key={c.label} style={{ padding: "12px 14px", textAlign: "center", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
              <div style={{ fontSize: "16px", marginBottom: "3px" }}>{c.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: c.label === "Date Range" ? "11px" : "16px", fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
          <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member name or phone..." style={inp} />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "paid", "partial", "pending"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s", background: filter === f ? "var(--purple)" : "var(--bg-elevated)", color: filter === f ? "#fff" : "var(--text-muted)", border: filter === f ? "none" : "1px solid var(--border-default)" }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading date range data...</div>
        ) : (
          <PaymentsTable payments={payments} search={search} filter={filter} />
        )}
      </div>
    </>
  );
}

// ── MAIN MODAL ────────────────────────────────────────────────────────────────
export default function ReportDrillDownModal({ open, onClose, mode, month, year, drill }) {
  const [stack,    setStack]    = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");

  // ── Date range state ──────────────────────────────────────────────────────
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");
  const [activeDateRange, setActiveDateRange] = useState(null); // { from, to }

  useEffect(() => {
    if (!open) { setActiveDateRange(null); setShowDatePicker(false); return; }
    setSearch(""); setFilter("all"); setPayments([]);

    if (mode === "this-month") {
      setStack([{ view: "this-month-payments", label: "This Month" }]);
    } else if (mode === "last-year") {
      const ly = new Date().getFullYear() - 1;
      setStack([{ view: "year-months", label: `Last Year — ${ly}`, year: ly }]);
    } else if (mode === "all-time") {
      setStack([{ view: "all-years", label: "All Time" }]);
    } else if (mode === "method") {
      setStack([{ view: "method-payments", label: `${(month || "").toUpperCase()} Payments`, method: month, year }]);
    } else if (mode === "daterange" && drill?.from && drill?.to) {
      setActiveDateRange({ from: drill.from, to: drill.to });
      setStack([{ view: "daterange", label: `${fmtDate(drill.from)} – ${fmtDate(drill.to)}` }]);
    }
  }, [mode, month, year, open, drill]);

  // Fetch payments when stack top changes
  useEffect(() => {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (top.view === "payments") {
      setLoading(true); setPayments([]);
      api.get(`/reports/drilldown/members/${top.year}/${top.month}`)
        .then(r => setPayments(r.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (top.view === "this-month-payments") {
      setLoading(true); setPayments([]);
      api.get("/reports/drilldown/this-month")
        .then(r => setPayments(r.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (top.view === "method-payments") {
      setLoading(true); setPayments([]);
      api.get(`/reports/drilldown/method/${top.method}`, { params: { year: top.year } })
        .then(r => setPayments(r.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [stack]);

  if (!open) return null;

  const top = stack[stack.length - 1];

  const goBack = () => {
    if (stack.length <= 1) { onClose(); return; }
    setStack(s => s.slice(0, -1));
    setSearch(""); setFilter("all");
  };

  const pushMonthsOfYear    = (yr)      => setStack(s => [...s, { view: "year-months", label: `${yr}`, year: yr }]);
  const pushPaymentsOfMonth = (yr, mo)  => setStack(s => [...s, { view: "payments", label: `${MONTH_NAMES[mo]} ${yr}`, year: yr, month: mo }]);

  const applyDateRange = () => {
    if (!dateFrom || !dateTo) return;
    if (new Date(dateFrom) > new Date(dateTo)) {
      alert("'From' date must be before 'To' date"); return;
    }
    setActiveDateRange({ from: dateFrom, to: dateTo });
    setStack([{ view: "daterange", label: `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}` }]);
    setShowDatePicker(false);
  };

  const inp = { padding: "8px 12px 8px 30px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "12px", outline: "none", width: "100%", boxSizing: "border-box" };

  const showSearchFilter = ["payments", "this-month-payments", "method-payments"].includes(top?.view);
  const isDateRangeView  = top?.view === "daterange";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400, padding: "20px", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} className="rdd-modal" style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", width: "min(960px,96vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", animation: "reportModalIn 0.2s cubic-bezier(0.16,1,0.3,1)" }}>

        {/* ── Header ── */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", flexShrink: 0, gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
            <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 8px", borderRadius: "var(--radius-sm)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", flexShrink: 0 }}>
              <FaChevronLeft style={{ fontSize: "10px" }} /> {stack.length <= 1 ? "Close" : "Back"}
            </button>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", minWidth: 0, overflow: "hidden" }}>
              {stack.map((s, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                  {i > 0 && <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>›</span>}
                  <span style={{ color: i === stack.length - 1 ? "var(--text-primary)" : "var(--text-muted)", fontWeight: i === stack.length - 1 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* ── Date Range Picker Button ── */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDatePicker(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "var(--radius-sm)", background: isDateRangeView ? "rgba(167,139,250,0.15)" : "var(--bg-surface)", border: `1px solid ${isDateRangeView ? "rgba(167,139,250,0.6)" : "var(--border-default)"}`, color: isDateRangeView ? "#a78bfa" : "var(--text-muted)", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.15s" }}
              >
                <FaCalendarAlt style={{ fontSize: "11px" }} />
                {isDateRangeView ? "Change Range" : "Date Range Filter"}
              </button>

              {/* Date picker dropdown */}
              {showDatePicker && (
                <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "16px", zIndex: 100, width: "min(280px, 90vw)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    📅 Select Date Range
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>From</label>
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", boxSizing: "border-box", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                        onFocus={e => e.target.style.borderColor = "#a78bfa"}
                        onBlur={e => e.target.style.borderColor = "var(--border-default)"}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>To</label>
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", boxSizing: "border-box", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                        onFocus={e => e.target.style.borderColor = "#a78bfa"}
                        onBlur={e => e.target.style.borderColor = "var(--border-default)"}
                      />
                    </div>
                  </div>

                  {/* Quick preset buttons */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Select</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {[
                        { label: "Today",      from: new Date().toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
                        { label: "This Week",  from: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split("T")[0]; })(), to: new Date().toISOString().split("T")[0] },
                        { label: "This Month", from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
                        { label: "Last Month", from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split("T")[0], to: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split("T")[0] },
                        { label: "Last 3 Mo",  from: (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().split("T")[0]; })(), to: new Date().toISOString().split("T")[0] },
                        { label: "This Year",  from: `${new Date().getFullYear()}-01-01`, to: new Date().toISOString().split("T")[0] },
                      ].map(p => (
                        <button key={p.label} onClick={() => { setDateFrom(p.from); setDateTo(p.to); }}
                          style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 500, cursor: "pointer", background: dateFrom === p.from && dateTo === p.to ? "rgba(167,139,250,0.2)" : "var(--bg-surface)", border: `1px solid ${dateFrom === p.from && dateTo === p.to ? "#a78bfa" : "var(--border-default)"}`, color: dateFrom === p.from && dateTo === p.to ? "#a78bfa" : "var(--text-muted)", transition: "all 0.12s" }}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setShowDatePicker(false)} style={{ flex: 1, padding: "8px", borderRadius: "var(--radius-sm)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                    <button onClick={applyDateRange} disabled={!dateFrom || !dateTo}
                      style={{ flex: 1, padding: "8px", borderRadius: "var(--radius-sm)", background: dateFrom && dateTo ? "#a78bfa" : "var(--bg-elevated)", color: dateFrom && dateTo ? "#fff" : "var(--text-muted)", border: "none", cursor: dateFrom && dateTo ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 700 }}>
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={onClose} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTimes style={{ fontSize: "12px" }} />
            </button>
          </div>
        </div>

        {/* ── Summary Strip (for normal payment views) ── */}
        {!loading && payments.length > 0 && showSearchFilter && <SummaryStrip payments={payments} />}

        {/* ── Search + Filter (for normal payment views) ── */}
        {showSearchFilter && (
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
            <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
              <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member name or phone..." style={inp} />
            </div>
            <div className="rdd-filter-pills" style={{ display: "flex", gap: "6px" }}>
              {["all", "paid", "partial", "pending"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s", background: filter === f ? "var(--text-primary)" : "var(--bg-elevated)", color: filter === f ? "#0a0a0a" : "var(--text-muted)", border: filter === f ? "none" : "1px solid var(--border-default)" }}>{f}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {/* Date Range View */}
          {isDateRangeView && activeDateRange && (
            <DateRangeView from={activeDateRange.from} to={activeDateRange.to} onBack={goBack} />
          )}

          {!isDateRangeView && (
            loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : (
              <>
                {showSearchFilter && <PaymentsTable payments={payments} search={search} filter={filter} />}
                {top?.view === "year-months"  && <YearMonthsList year={top.year} title={top.label} onMonthClick={(mo) => pushPaymentsOfMonth(top.year, mo)} />}
                {top?.view === "all-years"    && <AllYearsList onYearClick={(yr) => pushMonthsOfYear(yr)} />}
              </>
            )
          )}
        </div>
      </div>

      <style>{`
        @keyframes reportModalIn {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (max-width: 600px) {
          .rdd-modal {
            position: fixed !important;
            top: auto !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            max-height: 92vh !important;
            border-radius: 20px 20px 0 0 !important;
            animation: rddSlideUp 0.28s cubic-bezier(0.16,1,0.3,1) !important;
          }
          @keyframes rddSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .rdd-filter-pills { flex-wrap: wrap !important; }
        }
      `}</style>
    </div>
  );
}