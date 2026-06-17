import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api     from "../services/api";
import {
  FaTools, FaPlus, FaEdit, FaTrash, FaSearch,
  FaBoxOpen, FaCheckCircle, FaExclamationTriangle,
  FaRupeeSign, FaTimes, FaChevronLeft, FaChevronRight
} from "react-icons/fa";

// ── useMobile hook ────────────────────────────────────────────────────────────
function useMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["Cardio","Strength","Weights","Functional","Stretching","Other"];
const CONDITIONS = ["excellent","good","fair","poor","out_of_order"];
const STATUSES   = ["active","inactive","under_maintenance","retired"];

const COND_COLOR = {
  excellent:     { bg:"rgba(52,211,153,0.12)", color:"#34d399" },
  good:          { bg:"rgba(96,165,250,0.12)", color:"#60a5fa" },
  fair:          { bg:"rgba(251,191,36,0.12)", color:"#fbbf24" },
  poor:          { bg:"rgba(248,113,113,0.12)", color:"#f87171" },
  out_of_order:  { bg:"rgba(239,68,68,0.18)",  color:"#ef4444" },
};
const STATUS_COLOR = {
  active:            { bg:"rgba(52,211,153,0.12)", color:"#34d399" },
  inactive:          { bg:"rgba(156,163,175,0.12)",color:"#9ca3af" },
  under_maintenance: { bg:"rgba(251,191,36,0.12)", color:"#fbbf24" },
  retired:           { bg:"rgba(248,113,113,0.12)",color:"#f87171" },
};

const EMPTY = {
  name:"", category:"Cardio", brand:"", model:"", serial_number:"",
  purchase_date:"", purchase_price:"", condition_status:"good",
  location:"", quantity:1, notes:"", status:"active"
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color="#60a5fa" }) {
  return (
    <div style={{
      background:"var(--bg-surface)", border:"1px solid var(--border-subtle)",
      borderRadius:"var(--radius-lg)", padding:"20px 24px",
      display:"flex", alignItems:"center", gap:"16px"
    }}>
      <div style={{
        width:"44px", height:"44px", borderRadius:"10px", flexShrink:0,
        background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center"
      }}>
        <Icon style={{ color, fontSize: "20px" }} />
      </div>
      <div>
        <div style={{ fontSize: "25px", fontWeight:700, color:"var(--text-primary)", fontFamily:"var(--font-display)" }}>
          {value}
        </div>
        <div style={{ fontSize: "13px", color:"var(--text-muted)" }}>{label}</div>
        {sub && <div style={{ fontSize: "12px", color:"var(--text-muted)", marginTop:"2px" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ value, map }) {
  const s = map[value] || { bg:"rgba(156,163,175,0.12)", color:"#9ca3af" };
  return (
    <span style={{
      padding:"3px 10px", borderRadius:"20px", fontSize: "12px",
      fontWeight:600, background:s.bg, color:s.color,
      textTransform:"capitalize", whiteSpace:"nowrap"
    }}>{value?.replace(/_/g," ")}</span>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  const isMobile = useMobile();
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
      display:"flex", alignItems: isMobile ? "flex-end" : "center",
      justifyContent:"center",
      zIndex:1000, padding: isMobile ? 0 : "20px"
    }}>
      <div style={{
        background:"var(--bg-surface)", borderRadius: isMobile ? "16px 16px 0 0" : "var(--radius-lg)",
        border:"1px solid var(--border-subtle)", width:"100%", maxWidth: isMobile ? "100%" : "600px",
        maxHeight: isMobile ? "92vh" : "90vh", overflowY:"auto"
      }}>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"20px 24px",
          paddingTop: isMobile ? "calc(20px + env(safe-area-inset-top))" : "20px",
          borderBottom:"1px solid var(--border-subtle)"
        }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, color:"var(--text-primary)", margin:0 }}>
            {title}
          </h3>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:"var(--text-muted)",
            cursor:"pointer", padding:"4px", fontSize: "18px"
          }}><FaTimes /></button>
        </div>
        <div style={{
          padding:"24px",
          paddingBottom: isMobile ? "calc(24px + env(safe-area-inset-bottom))" : "24px"
        }}>{children}</div>
      </div>
    </div>
  );
}

// ── Form Field ─────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label style={{
        display:"block", marginBottom:"6px", fontSize: "12px", fontWeight:600,
        color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em"
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"10px 12px",
  background:"var(--bg-elevated)", border:"1px solid var(--border-default)",
  borderRadius:"var(--radius-md)", color:"var(--text-primary)",
  outline:"none", fontSize: "15px", boxSizing:"border-box"
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Equipment({ onLogout }) {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stFilter,  setStFilter]  = useState("");
  const [page,      setPage]      = useState(1);
  const [totalPages,setTotalPages]= useState(1);
  const [totalItems,setTotalItems]= useState(0);

  const [modal,     setModal]     = useState(null); // "add" | "edit" | "delete"
  const [selected,  setSelected]  = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  // ── Fetch list ────────────────────────────────────────────────────────────
  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/equipment", {
        params: { page, limit:10, search, category:catFilter, status:stFilter }
      });
      setEquipment(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.total);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  }, [page, search, catFilter, stFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/equipment/stats/summary");
      setStats(res.data.data);
    } catch {}
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setPage(1); }, [search, catFilter, stFilter]);
  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd  = () => { setForm(EMPTY); setError(""); setModal("add"); };
  const openEdit = (eq) => { setForm({ ...eq, purchase_date: eq.purchase_date?.split("T")[0] || "" }); setSelected(eq); setError(""); setModal("edit"); };
  const openDel  = (eq) => { setSelected(eq); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); setError(""); };

  const handleSave = async () => {
    if (!form.name || !form.category) { setError("Name and category are required"); return; }
    setSaving(true); setError("");
    try {
      if (modal === "add") {
        await api.post("/equipment", form);
      } else {
        await api.put(`/equipment/${selected.id}`, form);
      }
      closeModal(); fetchEquipment(); fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/equipment/${selected.id}`);
      closeModal(); fetchEquipment(); fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // ── Render ─────────────────────────────────────────────────────────────────
  const isMobile = useMobile();

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg-base)", fontFamily:"var(--font-body)" }}>
      <Sidebar onLogout={onLogout} />

      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? "16px" : "24px 32px",
          borderBottom:"1px solid var(--border-subtle)",
          background:"var(--bg-surface)", display:"flex", alignItems:"center", justifyContent:"space-between"
        }}>
          <div>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize: isMobile ? "18px" : "22px", fontWeight:800, color:"var(--text-primary)", margin:0 }}>
              Equipment
            </h1>
            {!isMobile && (
              <p style={{ color:"var(--text-muted)", fontSize: "15px", margin:"4px 0 0" }}>
                Track and manage all gym equipment
              </p>
            )}
          </div>
          <button onClick={openAdd} style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding: isMobile ? "8px 14px" : "10px 18px",
            background:"var(--text-primary)", color:"#0a0a0a",
            border:"none", borderRadius:"var(--radius-md)", cursor:"pointer",
            fontFamily:"var(--font-display)", fontWeight:700, fontSize: "15px"
          }}>
            <FaPlus /> {isMobile ? "Add" : "Add Equipment"}
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "12px" : "24px 32px" }}>

          {/* Stats */}
          {stats && (
            <div style={{
              display:"grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: isMobile ? "10px" : "16px",
              marginBottom: isMobile ? "14px" : "24px"
            }}>
              <StatCard icon={FaTools}               label="Total"      value={stats.total}      color="#60a5fa" />
              <StatCard icon={FaCheckCircle}          label="Active"     value={stats.active}     color="#34d399" />
              <StatCard icon={FaExclamationTriangle}  label="Maintenance" value={stats.maintenance} color="#fbbf24" />
              <StatCard icon={FaRupeeSign}            label="Asset Value"
                value={`₹${Number(stats.totalValue).toLocaleString("en-IN")}`} color="#a78bfa" />
            </div>
          )}

          {/* Filters */}
          <div style={{
            background:"var(--bg-surface)", border:"1px solid var(--border-subtle)",
            borderRadius:"var(--radius-lg)", padding: isMobile ? "12px" : "16px 20px",
            marginBottom:"16px",
            display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center"
          }}>
            <div style={{ position:"relative", flex:1, minWidth: isMobile ? "100%" : "200px" }}>
              <FaSearch style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", fontSize: "13px" }} />
              <input
                placeholder="Search equipment..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft:"34px" }}
              />
            </div>
            <div style={{ display:"flex", gap:"8px", width: isMobile ? "100%" : "auto" }}>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                style={{ ...inputStyle, flex: isMobile ? 1 : "none", width: isMobile ? "auto" : "160px" }}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={stFilter} onChange={e => setStFilter(e.target.value)}
                style={{ ...inputStyle, flex: isMobile ? 1 : "none", width: isMobile ? "auto" : "160px" }}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
              {(search || catFilter || stFilter) && (
                <button onClick={() => { setSearch(""); setCatFilter(""); setStFilter(""); }} style={{
                  padding:"10px 14px", background:"var(--bg-elevated)", border:"1px solid var(--border-default)",
                  borderRadius:"var(--radius-md)", color:"var(--text-muted)", cursor:"pointer", fontSize: "13px"
                }}>✕</button>
              )}
            </div>
          </div>

          {/* Table (desktop) / Cards (mobile) */}
          <div style={{
            background:"var(--bg-surface)", border:"1px solid var(--border-subtle)",
            borderRadius:"var(--radius-lg)", overflow:"hidden"
          }}>
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 20px", borderBottom:"1px solid var(--border-subtle)"
            }}>
              <span style={{ fontSize: "15px", color:"var(--text-muted)" }}>
                {loading ? "Loading..." : `${totalItems} item${totalItems !== 1 ? "s" : ""} found`}
              </span>
            </div>

            {isMobile ? (
              /* ── Mobile Card List ── */
              <div style={{ padding:"12px", display:"flex", flexDirection:"column", gap:"10px" }}>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} style={{ padding:"16px", borderRadius:"var(--radius-md)", background:"var(--bg-elevated)", border:"1px solid var(--border-subtle)" }}>
                      <div style={{ height:"13px", width:"50%", background:"var(--bg-surface)", borderRadius:"4px", marginBottom:"8px" }} />
                      <div style={{ height:"11px", width:"80%", background:"var(--bg-surface)", borderRadius:"4px" }} />
                    </div>
                  ))
                ) : equipment.length === 0 ? (
                  <div style={{ padding:"40px", textAlign:"center", color:"var(--text-muted)" }}>
                    <FaBoxOpen style={{ fontSize: "31px", marginBottom:"8px", opacity:0.3 }} />
                    <div>No equipment found</div>
                  </div>
                ) : equipment.map((eq, i) => (
                  <div key={eq.id} style={{
                    padding:"14px 16px", borderRadius:"var(--radius-md)",
                    background:"var(--bg-elevated)", border:"1px solid var(--border-subtle)",
                    position:"relative"
                  }}>
                    {/* Top row: name + actions */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, color:"var(--text-primary)", fontSize: "16px" }}>{eq.name}</div>
                        {eq.serial_number && <div style={{ fontSize: "12px", color:"var(--text-muted)", marginTop:"2px" }}>S/N: {eq.serial_number}</div>}
                      </div>
                      <div style={{ display:"flex", gap:"6px", marginLeft:"10px", flexShrink:0 }}>
                        <button onClick={() => openEdit(eq)} style={{
                          padding:"6px 10px", background:"rgba(96,165,250,0.1)",
                          border:"1px solid rgba(96,165,250,0.2)", borderRadius:"6px",
                          color:"#60a5fa", cursor:"pointer", fontSize: "13px"
                        }}><FaEdit /></button>
                        <button onClick={() => openDel(eq)} style={{
                          padding:"6px 10px", background:"rgba(248,113,113,0.1)",
                          border:"1px solid rgba(248,113,113,0.2)", borderRadius:"6px",
                          color:"#f87171", cursor:"pointer", fontSize: "13px"
                        }}><FaTrash /></button>
                      </div>
                    </div>
                    {/* Meta row */}
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ padding:"2px 8px", borderRadius:"12px", fontSize: "12px", fontWeight:600, background:"rgba(96,165,250,0.1)", color:"#60a5fa" }}>
                        {eq.category}
                      </span>
                      <Badge value={eq.condition_status} map={COND_COLOR} />
                      <Badge value={eq.status} map={STATUS_COLOR} />
                      {eq.location && (
                        <span style={{ fontSize: "12px", color:"var(--text-muted)" }}>📍 {eq.location}</span>
                      )}
                      <span style={{ fontSize: "12px", color:"var(--text-muted)", marginLeft:"auto" }}>
                        Qty: {eq.quantity}
                      </span>
                    </div>
                    {(eq.brand || eq.model) && (
                      <div style={{ fontSize: "13px", color:"var(--text-secondary)", marginTop:"6px" }}>
                        {eq.brand}{eq.model ? ` / ${eq.model}` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* ── Desktop Table ── */
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid var(--border-subtle)" }}>
                      {["#","Name","Category","Brand / Model","Location","Qty","Condition","Status","Actions"].map(h => (
                        <th key={h} style={{
                          padding:"12px 16px", textAlign:"left", fontSize: "12px",
                          fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase",
                          letterSpacing:"0.08em", whiteSpace:"nowrap"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={9} style={{ padding:"48px", textAlign:"center", color:"var(--text-muted)" }}>
                        Loading equipment...
                      </td></tr>
                    ) : equipment.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding:"48px", textAlign:"center", color:"var(--text-muted)" }}>
                        <FaBoxOpen style={{ fontSize: "36px", marginBottom:"8px", opacity:0.3 }} />
                        <div>No equipment found</div>
                      </td></tr>
                    ) : equipment.map((eq, i) => (
                      <tr key={eq.id} style={{
                        borderBottom:"1px solid var(--border-subtle)",
                        transition:"background 0.15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding:"14px 16px", color:"var(--text-muted)", fontSize: "13px" }}>
                          {(page - 1) * 10 + i + 1}
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <div style={{ fontWeight:600, color:"var(--text-primary)", fontSize: "15px" }}>{eq.name}</div>
                          {eq.serial_number && <div style={{ fontSize: "12px", color:"var(--text-muted)" }}>S/N: {eq.serial_number}</div>}
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <span style={{
                            padding:"3px 10px", borderRadius:"20px", fontSize: "12px",
                            fontWeight:600, background:"rgba(96,165,250,0.1)", color:"#60a5fa"
                          }}>{eq.category}</span>
                        </td>
                        <td style={{ padding:"14px 16px", fontSize: "15px", color:"var(--text-secondary)" }}>
                          {eq.brand || "—"}{eq.model ? ` / ${eq.model}` : ""}
                        </td>
                        <td style={{ padding:"14px 16px", fontSize: "15px", color:"var(--text-secondary)" }}>
                          {eq.location || "—"}
                        </td>
                        <td style={{ padding:"14px 16px", fontSize: "16px", fontWeight:600, color:"var(--text-primary)" }}>
                          {eq.quantity}
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <Badge value={eq.condition_status} map={COND_COLOR} />
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <Badge value={eq.status} map={STATUS_COLOR} />
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <button onClick={() => openEdit(eq)} style={{
                              padding:"6px 10px", background:"rgba(96,165,250,0.1)",
                              border:"1px solid rgba(96,165,250,0.2)", borderRadius:"6px",
                              color:"#60a5fa", cursor:"pointer", fontSize: "13px"
                            }} title="Edit"><FaEdit /></button>
                            <button onClick={() => openDel(eq)} style={{
                              padding:"6px 10px", background:"rgba(248,113,113,0.1)",
                              border:"1px solid rgba(248,113,113,0.2)", borderRadius:"6px",
                              color:"#f87171", cursor:"pointer", fontSize: "13px"
                            }} title="Delete"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"14px 20px", borderTop:"1px solid var(--border-subtle)"
              }}>
                <span style={{ fontSize: "15px", color:"var(--text-muted)" }}>
                  Page {page} of {totalPages}
                </span>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{
                    padding:"7px 12px", background:"var(--bg-elevated)", border:"1px solid var(--border-default)",
                    borderRadius:"6px", color: page === 1 ? "var(--text-muted)" : "var(--text-primary)",
                    cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1
                  }}><FaChevronLeft /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={{
                    padding:"7px 12px", background:"var(--bg-elevated)", border:"1px solid var(--border-default)",
                    borderRadius:"6px", color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)",
                    cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1
                  }}><FaChevronRight /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────────────────── */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Equipment" : "Edit Equipment"} onClose={closeModal}>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:"16px" }}>
            <Field label="Name *">
              <input value={form.name} onChange={f("name")} placeholder="e.g. Treadmill Pro" style={inputStyle} />
            </Field>
            <Field label="Category *">
              <select value={form.category} onChange={f("category")} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={f("brand")} placeholder="e.g. LifeFitness" style={inputStyle} />
            </Field>
            <Field label="Model">
              <input value={form.model} onChange={f("model")} placeholder="e.g. T5" style={inputStyle} />
            </Field>
            <Field label="Serial Number">
              <input value={form.serial_number} onChange={f("serial_number")} placeholder="Unique serial" style={inputStyle} />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={f("location")} placeholder="e.g. Cardio Zone" style={inputStyle} />
            </Field>
            <Field label="Purchase Date">
              <input type="date" value={form.purchase_date} onChange={f("purchase_date")} style={inputStyle} />
            </Field>
            <Field label="Purchase Price (₹)">
              <input type="number" value={form.purchase_price} onChange={f("purchase_price")} placeholder="0" style={inputStyle} />
            </Field>
            <Field label="Quantity">
              <input type="number" value={form.quantity} onChange={f("quantity")} min="1" style={inputStyle} />
            </Field>
            <Field label="Condition">
              <select value={form.condition_status} onChange={f("condition_status")} style={inputStyle}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={f("status")} style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.notes} onChange={f("notes")} rows={3}
              placeholder="Any additional notes..."
              style={{ ...inputStyle, resize:"vertical", marginTop:"16px" }} />
          </Field>

          {error && (
            <div style={{
              padding:"10px 14px", borderRadius:"8px",
              background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)",
              color:"#f87171", fontSize: "15px", marginTop:"16px"
            }}>{error}</div>
          )}

          <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end", marginTop:"24px" }}>
            <button onClick={closeModal} style={{
              padding:"10px 20px", background:"var(--bg-elevated)",
              border:"1px solid var(--border-default)", borderRadius:"var(--radius-md)",
              color:"var(--text-secondary)", cursor:"pointer", fontSize: "15px"
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding:"10px 20px", background:"var(--text-primary)", color:"#0a0a0a",
              border:"none", borderRadius:"var(--radius-md)", cursor:saving?"not-allowed":"pointer",
              fontWeight:700, fontSize: "15px", opacity:saving?0.7:1
            }}>{saving ? "Saving..." : modal === "add" ? "Add Equipment" : "Save Changes"}</button>
          </div>
        </Modal>
      )}

      {/* ── DELETE MODAL ──────────────────────────────────────────────────────── */}
      {modal === "delete" && selected && (
        <Modal title="Delete Equipment" onClose={closeModal}>
          <p style={{ color:"var(--text-secondary)", marginBottom:"8px" }}>
            Are you sure you want to delete <strong style={{ color:"var(--text-primary)" }}>{selected.name}</strong>?
          </p>
          <p style={{ color:"var(--text-muted)", fontSize: "15px", marginBottom:"24px" }}>
            This action cannot be undone.
          </p>
          {error && (
            <div style={{
              padding:"10px 14px", borderRadius:"8px",
              background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)",
              color:"#f87171", fontSize: "15px", marginBottom:"16px"
            }}>{error}</div>
          )}
          <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end" }}>
            <button onClick={closeModal} style={{
              padding:"10px 20px", background:"var(--bg-elevated)",
              border:"1px solid var(--border-default)", borderRadius:"var(--radius-md)",
              color:"var(--text-secondary)", cursor:"pointer", fontSize: "15px"
            }}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} style={{
              padding:"10px 20px", background:"#ef4444", color:"#fff",
              border:"none", borderRadius:"var(--radius-md)", cursor:saving?"not-allowed":"pointer",
              fontWeight:700, fontSize: "15px", opacity:saving?0.7:1
            }}>{saving ? "Deleting..." : "Yes, Delete"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}