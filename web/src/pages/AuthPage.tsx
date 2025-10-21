import { useState } from "react";
import axios from "axios";

export default function AuthPage({ onAuth }: { onAuth: (token: string, username: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    try {
      const url = isLogin
        ? "http://127.0.0.1:8000/auth/login"
        : "http://127.0.0.1:8000/auth/register";
      const body = isLogin
        ? { email, password }
        : { email, password, username };
      const res = await axios.post(url, body);
      onAuth(res.data.token, res.data.user.username);
    } catch (err: any) {
      alert("Xəta: " + (err.response?.data?.detail || "server error"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1216] flex items-center justify-center text-white">
      <div className="bg-[#1a1f2a] p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "🔐 Giriş" : "📝 Qeydiyyat"}
        </h2>
        {!isLogin && (
          <input
            placeholder="İstifadəçi adı"
            className="w-full mb-3 px-3 py-2 rounded bg-[#232a33]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 rounded bg-[#232a33]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifrə"
          className="w-full mb-3 px-3 py-2 rounded bg-[#232a33]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-accent hover:bg-blue-600 py-2 rounded-xl font-semibold"
        >
          {isLogin ? "Daxil ol" : "Qeydiyyatdan keç"}
        </button>
        <p
          className="text-center text-sm mt-3 text-mute cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Hesabın yoxdur? Qeydiyyatdan keç" : "Artıq hesabın var? Giriş et"}
        </p>
      </div>
    </div>
  );
}
