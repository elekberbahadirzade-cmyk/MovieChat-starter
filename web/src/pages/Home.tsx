
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { cfg } from "../env";
import api from "../api";
import { mockApi } from "../mock";
import { Room } from "../types";
import { Link } from "react-router-dom";

export default function Home() {
  const { t } = useTranslation();
  const { user, login, register } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");
  const [username, setUsername] = useState("Demo");
  const [newRoom, setNewRoom] = useState("My Room");

  const doLogin = async () => { await login(email, password); await loadRooms(); };
  const doRegister = async () => { await register(email, password, username); await loadRooms(); };
  const loadRooms = async () => {
    if (cfg.mock) setRooms(await mockApi.listRooms());
    else setRooms((await api.get("/rooms")).data);
  };
  const createRoom = async () => {
    if (cfg.mock) await mockApi.createRoom(newRoom, true);
    else await api.post("/rooms", { name: newRoom, is_public: true });
    await loadRooms();
  };

  return (
    <div>
      {!user && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input placeholder={t("email")!} value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder={t("password")!} value={password} type="password" onChange={e=>setPassword(e.target.value)} />
          <input placeholder={t("username")!} value={username} onChange={e=>setUsername(e.target.value)} />
          <button onClick={doRegister}>{t("login")} (register)</button>
          <button onClick={doLogin}>{t("login")}</button>
        </div>
      )}
      {user && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input placeholder={t("create_room")!} value={newRoom} onChange={e=>setNewRoom(e.target.value)} />
          <button onClick={createRoom}>{t("create_room")}</button>
          <button onClick={loadRooms}>{t("rooms")}</button>
        </div>
      )}
      <ul>
        {rooms.map(r => (
          <li key={r._id} style={{ marginBottom: 8 }}>
            <Link to={`/room/${r._id}`}>{r.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
