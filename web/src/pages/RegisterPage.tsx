import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  async function handleRegister() {
    if (!email || !password || !username)
      return setMsg("⚠️ Bütün xanaları doldur.");

    try {
      const res = await axios.post(`${API}/auth/register`, {
        email,
        password,
        username,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);
      navigate("/rooms");
    } catch (err: any) {
      setMsg("❌ Qeydiyyat zamanı xəta baş verdi.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f14] text-white">
      <h1 className="text-3xl font-bold mb-4">🧾 Qeydiyyat</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 text-black rounded"
      />
      <input
        placeholder="İstifadəçi adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2 p-2 text-black rounded"
      />
      <input
        placeholder="Şifrə"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 text-black rounded"
      />
      <button
        onClick={handleRegister}
        className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Qeydiyyatdan keç
      </button>
      <p className="mt-3 text-gray-300 text-sm">{msg}</p>
      <p className="mt-4 text-sm">
        Artıq hesabın var?{" "}
        <a href="/login" className="text-blue-400">
          Daxil ol
        </a>
      </p>
    </div>
  );
}
