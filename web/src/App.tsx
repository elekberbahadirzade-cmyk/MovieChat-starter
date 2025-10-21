import { useState } from "react";
import { Mic, MicOff, Send, Video, Users } from "lucide-react";
import { motion } from "framer-motion";
import VideoSync from "./components/VideoSync";

export default function App() {
  const [muted, setMuted] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#101621] to-[#111b2c] text-text flex">
      {/* Sol panel */}
      <aside className="w-64 glass flex flex-col border-r border-border shadow-soft">
        <div className="p-5 text-2xl font-bold text-accent glow border-b border-border flex items-center gap-2">
          <Video size={22} /> MovieChat
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {["🎬 General", "🍿 Cinema", "🎮 Gaming", "💬 Friends"].map((room) => (
            <motion.button
              key={room}
              whileHover={{ scale: 1.05 }}
              className="w-full text-left glass hover:bg-[#1e293b] transition px-3 py-2 rounded-xl text-sm"
            >
              {room}
            </motion.button>
          ))}
        </div>
      </aside>

      {/* Orta hissə */}
      <main className="flex-1 flex flex-col items-center justify-between">
        <div className="flex-1 w-full flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <VideoSync roomId="public_room_1" username="Elekber" />
          </motion.div>
        </div>

        {/* Voice panel */}
        <div className="glass border-t border-border w-full flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-mute flex items-center gap-1">
              <Users size={14} /> Ələkbər qoşulub
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMuted(!muted)}
            className="bg-[#1E242B] hover:bg-[#252C36] p-2 rounded-xl transition"
          >
            {muted ? <MicOff className="text-red-500" /> : <Mic className="text-accent" />}
          </motion.button>
        </div>
      </main>

      {/* Sağ panel (chat) */}
      <aside className="w-80 glass flex flex-col border-l border-border shadow-soft">
        <div className="p-4 border-b border-border font-semibold text-accent flex items-center gap-2">
          💬 Chat
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1C2128] px-3 py-2 rounded-xl shadow-soft text-sm"
            >
              {msg}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-border">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-[#1E242B] text-text px-3 py-2 rounded-xl outline-none text-sm"
            placeholder="Mesaj yaz..."
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="bg-accent hover:bg-blue-600 text-white p-2 rounded-xl"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </aside>
    </div>
  );
}
