import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login           from "./pages/Login";
import Dashboard       from "./pages/Dashboard";
import Members         from "./pages/Members";
import Attendance      from "./pages/Attendance";
import Trainers        from "./pages/Trainers";
import Payments        from "./pages/Payments";
import Equipment       from "./pages/Equipment";
import Notifications   from "./pages/Notifications";
import Reports         from "./pages/Reports";
import Profile         from "./pages/Profile";
import MembershipPlans from "./pages/MembershipPlans";
import Inquiries       from "./pages/Inquiries";
import InquiryForm     from "./pages/InquiryForm";
import NotFound        from "./pages/NotFound";
import ParticlesBackground from "./components/ParticlesBackground";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("gym_token")
  );

  const handleLogin = (token, admin) => {
    localStorage.setItem("gym_token", token);
    localStorage.setItem("gym_admin", JSON.stringify(admin));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <>
      <ParticlesBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
      <BrowserRouter>
        <Routes>

          {/* ✅ PUBLIC ROUTES — login ke bina accessible */}
          <Route path="/inquiry" element={<InquiryForm />} />
          <Route path="/login"   element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />

          {/* PROTECTED ROUTES */}
          {isLoggedIn ? (
            <>
              <Route path="/"                 element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard"        element={<Dashboard       onLogout={handleLogout} />} />
              <Route path="/members"          element={<Members         onLogout={handleLogout} />} />
              <Route path="/attendance"       element={<Attendance      onLogout={handleLogout} />} />
              <Route path="/trainers"         element={<Trainers        onLogout={handleLogout} />} />
              <Route path="/payments"         element={<Payments        onLogout={handleLogout} />} />
              <Route path="/membership-plans" element={<MembershipPlans onLogout={handleLogout} />} />
              <Route path="/equipment"        element={<Equipment       onLogout={handleLogout} />} />
              <Route path="/notifications"    element={<Notifications   onLogout={handleLogout} />} />
              <Route path="/reports"          element={<Reports         onLogout={handleLogout} />} />
              <Route path="/profile"          element={<Profile         onLogout={handleLogout} />} />
              <Route path="/inquiries"        element={<Inquiries       onLogout={handleLogout} />} />
            </>
          ) : null}

          {/* 404 — sab unknown routes ke liye */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
      </div>
    </>
  );
}

export default App;