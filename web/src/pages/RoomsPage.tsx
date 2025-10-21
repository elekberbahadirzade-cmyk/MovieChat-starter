import { useState, useEffect } from "react";
import axios from "axios";

export default function RoomsPage({ username }: { username: string }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const fetchRooms = async () => {
    const res = await axios.get("http://127.0.0.1:8000/rooms", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    setRooms(res.data);
  };

  const createRoom = async () => {
    const res = await axios.post(
      "http://127.0.0.1:8000/rooms",
      { name, is_public: isPublic },
      { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
    );
    alert(isPublic ? "Public otaq yaradıldı!" : "Private otaq kodu: " + res.data.access_code);
    fetchRooms();
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="p-8 text-white bg-[#0f1216] min-h-screen">
      <h2 className="text-2xl font-bold mb-4">🎬 Mövcud Otaqlar</h2>
      {rooms.map((r) => (
        <div key={r._id} className="p-3 bg-[#1e293b] rounded-xl mb-2">
          {r.name} {r.is_public ? "🔓" : "🔐"}
        </div>
      ))}

      <h3 className="text-xl font-semibold mt-6 mb-2">🪄 Yeni otaq yarat</h3>
      <input
        placeholder="Otaq adı"
        className="px-3 py-2 rounded bg-[#1e242b] mr-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label>
        <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} /> Public
      </label>
      <button onClick={createRoom} className="ml-4 bg-accent px-4 py-2 rounded-xl">
        Yarat
      </button>
    </div>
  );
}
