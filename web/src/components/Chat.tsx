
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { cfg } from "../env";
import { mockApi } from "../mock";
import api from "../api";
import { Message } from "../types";

export default function Chat({ roomId, user }: { roomId: string; user: any }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (cfg.mock) {
        setMessages(await mockApi.getMessages(roomId));
      } else {
        const { data } = await api.get(`/messages/${roomId}`);
        setMessages(data);
      }
    })();
  }, [roomId]);

  useEffect(() => {
    if (!cfg.mock && socket) {
      socket.emit("join_room", { room_id: roomId, username: user?.username || "anon" });
      socket.on("chat:message", (msg: Message) => setMessages(prev => [...prev, msg]));
      return () => {
        socket.emit("leave_room", { room_id: roomId });
        socket.off("chat:message");
      };
    }
  }, [socket, roomId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    if (cfg.mock) {
      const msg = await mockApi.sendMessage(roomId, text);
      setMessages(prev => [...prev, msg]);
    } else if (socket) {
      socket.emit("chat:message", { room_id: roomId, user, text });
    }
    setText("");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
      <div style={{ height: 200, overflowY: "auto", marginBottom: 8 }}>
        {messages.map(m => (
          <div key={m._id}><strong>{m.username}:</strong> {m.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Type a message..."
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=> (e.key==="Enter") && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
