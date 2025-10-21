import { useState, useEffect } from "react";
import axios from "axios";

export default function RoomsPage({ username }: { username: string }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const API = import.meta.env.VITE_API_URL;

  // 🟢 Otaqları serverdən al
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/rooms`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setRooms(res.data);
    } catch (err) {
      setMsg("⚠️ Otaqları almaq mümkün olmadı.");
    } finally {
      setLoading(false);
    }
  };

  // 🟣 Yeni otaq yarat
  const createRoom = async () => {
    if (!name.trim()) return alert("Otaq adı boş ola bilməz!");
    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/rooms`,
        { name, is_public: isPublic },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (isPublic) {
        alert("✅ Public otaq yaradıldı!");
      } else {
        alert("🔐 Private otaq kodu: " + res.data.access_code);
      }

      setName("");
      fetchRooms();
    } catch (err: any) {
      setMsg("❌ Otaq yaratmaq alınmadı: " + (err.response?.data?.detail || "xəta"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="p-8 text-white bg-[#0f1216] min-h-screen">
      <h2 className="text-2xl font-bold mb-4">🎬 Mövcud Otaqlar</h2>

      {loading && <p>⏳ Yüklənir...</p>}
      {msg && <p className="text-red-400 mb-2">{msg}</p>}

      {rooms.length === 0 && !loading ? (
        <p className="text-gray-400">Heç bir otaq yoxdur.</p>
      ) : (
        rooms.map((r) => (
          <div key={r._id} className="p-3 bg-[#1e293b] rounded-xl mb-2 flex justify-between">
            <span>{r.name}</span>
            <span>{r.is_public ? "🔓" : "🔐"}</span>
          </div>
        ))
      )}

      <h3 className="text-xl font-semibold mt-6 mb-2">🪄 Yeni otaq yarat</h3>

      <div className="flex items-center space-x-3">
        <input
          placeholder="Otaq adı"
          className="px-3 py-2 rounded bg-[#1e242b] text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
          />
          <span>Public</span>
        </label>
        <button
          onClick={createRoom}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-500"
        >
          {loading ? "Yaradılır..." : "Yarat"}
        </button>
      </div>
    </div>
  );
}
