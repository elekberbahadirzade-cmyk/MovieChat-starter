import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import RoomsPage from "./pages/RoomsPage";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  const handleAuth = (t: string, u: string) => {
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    setToken(t);
    setUsername(u);
  };

  return (
    <Router>
      <Routes>
        {!token ? (
          <>
            <Route path="/" element={<RegisterPage onAuth={handleAuth} />} />
            <Route path="/login" element={<LoginPage onAuth={handleAuth} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/rooms" element={<RoomsPage username={username} />} />
            <Route path="*" element={<Navigate to="/rooms" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
