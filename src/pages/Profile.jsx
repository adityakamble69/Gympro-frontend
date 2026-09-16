import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  FaUser, FaEnvelope, FaLock, FaEdit, FaCheck,
  FaTimes, FaShieldAlt, FaCalendarAlt, FaEye, FaEyeSlash,
  FaUserPlus, FaTrash, FaKey, FaUsers
} from "react-icons/fa";

// ── Small helper ──────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";

// ── Input Field ───────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, type = "text", value, onChange, placeholder, disabled, rightEl }) => (
  <div style={{ marginBottom: "18px" }}>
    <label style={{
      display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600,
      color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em"
    }}>{label}</label>
    <div style={{ position: "relative" }}>
      {Icon && (
        <Icon style={{
          position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", fontSize: "15px", pointerEvents: "none"
        }} />
      )}
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: "100%", padding: `10px ${rightEl ? "40px" : "14px"} 10px ${Icon ? "38px" : "14px"}`,
          boxSizing: "border-box",
          background: disabled ? "var(--bg-base)" : "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)", color: disabled ? "var(--text-muted)" : "var(--text-primary)",
          fontSize: "15px", outline: "none", transition: "border-color 0.2s",
          cursor: disabled ? "not-allowed" : "text"
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = "var(--border-strong)"; }}
        onBlur={e => e.target.style.borderColor = "var(--border-default)"}
      />
      {rightEl && (
        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
          {rightEl}
        </div>
      )}
    </div>
  </div>
);

// ── Alert Banner ──────────────────────────────────────────────────────────────
const Alert = ({ msg, type }) => {
  if (!msg) return null;
  const isError = type === "error";
  return (
    <div style={{
      padding: "11px 14px", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "15px",
      background: isError ? "var(--red-bg)"   : "var(--green-bg)",
      border:     `1px solid ${isError ? "rgba(248,113,113,0.25)" : "rgba(74,222,128,0.25)"}`,
      color:      isError ? "var(--red)"       : "var(--green)",
      display: "flex", alignItems: "center", gap: "8px"
    }}>
      {isError ? <FaTimes style={{ flexShrink: 0 }} /> : <FaCheck style={{ flexShrink: 0 }} />}
      {msg}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Profile({ onLogout }) {
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  const [editMode,  setEditMode]  = useState(false);
  const [fullName,  setFullName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [profMsg,   setProfMsg]   = useState({ text: "", type: "" });

  const [curPwd,    setCurPwd]    = useState("");
  const [newPwd,    setNewPwd]    = useState("");
  const [confPwd,   setConfPwd]   = useState("");
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg,    setPwdMsg]    = useState({ text: "", type: "" });

  // Staff Management (Super Admin only)
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [resetStaffTarget, setResetStaffTarget] = useState(null);
  const [newStaff, setNewStaff] = useState({ full_name: "", email: "", password: "", role: "receptionist" });
  const [resetPwdValue, setResetPwdValue] = useState("");
  const [staffMsg, setStaffMsg] = useState({ text: "", type: "" });
  const [staffSaving, setStaffSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data.data);
      setFullName(res.data.data.full_name);
      setEmail(res.data.data.email);
      if (res.data.data.role === "super_admin") {
        fetchStaff();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await api.get("/profile/staff");
      setStaffList(res.data.data || []);
    } catch (e) {
      console.error("Fetch staff error:", e);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.full_name || !newStaff.email || !newStaff.password) {
      setStaffMsg({ text: "All fields required", type: "error" });
      return;
    }
    setStaffSaving(true);
    setStaffMsg({ text: "", type: "" });
    try {
      await api.post("/profile/staff", newStaff);
      setStaffMsg({ text: "Staff account created successfully!", type: "success" });
      setShowAddStaffModal(false);
      setNewStaff({ full_name: "", email: "", password: "", role: "receptionist" });
      fetchStaff();
      setTimeout(() => setStaffMsg({ text: "", type: "" }), 4000);
    } catch (err) {
      setStaffMsg({ text: err.response?.data?.message || "Failed to create staff account", type: "error" });
    } finally {
      setStaffSaving(false);
    }
  };

  const handleResetStaffPassword = async () => {
    if (!resetPwdValue || resetPwdValue.length < 6) {
      setStaffMsg({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }
    setStaffSaving(true);
    try {
      await api.put(`/profile/staff/${resetStaffTarget.id}/password`, { new_password: resetPwdValue });
      setStaffMsg({ text: `Password changed for ${resetStaffTarget.full_name}`, type: "success" });
      setResetStaffTarget(null);
      setResetPwdValue("");
      setTimeout(() => setStaffMsg({ text: "", type: "" }), 4000);
    } catch (err) {
      setStaffMsg({ text: err.response?.data?.message || "Failed to reset password", type: "error" });
    } finally {
      setStaffSaving(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete staff account for ${name}?`)) return;
    try {
      await api.delete(`/profile/staff/${id}`);
      setStaffMsg({ text: `Staff ${name} deleted successfully`, type: "success" });
      fetchStaff();
      setTimeout(() => setStaffMsg({ text: "", type: "" }), 4000);
    } catch (err) {
      setStaffMsg({ text: err.response?.data?.message || "Failed to delete staff", type: "error" });
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim() || !email.trim()) {
      setProfMsg({ text: "Name and email are required", type: "error" }); return;
    }
    setSaving(true); setProfMsg({ text: "", type: "" });
    try {
      await api.put("/profile/update", { full_name: fullName, email });
      const stored = JSON.parse(localStorage.getItem("gym_admin") || "{}");
      localStorage.setItem("gym_admin", JSON.stringify({ ...stored, name: fullName, email }));
      setProfile(p => ({ ...p, full_name: fullName, email }));
      setEditMode(false);
      setProfMsg({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => setProfMsg({ text: "", type: "" }), 3000);
    } catch (e) {
      setProfMsg({ text: e.response?.data?.message || "Update failed", type: "error" });
    } finally { setSaving(false); }
  };

  const handleCancelEdit = () => {
    setFullName(profile?.full_name || "");
    setEmail(profile?.email || "");
    setEditMode(false);
    setProfMsg({ text: "", type: "" });
  };

  const handleChangePassword = async () => {
    if (!curPwd || !newPwd || !confPwd) {
      setPwdMsg({ text: "All fields are required", type: "error" }); return;
    }
    if (newPwd !== confPwd) {
      setPwdMsg({ text: "New passwords do not match", type: "error" }); return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ text: "Password must be at least 6 characters", type: "error" }); return;
    }
    setPwdSaving(true); setPwdMsg({ text: "", type: "" });
    try {
      await api.put("/profile/change-password", {
        current_password: curPwd, new_password: newPwd, confirm_password: confPwd
      });
      setCurPwd(""); setNewPwd(""); setConfPwd("");
      setPwdMsg({ text: "Password changed successfully!", type: "success" });
      setTimeout(() => setPwdMsg({ text: "", type: "" }), 3000);
    } catch (e) {
      setPwdMsg({ text: e.response?.data?.message || "Failed to change password", type: "error" });
    } finally { setPwdSaving(false); }
  };

  const pwdStrength = () => {
    if (!newPwd) return null;
    if (newPwd.length < 6)  return { label: "Too short", color: "var(--red)",    width: "25%" };
    if (newPwd.length < 8)  return { label: "Weak",      color: "var(--yellow)", width: "50%" };
    if (!/[A-Z]/.test(newPwd) || !/[0-9]/.test(newPwd))
                            return { label: "Medium",    color: "var(--blue)",   width: "70%" };
    return                  { label: "Strong",    color: "var(--green)",  width: "100%" };
  };
  const strength = pwdStrength();

  const eyeBtn = (show, toggle) => (
    <button onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}>
      {show ? <FaEyeSlash style={{ fontSize: "15px" }} /> : <FaEye style={{ fontSize: "15px" }} />}
    </button>
  );

  const initials = profile?.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "A";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", fontFamily: "var(--font-body)" }}>
      <Sidebar onLogout={onLogout} />

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 20px;
          align-items: start;
        }
        .profile-main {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
          min-width: 0;
        }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .profile-main {
            padding: 20px 16px !important;
          }
          .profile-h1 {
            font-size: 22px !important;
          }
        }
      `}</style>

      <main className="profile-main">

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 className="profile-h1" style={{ fontFamily: "var(--font-display)", fontSize: "31px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", margin: 0 }}>
            Profile
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>
            Manage your account details and password
          </p>
        </div>

        <div className="profile-grid">

          {/* ── Left: Avatar + Info card ── */}
          <div>
            {/* Avatar card */}
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: "28px",
              textAlign: "center", marginBottom: "16px"
            }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "var(--bg-active)", border: "2px solid var(--border-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: "31px", fontWeight: 800,
                color: "var(--text-primary)", margin: "0 auto 16px"
              }}>{loading ? "—" : initials}</div>

              <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                {loading ? "—" : profile?.full_name}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {loading ? "—" : profile?.email}
              </div>

              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 14px", borderRadius: "99px", fontSize: "13px", fontWeight: 600,
                background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                color: "var(--text-secondary)"
              }}>
                <FaShieldAlt style={{ fontSize: "11px", color: "var(--green)" }} />
                {profile?.role?.replace("_", " ") || "admin"}
              </span>
            </div>

            {/* Account info card */}
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: "20px"
            }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 14px" }}>
                Account Info
              </h3>
              {[
                { icon: FaUser,        label: "Full Name",    value: profile?.full_name },
                { icon: FaEnvelope,    label: "Email",        value: profile?.email },
                { icon: FaShieldAlt,   label: "Role",         value: profile?.role?.replace("_", " ") },
                { icon: FaCalendarAlt, label: "Member Since", value: fmtDate(profile?.created_at) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 0", borderBottom: "1px solid var(--border-subtle)"
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "6px",
                    background: "var(--bg-elevated)", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--text-muted)", flexShrink: 0
                  }}>
                    <Icon style={{ fontSize: "12px" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500, textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {loading ? "—" : value || "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Edit profile + Change password ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Edit Profile Card */}
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Edit Profile
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "3px" }}>Update your name and email</p>
                </div>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 14px", borderRadius: "var(--radius-sm)",
                    background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px",
                    whiteSpace: "nowrap"
                  }}>
                    <FaEdit style={{ fontSize: "11px" }} /> Edit
                  </button>
                )}
              </div>

              <Alert msg={profMsg.text} type={profMsg.type} />

              <Field label="Full Name" icon={FaUser}     value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"  disabled={!editMode} />
              <Field label="Email"     icon={FaEnvelope} value={email}    onChange={e => setEmail(e.target.value)}    placeholder="your@email.com"   disabled={!editMode} />

              <div style={{ marginBottom: "0" }}>
                <label style={{
                  display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600,
                  color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em"
                }}>Role</label>
                <input value={profile?.role?.replace("_", " ") || ""} disabled style={{
                  width: "100%", padding: "10px 14px", boxSizing: "border-box",
                  background: "var(--bg-base)", border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
                  fontSize: "15px", cursor: "not-allowed", textTransform: "capitalize"
                }} />
              </div>

              {editMode && (
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button onClick={handleCancelEdit} style={{
                    flex: 1, padding: "10px", borderRadius: "var(--radius-sm)",
                    background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)", cursor: "pointer", fontSize: "15px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                  }}>
                    <FaTimes style={{ fontSize: "12px" }} /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={saving} style={{
                    flex: 1, padding: "10px", borderRadius: "var(--radius-sm)",
                    background: saving ? "var(--bg-elevated)" : "var(--text-primary)",
                    color: saving ? "var(--text-muted)" : "#0a0a0a",
                    border: "none", cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: "15px", fontFamily: "var(--font-display)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                  }}>
                    <FaCheck style={{ fontSize: "12px" }} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: "24px"
            }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Change Password
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "3px" }}>Keep your account secure</p>
              </div>

              <Alert msg={pwdMsg.text} type={pwdMsg.type} />

              <Field label="Current Password" icon={FaLock} type={showCur ? "text" : "password"}
                value={curPwd} onChange={e => setCurPwd(e.target.value)}
                placeholder="Enter current password"
                rightEl={eyeBtn(showCur, () => setShowCur(v => !v))} />

              <Field label="New Password" icon={FaLock} type={showNew ? "text" : "password"}
                value={newPwd} onChange={e => setNewPwd(e.target.value)}
                placeholder="Enter new password"
                rightEl={eyeBtn(showNew, () => setShowNew(v => !v))} />

              {/* Password strength bar */}
              {strength && (
                <div style={{ marginTop: "-12px", marginBottom: "18px" }}>
                  <div style={{ height: "3px", background: "var(--bg-elevated)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "99px", transition: "all 0.3s" }} />
                  </div>
                  <div style={{ fontSize: "11px", color: strength.color, marginTop: "4px", fontWeight: 600 }}>{strength.label}</div>
                </div>
              )}

              <Field label="Confirm New Password" icon={FaLock} type={showConf ? "text" : "password"}
                value={confPwd} onChange={e => setConfPwd(e.target.value)}
                placeholder="Confirm new password"
                rightEl={eyeBtn(showConf, () => setShowConf(v => !v))} />

              {/* Match indicator */}
              {confPwd && newPwd && (
                <div style={{
                  marginTop: "-12px", marginBottom: "16px", fontSize: "12px", fontWeight: 600,
                  color: confPwd === newPwd ? "var(--green)" : "var(--red)",
                  display: "flex", alignItems: "center", gap: "5px"
                }}>
                  {confPwd === newPwd ? <FaCheck style={{ fontSize: "9px" }} /> : <FaTimes style={{ fontSize: "9px" }} />}
                  {confPwd === newPwd ? "Passwords match" : "Passwords do not match"}
                </div>
              )}

              <button onClick={handleChangePassword} disabled={pwdSaving} style={{
                width: "100%", padding: "11px", borderRadius: "var(--radius-sm)",
                background: pwdSaving ? "var(--bg-elevated)" : "var(--text-primary)",
                color: pwdSaving ? "var(--text-muted)" : "#0a0a0a",
                border: "none", cursor: pwdSaving ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: "15px", fontFamily: "var(--font-display)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}>
                <FaLock style={{ fontSize: "12px" }} />
                {pwdSaving ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>

          {/* ── Super Admin: Staff & Receptionists Section ── */}
          {profile?.role === "super_admin" && (
            <div style={{
              marginTop: "24px", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaUsers style={{ color: "var(--blue)" }} /> Staff & Reception Accounts
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "3px" }}>
                    Manage login credentials for front-desk receptionists and staff
                  </p>
                </div>

                <button
                  onClick={() => setShowAddStaffModal(true)}
                  style={{
                    padding: "8px 16px", borderRadius: "var(--radius-sm)",
                    background: "var(--text-primary)", color: "#0a0a0a", border: "none",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <FaUserPlus /> + Add Receptionist
                </button>
              </div>

              <Alert msg={staffMsg.text} type={staffMsg.type} />

              {loadingStaff ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading staff accounts...</div>
              ) : staffList.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13.5px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
                  No receptionist accounts created yet. Click "+ Add Receptionist" above to create one.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {staffList.map(s => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", borderRadius: "var(--radius-sm)",
                        background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                        flexWrap: "wrap", gap: "10px"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14.5px" }}>{s.full_name}</span>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                            background: "rgba(96,165,250,0.12)", color: "var(--blue)", textTransform: "capitalize"
                          }}>
                            {s.role}
                          </span>
                        </div>
                        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {s.email} • Created {fmtDate(s.created_at)}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => { setResetStaffTarget(s); setResetPwdValue(""); }}
                          style={{
                            padding: "6px 12px", borderRadius: "var(--radius-sm)",
                            background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                            color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                          }}
                        >
                          <FaKey style={{ fontSize: "10px" }} /> Reset Password
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id, s.full_name)}
                          style={{
                            padding: "6px 10px", borderRadius: "var(--radius-sm)",
                            background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.2)",
                            color: "var(--red)", fontSize: "12px", cursor: "pointer"
                          }}
                          title="Delete staff"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── MODAL: Add New Staff ── */}
      {showAddStaffModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddStaffModal(false); }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "440px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Add Receptionist Account
              </h2>
              <button onClick={() => setShowAddStaffModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}><FaTimes /></button>
            </div>

            <form onSubmit={handleAddStaff}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Staff Full Name *</label>
                <input
                  autoFocus
                  required
                  value={newStaff.full_name}
                  onChange={e => setNewStaff(s => ({ ...s, full_name: e.target.value }))}
                  placeholder="e.g. Pooja Sharma"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Login Email *</label>
                <input
                  required
                  type="email"
                  value={newStaff.email}
                  onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))}
                  placeholder="reception@gym.com"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Password * (min 6 chars)</label>
                <input
                  required
                  type="password"
                  value={newStaff.password}
                  onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))}
                  placeholder="Enter password"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Assigned Role</label>
                <select
                  value={newStaff.role}
                  onChange={e => setNewStaff(s => ({ ...s, role: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                >
                  <option value="receptionist">Receptionist (Front-Desk Desk Access Only)</option>
                  <option value="super_admin">Super Admin (Full Financial & System Access)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  style={{ padding: "8px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffSaving}
                  style={{
                    padding: "8px 18px", borderRadius: "var(--radius-sm)", background: "var(--text-primary)",
                    color: "#0a0a0a", border: "none", fontWeight: 700, cursor: staffSaving ? "not-allowed" : "pointer"
                  }}
                >
                  {staffSaving ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Reset Staff Password ── */}
      {resetStaffTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) setResetStaffTarget(null); }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "400px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Reset Password
              </h2>
              <button onClick={() => setResetStaffTarget(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}><FaTimes /></button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
              Set a new password for <strong style={{ color: "var(--text-primary)" }}>{resetStaffTarget.full_name}</strong> ({resetStaffTarget.email}):
            </p>

            <input
              autoFocus
              type="password"
              value={resetPwdValue}
              onChange={e => setResetPwdValue(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "16px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setResetStaffTarget(null)}
                style={{ padding: "8px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetStaffPassword}
                disabled={staffSaving || resetPwdValue.length < 6}
                style={{
                  padding: "8px 18px", borderRadius: "var(--radius-sm)", background: "var(--text-primary)",
                  color: "#0a0a0a", border: "none", fontWeight: 700, cursor: (staffSaving || resetPwdValue.length < 6) ? "not-allowed" : "pointer"
                }}
              >
                {staffSaving ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}