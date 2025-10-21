
import { useState } from "react";
import { cfg } from "../env";
import api from "../api";
import { mockApi } from "../mock";
import { Room } from "../types";

export default function Admin() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const load = async () => {
    if (cfg.mock) setRooms(await mockApi.listRooms());
    else setRooms((await api.get("/rooms")).data);
  };
  return (
    <div>
      <h2>Admin Panel</h2>
      <button onClick={load}>Load Rooms</button>
      <ul>
        {rooms.map(r => <li key={r._id}>{r.name} — {r._id}</li>)}
      </ul>
    </div>
  );
}
