import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import {
  FaUsers, FaUserTie, FaClipboardCheck, FaRupeeSign,
  FaArrowRight, FaArrowUp, FaArrowDown, FaSync,
  FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle,
  FaEye, FaEyeSlash, FaTimes, FaCheck, FaSearch, FaUser
} from "react-icons/fa";
import NotificationBell from "../components/NotificationBell";
import RevenueDrillDown from "../components/Revenuedrilldown";
import MemberProfileDrawer from "../components/MemberProfileDrawer";

const fmt     = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const MASK    = "••••••";

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg, sub, onClick, trend, trendLabel, delay = 0, masked = false, onToggleMask }) => (
  <div
    onClick={onClick}
    className="fade-up"
    style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: "22px",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
      position: "relative", overflow: "hidden",
      animationDelay: `${delay}s`, opacity: 0
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${color}20`; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${color}, transparent)`, opacity: 0.8 }} />
    <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", borderRadius: "50%", background: bg, filter: "blur(20px)", opacity: 0.5 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", position: "relative" }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: bg, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        <Icon style={{ fontSize: "15px" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {onToggleMask && (
          <button onClick={e => { e.stopPropagation(); onToggleMask(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px", padding: "2px", display: "flex", alignItems: "center", opacity: 0.7 }}
            title={masked ? "Show value" : "Hide value"}>
            {masked ? <FaEye /> : <FaEyeSlash />}
          </button>
        )}
        {onClick && <FaArrowRight style={{ color: "var(--text-muted)", fontSize: "10px", opacity: 0.5 }} />}
      </div>
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: masked ? "22px" : "30px", fontWeight: 700, color: masked ? "var(--text-muted)" : "var(--text-primary)", lineHeight: 1, marginBottom: "5px", position: "relative", letterSpacing: masked ? "0.15em" : "normal", userSelect: masked ? "none" : "auto" }}>
      {masked ? MASK : (value ?? "—")}
    </div>
    <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, position: "relative" }}>{label}</div>
    {sub && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", position: "relative" }}>{sub}</div>}
    {!masked && trend !== undefined && (
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "10px", fontSize: "11px", color: trend >= 0 ? "var(--green)" : "var(--red)", position: "relative" }}>
        {trend >= 0 ? <FaArrowUp style={{ fontSize: "9px" }} /> : <FaArrowDown style={{ fontSize: "9px" }} />}
        <span>{Math.abs(trend)} {trendLabel || "vs yesterday"}</span>
      </div>
    )}
  </div>
);

// ── Mini Stat ──────────────────────────────────────────────────────────────────
const MiniStat = ({ icon: Icon, label, value, color, delay = 0, masked = false, onToggleMask, onClick }) => (
  <div className="fade-up" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "16px 18px", transition: "all 0.18s", animationDelay: `${delay}s`, opacity: 0, position: "relative", cursor: onClick ? "pointer" : "default" }}
    onClick={onClick}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = "var(--bg-elevated)"; if (onClick) e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Icon style={{ fontSize: "13px", color, marginBottom: "10px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {onToggleMask && (
          <button onClick={onToggleMask} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "11px", padding: "0", opacity: 0.6 }} title={masked ? "Show" : "Hide"}>
            {masked ? <FaEye /> : <FaEyeSlash />}
          </button>
        )}
        {onClick && <FaArrowRight style={{ fontSize: "9px", color: "var(--text-muted)", opacity: 0.5 }} />}
      </div>
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: masked ? "16px" : "19px", fontWeight: 700, color: masked ? "var(--text-muted)" : "var(--text-primary)", lineHeight: 1, marginBottom: "4px", letterSpacing: masked ? "0.15em" : "normal" }}>
      {masked ? MASK : value}
    </div>
    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</div>
  </div>
);

// ── Chart Tooltip ──────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
      <p style={{ color: "var(--text-muted)", fontSize: "11px", marginBottom: "4px" }}>{label}</p>
      <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>
        {prefix}{typeof payload[0].value === "number" ? payload[0].value.toLocaleString("en-IN") : payload[0].value}{suffix}
      </p>
    </div>
  );
};

// ── Row Components ─────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--bg-active)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34 + "px", fontWeight: 700, color: "var(--accent-bright)", flexShrink: 0 }}>
    {name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
  </div>
);

const PaymentRow = ({ p }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Avatar name={p.full_name} />
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{p.full_name}</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.payment_for?.replace("_", " ")} · {p.payment_method}</div>
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-display)" }}>{fmt(p.amount)}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{fmtDate(p.payment_date)}</div>
    </div>
  </div>
);

const MemberRow = ({ m }) => {
  const statusColor = m.status === "active" ? "var(--green)" : m.status === "expired" ? "var(--red)" : "var(--yellow)";
  const statusBg    = m.status === "active" ? "var(--green-bg)" : m.status === "expired" ? "var(--red-bg)" : "var(--yellow-bg)";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Avatar name={m.full_name} />
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{m.full_name}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.membership_type} · {m.phone}</div>
        </div>
      </div>
      <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: statusBg, color: statusColor, textTransform: "capitalize" }}>{m.status}</span>
    </div>
  );
};

// ── Expired Members Modal ──────────────────────────────────────────────────────
function ExpiredMembersModal({ count, onClose, navigate }) {
  const [members,     setMembers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [phoneVis,    setPhoneVis]    = useState({});
  const [dueMap,      setDueMap]      = useState({});
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const fetchExpired = async (pg = 1) => {
    setLoading(true);
    try {
      // Fetch all members with large limit and filter by status client-side
      // (backend search is by name/email/phone, not status)
      const r = await api.get(`/members?page=1&limit=200`);
      const all = (r.data.data || []).filter(m => m.status === "expired");
      const perPage = 8;
      const start = (pg - 1) * perPage;
      const pageItems = all.slice(start, start + perPage);
      setMembers(pageItems);
      setTotal(all.length);
      setTotalPages(Math.ceil(all.length / perPage) || 1);
      // fetch dues for visible members
      const entries = await Promise.all(
        pageItems.map(async (m) => {
          try {
            const pr = await api.get(`/payments/member/${m.id}`);
            const pending = (pr.data.data || []).filter(p => p.status === "pending");
            const tot = pending.reduce((s, p) => s + Number(p.due_amount || p.amount || 0), 0);
            return [m.id, { total: tot, payments: pending, marking: false }];
          } catch { return [m.id, { total: 0, payments: [], marking: false }]; }
        })
      );
      setDueMap(Object.fromEntries(entries));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExpired(1); }, []);

  const markDuePaid = async (memberId) => {
    const info = dueMap[memberId];
    if (!info || info.payments.length === 0 || info.marking) return;
    setDueMap(prev => ({ ...prev, [memberId]: { ...prev[memberId], marking: true } }));
    try {
      await Promise.all(info.payments.map(p => {
        const totalAmt = Number(p.amount) || Number(p.due_amount) || 1;
        const payDate  = p.payment_date
          ? new Date(p.payment_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        return api.put(`/payments/${p.id}`, {
          member_id:      p.member_id,
          amount:         totalAmt,
          paid_amount:    totalAmt,
          due_amount:     0,
          payment_date:   payDate,
          payment_method: p.payment_method || "cash",
          payment_for:    p.payment_for    || "monthly",
          status:         "paid",
          months_covered: Number(p.months_covered) || 1,
          notes:          p.notes      || null,
          plan_name:      p.plan_name  || null,
          plan_start:     p.plan_start ? new Date(p.plan_start).toISOString().split("T")[0] : null,
          plan_end:       p.plan_end   ? new Date(p.plan_end).toISOString().split("T")[0]   : null,
        });
      }));
      setDueMap(prev => ({ ...prev, [memberId]: { total: 0, payments: [], marking: false } }));
    } catch { setDueMap(prev => ({ ...prev, [memberId]: { ...prev[memberId], marking: false } })); }
  };

  return (
    <div
      className="fade-in"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)", padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fade-up" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "560px", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaTimesCircle style={{ color: "var(--red)", fontSize: "16px" }} />
              Expired Members
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>{count} members with expired membership</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => { onClose(); navigate("/members"); }}
              style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
            >
              View All <FaArrowRight style={{ fontSize: "9px" }} />
            </button>
            <button onClick={onClose} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTimes style={{ fontSize: "11px" }} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: "12px", width: "45%", marginBottom: "6px" }} />
                  <div className="skeleton" style={{ height: "10px", width: "65%" }} />
                </div>
                <div className="skeleton" style={{ height: "24px", width: "70px", borderRadius: "6px" }} />
              </div>
            ))
          ) : members.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
              <FaCheckCircle style={{ fontSize: "28px", color: "var(--green)", marginBottom: "10px", display: "block", margin: "0 auto 10px" }} />
              No expired members found!
            </div>
          ) : (
            members.map(m => {
              const due = dueMap[m.id];
              const isPhoneVis = phoneVis[m.id];
              return (
                <div key={m.id} style={{ padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "12px", alignItems: "flex-start", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Avatar */}
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>
                    {m.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{m.full_name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                      <span>{isPhoneVis ? m.phone : m.phone ? "••••••" + m.phone.slice(-4) : "—"}</span>
                      {m.phone && (
                        <button
                          onClick={() => setPhoneVis(p => ({ ...p, [m.id]: !p[m.id] }))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex", alignItems: "center" }}
                        >
                          {isPhoneVis ? <FaEyeSlash style={{ fontSize: "10px" }} /> : <FaEye style={{ fontSize: "10px" }} />}
                        </button>
                      )}
                      <span style={{ color: "var(--border-default)" }}>·</span>
                      <span>{m.membership_type || "—"}</span>
                      <span style={{ color: "var(--border-default)" }}>·</span>
                      <span style={{ color: "var(--red)" }}>Expired {fmtDate(m.membership_end)}</span>
                    </div>

                    {/* Due badge */}
                    {due?.total > 0 && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "5px", padding: "3px 8px", borderRadius: "99px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#f59e0b" }}>Due ₹{Number(due.total).toLocaleString("en-IN")}</span>
                        <button
                          onClick={() => markDuePaid(m.id)}
                          disabled={due.marking}
                          style={{ background: "none", border: "none", cursor: due.marking ? "not-allowed" : "pointer", color: due.marking ? "var(--text-muted)" : "var(--green)", fontSize: "10px", fontWeight: 700, padding: 0, display: "flex", alignItems: "center", gap: "3px" }}
                        >
                          <FaCheck style={{ fontSize: "8px" }} />
                          {due.marking ? "..." : "Mark Paid"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expired badge */}
                  <span style={{ padding: "3px 8px", borderRadius: "99px", fontSize: "10px", fontWeight: 600, background: "var(--red-bg)", color: "var(--red)", flexShrink: 0, marginTop: "2px" }}>Expired</span>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => { setPage(p => p - 1); fetchExpired(page - 1); }} disabled={page === 1}
                style={{ padding: "5px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "12px" }}>‹</button>
              <button onClick={() => { setPage(p => p + 1); fetchExpired(page + 1); }} disabled={page === totalPages}
                style={{ padding: "5px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: page === totalPages ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: "12px" }}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SectionCard = ({ children, style = {} }) => (
  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "22px", ...style }}>
    {children}
  </div>
);

const SectionHeader = ({ title, sub, onNav }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
      {sub && <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "3px" }}>{sub}</p>}
    </div>
    {onNav && (
      <button onClick={onNav} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-muted)"; }}
      >View <FaArrowRight style={{ fontSize: "9px" }} /></button>
    )}
  </div>
);

const SkeletonRows = ({ n = 4 }) => [...Array(n)].map((_, i) => (
  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
    <div style={{ display: "flex", gap: "10px", flex: 1 }}>
      <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: "11px", width: "55%", marginBottom: "6px" }} />
        <div className="skeleton" style={{ height: "10px", width: "35%" }} />
      </div>
    </div>
    <div className="skeleton" style={{ height: "11px", width: "60px" }} />
  </div>
));

// ── Mobile Responsive Styles ──────────────────────────────────────────────────
const dashStyles = `
  .dash-main {
    flex: 1;
    padding: 32px 36px;
    overflow-y: auto;
    min-width: 0;
  }
  .dash-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .dash-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dash-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }
  .dash-drill-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }
  .dash-charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .dash-bottom-row {
    display: grid;
    grid-template-columns: 1fr 1.4fr 1.4fr;
    gap: 16px;
  }
  .dash-mini-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }
  .dash-role-pill {
    display: flex;
  }

  @media (max-width: 768px) {
    .dash-main {
      padding: 16px;
      padding-top: 64px; /* space for hamburger */
    }
    .dash-header-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    .dash-header-actions {
      width: 100%;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 8px;
    }
    .dash-role-pill {
      display: none;
    }
    .dash-stat-grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .dash-drill-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .dash-charts-row {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .dash-bottom-row {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .dash-mini-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 400px) {
    .dash-stat-grid {
      grid-template-columns: 1fr;
    }
    .dash-mini-grid {
      grid-template-columns: 1fr;
    }
    .dash-drill-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const { admin } = useAuth();

  const [attendStats,  setAttendStats]  = useState(null);
  const [weekly,       setWeekly]       = useState([]);
  const [payStats,     setPayStats]     = useState(null);
  const [trainerStats, setTrainerStats] = useState(null);
  const [recentPay,    setRecentPay]    = useState([]);
  const [recentMem,    setRecentMem]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);

  const [shown, setShown] = useState({ activeMembers: false, thisMonthRev: false });
  const toggle = (key) => setShown(s => ({ ...s, [key]: !s[key] }));
  const [showExpired,     setShowExpired]     = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [searchResults,   setSearchResults]   = useState([]);
  const [searchLoading,   setSearchLoading]   = useState(false);
  const [showSearchDrop,  setShowSearchDrop]  = useState(false);
  const [profileMember,   setProfileMember]   = useState(null);
  const searchTimer = useRef(null);

  const fetchAll = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [attendRes, weekRes, payRes, trainerRes, recentPayRes, recentMemRes] = await Promise.all([
        api.get("/attendance/stats/summary"),
        api.get("/attendance/stats/weekly"),
        api.get("/payments/stats/summary"),
        api.get("/trainers/stats/summary"),
        api.get("/payments", { params: { limit: 5, page: 1 } }),
        api.get("/members",  { params: { limit: 5, page: 1 } }),
      ]);
      setAttendStats(attendRes.data.data);
      setWeekly(weekRes.data.data.map(d => ({ ...d, label: new Date(d.day).toLocaleDateString("en-IN", { weekday: "short" }) })));
      setPayStats(payRes.data.data);
      setTrainerStats(trainerRes.data.data);
      setRecentPay(recentPayRes.data.data);
      setRecentMem(recentMemRes.data.data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    const interval = setInterval(() => fetchAll(true), 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); setShowSearchDrop(false); return; }
    setSearchLoading(true); setShowSearchDrop(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await api.get(`/members?page=1&limit=6&search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(r.data.data || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statusBreakdown = attendStats?.statusBreakdown || [];
  const activeMembers   = statusBreakdown.find(r => r.status === "active")?.count  || 0;
  const expiredMembers  = statusBreakdown.find(r => r.status === "expired")?.count || 0;
  const attendTrend     = attendStats ? (attendStats.todayCount - attendStats.yesterdayCount) : undefined;
  const payTrend        = payStats    ? (Number(payStats.thisMonth) - Number(payStats.lastMonth)) : undefined;

  const membershipPie = attendStats?.membershipBreakdown?.map(r => ({ name: r.membership_type, value: r.count })) || [];
  const PIE_COLORS    = ["#3b82f6", "#06b6d4", "#8b5cf6", "#34d399", "#fbbf24"];
  const revenueChart  = payStats?.monthly6 || [];

  // ── Pass stats in the required format to RevenueDrillDown ──
  const drillStats = {
    totalRevenue:    payStats?.totalRevenue    || 0,
    todayRevenue:    payStats?.todayRevenue    || 0,
    thisMonthRev:    payStats?.thisMonth       || 0,
    pendingPayments: payStats?.pendingCount    || 0,
    pendingAmount:   payStats?.pendingAmount   || 0,
    totalCount:      payStats?.totalCount      || 0,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", fontFamily: "var(--font-body)" }}>
      <style>{dashStyles}</style>
      <Sidebar onLogout={onLogout} />

      <main className="dash-main">

        {/* ── Header ── */}
        <div className="fade-up" style={{ marginBottom: "28px", position: "relative", zIndex: 100 }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "4px", letterSpacing: "0.02em" }}>
            {greet},{" "}
            <span style={{ background: "var(--grad-blue-cyan)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 600 }}>
              {admin?.name?.split(" ")[0] || "Admin"}
            </span> 👋
          </p>
          <div className="dash-header-row">
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", margin: 0 }}>
              Dashboard
            </h1>
            <div className="dash-header-actions">
              {/* ── Member Search ── */}
              <div style={{ position: "relative" }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) { setShowSearchDrop(false); } }}>
                <div style={{ position: "relative", width: "220px" }}>
                  <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px", pointerEvents: "none" }} />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowSearchDrop(true)}
                    placeholder="Search member..."
                    style={{ width: "100%", padding: "7px 28px 7px 30px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontSize: "12px", outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box" }}
                    onKeyDown={e => { if (e.key === "Escape") { setSearchQuery(""); setShowSearchDrop(false); } }}
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setShowSearchDrop(false); }} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex", alignItems: "center" }}>
                      <FaTimes style={{ fontSize: "10px" }} />
                    </button>
                  )}
                </div>
                {/* Dropdown */}
                {showSearchDrop && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 500, overflow: "hidden", minWidth: "260px" }}>
                    {searchLoading ? (
                      <div style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>No members found</div>
                    ) : (
                      searchResults.map(m => {
                        const statusColor = m.status === "active" ? "var(--green)" : m.status === "expired" ? "var(--red)" : "var(--yellow)";
                        return (
                          <div key={m.id}
                            tabIndex={0}
                            onClick={() => { setProfileMember(m); setSearchQuery(""); setShowSearchDrop(false); }}
                            onKeyDown={e => e.key === "Enter" && (() => { setProfileMember(m); setSearchQuery(""); setShowSearchDrop(false); })()}
                            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--bg-active)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "var(--accent-bright)", flexShrink: 0 }}>
                              {m.full_name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.full_name}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{m.phone} · {m.membership_type || "—"}</div>
                            </div>
                            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "99px", background: m.status === "active" ? "var(--green-bg)" : m.status === "expired" ? "var(--red-bg)" : "var(--yellow-bg)", color: statusColor, flexShrink: 0, textTransform: "capitalize" }}>{m.status}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {lastUpdated && (
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <button onClick={() => fetchAll(true)} disabled={refreshing}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: refreshing ? "not-allowed" : "pointer", fontSize: "12px", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                <FaSync style={{ fontSize: "10px", animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <NotificationBell />
              <div className="dash-role-pill" style={{ padding: "6px 12px", borderRadius: "99px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", fontSize: "11px", color: "var(--text-muted)", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
                {admin?.role?.replace("_", " ")}
              </div>
            </div>
          </div>
        </div>

        {/* ── Top Stat Cards (Attendance + Members + Trainers) ── */}
        <div className="dash-stat-grid">
          <StatCard icon={FaClipboardCheck} color="var(--green)" bg="var(--green-bg)"
            label="Today's Attendance" value={loading ? "—" : attendStats?.todayCount ?? 0}
            trend={attendTrend} delay={0.05} onClick={() => navigate("/attendance")} />

          <StatCard icon={FaUsers} color="var(--accent)" bg="var(--accent-subtle)"
            label="Active Members" value={loading ? "—" : activeMembers}
            sub={shown.activeMembers ? `${expiredMembers} expired` : undefined}
            delay={0.10} onClick={() => navigate("/members")}
            masked={!shown.activeMembers} onToggleMask={() => toggle("activeMembers")} />

          <StatCard icon={FaUserTie} color="var(--yellow)" bg="var(--yellow-bg)"
            label="Active Trainers" value={loading ? "—" : trainerStats?.active ?? 0}
            sub={`${trainerStats?.total ?? 0} total`} delay={0.15} onClick={() => navigate("/trainers")} />

          <StatCard icon={FaRupeeSign} color="var(--cyan)" bg="var(--cyan-bg)"
            label="This Month Rev" value={loading ? "—" : fmt(payStats?.thisMonth)}
            trend={shown.thisMonthRev ? payTrend : undefined} trendLabel="vs last month"
            delay={0.20} onClick={() => navigate("/payments")}
            masked={!shown.thisMonthRev} onToggleMask={() => toggle("thisMonthRev")} />
        </div>

        {/* ── Revenue Drill Down Section ── */}
        <div className="fade-up" style={{ marginBottom: "20px", animationDelay: "0.22s", opacity: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Revenue Overview
            </h2>
            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "99px", background: "var(--blue-bg, rgba(59,130,246,0.1))", color: "var(--blue)", border: "1px solid rgba(59,130,246,0.2)", fontWeight: 600 }}>
              Click to drill down
            </span>
          </div>
          {loading
            ? <div className="dash-drill-grid">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "12px" }} />
                ))}
              </div>
            : <RevenueDrillDown stats={drillStats} />
          }
        </div>

        {/* ── Mini Stats (Week checkins + expired) ── */}
        <div className="dash-mini-grid">
          <MiniStat icon={FaCheckCircle}         color="var(--green)"  label="Week Checkins"   value={loading ? "—" : attendStats?.weekCount ?? 0} delay={0.25} />
          <MiniStat icon={FaTimesCircle}         color="var(--red)"    label="Expired Members" value={loading ? "—" : expiredMembers}              delay={0.28} onClick={() => !loading && expiredMembers > 0 && setShowExpired(true)} />
        </div>

        {/* ── Charts Row ── */}
        <div className="dash-charts-row">
          <SectionCard>
            <SectionHeader title="Weekly Attendance" sub="Last 7 days check-ins" onNav={() => navigate("/attendance")} />
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={weekly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip suffix=" checkins" />} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#attendGrad)"
                  dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#60a5fa", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard>
            <SectionHeader title="Monthly Revenue" sub="Last 6 months" onNav={() => navigate("/payments")} />
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={revenueChart} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => "₹" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip content={<ChartTooltip prefix="₹" />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {revenueChart.map((_, i) => (
                    <Cell key={i} fill={i === revenueChart.length - 1 ? "#3b82f6" : "#1e3a5f"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* ── Bottom Row ── */}
        <div className="dash-bottom-row">
          <SectionCard>
            <SectionHeader title="Membership Types" sub="Distribution" />
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={membershipPie.length ? membershipPie : [{ name: "No data", value: 1 }]}
                  cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3} dataKey="value">
                  {(membershipPie.length ? membershipPie : [{ name: "No data" }]).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: "10px" }}>
              {membershipPie.map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: PIE_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader title="Recent Payments" sub="Latest 5 transactions" onNav={() => navigate("/payments")} />
            {loading ? <SkeletonRows n={4} /> :
              recentPay.length === 0
                ? <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>No payments yet</p>
                : recentPay.map(p => <PaymentRow key={p.id} p={p} />)
            }
          </SectionCard>

          <SectionCard>
            <SectionHeader title="Recent Members" sub="Latest 5 joined" onNav={() => navigate("/members")} />
            {loading ? <SkeletonRows n={4} /> :
              recentMem.length === 0
                ? <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>No members yet</p>
                : recentMem.map(m => <MemberRow key={m.id} m={m} />)
            }
          </SectionCard>
        </div>

      </main>

      {/* Expired Members Modal */}
      {showExpired && (
        <ExpiredMembersModal
          count={expiredMembers}
          onClose={() => setShowExpired(false)}
          navigate={navigate}
        />
      )}

      {/* Member Profile Drawer (from search) */}
      <MemberProfileDrawer
        member={profileMember}
        onClose={() => setProfileMember(null)}
        onEdit={() => { setProfileMember(null); navigate("/members"); }}
      />
    </div>
  );
}