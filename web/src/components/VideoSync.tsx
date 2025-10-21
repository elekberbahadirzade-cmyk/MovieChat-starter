import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";

function parseYouTubeId(url: string) {
  const m = url.match(/v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/);
  return m ? m[1] : "";
}

type Props = { roomId: string; username?: string };

export default function VideoSync({ roomId, username = "anon" }: Props) {
  const { socket } = useSocket();
  const [url, setUrl] = useState("");
  const [player, setPlayer] = useState<any>(null);
  const seekInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_room", { room_id: roomId, username });
    return () => socket.emit("leave_room", { room_id: roomId });
  }, [socket, roomId, username]);

  useEffect(() => {
    if (!socket) return;
    const onControl = (data: any) => {
      if (!player || data.room_id !== roomId) return;
      if (data.action === "load" && data.url) setUrl(data.url);
      if (data.action === "play") player.playVideo();
      if (data.action === "pause") player.pauseVideo();
      if (data.action === "seek" && typeof data.timestamp === "number")
        player.seekTo(data.timestamp, true);
    };
    socket.on("video:control", onControl);
    return () => socket.off("video:control", onControl);
  }, [socket, player, roomId]);

  const onReady = (e: any) => setPlayer(e.target);
  const send = (payload: any) => socket?.emit("video:control", { room_id: roomId, ...payload });
  const load = () => { if (!url.trim()) return; send({ action: "load", url }); };
  const play = () => { player?.playVideo(); send({ action: "play" }); };
  const pause = () => { player?.pauseVideo(); send({ action: "pause" }); };
  const seek = () => {
    const t = Number(seekInput.current?.value || 0);
    player?.seekTo(t, true);
    send({ action: "seek", timestamp: t });
  };

  return (
    <div className="glass border border-border rounded-2xl p-4 shadow-soft w-full">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          className="flex-1 bg-[#1E242B] border border-border rounded-xl px-3 py-2 outline-none"
          placeholder="YouTube URL (məs: https://youtu.be/dQw4w9WgXcQ)"
          value={url}
          onChange={(e)=>setUrl(e.target.value)}
        />
        <button onClick={load} className="bg-bg border border-border rounded-xl px-3 py-2 hover:border-accent transition">Load</button>
        <button onClick={play} className="bg-accent text-white rounded-xl px-3 py-2 hover:brightness-110 transition">Play</button>
        <button onClick={pause} className="bg-bg border border-border rounded-xl px-3 py-2 hover:border-accent transition">Pause</button>
        <div className="flex items-center gap-2">
          <input ref={seekInput} className="w-24 bg-[#1E242B] border border-border rounded-xl px-2 py-2 outline-none" placeholder="sec" />
          <button onClick={seek} className="bg-bg border border-border rounded-xl px-3 py-2 hover:border-accent transition">Seek</button>
        </div>
      </div>

      {url ? (
        <div className="rounded-xl overflow-hidden border border-border">
          <YouTube videoId={parseYouTubeId(url)} onReady={onReady} opts={{ playerVars: { playsinline: 1 } }} />
        </div>
      ) : (
        <div className="w-full aspect-video glass rounded-xl flex items-center justify-center text-mute">
          🎥 Link daxil et, “Load” bas
        </div>
      )}
    </div>
  );
}
