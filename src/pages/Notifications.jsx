// pages/Notifications.jsx
import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaBell, FaCheckDouble, FaTrash, FaSync,
  FaExclamationTriangle, FaClock, FaTools, FaMoneyBill, FaInfoCircle,
  FaChevronLeft, FaChevronRight, FaFilter
} from "react-icons/fa";

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const TYPE_META = {
  membership_expired:   { icon: FaExclamationTriangle, color: "var(--red)",    bg: "var(--red-bg)",    label: "Expired"        },
  membership_expiring:  { icon: FaClock,               color: "var(--yellow)", bg: "var(--yellow-bg)", label: "Expiring"       },
  equipment_maintenance:{ icon: FaTools,               color: "var(--blue)",   bg: "var(--blue-bg)",   label: "Maintenance"    },
  payment_pending:      { icon: FaMoneyBill,           color: "var(--green)",  bg: "var(--green-bg)",  label: "Payment"        },
  general:              { icon: FaInfoCircle,          color: "#888",          bg: "rgba(136,136,136,0.1)", label: "General"   },
};

export default function Notifications({ onLogout }) {
  const [notifications, setNotifs]    = useState([]);
  const [loading,       setLoading]   = useState(true);
  const [syncing,       setSyncing]   = useState(false);
  const [filter,        setFilter]    = useState("");
  const [showUnread,    setUnreadOnly]= useState(false);
  const [page,          setPage]      = useState(1);
  const [totalPages,    setTotal]     = useState(1);
  const [totalCount,    setCount]     = useState(0);
  const [unreadCount,   setUnread]    = useState(0);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications", { params: { page, limit: 15 } });
      let data = res.data.data;
      if (filter)     data = data.filter(n => n.type === filter);
      if (showUnread) data = data.filter(n => !n.is_read);
      setNotifs(data);
      setTotal(res.data.pagination.totalPages);
      setCount(res.data.pagination.total);
      setUnread(data.filter(n => !n.is_read).length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filter, showUnread]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);
  useEffect(() => { setPage(1); }, [filter, showUnread]);

  const syncNotifs = async () => {
    setSyncing(true);
    try { await api.post("/notifications/sync"); fetchNotifs(); }
    catch (e) { console.error(e); }
    finally { setSyncing(false); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: 1 } : x));
      setUnread(u => Math.max(0, u - 1));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/mark-all/read");
      setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
      setUnread(0);
    } catch (e) { console.error(e); }
  };

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifs(n => n.filter(x => x.id !== id));
    } catch (e) { console.error(e); }
  };

  const clearRead = async () => {
    if (!window.confirm("Delete all read notifications?")) return;
    try { await api.delete("/notifications/clear/read"); fetchNotifs(); }
    catch (e) { console.error(e); }
  };

  // Group by date
  const grouped = notifications.reduce((acc, n) => {
    const day = new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    if (!acc[day]) acc[day] = [];
    acc[day].push(n);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", fontFamily: "var(--font-body)" }}>
      <Sidebar onLogout={onLogout} />

      <main style={{ flex: 1, padding: "24px 20px", overflowY: "auto", minWidth: 0 }}>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .notif-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }
          .notif-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .notif-action-btn {
            display: flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: var(--radius-sm);
            background: var(--bg-elevated); border: 1px solid var(--border-default);
            color: var(--text-secondary); cursor: pointer; font-size: 13px;
            white-space: nowrap;
          }
          .notif-action-btn-red {
            background: var(--red-bg);
            border: 1px solid rgba(248,113,113,0.2);
            color: var(--red);
          }
          .notif-chips-bar {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .notif-chips-bar::-webkit-scrollbar { display: none; }
          .notif-chip {
            display: flex; align-items: center; gap: 6px;
            padding: 6px 12px; border-radius: 99px; cursor: pointer;
            font-size: 12px; white-space: nowrap; flex-shrink: 0;
          }
          .notif-item {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-subtle);
            display: flex; gap: 12px; align-items: flex-start;
            transition: background 0.15s;
          }
          .notif-item-meta {
            display: flex; align-items: center; gap: 8px; flex-shrink: 0;
          }
          .notif-item-content {
            flex: 1; min-width: 0;
          }
          .notif-item-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 4px;
          }

          @media (max-width: 768px) {
            .notif-main-padding {
              padding: 16px 14px !important;
            }
            .notif-action-btn span.btn-label {
              display: none;
            }
            .notif-action-btn {
              padding: 9px 10px;
            }
            .notif-header h1 {
              font-size: 22px !important;
            }
          }

          @media (max-width: 480px) {
            .notif-item {
              padding: 12px 14px;
            }
          }
        `}</style>

        {/* Header */}
        <div className="notif-header fade-up">
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", margin: 0 }}>
              Notifications
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
              {unreadCount > 0 ? <span style={{ color: "var(--red)" }}>{unreadCount} unread</span> : "All caught up"} — {totalCount} total
            </p>
          </div>

          <div className="notif-actions">
            <button onClick={syncNotifs} disabled={syncing} className="notif-action-btn" style={{ opacity: syncing ? 0.6 : 1 }}>
              <FaSync style={{ fontSize: "11px", animation: syncing ? "spin 1s linear infinite" : "none" }} />
              <span className="btn-label">{syncing ? "Syncing..." : "Sync Alerts"}</span>
            </button>

            {unreadCount > 0 && (
              <button onClick={markAllRead} className="notif-action-btn">
                <FaCheckDouble style={{ fontSize: "11px" }} />
                <span className="btn-label">Mark All Read</span>
              </button>
            )}

            <button onClick={clearRead} className="notif-action-btn notif-action-btn-red">
              <FaTrash style={{ fontSize: "11px" }} />
              <span className="btn-label">Clear Read</span>
            </button>
          </div>
        </div>

        {/* Filter chips — horizontally scrollable on mobile */}
        <div className="notif-chips-bar">
          {Object.entries(TYPE_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const count = notifications.filter(n => n.type === key).length;
            const active = filter === key;
            return (
              <button
                key={key}
                className="notif-chip"
                onClick={() => setFilter(active ? "" : key)}
                style={{
                  background: active ? meta.color : "var(--bg-elevated)",
                  border: `1px solid ${active ? meta.color : "var(--border-default)"}`,
                  color: active ? "#0a0a0a" : "var(--text-muted)",
                }}
              >
                <Icon style={{ fontSize: "10px" }} />
                {meta.label}
                <span style={{
                  padding: "1px 6px", borderRadius: "99px", fontSize: "10px", fontWeight: 700,
                  background: active ? meta.color : "var(--bg-surface)",
                  color: active ? "#0a0a0a" : "var(--text-muted)"
                }}>{count}</span>
              </button>
            );
          })}
          <button
            className="notif-chip"
            onClick={() => setUnreadOnly(v => !v)}
            style={{
              background: showUnread ? "var(--red-bg)" : "var(--bg-elevated)",
              border: `1px solid ${showUnread ? "var(--red)" : "var(--border-default)"}`,
              color: showUnread ? "var(--red)" : "var(--text-muted)",
            }}
          >
            <FaFilter style={{ fontSize: "10px" }} /> Unread only
          </button>
        </div>

        {/* Notifications list */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)", overflow: "hidden"
        }}>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-elevated)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: "12px", width: "40%", background: "var(--bg-elevated)", borderRadius: "4px", marginBottom: "8px" }} />
                  <div style={{ height: "11px", width: "70%", background: "var(--bg-elevated)", borderRadius: "4px" }} />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <FaBell style={{ fontSize: "40px", color: "var(--text-muted)", opacity: 0.2, display: "block", margin: "0 auto 14px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "0 0 6px", fontWeight: 600 }}>No notifications</p>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>Click "Sync Alerts" to check for new alerts</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                {/* Date divider */}
                <div style={{
                  padding: "8px 16px", background: "var(--bg-elevated)",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.08em"
                }}>{date}</div>

                {items.map(n => {
                  const meta = TYPE_META[n.type] || TYPE_META.general;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={n.id}
                      className="notif-item"
                      style={{
                        background: n.is_read ? "transparent" : "rgba(255,255,255,0.015)",
                        borderLeft: n.is_read ? "3px solid transparent" : `3px solid ${meta.color}`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = n.is_read ? "transparent" : "rgba(255,255,255,0.015)"}
                    >
                      {/* Icon */}
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                        background: meta.bg, display: "flex", alignItems: "center",
                        justifyContent: "center", color: meta.color
                      }}>
                        <Icon style={{ fontSize: "14px" }} />
                      </div>

                      {/* Content */}
                      <div className="notif-item-content">
                        <div className="notif-item-top">
                          <span style={{
                            fontSize: "13px", fontWeight: n.is_read ? 500 : 700,
                            color: n.is_read ? "var(--text-secondary)" : "var(--text-primary)",
                            lineHeight: 1.4
                          }}>{n.title}</span>
                          <div className="notif-item-meta">
                            {!n.is_read && (
                              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: meta.color, display: "inline-block", flexShrink: 0 }} />
                            )}
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{timeAgo(n.created_at)}</span>
                          </div>
                        </div>

                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 8px", lineHeight: 1.6 }}>
                          {n.message}
                        </p>

                        <div style={{ display: "flex", gap: "10px" }}>
                          {!n.is_read && (
                            <button
                              onClick={() => markRead(n.id)}
                              style={{
                                background: "none", border: "none", cursor: "pointer", padding: 0,
                                color: "var(--text-muted)", fontSize: "11px",
                                display: "flex", alignItems: "center", gap: "4px"
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
                              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                            >
                              <FaCheckDouble style={{ fontSize: "10px" }} /> Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteOne(n.id)}
                            style={{
                              background: "none", border: "none", cursor: "pointer", padding: 0,
                              color: "var(--text-muted)", fontSize: "11px",
                              display: "flex", alignItems: "center", gap: "4px"
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                          >
                            <FaTrash style={{ fontSize: "10px" }} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{
                  padding: "6px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)", color: page===1 ? "var(--text-muted)" : "var(--text-secondary)",
                  cursor: page===1 ? "not-allowed" : "pointer"
                }}><FaChevronLeft /></button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} style={{
                  padding: "6px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)", color: page===totalPages ? "var(--text-muted)" : "var(--text-secondary)",
                  cursor: page===totalPages ? "not-allowed" : "pointer"
                }}><FaChevronRight /></button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}