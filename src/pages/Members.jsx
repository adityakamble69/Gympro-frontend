import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaPlus, FaSearch, FaTimes,
  FaUsers, FaUser,
  FaWhatsapp, FaCheck, FaPaperPlane, FaSyncAlt, FaTrash,
  FaEye, FaEyeSlash, FaFileInvoiceDollar, FaEdit, FaSave,
  FaEnvelope
} from "react-icons/fa";
import MemberProfileDrawer from "../components/MemberProfileDrawer";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  padding: "9px 12px", borderRadius: "var(--radius-sm)",
  background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
  color: "var(--text-primary)", fontSize: "13.5px", outline: "none",
  width: "100%", transition: "border-color 0.15s", fontFamily: "var(--font-body)"
};

const EMPTY = {
  full_name: "", phone: "", address: "",
  gender: "", date_of_birth: "", membership_type: "",
  membership_start: "", membership_end: "", status: "active"
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtLong = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const daysLeft = (end) => end ? Math.ceil((new Date(end) - new Date()) / 86400000) : null;

const DUR_COLOR = {
  monthly: ["var(--blue)", "rgba(96,165,250,0.1)"],
  quarterly: ["var(--yellow)", "rgba(251,191,36,0.1)"],
  yearly: ["var(--green)", "rgba(74,222,128,0.1)"],
};

const MembershipBadge = ({ type, plans }) => {
  const plan = plans.find(p => p.name === type || p.duration_type === type);
  const [color, bg] = DUR_COLOR[plan?.duration_type] || ["var(--text-muted)", "rgba(80,80,80,0.12)"];
  return <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "99px", background: bg, color, textTransform: "capitalize", whiteSpace: "nowrap" }}>{type || "—"}</span>;
};

const StatusBadge = ({ status }) => {
  const map = { active: ["var(--green)", "var(--green-bg)"], expired: ["var(--red)", "var(--red-bg)"], inactive: ["var(--text-muted)", "rgba(80,80,80,0.12)"] };
  const [color, bg] = map[status] || map.inactive;
  return <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "99px", background: bg, color, textTransform: "capitalize" }}>{status}</span>;
};

// ─── WhatsApp Templates ────────────────────────────────────────────────────────
const WA_TEMPLATES = {
  expiry_warning: (m) => `Hi ${m.full_name}! 👋\n\nYour *Workout World Gym* membership is expiring in *${daysLeft(m.membership_end) ?? "a few"} day(s)* (${fmtLong(m.membership_end)}).\n\nRenew now to continue your fitness journey! 💪\n\n_Team Workout World Gym_ ⚡`,
  payment_reminder: (m) => `Hi ${m.full_name}! 👋\n\nFriendly reminder — your *Workout World Gym* membership payment is pending.\n\nPlan: *${m.membership_type || "Membership"}*\nExpiry: *${fmtLong(m.membership_end)}*\n\nPlease clear your dues at the earliest. 🙏\n\n_Team Workout World Gym_ ⚡`,
  renewal_done: (m) => `Hi ${m.full_name}! 🎉\n\nYour *Workout World Gym* membership has been successfully *renewed*!\n\nPlan: *${m.membership_type || "Membership"}*\nValid Till: *${fmtLong(m.membership_end)}*\n\nThank you! See you at the gym! 🏋️‍♂️\n\n_Team Workout World Gym_ ⚡`,
  welcome: (m) => `Hi ${m.full_name}! 🎉\n\nWelcome to *Workout World Gym*! Your membership is now *active*.\n\nPlan: *${m.membership_type || "Standard"}*\nValid Till: *${fmtLong(m.membership_end)}*\n\nBring a valid ID on your first visit. Let's crush those goals! 💪\n\n_Team Workout World Gym_ ⚡`,
};

const NOTIFY_TYPES = [
  { key: "expiry_warning", icon: "⏰", label: "Expiry Warning", color: "#f59e0b", desc: "Membership khatam hone wali hai" },
  { key: "payment_reminder", icon: "💳", label: "Payment Due Reminder", color: "#ef4444", desc: "Payment pending — send a reminder" },
  { key: "renewal_done", icon: "✅", label: "Renewal Confirmation", color: "#10b981", desc: "Membership renewed — send confirmation" },
  { key: "welcome", icon: "🎉", label: "Welcome / Re-Welcome", color: "#6366f1", desc: "Welcome with membership details" },
];

// ─── Notify Modal ──────────────────────────────────────────────────────────────
function NotifyModal({ member, onClose }) {
  const [selType, setSelType] = useState("");
  const [result, setResult] = useState(null);
  const [waPreview, setWaPreview] = useState("");

  useEffect(() => { setSelType(""); setResult(null); setWaPreview(""); }, []);
  useEffect(() => {
    if (selType) setWaPreview(WA_TEMPLATES[selType]?.(member) || "");
    else setWaPreview("");
  }, [selType, member]);

  const openWhatsApp = () => {
    if (!waPreview || !member.phone) return;
    let phone = member.phone.replace(/[\s\-\(\)]/g, "");
    if (phone.startsWith("0")) phone = phone.slice(1);
    if (!phone.startsWith("+")) phone = "91" + phone;
    else phone = phone.replace("+", "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waPreview)}`, "_blank");
    setResult({ ok: true, msg: "WhatsApp opened! Send message from there." });
  };

  if (!member) return null;
  const days = daysLeft(member.membership_end);

  const TypeSelector = ({ value, onChange }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
      {NOTIFY_TYPES.map(t => (
        <div key={t.key} onClick={() => onChange(t.key)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: value === t.key ? `1px solid ${t.color}55` : "1px solid var(--border-default)", background: value === t.key ? `${t.color}10` : "var(--bg-elevated)", transition: "all 0.15s" }}>
          <span style={{ fontSize: "20px", lineHeight: 1 }}>{t.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{t.label}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{t.desc}</div>
          </div>
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: value === t.key ? `2px solid ${t.color}` : "2px solid var(--border-default)", background: value === t.key ? t.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {value === t.key && <FaCheck style={{ fontSize: "8px", color: "#fff" }} />}
          </div>
        </div>
      ))}
    </div>
  );

  const ResultBanner = () => result ? (
    <div style={{ padding: "11px 14px", borderRadius: "var(--radius-sm)", marginBottom: "14px", background: result.ok ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${result.ok ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, color: result.ok ? "var(--green)" : "var(--red)", fontSize: "13px" }}>
      {result.ok ? "✅" : "❌"} {result.msg}
    </div>
  ) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "500px", maxHeight: "88vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Notify Member</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>{member.full_name} · {member.phone || "No phone"}</p>
            </div>
            <button onClick={onClose} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTimes style={{ fontSize: "12px" }} />
            </button>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Plan: <strong style={{ color: "var(--text-secondary)" }}>{member.membership_type || "—"}</strong></span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Expiry: <strong style={{ color: days !== null && days <= 7 ? "var(--red)" : days !== null && days <= 15 ? "var(--yellow)" : "var(--text-secondary)" }}>{fmtLong(member.membership_end)}</strong></span>
            {days !== null && (
              <span style={{ fontSize: "11px", padding: "1px 8px", borderRadius: "99px", background: days <= 0 ? "var(--red-bg)" : days <= 7 ? "var(--red-bg)" : days <= 15 ? "var(--yellow-bg)" : "var(--green-bg)", color: days <= 0 ? "var(--red)" : days <= 7 ? "var(--red)" : days <= 15 ? "var(--yellow)" : "var(--green)", fontWeight: 600 }}>
                {days <= 0 ? "Expired" : `${days}d left`}
              </span>
            )}
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <>
            {!member.phone && <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", color: "var(--red)", fontSize: "13px", marginBottom: "14px", border: "1px solid rgba(248,113,113,0.2)" }}>⚠️ No phone number registered for this member.</div>}
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>Select message type:</p>
            <TypeSelector value={selType} onChange={setSelType} />
            {waPreview && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Message Preview</p>
                <div style={{ background: "#1a2e1a", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "var(--radius-sm)", padding: "14px 16px", fontSize: "12px", color: "#dcfce7", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "monospace", maxHeight: "160px", overflowY: "auto" }}>
                  {waPreview}
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>💡 Message will be pre-filled in WhatsApp — send from there</p>
              </div>
            )}
            <ResultBanner />
            <button onClick={openWhatsApp} disabled={!selType || !member.phone} style={{ width: "100%", padding: "11px", borderRadius: "var(--radius-sm)", background: (!selType || !member.phone) ? "var(--bg-elevated)" : "#25d366", color: (!selType || !member.phone) ? "var(--text-muted)" : "#fff", border: "none", cursor: (!selType || !member.phone) ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FaWhatsapp style={{ fontSize: "15px" }} />
              Open WhatsApp — {member.phone || "No phone"}
            </button>
          </>
        </div>
      </div>
    </div>
  );
}

// ─── View Bill Modal ───────────────────────────────────────────────────────────
function ViewBillModal({ member, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const r = await api.get(`/members/${member.id}/plan-history`);
        setHistory(r.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [member.id]);

  const fmtMonth = (d) => d ? new Date(d).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const openEdit = (row) => {
    setEditingId(row.id);
    setSaveError("");
    setEditForm({
      plan_name: row.plan_name || "",
      plan_start: row.plan_start ? new Date(row.plan_start).toISOString().split("T")[0] : "",
      plan_end: row.plan_end ? new Date(row.plan_end).toISOString().split("T")[0] : "",
      amount_paid: row.amount_paid != null ? String(row.amount_paid) : "",
      notes: row.notes || "",
    });
  };

  const handleSave = async () => {
    if (!editForm.plan_name || !editForm.plan_start) { setSaveError("Plan name aur start date required hai."); return; }
    setSaving(true); setSaveError("");
    try {
      await api.put(`/members/${member.id}/plan-history/${editingId}`, {
        plan_name: editForm.plan_name,
        plan_start: editForm.plan_start,
        plan_end: editForm.plan_end || null,
        amount_paid: Number(editForm.amount_paid) || 0,
        notes: editForm.notes || null,
      });
      // Refresh history
      const r = await api.get(`/members/${member.id}/plan-history`);
      setHistory(r.data.data || []);
      setEditingId(null);
    } catch (e) {
      setSaveError(e.response?.data?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const setEF = (k, v) => setEditForm(p => ({ ...p, [k]: v }));

  const editInputStyle = {
    padding: "6px 10px", borderRadius: "var(--radius-sm)",
    background: "var(--bg-base)", border: "1px solid var(--border-default)",
    color: "var(--text-primary)", fontSize: "12px", outline: "none",
    width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)"
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)", padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "720px", maxHeight: "88vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", flexShrink: 0 }}>
                <FaFileInvoiceDollar style={{ fontSize: "14px" }} />
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Membership Bills</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>{member.full_name} · {member.membership_type || "—"}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FaTimes style={{ fontSize: "12px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: "54px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", animation: "shimmer 1.4s infinite" }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
              <FaFileInvoiceDollar style={{ fontSize: "32px", opacity: 0.25, display: "block", margin: "0 auto 12px" }} />
              <p style={{ fontSize: "13px" }}>Koi bill history nahi mili.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {history.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <div key={row.id} style={{ borderRadius: "var(--radius-lg)", border: isEditing ? "1px solid rgba(96,165,250,0.45)" : "1px solid var(--border-default)", background: isEditing ? "rgba(96,165,250,0.04)" : "var(--bg-elevated)", overflow: "hidden", transition: "all 0.2s" }}>

                    {/* Row header — always visible */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", align: "center", gap: "16px", flexWrap: "wrap", flex: 1 }}>
                        {/* Month */}
                        <div style={{ minWidth: "110px" }}>
                          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Month</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{fmtMonth(row.plan_start)}</div>
                        </div>
                        {/* Period */}
                        <div style={{ minWidth: "180px" }}>
                          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Period</div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{fmtDate(row.plan_start)} <span style={{ color: "var(--text-muted)" }}>→</span> {fmtDate(row.plan_end)}</div>
                        </div>
                        {/* Plan */}
                        <div style={{ minWidth: "120px" }}>
                          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Plan</div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--blue)", textTransform: "capitalize" }}>{row.plan_name || "—"}</div>
                        </div>
                        {/* Amount */}
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Amount Paid</div>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--green)", fontFamily: "var(--font-display)" }}>₹{Number(row.amount_paid || 0).toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                      {/* Edit button */}
                      {!isEditing && (
                        <button onClick={() => openEdit(row)}
                          style={{ padding: "5px 11px", borderRadius: "var(--radius-sm)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600, flexShrink: 0, transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)"; e.currentTarget.style.color = "var(--blue)"; e.currentTarget.style.background = "rgba(96,165,250,0.07)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-surface)"; }}>
                          <FaEdit style={{ fontSize: "10px" }} /> Edit Bill
                        </button>
                      )}
                    </div>

                    {/* Edit form — slides open */}
                    {isEditing && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-subtle)" }}>
                        <div style={{ paddingTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>Plan Name *</label>
                            <input style={editInputStyle} value={editForm.plan_name} onChange={e => setEF("plan_name", e.target.value)} placeholder="e.g. Monthly Plan" />
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>Amount Paid (₹)</label>
                            <input style={editInputStyle} type="number" min="0" value={editForm.amount_paid} onChange={e => setEF("amount_paid", e.target.value)} placeholder="0" />
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>Start Date *</label>
                            <input style={editInputStyle} type="date" value={editForm.plan_start} onChange={e => setEF("plan_start", e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>End Date</label>
                            <input style={editInputStyle} type="date" value={editForm.plan_end} onChange={e => setEF("plan_end", e.target.value)} />
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>Notes</label>
                            <input style={editInputStyle} value={editForm.notes} onChange={e => setEF("notes", e.target.value)} placeholder="Optional note..." />
                          </div>
                        </div>
                        {saveError && <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--red)", fontSize: "12px" }}>⚠️ {saveError}</div>}
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-end" }}>
                          <button onClick={() => { setEditingId(null); setSaveError(""); }}
                            style={{ padding: "7px 16px", borderRadius: "var(--radius-sm)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px" }}>
                            Cancel
                          </button>
                          <button onClick={handleSave} disabled={saving}
                            style={{ padding: "7px 18px", borderRadius: "var(--radius-sm)", background: saving ? "var(--bg-elevated)" : "var(--blue)", border: "none", color: saving ? "var(--text-muted)" : "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaSave style={{ fontSize: "10px" }} /> {saving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notes preview (when not editing) */}
                    {!isEditing && row.notes && (
                      <div style={{ padding: "6px 16px 10px", borderTop: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>📝 {row.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "8px 22px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Renew Modal ───────────────────────────────────────────────────────────────
function RenewModal({ member, plans, plansByType, onClose, onSuccess }) {
  const TYPE_LABEL = { monthly: "Monthly Plans", quarterly: "Quarterly Plans", yearly: "Yearly Plans" };
  const [selectedPlan, setSelectedPlan] = useState(member.membership_type || "");
  const [startFrom, setStartFrom] = useState("today");
  const [paidAmount, setPaidAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingPayments, setPendingPayments] = useState([]);
  const [collectPending, setCollectPending] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [dueDate, setDueDate] = useState("");

  const plan = plans.find(p => p.name === selectedPlan);
  const days = daysLeft(member.membership_end);
  const planPrice = plan ? Number(plan.price) : 0;

  const discountAmt = (() => {
    const v = Number(discountValue) || 0;
    if (discountType === "percent") return Math.min(planPrice, Math.round(planPrice * v / 100));
    return Math.min(planPrice, v);
  })();
  const afterDiscount = Math.max(0, planPrice - discountAmt);

  useEffect(() => {
    if (plan) {
      const v = Number(discountValue) || 0;
      const disc = discountType === "percent"
        ? Math.min(Number(plan.price), Math.round(Number(plan.price) * v / 100))
        : Math.min(Number(plan.price), v);
      setPaidAmount(String(Math.max(0, Number(plan.price) - disc)));
    }
  }, [plan?.id, discountValue, discountType]);

  useEffect(() => {
    const fetchPending = async () => {
      setPendingLoading(true);
      try {
        const r = await api.get(`/payments/member/${member.id}`);
        const pending = (r.data.data || []).filter(p => p.status === "pending");
        setPendingPayments(pending);
      } catch (e) { }
      finally { setPendingLoading(false); }
    };
    fetchPending();
  }, [member.id]);

  const totalPending = pendingPayments.reduce((s, p) => s + Number(p.due_amount || p.amount || 0), 0);

  const calcDates = () => {
    if (!plan) return { start: null, end: null };
    const base = startFrom === "expiry" && member.membership_end && days > 0
      ? new Date(member.membership_end) : new Date();
    const end = new Date(base);
    end.setDate(end.getDate() + plan.duration_days);
    return { start: base.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
  };

  const { start: newStart, end: newEnd } = calcDates();

  const handleRenew = async () => {
    setError("");
    if (!selectedPlan) { setError("Please select a plan."); return; }
    if (!paidAmount || isNaN(paidAmount) || Number(paidAmount) < 0) { setError("Please enter a valid amount."); return; }
    setSaving(true);
    try {
      await api.put(`/members/${member.id}`, {
        full_name: member.full_name, email: member.email, phone: member.phone,
        address: member.address || "", gender: member.gender || "",
        date_of_birth: member.date_of_birth?.split("T")[0] || "",
        membership_type: selectedPlan, membership_start: newStart, membership_end: newEnd, status: "active",
      });
      const finalPrice = afterDiscount;
      const paidAmt = Number(paidAmount);
      const dueAmt = Math.max(0, finalPrice - paidAmt);
      await api.post("/payments", {
        member_id: member.id, amount: finalPrice, paid_amount: paidAmt, due_amount: dueAmt,
        discount_amount: discountAmt, discount_type: discountAmt > 0 ? discountType : null,
        payment_for: plan?.duration_type || "monthly", payment_method: payMethod,
        payment_date: new Date().toISOString().split("T")[0],
        due_date: dueAmt > 0 && dueDate ? dueDate : undefined,
        status: dueAmt > 0 ? "pending" : "paid",
        notes: notes || `Renewal — ${selectedPlan}`,
        plan_name: selectedPlan, plan_start: newStart, plan_end: newEnd,
        months_covered: plan ? Math.round(plan.duration_days / 30) : 1,
      });
      if (collectPending && pendingPayments.length > 0) {
        await Promise.all(pendingPayments.map(p =>
          api.put(`/payments/${p.id}`, {
            member_id: p.member_id, amount: Number(p.amount), paid_amount: Number(p.amount), due_amount: 0,
            payment_date: new Date().toISOString().split("T")[0], payment_method: payMethod,
            payment_for: p.payment_for || "monthly", status: "paid",
            months_covered: p.months_covered || 1, notes: p.notes || null,
            plan_name: p.plan_name || null, plan_start: p.plan_start || null, plan_end: p.plan_end || null,
          })
        ));
      }
      onSuccess();
    } catch (e) { setError(e.response?.data?.message || "Renewal failed. Try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fade-up" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaSyncAlt style={{ fontSize: "14px", color: "var(--green)" }} /> Renew Membership
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>{member.full_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTimes style={{ fontSize: "12px" }} />
          </button>
        </div>

        <div style={{ margin: "16px 24px", padding: "12px 16px", borderRadius: "var(--radius-sm)", background: days !== null && days <= 0 ? "var(--red-bg)" : "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Current Plan</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{member.membership_type || "No Plan"}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{fmt(member.membership_start)} → {fmt(member.membership_end)}</div>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, background: days === null ? "rgba(80,80,80,0.12)" : days <= 0 ? "var(--red-bg)" : days <= 7 ? "var(--red-bg)" : days <= 15 ? "var(--yellow-bg)" : "var(--green-bg)", color: days === null ? "var(--text-muted)" : days <= 0 ? "var(--red)" : days <= 7 ? "var(--red)" : days <= 15 ? "var(--yellow)" : "var(--green)" }}>
              {days === null ? "—" : days <= 0 ? "Expired" : `${days}d left`}
            </span>
          </div>
        </div>

        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {!pendingLoading && totalPending > 0 && (
            <div style={{ borderRadius: "var(--radius-sm)", border: "1px solid rgba(248,113,113,0.3)", background: "var(--red-bg)", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--red)" }}>⚠️ Pending Due: ₹{totalPending.toLocaleString("en-IN")}</span>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <input type="checkbox" checked={collectPending} onChange={e => setCollectPending(e.target.checked)} />
                  Collect now
                </label>
              </div>
            </div>
          )}

          <Field label="New Plan *">
            <select style={inputStyle} value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}>
              <option value="">— Select a Plan —</option>
              {Object.entries(plansByType).map(([type, list]) => (
                <optgroup key={type} label={TYPE_LABEL[type] || type}>
                  {list.map(p => <option key={p.id} value={p.name}>{p.name} — ₹{Number(p.price).toLocaleString("en-IN")} / {p.duration_days} days</option>)}
                </optgroup>
              ))}
            </select>
            {plan && (
              <div style={{ marginTop: "6px", padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Duration: <strong style={{ color: "var(--text-secondary)" }}>{plan.duration_days} days</strong></span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Price: <strong style={{ color: "var(--green)" }}>₹{Number(plan.price).toLocaleString("en-IN")}</strong></span>
              </div>
            )}
          </Field>

          <Field label="Start From">
            <div style={{ display: "flex", gap: "8px" }}>
              {[["today", "Today"], ["expiry", "After Expiry"]].map(([v, l]) => (
                <button key={v} onClick={() => setStartFrom(v)} style={{ flex: 1, padding: "8px", borderRadius: "var(--radius-sm)", border: startFrom === v ? "1px solid var(--green)" : "1px solid var(--border-default)", background: startFrom === v ? "var(--green-bg)" : "var(--bg-elevated)", color: startFrom === v ? "var(--green)" : "var(--text-muted)", cursor: "pointer", fontSize: "12px", fontWeight: startFrom === v ? 700 : 400 }}>{l}</button>
              ))}
            </div>
            {plan && newStart && newEnd && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>📅 {fmt(newStart)} → {fmt(newEnd)}</div>}
          </Field>

          <Field label="Discount (Optional)">
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ display: "flex", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", overflow: "hidden", flexShrink: 0 }}>
                {[{ val: "flat", label: "₹" }, { val: "percent", label: "%" }].map(opt => (
                  <button key={opt.val} type="button" onClick={() => { setDiscountType(opt.val); setDiscountValue(""); }}
                    style={{ padding: "9px 14px", background: discountType === opt.val ? "var(--bg-active, rgba(255,255,255,0.08))" : "var(--bg-elevated)", border: "none", color: discountType === opt.val ? "var(--text-primary)" : "var(--text-muted)", cursor: "pointer", fontWeight: discountType === opt.val ? 700 : 400, fontSize: "13px" }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <input style={{ ...inputStyle, flex: 1 }} type="number" min="0" value={discountValue}
                placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 200"}
                onChange={e => setDiscountValue(e.target.value)} />
            </div>
            {discountAmt > 0 && plan && (
              <div style={{ marginTop: "6px", display: "flex", gap: "10px", padding: "7px 12px", borderRadius: "var(--radius-sm)", background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "line-through" }}>₹{planPrice.toLocaleString("en-IN")}</span>
                <span style={{ fontSize: "11px", color: "var(--red)" }}>− ₹{discountAmt.toLocaleString("en-IN")}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }}>= ₹{afterDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Amount Paid (₹) *">
              <input style={inputStyle} type="number" min="0" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Payment Method">
              <select style={inputStyle} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="cash">💵 Cash</option>
                <option value="upi">📱 UPI</option>
                <option value="card">💳 Card</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="cheque">📄 Cheque</option>
              </select>
            </Field>
          </div>

          {plan && (() => {
            const paid = Number(paidAmount) || 0;
            const due = Math.max(0, afterDiscount - paid);
            const isPartial = due > 0;
            return (
              <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: isPartial ? "rgba(245,158,11,0.07)" : "rgba(74,222,128,0.06)", border: `1px solid ${isPartial ? "rgba(245,158,11,0.3)" : "rgba(74,222,128,0.25)"}` }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Payment Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {discountAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span style={{ color: "var(--text-muted)" }}>Discount</span><span style={{ color: "var(--red)", fontWeight: 600 }}>− ₹{discountAmt.toLocaleString("en-IN")}</span></div>}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span style={{ color: "var(--text-muted)" }}>Payable</span><span style={{ color: "var(--text-primary)", fontWeight: 700 }}>₹{afterDiscount.toLocaleString("en-IN")}</span></div>
                  <div style={{ height: "1px", background: "var(--border-subtle)", margin: "2px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ fontWeight: 700, color: isPartial ? "#f59e0b" : "var(--green)" }}>{isPartial ? "⚠️ Balance Due" : "✅ Fully Paid"}</span>
                    <span style={{ fontWeight: 800, color: isPartial ? "#f59e0b" : "var(--green)", fontFamily: "var(--font-display)" }}>₹{due.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {plan && (() => {
            const paid = Number(paidAmount) || 0;
            const due = Math.max(0, afterDiscount - paid);
            if (due <= 0) return null;
            const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
            return (
              <Field label="Promise to Pay by (Optional)">
                <input style={{ ...inputStyle, borderColor: dueDate ? "rgba(245,158,11,0.5)" : "var(--border-default)" }}
                  type="date" min={minDate.toISOString().split("T")[0]} value={dueDate}
                  onChange={e => setDueDate(e.target.value)} />
                {dueDate && <p style={{ fontSize: "11px", color: "#f59e0b", margin: "4px 0 0" }}>⏰ Reminder set for {fmt(dueDate)}</p>}
              </Field>
            );
          })()}

          <Field label="Notes (Optional)">
            <input style={inputStyle} value={notes} placeholder={`Renewal — ${selectedPlan || "Plan"}`} onChange={e => setNotes(e.target.value)} />
          </Field>

          {error && <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--red)", fontSize: "13px" }}>⚠️ {error}</div>}

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
            <button onClick={handleRenew} disabled={saving} style={{ flex: 2, padding: "10px", borderRadius: "var(--radius-sm)", background: saving ? "var(--bg-elevated)" : "var(--green-bg)", border: saving ? "1px solid var(--border-default)" : "1px solid rgba(74,222,128,0.4)", color: saving ? "var(--text-muted)" : "var(--green)", cursor: saving ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              <FaSyncAlt style={{ fontSize: "11px" }} /> {saving ? "Renewing..." : "CONFIRM RENEWAL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Member Card ────────────────────────────────────────────────────────
const MemberCard = ({ m, plans, onProfile, onRenew, onViewBill, onNotify, onDelete, dueInfo, onMarkPaid, phoneVisible, onTogglePhone }) => {
  const days = daysLeft(m.membership_end);
  const warn = days !== null && days <= 7 && days >= 0;
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div onClick={() => onProfile(m)} style={{ cursor: "pointer", flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "5px" }}>
            <FaUser style={{ fontSize: "9px", opacity: 0.4 }} /> {m.full_name}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span>{phoneVisible[m.id] ? m.phone : m.phone ? "••••••" + m.phone.slice(-4) : "—"}</span>
            {m.phone && (
              <button onClick={e => { e.stopPropagation(); onTogglePhone(m.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex", alignItems: "center" }}>
                {phoneVisible[m.id] ? <FaEyeSlash style={{ fontSize: "11px" }} /> : <FaEye style={{ fontSize: "11px" }} />}
              </button>
            )}
            <span>· {m.email}</span>
          </div>
        </div>
        <StatusBadge status={m.status} />
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <MembershipBadge type={m.membership_type} plans={plans} />
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{fmt(m.membership_start)} → {fmt(m.membership_end)}</span>
        {days !== null && (
          <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "99px", fontWeight: 600, background: days <= 0 ? "var(--red-bg)" : days <= 7 ? "var(--red-bg)" : "var(--green-bg)", color: days <= 0 ? "var(--red)" : days <= 7 ? "var(--red)" : "var(--green)" }}>
            {days <= 0 ? "Expired" : `${days}d left`}
          </span>
        )}
      </div>
      {dueInfo?.total > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: "var(--radius-sm)", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Due:</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b" }}>₹{Number(dueInfo.total).toLocaleString("en-IN")}</span>
          </div>
          <button onClick={() => onMarkPaid(m.id)} disabled={dueInfo?.marking}
            style={{ padding: "3px 8px", borderRadius: "var(--radius-sm)", background: dueInfo?.marking ? "var(--bg-elevated)" : "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: dueInfo?.marking ? "var(--text-muted)" : "var(--green)", cursor: dueInfo?.marking ? "not-allowed" : "pointer", fontSize: "10px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <FaCheck style={{ fontSize: "8px" }} />
            {dueInfo?.marking ? "Marking..." : "Mark Paid"}
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <button onClick={() => onRenew(m)} style={{ padding: "5px 10px", borderRadius: "var(--radius-sm)", background: "var(--green-bg)", border: "1px solid rgba(74,222,128,0.25)", color: "var(--green)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}><FaSyncAlt style={{ fontSize: "10px" }} /> Renew</button>
        <button onClick={() => onViewBill(m)} style={{ padding: "5px 10px", borderRadius: "var(--radius-sm)", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)", color: "var(--blue)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}><FaFileInvoiceDollar style={{ fontSize: "10px" }} /> Bill</button>
        <button onClick={() => onNotify(m)} style={{ padding: "5px 10px", borderRadius: "var(--radius-sm)", background: warn ? "rgba(245,158,11,0.1)" : "var(--bg-elevated)", border: warn ? "1px solid rgba(245,158,11,0.35)" : "1px solid var(--border-default)", color: warn ? "#f59e0b" : "var(--text-secondary)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}><FaEnvelope style={{ fontSize: "10px" }} /> Notify</button>
        <button onClick={() => onDelete(m.id)} style={{ padding: "5px 9px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center" }}><FaTrash style={{ fontSize: "10px" }} /></button>
      </div>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const membersStyles = `
  .members-main {
    flex: 1;
    padding: 32px 36px;
    overflow-y: auto;
    min-width: 0;
    height: 100vh;
  }
  .members-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .members-table-wrap { display: block; }
  .members-cards-wrap { display: none; }
  .modal-inner { padding: 28px; width: 100%; max-width: 580px; }
  .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .skeleton { background: var(--bg-elevated); border-radius: 4px; animation: shimmer 1.4s infinite; }
  @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.3s ease both; }
  .fade-in { animation: fadeUp 0.2s ease both; }
  .stagger-1 { animation-delay: 0.05s; }
  @media (max-width: 768px) {
    .members-main { padding: 16px; padding-top: 64px; }
    .members-header { flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .members-header button { width: 100%; justify-content: center; }
    .members-table-wrap { display: none; }
    .members-cards-wrap { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
    .modal-inner { padding: 20px 16px; max-width: 100%; border-radius: var(--radius-lg) !important; margin: 8px; width: calc(100% - 16px) !important; }
    .modal-form-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Members({ onLogout }) {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "expired"
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifyMember, setNotifyMember] = useState(null);
  const [profileMember, setProfileMember] = useState(null);
  const [renewMember, setRenewMember] = useState(null);
  const [viewBillMember, setViewBillMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [phoneVisible, setPhoneVisible] = useState({});
  const [dueMap, setDueMap] = useState({});

  const mainRef = useRef(null);
  const sentinelRef = useRef(null);
  const searchTimer = useRef(null);
  const isFetching = useRef(false);

  // ── Fetch members ──────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async (page = 1, q = "", append = false, status = "all") => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const statusParam = status !== "all" ? `&status=${status}` : "";
      const r = await api.get(`/members?page=${page}&limit=15&search=${encodeURIComponent(q)}${statusParam}`);
      const newData = r.data.data || [];
      const pag = r.data.pagination || {};
      setMembers(prev => append ? [...prev, ...newData] : newData);
      setTotalCount(pag.total || 0);
      setCurrentPage(pag.page || 1);
      setHasMore((pag.page || 1) < (pag.totalPages || 1));
      fetchDuesForMembers(newData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); isFetching.current = false; }
  }, []);

  const fetchPlans = async () => {
    try { const r = await api.get("/membership-plans?status=active"); setPlans(r.data.data || []); } catch (e) { }
  };

  // Initial load
  useEffect(() => { fetchMembers(1, "", false, "all"); fetchPlans(); }, []);

  // Search + filter change — reset list
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setMembers([]);
      setHasMore(true);
      setCurrentPage(1);
      fetchMembers(1, search, false, statusFilter);
    }, 380);
    return () => clearTimeout(searchTimer.current);
  }, [search, statusFilter]);

  // ── Infinite scroll observer ───────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = mainRef.current;
    if (!sentinel || !container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMembers(currentPage + 1, search, true, statusFilter);
        }
      },
      { root: container, threshold: 0.1, rootMargin: "120px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, currentPage, search, statusFilter, fetchMembers]);

  // ── Dues ───────────────────────────────────────────────────────────────────
  const fetchDuesForMembers = async (mems) => {
    if (!mems.length) return;
    const entries = await Promise.all(
      mems.map(async (m) => {
        try {
          const r = await api.get(`/payments/member/${m.id}`);
          const pending = (r.data.data || []).filter(p => p.status === "pending");
          const total = pending.reduce((s, p) => s + Number(p.due_amount || p.amount || 0), 0);
          return [m.id, { total, payments: pending, loading: false, marking: false }];
        } catch {
          return [m.id, { total: 0, payments: [], loading: false, marking: false }];
        }
      })
    );
    setDueMap(prev => ({ ...prev, ...Object.fromEntries(entries) }));
  };

  const markDuePaid = async (memberId) => {
    const info = dueMap[memberId];
    if (!info || info.payments.length === 0 || info.marking) return;
    setDueMap(prev => ({ ...prev, [memberId]: { ...prev[memberId], marking: true } }));
    try {
      await Promise.all(info.payments.map(p => {
        const totalAmt = Number(p.amount) || Number(p.due_amount) || 1;
        const payDate = p.payment_date ? new Date(p.payment_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
        return api.put(`/payments/${p.id}`, {
          member_id: p.member_id, amount: totalAmt, paid_amount: totalAmt, due_amount: 0,
          payment_date: payDate, payment_method: p.payment_method || "cash",
          payment_for: p.payment_for || "monthly", status: "paid",
          months_covered: Number(p.months_covered) || 1, notes: p.notes || null,
          plan_name: p.plan_name || null,
          plan_start: p.plan_start ? new Date(p.plan_start).toISOString().split("T")[0] : null,
          plan_end: p.plan_end ? new Date(p.plan_end).toISOString().split("T")[0] : null,
        });
      }));
      setDueMap(prev => ({ ...prev, [memberId]: { total: 0, payments: [], loading: false, marking: false } }));
    } catch (e) {
      console.error(e);
      setDueMap(prev => ({ ...prev, [memberId]: { ...prev[memberId], marking: false } }));
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePlanSelect = (planName) => {
    setF("membership_type", planName);
    const p = plans.find(pl => pl.name === planName);
    if (p) {
      const start = new Date(), end = new Date();
      end.setDate(end.getDate() + p.duration_days);
      setF("membership_start", start.toISOString().split("T")[0]);
      setF("membership_end", end.toISOString().split("T")[0]);
    }
  };

  const openAdd = () => { setForm(EMPTY); setEditingId(null); setFormError(""); setShowModal(true); };
  const openEdit = (m) => {
    setForm({ full_name: m.full_name || "", email: m.email || "", phone: m.phone || "", address: m.address || "", gender: m.gender || "", date_of_birth: m.date_of_birth?.split("T")[0] || "", membership_type: m.membership_type || "", membership_start: m.membership_start?.split("T")[0] || "", membership_end: m.membership_end?.split("T")[0] || "", status: m.status || "active" });
    setEditingId(m.id); setFormError(""); setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.full_name || !form.email || !form.phone) { setFormError("Name, email, and phone are required."); return; }
    setSaving(true);
    try {
      if (editingId) await api.put(`/members/${editingId}`, form);
      else await api.post("/members", form);
      setShowModal(false);
      setMembers([]); setHasMore(true); setCurrentPage(1);
      fetchMembers(1, search, false);
    } catch (e) { setFormError(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/members/${deleteId}`);
      setDeleteId(null);
      setMembers([]); setHasMore(true); setCurrentPage(1);
      fetchMembers(1, search, false);
    } catch (e) { console.error(e); }
  };

  const refreshList = () => { setMembers([]); setHasMore(true); setCurrentPage(1); fetchMembers(1, search, false); };

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const plansByType = plans.reduce((a, p) => { if (!a[p.duration_type]) a[p.duration_type] = []; a[p.duration_type].push(p); return a; }, {});
  const TYPE_LABEL = { monthly: "Monthly Plans", quarterly: "Quarterly Plans", yearly: "Yearly Plans" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", fontFamily: "var(--font-body)" }}>
      <style>{membersStyles}</style>
      <Sidebar onLogout={onLogout} />

      {/* ── Scrollable main — ref attached here ── */}
      <main className="members-main" ref={mainRef}>

        {/* Header */}
        <div className="fade-up members-header">
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", margin: 0 }}>Members</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{totalCount} total member{totalCount !== 1 ? "s" : ""} registered</p>
          </div>
          <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "var(--radius-sm)", background: "var(--text-primary)", color: "#0a0a0a", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.03em", transition: "opacity 0.15s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <FaPlus style={{ fontSize: "11px" }} /> ADD MEMBER
          </button>
        </div>

        {/* Table Card */}
        <div className="fade-up stagger-1" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>

          {/* Search */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "12px" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone…" style={{ ...inputStyle, paddingLeft: "34px", width: "100%", boxSizing: "border-box" }} />
            </div>
            {search && <button onClick={() => setSearch("")} style={{ padding: "8px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><FaTimes style={{ fontSize: "12px" }} /></button>}
          </div>

          {/* Desktop Table */}
          <div className="members-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "var(--bg-elevated)" }}>
                  {["Name", "Contact", "Membership Plan", "Due Amount", "Period", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                          <div style={{ height: "12px", borderRadius: "4px", background: "var(--bg-elevated)", width: j === 0 ? "140px" : "80px" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                    <FaUsers style={{ fontSize: "32px", opacity: 0.3, display: "block", margin: "0 auto 12px" }} />
                    {search ? `No members match "${search}"` : "No members yet. Add your first one!"}
                  </td></tr>
                ) : (
                  members.map(m => {
                    const days = daysLeft(m.membership_end);
                    const warn = days !== null && days <= 7 && days >= 0;
                    return (
                      <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 14px" }}>
                          <div onClick={() => setProfileMember(m)} style={{ fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--blue)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}>
                            <FaUser style={{ fontSize: "9px", opacity: 0.4 }} /> {m.full_name}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{m.email}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ color: "var(--text-secondary)" }}>{m.email || "—"}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
                            <span>{phoneVisible[m.id] ? m.phone : m.phone ? "••••••" + m.phone.slice(-4) : "—"}</span>
                            {m.phone && (
                              <button onClick={() => setPhoneVisible(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex", alignItems: "center" }}>
                                {phoneVisible[m.id] ? <FaEyeSlash style={{ fontSize: "11px" }} /> : <FaEye style={{ fontSize: "11px" }} />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}><MembershipBadge type={m.membership_type} plans={plans} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          {dueMap[m.id]?.total > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b" }}>₹{Number(dueMap[m.id].total).toLocaleString("en-IN")}</span>
                              <button onClick={() => markDuePaid(m.id)} disabled={dueMap[m.id]?.marking}
                                style={{ padding: "3px 8px", borderRadius: "var(--radius-sm)", background: dueMap[m.id]?.marking ? "var(--bg-elevated)" : "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: dueMap[m.id]?.marking ? "var(--text-muted)" : "var(--green)", cursor: dueMap[m.id]?.marking ? "not-allowed" : "pointer", fontSize: "10px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                                <FaCheck style={{ fontSize: "8px" }} />
                                {dueMap[m.id]?.marking ? "Marking..." : "Mark Paid"}
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{fmt(m.membership_start)}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>→ {fmt(m.membership_end)}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={m.status} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            <button onClick={() => setRenewMember(m)} title="Renew" style={{ padding: "5px 9px", borderRadius: "var(--radius-sm)", background: "var(--green-bg)", border: "1px solid rgba(74,222,128,0.25)", color: "var(--green)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                              <FaSyncAlt style={{ fontSize: "10px" }} /> Renew
                            </button>
                            <button onClick={() => setViewBillMember(m)} title="View Bill"
                              style={{ padding: "5px 9px", borderRadius: "var(--radius-sm)", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)", color: "var(--blue)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.16)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.08)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.25)"; }}>
                              <FaFileInvoiceDollar style={{ fontSize: "10px" }} /> Bill
                            </button>
                            <button onClick={() => setNotifyMember(m)} title="Notify"
                              style={{ padding: "5px 9px", borderRadius: "var(--radius-sm)", background: warn ? "rgba(245,158,11,0.1)" : "var(--bg-elevated)", border: warn ? "1px solid rgba(245,158,11,0.35)" : "1px solid var(--border-default)", color: warn ? "#f59e0b" : "var(--text-secondary)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,211,102,0.1)"; e.currentTarget.style.borderColor = "#25d36655"; e.currentTarget.style.color = "#25d366"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = warn ? "rgba(245,158,11,0.1)" : "var(--bg-elevated)"; e.currentTarget.style.borderColor = warn ? "rgba(245,158,11,0.35)" : "var(--border-default)"; e.currentTarget.style.color = warn ? "#f59e0b" : "var(--text-secondary)"; }}>
                              <FaEnvelope style={{ fontSize: "10px" }} /> Notify
                            </button>
                            <button onClick={() => setDeleteId(m.id)} title="Delete"
                              style={{ padding: "5px 8px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "var(--red-bg)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; e.currentTarget.style.color = "var(--red)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                              <FaTrash style={{ fontSize: "10px" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="members-cards-wrap">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="skeleton" style={{ height: "14px", width: "55%" }} />
                  <div className="skeleton" style={{ height: "11px", width: "75%" }} />
                  <div className="skeleton" style={{ height: "11px", width: "45%" }} />
                </div>
              ))
            ) : members.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                <FaUsers style={{ fontSize: "32px", opacity: 0.3, display: "block", margin: "0 auto 12px" }} />
                {search ? `No members match "${search}"` : "No members yet."}
              </div>
            ) : (
              members.map(m => (
                <MemberCard key={m.id} m={m} plans={plans}
                  onProfile={setProfileMember} onRenew={setRenewMember}
                  onViewBill={setViewBillMember}
                  onNotify={setNotifyMember} onDelete={setDeleteId}
                  dueInfo={dueMap[m.id]} onMarkPaid={markDuePaid}
                  phoneVisible={phoneVisible}
                  onTogglePhone={(id) => setPhoneVisible(prev => ({ ...prev, [id]: !prev[id] }))}
                />
              ))
            )}
          </div>

          {/* ── Infinite Scroll Sentinel ── */}
          <div ref={sentinelRef} style={{ padding: "20px", textAlign: "center", borderTop: members.length > 0 ? "1px solid var(--border-subtle)" : "none" }}>
            {loadingMore && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--text-muted)", fontSize: "13px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid var(--border-default)", borderTopColor: "var(--text-primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                Loading more members...
              </div>
            )}
            {!loading && !loadingMore && !hasMore && members.length > 0 && (
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>✅ All {totalCount} members loaded</div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {notifyMember && <NotifyModal member={notifyMember} onClose={() => setNotifyMember(null)} />}

      <MemberProfileDrawer
        member={profileMember}
        onClose={() => setProfileMember(null)}
        onEdit={(m) => { setProfileMember(null); openEdit(m); }}
      />

      {showModal && (
        <div className="fade-in" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)", padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="fade-up modal-inner" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{editingId ? "Edit Member" : "Add Member"}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>{editingId ? "Update member details" : "Register a new gym member"}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><FaTimes style={{ fontSize: "12px" }} /></button>
            </div>
            <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "22px" }} />
            <div className="modal-form-grid">
              <div style={{ gridColumn: "1 / -1" }}><Field label="Full Name *"><input style={inputStyle} value={form.full_name} onChange={e => setF("full_name", e.target.value)} placeholder="Enter full name" onFocus={e => e.target.style.borderColor = "var(--border-strong)"} onBlur={e => e.target.style.borderColor = "var(--border-default)"} /></Field></div>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Phone Number *"><input style={inputStyle} value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="9876543210" onFocus={e => e.target.style.borderColor = "var(--border-strong)"} onBlur={e => e.target.style.borderColor = "var(--border-default)"} /></Field></div>
              <Field label="Gender"><select style={inputStyle} value={form.gender} onChange={e => setF("gender", e.target.value)}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></Field>
              <Field label="Date of Birth"><input style={inputStyle} type="date" value={form.date_of_birth} onChange={e => setF("date_of_birth", e.target.value)} onFocus={e => e.target.style.borderColor = "var(--border-strong)"} onBlur={e => e.target.style.borderColor = "var(--border-default)"} /></Field>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Address"><input style={inputStyle} value={form.address} onChange={e => setF("address", e.target.value)} placeholder="Enter address" onFocus={e => e.target.style.borderColor = "var(--border-strong)"} onBlur={e => e.target.style.borderColor = "var(--border-default)"} /></Field></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Membership Plan">
                  <select style={inputStyle} value={form.membership_type} onChange={e => handlePlanSelect(e.target.value)}>
                    <option value="">— Select a Plan —</option>
                    {Object.entries(plansByType).map(([type, list]) => (
                      <optgroup key={type} label={TYPE_LABEL[type] || type}>
                        {list.map(p => <option key={p.id} value={p.name}>{p.name} — ₹{Number(p.price).toLocaleString("en-IN")} / {p.duration_days} days</option>)}
                      </optgroup>
                    ))}
                  </select>
                </Field>
                {form.membership_type && (() => { const p = plans.find(pl => pl.name === form.membership_type); if (!p) return null; return <div style={{ marginTop: "8px", padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", gap: "20px", flexWrap: "wrap" }}><span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Duration: <strong style={{ color: "var(--text-secondary)" }}>{p.duration_days} days</strong></span><span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Price: <strong style={{ color: "var(--green)" }}>₹{Number(p.price).toLocaleString("en-IN")}</strong></span></div>; })()}
              </div>
              <Field label="Status"><select style={inputStyle} value={form.status} onChange={e => setF("status", e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option></select></Field>
              <div />
              <Field label="Membership Start"><input style={inputStyle} type="date" value={form.membership_start} onChange={e => setF("membership_start", e.target.value)} onFocus={e => e.target.style.borderColor = "var(--border-strong)"} onBlur={e => e.target.style.borderColor = "var(--border-default)"} /></Field>
              <Field label="Membership End"><input style={inputStyle} type="date" value={form.membership_end} onChange={e => setF("membership_end", e.target.value)} onFocus={e => e.target.style.borderColor = "var(--border-strong)"} onBlur={e => e.target.style.borderColor = "var(--border-default)"} /></Field>
              <div style={{ gridColumn: "1 / -1" }}><p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>💡 Start/end dates are automatically set when a plan is selected.</p></div>
            </div>
            {formError && <div style={{ marginTop: "16px", padding: "11px 14px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--red)", fontSize: "13px" }}>{formError}</div>}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "9px 20px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "9px 24px", borderRadius: "var(--radius-sm)", background: saving ? "var(--bg-elevated)" : "var(--text-primary)", color: saving ? "var(--text-muted)" : "#0a0a0a", border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.03em" }}>
                {saving ? "Saving..." : editingId ? "UPDATE" : "ADD MEMBER"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewBillMember && (
        <ViewBillModal
          member={viewBillMember}
          onClose={() => setViewBillMember(null)}
        />
      )}

      {renewMember && (
        <RenewModal
          member={renewMember} plans={plans} plansByType={plansByType}
          onClose={() => setRenewMember(null)}
          onSuccess={() => { setRenewMember(null); refreshList(); }}
        />
      )}

      {deleteId && (
        <div className="fade-in" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400, backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="fade-up" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "32px", maxWidth: "360px", width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--red)" }}>
              <FaTrash style={{ fontSize: "18px" }} />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Delete Member?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>Yeh member permanently delete ho jayega.</p>
            <p style={{ color: "var(--red)", fontSize: "12px", marginBottom: "24px", padding: "8px 12px", background: "var(--red-bg)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(248,113,113,0.2)" }}>
              ⚠️ Saare payments aur attendance records bhi delete honge.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--red)", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)" }}>DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}