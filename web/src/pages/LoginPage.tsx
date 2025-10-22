import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔹 Burada interfeysi saxla
export interface LoginPageProps {
  onAuth: (token: string, username: string) => void;
}

// 🔹 Burada komponent export olunur
export default function LoginPage({ onAuth }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "https://moviechat-starter.onrender.com";

  async function handleLogin() {
    if (!email || !password) {
      setMsg("⚠️ Email və şifrəni daxil et.");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/auth/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const token = res.data.token;
      const username = res.data.user.username;

      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      onAuth(token, username);
      navigate("/rooms");
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      setMsg("❌ Daxil olma alınmadı.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f14] text-white">
      <h1 className="text-3xl font-bold mb-4">🔐 Daxil ol</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 text-black rounded w-64"
      />

      <input
        placeholder="Şifrə"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 text-black rounded w-64"
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Daxil ol
      </button>

      <p className="mt-3 text-gray-300 text-sm">{msg}</p>

      <p className="mt-4 text-sm">
        Hesabın yoxdur?{" "}
        <a href="/" className="text-green-400">
          Qeydiyyatdan keç
        </a>
      </p>
    </div>
  );
}
