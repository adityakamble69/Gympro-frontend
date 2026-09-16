import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaCheckCircle, FaUsers, FaExclamationTriangle, FaEnvelope,
  FaSearch, FaTimes, FaPlus, FaClock, FaWhatsapp, FaSyncAlt,
  FaArrowRight, FaSignInAlt, FaSignOutAlt, FaIdCard, FaMoneyBillWave,
  FaCheck, FaUserPlus, FaPhone, FaCalendarCheck
} from "react-icons/fa";

const fmtTime = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function ReceptionistDashboard({ onLogout }) {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("gym_admin") || "{}");

  // State
  const [clock, setClock] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    todayCheckins: 0,
    activeNow: 0,
    expiredOrDue: 0,
    newInquiries: 0
  });

  // Feeds
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  // Modals
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch front-desk data
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Attendance for today
      const attRes = await api.get(`/attendance?date=${todayStr}&limit=50`).catch(() => ({ data: { data: [] } }));
      const attData = attRes.data?.data || [];
      setTodayAttendance(attData);

      const activeNowCount = attData.filter(a => !a.check_out).length;

      // 2. Inquiries summary & list
      const inqRes = await api.get("/inquiries?limit=6&status=new").catch(() => ({ data: { data: [] } }));
      const inqData = inqRes.data?.data || [];
      setRecentInquiries(inqData);

      // 3. Members summary (check-in / active stats)
      const memRes = await api.get("/members?limit=100&lite=true").catch(() => ({ data: { data: [] } }));
      const memData = memRes.data?.data || [];
      const expiredCount = memData.filter(m => m.status === "expired").length;

      setStats({
        todayCheckins: attData.length,
        activeNow: activeNowCount,
        expiredOrDue: expiredCount,
        newInquiries: inqData.length
      });
    } catch (err) {
      console.error("Reception dashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Instant member lookup search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/members?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSearchResults(res.data?.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [searchQuery]);

  // Quick punch check-in
  const handleDirectCheckin = async (memberId, memberName) => {
    try {
      await api.post("/attendance/checkin", { member_id: memberId });
      showToast(`✅ Checked in: ${memberName}`);
      loadDashboardData(true);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || "Check-in failed"}`);
    }
  };

  // Quick checkout
  const handleDirectCheckout = async (recordId, memberName) => {
    try {
      await api.put(`/attendance/checkout/${recordId}`);
      showToast(`👋 Checked out: ${memberName}`);
      loadDashboardData(true);
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || "Checkout failed"}`);
    }
  };

  const showToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 4000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", fontFamily: "var(--font-body)" }}>
      <Sidebar onLogout={onLogout} />

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", height: "100vh" }}>
        
        {/* Toast Alert Banner */}
        {actionSuccessMsg && (
          <div style={{
            position: "fixed", top: "24px", right: "24px", zIndex: 1100,
            background: "var(--bg-surface)", border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)", padding: "12px 18px", boxShadow: "var(--shadow-lg)",
            display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600,
            color: "var(--text-primary)", animation: "fadeUp 0.2s ease"
          }}>
            {actionSuccessMsg}
          </div>
        )}

        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🛎️</span>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Front Desk Terminal
              </h1>
              <span style={{
                background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)",
                color: "var(--blue)", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", textTransform: "uppercase"
              }}>
                Receptionist Active
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Welcome back, <strong style={{ color: "var(--text-secondary)" }}>{admin.name || "Receptionist"}</strong> • Daily Gym Operations Desk
            </p>
          </div>

          {/* Clock & Refresh */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                | {clock.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>

            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              title="Refresh desk data"
              style={{
                background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", padding: "9px 12px", color: "var(--text-muted)",
                cursor: refreshing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px",
                fontSize: "13px", transition: "all 0.15s"
              }}
            >
              <FaSyncAlt style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)", padding: "16px 20px", marginBottom: "24px",
          display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center"
        }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "6px" }}>
            QUICK ACTIONS:
          </span>

          <button
            onClick={() => setShowCheckInModal(true)}
            style={{
              padding: "9px 16px", borderRadius: "var(--radius-md)",
              background: "var(--text-primary)", color: "#0a0a0a", border: "none",
              fontSize: "13.5px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "7px",
              boxShadow: "0 2px 8px rgba(255,255,255,0.12)", transition: "transform 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <FaCheckCircle style={{ fontSize: "14px" }} /> Quick Check-In
          </button>

          <button
            onClick={() => navigate("/members")}
            style={{
              padding: "9px 16px", borderRadius: "var(--radius-md)",
              background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)",
              color: "var(--blue)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "7px"
            }}
          >
            <FaUserPlus style={{ fontSize: "13px" }} /> New Member Registration
          </button>

          <button
            onClick={() => navigate("/payments")}
            style={{
              padding: "9px 16px", borderRadius: "var(--radius-md)",
              background: "var(--green-bg)", border: "1px solid rgba(74,222,128,0.3)",
              color: "var(--green)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "7px"
            }}
          >
            <FaMoneyBillWave style={{ fontSize: "13px" }} /> Collect Payment & Invoice
          </button>

          <button
            onClick={() => setShowInquiryModal(true)}
            style={{
              padding: "9px 16px", borderRadius: "var(--radius-md)",
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
              color: "var(--yellow)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "7px"
            }}
          >
            <FaEnvelope style={{ fontSize: "13px" }} /> + Walk-In Inquiry
          </button>
        </div>

        {/* 4 Key Counters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px"
          }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "var(--green-bg)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", fontSize: "20px" }}>
              <FaCheckCircle />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                {stats.todayCheckins}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>Today's Check-ins</div>
            </div>
          </div>

          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px"
          }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", fontSize: "20px" }}>
              <FaUsers />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                {stats.activeNow}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>Currently in Gym</div>
            </div>
          </div>

          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px",
            cursor: "pointer"
          }} onClick={() => navigate("/members")}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--yellow)", fontSize: "20px" }}>
              <FaExclamationTriangle />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--yellow)", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                {stats.expiredOrDue}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>Expired Plans</div>
            </div>
          </div>

          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px",
            cursor: "pointer"
          }} onClick={() => navigate("/inquiries")}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7", fontSize: "20px" }}>
              <FaEnvelope />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                {stats.newInquiries}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>New Inquiries</div>
            </div>
          </div>

        </div>

        {/* Instant Member Lookup Bar */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)", padding: "20px 22px", marginBottom: "24px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <FaSearch style={{ color: "var(--blue)", fontSize: "14px" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Instant Member Desk Lookup
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search member by Name, Phone (+91...) or Member ID to check status..."
              style={{
                width: "100%", padding: "12px 42px 12px 16px", borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                color: "var(--text-primary)", fontSize: "15px", outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s"
              }}
              onFocus={e => e.target.style.borderColor = "var(--blue)"}
              onBlur={e => e.target.style.borderColor = "var(--border-default)"}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "14px"
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Lookup Results Cards */}
          {searching && (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              Searching members...
            </div>
          )}

          {searchResults.length > 0 && (
            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {searchResults.map(m => {
                const isExpired = m.status === "expired";
                const hasDue = m.due_total > 0;
                return (
                  <div
                    key={m.id}
                    style={{
                      background: "var(--bg-elevated)", border: `1px solid ${isExpired ? "rgba(248,113,113,0.3)" : "var(--border-default)"}`,
                      borderRadius: "var(--radius-md)", padding: "12px 16px", display: "flex",
                      alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "50%",
                        background: "var(--bg-active)", border: "1px solid var(--border-strong)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, color: "var(--text-primary)", fontSize: "14px"
                      }}>
                        {m.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "15px" }}>{m.full_name}</span>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px",
                            background: isExpired ? "var(--red-bg)" : "var(--green-bg)",
                            color: isExpired ? "var(--red)" : "var(--green)"
                          }}>
                            {isExpired ? "Expired" : "Active"}
                          </span>
                          {hasDue && (
                            <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px", background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                              Due: {fmt(m.due_total)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                          📞 {m.phone || "No phone"} • Plan: <strong style={{ color: "var(--text-secondary)" }}>{m.membership_type || "None"}</strong> • Valid Till: {fmtDate(m.membership_end)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => handleDirectCheckin(m.id, m.full_name)}
                        style={{
                          padding: "6px 12px", borderRadius: "var(--radius-sm)",
                          background: "var(--green-bg)", border: "1px solid rgba(74,222,128,0.3)",
                          color: "var(--green)", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                        }}
                      >
                        <FaCheck /> Mark Check-In
                      </button>

                      <button
                        onClick={() => navigate("/members")}
                        style={{
                          padding: "6px 12px", borderRadius: "var(--radius-sm)",
                          background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)",
                          color: "var(--blue)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer"
                        }}
                      >
                        ⚡ Renew / Profile
                      </button>

                      {m.phone && (
                        <button
                          onClick={() => {
                            const p = m.phone.replace(/[\s\-\(\)\+]/g, "");
                            const num = p.length === 10 ? "91" + p : p;
                            window.open(`https://wa.me/${num}`, "_blank");
                          }}
                          style={{
                            padding: "6px 10px", borderRadius: "var(--radius-sm)",
                            background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
                            color: "#25d366", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                          }}
                        >
                          <FaWhatsapp /> Chat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2-Column Operational Feed */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
          
          {/* Column 1: Live Attendance Stream */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)", overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCalendarCheck style={{ color: "var(--green)", fontSize: "15px" }} />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Live Attendance Stream (Today)
                </h2>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {todayAttendance.length} visits today
              </span>
            </div>

            <div style={{ padding: "14px", flex: 1, maxHeight: "460px", overflowY: "auto" }}>
              {todayAttendance.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                  <FaClock style={{ fontSize: "28px", opacity: 0.3, display: "block", margin: "0 auto 10px" }} />
                  No check-ins recorded yet today. Use Quick Check-In above!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {todayAttendance.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-md)", padding: "10px 14px",
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: rec.check_out ? "rgba(80,80,80,0.2)" : "var(--green-bg)",
                          border: `1px solid ${rec.check_out ? "var(--border-default)" : "rgba(74,222,128,0.3)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: rec.check_out ? "var(--text-muted)" : "var(--green)", fontSize: "12px", fontWeight: 700
                        }}>
                          {rec.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>
                            {rec.full_name}
                          </div>
                          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px", display: "flex", gap: "8px" }}>
                            <span>In: <strong style={{ color: "var(--green)" }}>{fmtTime(rec.check_in)}</strong></span>
                            {rec.check_out && <span>Out: <strong>{fmtTime(rec.check_out)}</strong></span>}
                            <span>• {rec.membership_type || "Plan"}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {rec.check_out ? (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "rgba(80,80,80,0.15)", padding: "2px 8px", borderRadius: "99px" }}>
                            Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDirectCheckout(rec.id, rec.full_name)}
                            style={{
                              padding: "4px 9px", borderRadius: "var(--radius-sm)",
                              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                              color: "var(--yellow)", fontSize: "11.5px", fontWeight: 600, cursor: "pointer"
                            }}
                          >
                            Check-Out
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", textAlign: "center" }}>
              <button
                onClick={() => navigate("/attendance")}
                style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontSize: "12.5px", fontWeight: 600 }}
              >
                View Full Attendance Register →
              </button>
            </div>
          </div>

          {/* Column 2: Today's Inquiries & Follow-ups */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)", overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaEnvelope style={{ color: "#a855f7", fontSize: "14px" }} />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Recent Inquiries & Leads
                </h2>
              </div>
              <button
                onClick={() => setShowInquiryModal(true)}
                style={{
                  background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
                  color: "#a855f7", borderRadius: "4px", padding: "3px 8px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
                }}
              >
                + Add
              </button>
            </div>

            <div style={{ padding: "14px", flex: 1, maxHeight: "460px", overflowY: "auto" }}>
              {recentInquiries.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                  No new inquiries pending.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recentInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      style={{
                        background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-md)", padding: "11px 14px",
                        display: "flex", flexDirection: "column", gap: "6px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>
                          {inq.full_name}
                        </div>
                        <span style={{ fontSize: "10.5px", background: "rgba(168,85,247,0.15)", color: "#a855f7", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          {inq.membership_interest || "Walk-In"}
                        </span>
                      </div>

                      <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>📞 {inq.phone}</span>
                        {inq.phone && (
                          <button
                            onClick={() => {
                              const p = inq.phone.replace(/[\s\-\(\)\+]/g, "");
                              const num = p.length === 10 ? "91" + p : p;
                              const txt = encodeURIComponent(`Hi ${inq.full_name}! Thanks for visiting Workout World Gym. Would you like to check out our membership offers? 💪`);
                              window.open(`https://wa.me/${num}?text=${txt}`, "_blank");
                            }}
                            style={{
                              background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
                              color: "#25d366", borderRadius: "4px", padding: "3px 7px", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px"
                            }}
                          >
                            <FaWhatsapp /> Contact
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", textAlign: "center" }}>
              <button
                onClick={() => navigate("/inquiries")}
                style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontSize: "12.5px", fontWeight: 600 }}
              >
                Open Full Inquiry Desk →
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* ── MODAL: Quick Check-In ── */}
      {showCheckInModal && (
        <CheckInQuickModal
          onClose={() => setShowCheckInModal(false)}
          onSuccess={(name) => {
            showToast(`✅ Attendance checked in for ${name}`);
            loadDashboardData(true);
          }}
        />
      )}

      {/* ── MODAL: Quick Walk-in Inquiry ── */}
      {showInquiryModal && (
        <WalkInInquiryModal
          onClose={() => setShowInquiryModal(false)}
          onSuccess={(name) => {
            showToast(`✅ Walk-in inquiry registered for ${name}`);
            loadDashboardData(true);
          }}
        />
      )}

    </div>
  );
}

// ── CheckInQuickModal Component ──
function CheckInQuickModal({ onClose, onSuccess }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q.trim()) { setList([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/members?search=${encodeURIComponent(q)}&limit=6&lite=true`);
        setList(res.data?.data || []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const handlePunch = async (m) => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/attendance/checkin", { member_id: m.id });
      onSuccess(m.full_name);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "460px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Punch Member Check-In
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}><FaTimes /></button>
        </div>

        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Type member name or phone..."
          style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "12px" }}
        />

        {error && (
          <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--red)", fontSize: "12.5px", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
          {list.map(m => (
            <div
              key={m.id}
              onClick={() => !submitting && handlePunch(m)}
              style={{
                padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)", cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.12s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--green)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            >
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{m.full_name}</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{m.phone} • {m.membership_type || "Plan"}</div>
              </div>
              <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 700 }}>+ Punch</span>
            </div>
          ))}
          {q && !loading && list.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "16px" }}>No members found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── WalkInInquiryModal Component ──
function WalkInInquiryModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    membership_interest: "monthly",
    message: ""
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      setErr("Full name and phone are required");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      await api.post("/inquiries/submit", {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || `${form.phone.slice(-6)}@inquiry.guest`,
        membership_interest: form.membership_interest,
        message: form.message || "Walk-in visitor at front desk"
      });
      onSuccess(form.full_name);
      onClose();
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to record inquiry");
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "var(--radius-sm)",
    background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
    color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "10px"
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "440px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            New Walk-In Inquiry
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}><FaTimes /></button>
        </div>

        {err && (
          <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--red)", fontSize: "12.5px", marginBottom: "10px" }}>
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Visitor Full Name *</label>
          <input
            autoFocus
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            placeholder="e.g. Rahul Sharma"
            style={inp}
          />

          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Phone Number *</label>
          <input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="e.g. 9876543210"
            style={inp}
          />

          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Interested Plan</label>
          <select
            value={form.membership_interest}
            onChange={e => setForm(f => ({ ...f, membership_interest: e.target.value }))}
            style={inp}
          >
            <option value="monthly">Monthly Plan</option>
            <option value="quarterly">Quarterly (3 Months)</option>
            <option value="yearly">Yearly (12 Months)</option>
            <option value="personal_training">Personal Training</option>
            <option value="not_sure">Not Sure / Trial</option>
          </select>

          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Notes / Requirements</label>
          <textarea
            rows={2}
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="e.g. Interested in morning 6-8 AM batch"
            style={{ ...inp, resize: "none" }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "8px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "8px 18px", borderRadius: "var(--radius-sm)", background: "var(--text-primary)",
                color: "#0a0a0a", border: "none", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer"
              }}
            >
              {saving ? "Saving..." : "Save Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
