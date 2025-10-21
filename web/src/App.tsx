import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import RoomsPage from "./pages/RoomsPage";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [username, setUsername] = useState<string>(localStorage.getItem("username") || "");

  const handleAuth = (t: string, u: string) => {
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    setToken(t);
    setUsername(u);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername("");
  };

  // Token yoxdursa login səhifəsinə yönləndir
  return (
    <BrowserRouter>
      <Routes>
        {/* Qeydiyyat */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/rooms" /> : <RegisterPage />
          }
        />

        {/* Daxil olma */}
        <Route
          path="/login"
          element={
            token ? <Navigate to="/rooms" /> : <LoginPage onAuth={handleAuth} />
          }
        />

        {/* Otaqlar */}
        <Route
          path="/rooms"
          element={
            token ? (
              <RoomsPage username={username} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Naməlum səhifələr üçün fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
