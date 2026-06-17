import { useState, useEffect, useRef } from "react";
const API = "https://gympro-backend-production-2c21.up.railway.app/api";

export default function InquiryForm() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", gender: "",
    date_of_birth: "", address: "", message: "",
    membership_interest: "not_sure", preferred_time: "anytime", photo: ""
  });
  const [plans, setPlans]         = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraOpen, setCameraOpen]     = useState(false);
  const [stream, setStream]             = useState(null);
  const [photoStatus, setPhotoStatus]   = useState("No photo taken yet");
  const [alert, setAlert]               = useState({ type: "", msg: "" });
  const [submitting, setSubmitting]     = useState(false);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  // ── Load Plans ─────────────────────────────────────────────────────────────
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
        setForm({ full_name:"", email:"", phone:"", gender:"", date_of_birth:"", address:"", message:"", membership_interest:"not_sure", preferred_time:"anytime", photo:"" });
        removePhoto();
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

  // ── Styles ─────────────────────────────────────────────────────────────────
  const S = {
    page: { minHeight:"100vh", background:"#060910", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"'DM Sans', sans-serif", color:"#e6edf3", position:"relative" },
    bg:   { position:"fixed", inset:0, backgroundImage:"radial-gradient(ellipse 80% 50% at 50% -20%, rgba(47,129,247,0.12), transparent)", opacity:0.4, pointerEvents:"none", zIndex:0 },
    wrap: { position:"relative", zIndex:1, width:"100%", maxWidth:"580px" },
    header: { textAlign:"center", marginBottom:"32px" },
    logo: { display:"inline-flex", alignItems:"center", gap:"10px", marginBottom:"20px" },
    logoIcon: { width:"40px", height:"40px", background:"#2f81f7", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize: "20px", boxShadow:"0 0 20px rgba(47,129,247,0.4)" },
    logoText: { fontFamily:"'Syne', sans-serif", fontSize: "22px", fontWeight:800, color:"#e6edf3" },
    h1: { fontFamily:"'Syne', sans-serif", fontSize: "36px", fontWeight:800, letterSpacing:"-0.5px", lineHeight:1.2, marginBottom:"10px" },
    subtitle: { color:"#8b949e", fontSize: "17px", lineHeight:1.6 },
    card: { background:"#0d1117", border:"1px solid #21262d", borderRadius:"16px", padding:"32px", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" },
    grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" },
    field: { display:"flex", flexDirection:"column", gap:"6px" },
    label: { fontSize: "12px", fontWeight:600, color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.08em" },
    input: { background:"#161b22", border:"1px solid #21262d", borderRadius:"8px", color:"#e6edf3", fontFamily:"'DM Sans', sans-serif", fontSize: "16px", padding:"11px 14px", outline:"none", width:"100%", boxSizing:"border-box" },
    section: { marginTop:"20px" },
    sectionTitle: { fontSize: "15px", fontWeight:600, color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" },
    photoSection: { background:"#161b22", border:"1px solid #30363d", borderRadius:"12px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" },
    photoWrap: { width:"120px", height:"120px", borderRadius:"50%", overflow:"hidden", border:"2px solid #30363d", background:"#060910", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    camBtn: { padding:"9px 16px", borderRadius:"8px", border:"1px solid #30363d", background:"#161b22", color:"#e6edf3", cursor:"pointer", fontSize: "15px", fontWeight:500 },
    camBtnPrimary: { padding:"9px 16px", borderRadius:"8px", border:"none", background:"#2f81f7", color:"#fff", cursor:"pointer", fontSize: "15px", fontWeight:600 },
    camBtnDanger: { padding:"9px 16px", borderRadius:"8px", border:"none", background:"rgba(248,81,73,0.15)", color:"#f85149", cursor:"pointer", fontSize: "15px", fontWeight:500 },
    planCard: { display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", borderRadius:"10px", border:"1px solid #21262d", background:"#161b22", cursor:"pointer", marginBottom:"8px", transition:"all 0.15s" },
    planCardActive: { border:"1px solid #2f81f7", background:"rgba(47,129,247,0.06)" },
    pill: { padding:"8px 16px", borderRadius:"99px", border:"1px solid #21262d", background:"#161b22", color:"#8b949e", cursor:"pointer", fontSize: "15px", fontWeight:500 },
    pillActive: { border:"1px solid #2f81f7", background:"rgba(47,129,247,0.1)", color:"#2f81f7" },
    submitBtn: { width:"100%", padding:"14px", background:"#2f81f7", color:"#fff", border:"none", borderRadius:"10px", fontSize: "17px", fontWeight:700, cursor:"pointer", marginTop:"24px", fontFamily:"'Syne', sans-serif", letterSpacing:"0.05em" },
    alert: (type) => ({ padding:"14px 18px", borderRadius:"10px", fontSize: "16px", marginBottom:"16px", background: type === "success" ? "rgba(63,185,80,0.1)" : "rgba(248,81,73,0.1)", border:`1px solid ${type === "success" ? "rgba(63,185,80,0.3)" : "rgba(248,81,73,0.3)"}`, color: type === "success" ? "#3fb950" : "#f85149" }),
    divider: { height:"1px", background:"#21262d", margin:"20px 0" },
    video: { width:"100%", borderRadius:"8px", display: cameraOpen ? "block" : "none" },
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