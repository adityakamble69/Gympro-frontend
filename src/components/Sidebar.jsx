import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaHome, FaUsers, FaUserTie, FaClipboardCheck,
  FaMoneyBill, FaTools, FaChartBar, FaSignOutAlt, FaBolt,
  FaUserCircle, FaIdCard, FaBell, FaEnvelope, FaBars, FaTimes
} from "react-icons/fa";
import api from "../services/api";

const NAV = [
  { icon: FaHome,           label: "Dashboard",        path: "/dashboard"        },
  { icon: FaUsers,          label: "Members",          path: "/members"          },
  { icon: FaUserTie,        label: "Trainers",         path: "/trainers"         },
  { icon: FaClipboardCheck, label: "Attendance",       path: "/attendance"       },
  { icon: FaMoneyBill,      label: "Payments",         path: "/payments"         },
  { icon: FaIdCard,         label: "Membership Plans", path: "/membership-plans" },
  { icon: FaTools,          label: "Equipment",        path: "/equipment"        },
  { icon: FaEnvelope,       label: "Inquiries",        path: "/inquiries", badge: true },
  { icon: FaBell,           label: "Notifications",    path: "/notifications"    },
  { icon: FaChartBar,       label: "Reports",          path: "/reports"          },
  { icon: FaUserCircle,     label: "Profile",          path: "/profile"          },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin    = JSON.parse(localStorage.getItem("gym_admin") || "{}");
  const initials = admin.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "A";
  const [newInquiries, setNewInquiries] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchInquiryCount();
    const interval = setInterval(fetchInquiryCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const fetchInquiryCount = async () => {
    try {
      const res = await api.get("/inquiries/stats/summary");
      setNewInquiries(res.data.data?.new_count || 0);
    } catch(e) {}
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <aside style={{
      width: "220px",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border-subtle)",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-body)",
      overflowY: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px",
            background: "var(--text-primary)",
            borderRadius: "7px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <FaBolt style={{ color: "#0a0a0a", fontSize: "13px" }} />
          </div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "15px", color: "var(--text-primary)",
            letterSpacing: "0.02em", lineHeight: 1.2
          }}>
            Workout World Gym
          </span>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            display: "none",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "16px", padding: "4px",
            borderRadius: "6px", alignItems: "center", justifyContent: "center",
          }}
          className="sidebar-close-btn"
        >
          <FaTimes />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", minHeight: 0 }}>
        <p style={{
          fontSize: "10px", fontWeight: 600,
          color: "var(--text-muted)", textTransform: "uppercase",
          letterSpacing: "0.12em", padding: "8px 10px 6px", marginBottom: "4px"
        }}>Navigation</p>

        {NAV.map(({ icon: Icon, label, path, badge }) => {
          const active    = location.pathname === path;
          const showBadge = badge && newInquiries > 0;
          return (
            <div
              key={path}
              onClick={() => handleNav(path)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 10px", borderRadius: "var(--radius-sm)",
                marginBottom: "2px", cursor: "pointer",
                background: active ? "var(--bg-active)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400, fontSize: "13.5px",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}}
            >
              <Icon style={{ fontSize: "14px", flexShrink: 0, opacity: active ? 1 : 0.6 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {showBadge && (
                <span style={{
                  background: "#2f81f7", color: "#fff",
                  fontSize: "10px", fontWeight: 700,
                  padding: "1px 6px", borderRadius: "99px",
                  minWidth: "18px", textAlign: "center"
                }}>
                  {newInquiries}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "12px 10px" }}>
        <div
          onClick={() => handleNav("/profile")}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px", borderRadius: "var(--radius-sm)",
            background: "var(--bg-elevated)", marginBottom: "8px",
            cursor: "pointer", border: "1px solid transparent",
            transition: "border-color 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
        >
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "var(--bg-active)", border: "1px solid var(--border-strong)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", flexShrink: 0
          }}>{initials}</div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{
              fontSize: "13px", fontWeight: 600, color: "var(--text-primary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
            }}>{admin.name || "Admin"}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {admin.role?.replace("_", " ") || "admin"}
            </div>
          </div>
        </div>

        <div
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 10px", borderRadius: "var(--radius-sm)",
            cursor: "pointer", color: "var(--text-muted)",
            fontSize: "13.5px", transition: "all 0.15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--red-bg)"; e.currentTarget.style.color = "var(--red)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <FaSignOutAlt style={{ fontSize: "13px" }} /> Sign Out
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <style>{`
        /* ── Desktop: normal sidebar ── */
        .sidebar-wrapper {
          display: flex;
          flex-shrink: 0;
          min-height: 100vh;
        }
        .hamburger-btn {
          display: none;
        }
        .mobile-overlay {
          display: none;
        }
        .sidebar-close-btn {
          display: none !important;
        }

        /* ── Mobile (≤768px) ── */
        @media (max-width: 768px) {
          .sidebar-wrapper {
            display: none;
          }

          .hamburger-btn {
            display: flex;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1200;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            cursor: pointer;
            color: var(--text-secondary);
            box-shadow: var(--shadow-md);
            transition: all 0.15s;
          }
          .hamburger-btn:hover {
            border-color: var(--border-strong);
            color: var(--text-primary);
          }

          /* Overlay backdrop */
          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1201;
            backdrop-filter: blur(2px);
            animation: fadeIn 0.2s ease;
          }

          /* Slide-in drawer */
          .mobile-drawer {
            position: fixed;
            top: 0;
            left: 0;
            height: 100dvh;
            z-index: 1202;
            transform: translateX(0);
            animation: slideInDrawer 0.25s cubic-bezier(0.16,1,0.3,1);
            box-shadow: 4px 0 40px rgba(0,0,0,0.8);
          }

          .sidebar-close-btn {
            display: flex !important;
          }
        }

        @keyframes slideInDrawer {
          from { transform: translateX(-100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="sidebar-wrapper">
        <SidebarContent />
      </div>

      {/* Mobile Hamburger Button */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <FaBars style={{ fontSize: "16px" }} />
      </button>

      {/* Mobile Drawer + Overlay */}
      {mobileOpen && (
        <>
          <div className="mobile-overlay" />
          <div className="mobile-drawer">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}