import { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { prefetchDashboard } from "./services/prefetch";

const Dashboard       = lazy(() => import("./pages/Dashboard"));
const Members         = lazy(() => import("./pages/Members"));
const Attendance      = lazy(() => import("./pages/Attendance"));
const Trainers        = lazy(() => import("./pages/Trainers"));
const Payments        = lazy(() => import("./pages/Payments"));
const Equipment       = lazy(() => import("./pages/Equipment"));
const Notifications   = lazy(() => import("./pages/Notifications"));
const Reports         = lazy(() => import("./pages/Reports"));
const Profile         = lazy(() => import("./pages/Profile"));
const MembershipPlans = lazy(() => import("./pages/MembershipPlans"));
const Inquiries       = lazy(() => import("./pages/Inquiries"));
const NotFound        = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div style={{
      minHeight: "100vh", background: "#000", color: "#888",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif", fontSize: "14px",
    }}>
      Loading…
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("gym_token")
  );

  const handleLogin = (token, admin) => {
    localStorage.setItem("gym_token", token);
    localStorage.setItem("gym_admin", JSON.stringify(admin));
    prefetchDashboard();
    import("./pages/Dashboard");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />

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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
