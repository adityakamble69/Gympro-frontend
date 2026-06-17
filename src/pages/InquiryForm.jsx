import { useState, useEffect, useRef } from "react";
const API = "https://gympro-backend-production-2c21.up.railway.app/api";

export default function InquiryForm() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", gender: "",
    date_of_birth: "", address: "", message: "",
    membership_interest: "not_sure", preferred_time: "anytime",
    photo: "", aadhar_card: ""
  });
  const [plans, setPlans]               = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraOpen, setCameraOpen]     = useState(false);
  const [stream, setStream]             = useState(null);
  const [photoStatus, setPhotoStatus]   = useState("No photo taken yet");

  // Aadhaar state
  const [aadharPreview, setAadharPreview]   = useState(null);
  const [aadharStatus, setAadharStatus]     = useState("No Aadhaar uploaded yet");
  const [aadharSide, setAadharSide]         = useState("front"); // "front" | "back"
  const [aadharFront, setAadharFront]       = useState(null);
  const [aadharBack, setAadharBack]         = useState(null);

  const [alert, setAlert]             = useState({ type: "", msg: "" });
  const [submitting, setSubmitting]   = useState(false);

  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const aadharFrontRef = useRef(null);
  const aadharBackRef  = useRef(null);

  useEffect(() => {
    fetch(`${API}/membership-plans/public`)
      .then(r => r.json())
      .then(json => { if (json.success) setPlans(json.data); })
      .catch(() => {});
  }, []);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  // ── Camera ─────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setStream(s);
      setCameraOpen(true);
      setPhotoStatus("Position your face and click Take Photo");
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch {
      setPhotoStatus("⚠️ Camera access denied. Please upload a photo.");
    }
  };

  const takePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg", 0.75);
    showPhoto(dataURL);
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    setCameraOpen(false);
  };

  const showPhoto = (dataURL) => {
    setForm(p => ({ ...p, photo: dataURL }));
    setPhotoPreview(dataURL);
    setPhotoStatus("✅ Photo captured!");
  };

  const removePhoto = () => {
    setForm(p => ({ ...p, photo: "" }));
    setPhotoPreview(null);
    setPhotoStatus("No photo taken yet");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setPhotoStatus("⚠️ File too large. Max 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const MAX = 640;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        showPhoto(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ── Aadhaar Upload ─────────────────────────────────────────────────────────
  const handleAadharUpload = (side) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setAadharStatus("⚠️ File too large. Max 5MB."); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataURL = ev.target.result;
      if (side === "front") {
        setAadharFront(dataURL);
        setAadharStatus(aadharBack ? "✅ Both sides uploaded!" : "Front uploaded. Now upload Back side.");
      } else {
        setAadharBack(dataURL);
        setAadharStatus(aadharFront ? "✅ Both sides uploaded!" : "Back uploaded. Now upload Front side.");
      }
      // Store as JSON object with both sides
      const combined = side === "front"
        ? { front: dataURL, back: aadharBack }
        : { front: aadharFront, back: dataURL };
      setForm(p => ({ ...p, aadhar_card: JSON.stringify(combined) }));
    };
    reader.readAsDataURL(file);
  };

  const removeAadhar = () => {
    setAadharFront(null);
    setAadharBack(null);
    setForm(p => ({ ...p, aadhar_card: "" }));
    setAadharStatus("No Aadhaar uploaded yet");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      setAlert({ type: "error", msg: "⚠️ Please fill in Name, Email and Phone." });
      return;
    }
    setSubmitting(true);
    setAlert({ type: "", msg: "" });
    try {
      const res  = await fetch(`${API}/inquiries/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setAlert({ type: "success", msg: "✅ Thank you! We will contact you within 24 hours." });
        setForm({ full_name:"", email:"", phone:"", gender:"", date_of_birth:"", address:"", message:"", membership_interest:"not_sure", preferred_time:"anytime", photo:"", aadhar_card:"" });
        removePhoto();
        removeAadhar();
      } else throw new Error(json.message);
    } catch (err) {
      setAlert({ type: "error", msg: "❌ " + (err.message || "Something went wrong.") });
    } finally { setSubmitting(false); }
  };

  const durationLabel = (type, days) => {
    if (type === "monthly")   return "1 Month";
    if (type === "quarterly") return `${Math.round(days / 30)} Months`;
    if (type === "yearly")    return "1 Year";
    return `${days} Days`;
  };

  // ── Styles — Pure Black & Gray Theme ──────────────────────────────────────
  const S = {
    page: { minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"'DM Sans', sans-serif", color:"#d4d4d4", position:"relative" },
    bg:   { position:"fixed", inset:0, backgroundImage:"radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,255,255,0.03), transparent)", pointerEvents:"none", zIndex:0 },
    wrap: { position:"relative", zIndex:1, width:"100%", maxWidth:"580px" },
    header: { textAlign:"center", marginBottom:"32px" },
    logo: { display:"inline-flex", alignItems:"center", gap:"10px", marginBottom:"20px" },
    logoIcon: { width:"40px", height:"40px", background:"#1f1f1f", border:"1px solid #333", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize: "20px" },
    logoText: { fontFamily:"'Syne', sans-serif", fontSize: "22px", fontWeight:800, color:"#f0f0f0" },
    h1: { fontFamily:"'Syne', sans-serif", fontSize: "36px", fontWeight:800, letterSpacing:"-0.5px", lineHeight:1.2, marginBottom:"10px", color:"#f0f0f0" },
    subtitle: { color:"#6b6b6b", fontSize: "17px", lineHeight:1.6 },
    card: { background:"#111111", border:"1px solid #222222", borderRadius:"16px", padding:"32px", boxShadow:"0 8px 60px rgba(0,0,0,0.8)" },
    grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" },
    field: { display:"flex", flexDirection:"column", gap:"6px" },
    label: { fontSize: "12px", fontWeight:600, color:"#555", textTransform:"uppercase", letterSpacing:"0.1em" },
    input: { background:"#191919", border:"1px solid #2a2a2a", borderRadius:"8px", color:"#d4d4d4", fontFamily:"'DM Sans', sans-serif", fontSize: "16px", padding:"11px 14px", outline:"none", width:"100%", boxSizing:"border-box", transition:"border-color 0.15s" },
    section: { marginTop:"20px" },
    sectionTitle: { fontSize: "15px", fontWeight:600, color:"#555", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px", display:"flex", alignItems:"center", gap:"8px" },
    photoSection: { background:"#191919", border:"1px solid #2a2a2a", borderRadius:"12px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" },
    photoWrap: { width:"120px", height:"120px", borderRadius:"50%", overflow:"hidden", border:"2px solid #2a2a2a", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    camBtn: { padding:"9px 16px", borderRadius:"8px", border:"1px solid #2a2a2a", background:"#191919", color:"#aaa", cursor:"pointer", fontSize: "15px", fontWeight:500 },
    camBtnPrimary: { padding:"9px 16px", borderRadius:"8px", border:"1px solid #444", background:"#2a2a2a", color:"#f0f0f0", cursor:"pointer", fontSize: "15px", fontWeight:600 },
    camBtnDanger: { padding:"9px 16px", borderRadius:"8px", border:"none", background:"rgba(248,81,73,0.12)", color:"#f85149", cursor:"pointer", fontSize: "15px", fontWeight:500 },
    planCard: { display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", borderRadius:"10px", border:"1px solid #222", background:"#191919", cursor:"pointer", marginBottom:"8px", transition:"all 0.15s" },
    planCardActive: { border:"1px solid #555", background:"#222" },
    pill: { padding:"8px 16px", borderRadius:"99px", border:"1px solid #222", background:"#191919", color:"#666", cursor:"pointer", fontSize: "15px", fontWeight:500, transition:"all 0.15s" },
    pillActive: { border:"1px solid #888", background:"#2a2a2a", color:"#f0f0f0" },
    submitBtn: { width:"100%", padding:"14px", background:"#e0e0e0", color:"#0a0a0a", border:"none", borderRadius:"10px", fontSize: "17px", fontWeight:800, cursor:"pointer", marginTop:"24px", fontFamily:"'Syne', sans-serif", letterSpacing:"0.06em" },
    alert: (type) => ({ padding:"14px 18px", borderRadius:"10px", fontSize: "16px", marginBottom:"16px", background: type === "success" ? "rgba(63,185,80,0.08)" : "rgba(248,81,73,0.08)", border:`1px solid ${type === "success" ? "rgba(63,185,80,0.25)" : "rgba(248,81,73,0.25)"}`, color: type === "success" ? "#3fb950" : "#f85149" }),
    divider: { height:"1px", background:"#1e1e1e", margin:"20px 0" },
    video: { width:"100%", borderRadius:"8px", display: cameraOpen ? "block" : "none" },

    // Aadhaar styles
    aadharSection: { background:"#161b22", border:"1px solid #30363d", borderRadius:"12px", padding:"20px", display:"flex", flexDirection:"column", gap:"16px" },
    aadharSideTabs: { display:"flex", gap:"8px" },
    aadharSideTab: (active) => ({
      flex:1, padding:"8px", borderRadius:"8px", border:`1px solid ${active ? "#2f81f7" : "#30363d"}`,
      background: active ? "rgba(47,129,247,0.1)" : "#0d1117",
      color: active ? "#2f81f7" : "#8b949e",
      cursor:"pointer", fontSize:"14px", fontWeight:600, textAlign:"center", transition:"all 0.15s"
    }),
    aadharCardWrap: (uploaded) => ({
      width:"100%", height:"140px", borderRadius:"10px",
      border:`2px dashed ${uploaded ? "#3fb950" : "#30363d"}`,
      background:"#0d1117",
      display:"flex", alignItems:"center", justifyContent:"center",
      overflow:"hidden", position:"relative", cursor:"pointer",
      transition:"border-color 0.2s"
    }),
    aadharOverlay: { position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s" },
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={S.page}>
        <div style={S.bg} />
        <div style={S.wrap}>
          {/* Header */}
          <div style={S.header}>
            <div style={S.logo}>
              <div style={S.logoIcon}>⚡</div>
              <span style={S.logoText}>WORKOUT WORLD GYM</span>
            </div>
            <h1 style={S.h1}>Start Your <span style={{ color:"#2f81f7" }}>Fitness Journey</span></h1>
            <p style={S.subtitle}>Fill in your details and we'll get back to you within 24 hours.</p>
          </div>

          {/* Card */}
          <div style={S.card}>
            {alert.msg && <div style={S.alert(alert.type)}>{alert.msg}</div>}

            <form onSubmit={handleSubmit}>
              {/* Personal Info */}
              <div style={S.grid}>
                <div style={S.field}>
                  <label style={S.label}>Full Name *</label>
                  <input style={S.input} value={form.full_name} onChange={f("full_name")} placeholder="Your full name" />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Phone *</label>
                  <input style={S.input} value={form.phone} onChange={f("phone")} placeholder="10-digit mobile" />
                </div>
                <div style={{ ...S.field, gridColumn:"1/-1" }}>
                  <label style={S.label}>Email *</label>
                  <input style={S.input} type="email" value={form.email} onChange={f("email")} placeholder="your@email.com" />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Gender</label>
                  <select style={S.input} value={form.gender} onChange={f("gender")}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Date of Birth</label>
                  <input style={S.input} type="date" value={form.date_of_birth} onChange={f("date_of_birth")} />
                </div>
                <div style={{ ...S.field, gridColumn:"1/-1" }}>
                  <label style={S.label}>Address</label>
                  <input style={S.input} value={form.address} onChange={f("address")} placeholder="Your address" />
                </div>
              </div>

              <div style={S.divider} />

              {/* Photo */}
              <p style={S.sectionTitle}>📷 Your Photo</p>
              <div style={S.photoSection}>
                <div style={{ ...S.photoWrap, border: photoPreview ? "2px solid #3fb950" : "2px solid #30363d" }}>
                  {photoPreview
                    ? <img src={photoPreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <span style={{ color:"#484f58", fontSize: "45px" }}>👤</span>
                  }
                </div>

                {cameraOpen ? (
                  <div style={{ width:"100%" }}>
                    <video ref={videoRef} autoPlay playsInline style={{ width:"100%", borderRadius:"8px" }} />
                    <div style={{ display:"flex", gap:"8px", marginTop:"10px", justifyContent:"center" }}>
                      <button type="button" style={S.camBtnPrimary} onClick={takePhoto}>📸 Take Photo</button>
                      <button type="button" style={S.camBtnDanger}  onClick={stopCamera}>✕ Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center" }}>
                    <button type="button" style={S.camBtnPrimary} onClick={openCamera}>
                      {photoPreview ? "📷 Retake" : "📷 Open Camera"}
                    </button>
                    {photoPreview && <button type="button" style={S.camBtnDanger} onClick={removePhoto}>🗑️ Remove</button>}
                    <label style={{ ...S.camBtn, padding:"9px 16px", cursor:"pointer" }}>
                      🖼️ Upload
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileUpload} />
                    </label>
                  </div>
                )}
                <p style={{ fontSize: "13px", color: photoPreview ? "#3fb950" : "#f0883e" }}>{photoStatus}</p>
              </div>
              <canvas ref={canvasRef} style={{ display:"none" }} />

              <div style={S.divider} />

              {/* ── Aadhaar Card ────────────────────────────────────────────── */}
              <p style={S.sectionTitle}>🪪 Aadhaar Card <span style={{ color:"#484f58", fontWeight:400, textTransform:"none", fontSize:"12px", letterSpacing:0 }}>(optional)</span></p>
              <div style={S.aadharSection}>

                {/* Side tabs */}
                <div style={S.aadharSideTabs}>
                  <div style={S.aadharSideTab(aadharSide === "front")} onClick={() => setAadharSide("front")}>
                    {aadharFront ? "✅ " : ""}Front Side
                  </div>
                  <div style={S.aadharSideTab(aadharSide === "back")} onClick={() => setAadharSide("back")}>
                    {aadharBack ? "✅ " : ""}Back Side
                  </div>
                </div>

                {/* Upload box */}
                <div>
                  {aadharSide === "front" ? (
                    <label>
                      <div
                        style={S.aadharCardWrap(!!aadharFront)}
                        onMouseEnter={e => { if (aadharFront) e.currentTarget.querySelector(".aadhar-overlay").style.opacity = "1"; }}
                        onMouseLeave={e => { if (aadharFront) e.currentTarget.querySelector(".aadhar-overlay").style.opacity = "0"; }}
                      >
                        {aadharFront ? (
                          <>
                            <img src={aadharFront} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="Aadhaar Front" />
                            <div className="aadhar-overlay" style={{ ...S.aadharOverlay, opacity:0 }}>
                              <span style={{ color:"#fff", fontSize:"14px", fontWeight:600 }}>🔄 Change</span>
                            </div>
                          </>
                        ) : (
                          <div style={{ textAlign:"center", color:"#484f58" }}>
                            <div style={{ fontSize:"36px", marginBottom:"8px" }}>🪪</div>
                            <div style={{ fontSize:"13px", fontWeight:600, color:"#8b949e" }}>Upload Front Side</div>
                            <div style={{ fontSize:"11px", marginTop:"4px" }}>JPG, PNG up to 5MB</div>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*,application/pdf" style={{ display:"none" }} onChange={handleAadharUpload("front")} />
                    </label>
                  ) : (
                    <label>
                      <div
                        style={S.aadharCardWrap(!!aadharBack)}
                        onMouseEnter={e => { if (aadharBack) e.currentTarget.querySelector(".aadhar-overlay").style.opacity = "1"; }}
                        onMouseLeave={e => { if (aadharBack) e.currentTarget.querySelector(".aadhar-overlay").style.opacity = "0"; }}
                      >
                        {aadharBack ? (
                          <>
                            <img src={aadharBack} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="Aadhaar Back" />
                            <div className="aadhar-overlay" style={{ ...S.aadharOverlay, opacity:0 }}>
                              <span style={{ color:"#fff", fontSize:"14px", fontWeight:600 }}>🔄 Change</span>
                            </div>
                          </>
                        ) : (
                          <div style={{ textAlign:"center", color:"#484f58" }}>
                            <div style={{ fontSize:"36px", marginBottom:"8px" }}>🪪</div>
                            <div style={{ fontSize:"13px", fontWeight:600, color:"#8b949e" }}>Upload Back Side</div>
                            <div style={{ fontSize:"11px", marginTop:"4px" }}>JPG, PNG up to 5MB</div>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*,application/pdf" style={{ display:"none" }} onChange={handleAadharUpload("back")} />
                    </label>
                  )}
                </div>

                {/* Status + Remove */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <p style={{ fontSize:"13px", color: (aadharFront && aadharBack) ? "#3fb950" : aadharFront || aadharBack ? "#f0883e" : "#484f58", margin:0 }}>
                    {aadharStatus}
                  </p>
                  {(aadharFront || aadharBack) && (
                    <button type="button" onClick={removeAadhar} style={{ ...S.camBtnDanger, padding:"6px 12px", fontSize:"12px" }}>
                      🗑️ Remove All
                    </button>
                  )}
                </div>

                {/* Privacy note */}
                <div style={{ background:"rgba(47,129,247,0.06)", border:"1px solid rgba(47,129,247,0.15)", borderRadius:"8px", padding:"10px 14px", display:"flex", gap:"8px", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"14px", flexShrink:0 }}>🔒</span>
                  <p style={{ margin:0, fontSize:"12px", color:"#8b949e", lineHeight:1.5 }}>
                    Your Aadhaar details are stored securely and used only for gym membership verification.
                  </p>
                </div>
              </div>

              <div style={S.divider} />

              {/* Membership Plans */}
              <p style={S.sectionTitle}>💪 Membership Interest</p>
              <div
                style={{ ...S.planCard, ...(form.membership_interest === "not_sure" ? S.planCardActive : {}) }}
                onClick={() => setForm(p => ({ ...p, membership_interest:"not_sure" }))}
              >
                <div style={{ width:"16px", height:"16px", borderRadius:"50%", border:`2px solid ${form.membership_interest === "not_sure" ? "#2f81f7" : "#30363d"}`, background: form.membership_interest === "not_sure" ? "#2f81f7" : "transparent", flexShrink:0 }} />
                <div>
                  <div style={{ fontWeight:600, fontSize: "16px" }}>Not Sure Yet</div>
                  <div style={{ color:"#8b949e", fontSize: "13px" }}>I'll decide after visiting</div>
                </div>
              </div>
              {plans.map(plan => (
                <div key={plan.id}
                  style={{ ...S.planCard, ...(form.membership_interest === plan.duration_type ? S.planCardActive : {}) }}
                  onClick={() => setForm(p => ({ ...p, membership_interest: plan.duration_type }))}
                >
                  <div style={{ width:"16px", height:"16px", borderRadius:"50%", border:`2px solid ${form.membership_interest === plan.duration_type ? "#2f81f7" : "#30363d"}`, background: form.membership_interest === plan.duration_type ? "#2f81f7" : "transparent", flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize: "16px" }}>{plan.name}</div>
                    <div style={{ color:"#8b949e", fontSize: "13px" }}>{durationLabel(plan.duration_type, plan.duration_days)}</div>
                  </div>
                  <div style={{ fontWeight:700, color:"#2f81f7", fontSize: "17px" }}>₹{Number(plan.price).toLocaleString("en-IN")}</div>
                </div>
              ))}

              <div style={S.divider} />

              {/* Preferred Time */}
              <p style={S.sectionTitle}>⏰ Preferred Time</p>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {[["anytime","Any Time"], ["morning","Morning"], ["afternoon","Afternoon"], ["evening","Evening"]].map(([val, label]) => (
                  <div key={val}
                    style={{ ...S.pill, ...(form.preferred_time === val ? S.pillActive : {}) }}
                    onClick={() => setForm(p => ({ ...p, preferred_time: val }))}
                  >{label}</div>
                ))}
              </div>

              <div style={S.divider} />

              {/* Message */}
              <div style={S.field}>
                <label style={S.label}>Message / Questions</label>
                <textarea style={{ ...S.input, minHeight:"90px", resize:"vertical" }} value={form.message} onChange={f("message")} placeholder="Any questions or special requirements..." />
              </div>

              <button type="submit" disabled={submitting} style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "SENDING..." : "SEND INQUIRY →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}