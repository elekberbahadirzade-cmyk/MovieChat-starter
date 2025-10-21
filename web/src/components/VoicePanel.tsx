
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { cfg } from "../env";

type PeerMap = { [sid: string]: RTCPeerConnection };

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export default function VoicePanel({ roomId, username }: { roomId: string; username: string }) {
  const { socket } = useSocket();
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<PeerMap>({});
  const localAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!cfg.mock && socket) {
      socket.on("voice:signal", async (data: any) => {
        const { from, signal } = data;
        let pc = peersRef.current[from];
        if (!pc) {
          pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
          peersRef.current[from] = pc;
          pc.ontrack = (ev) => {
            const audio = new Audio();
            audio.srcObject = ev.streams[0];
            audio.autoplay = true;
          };
          localStreamRef.current?.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
          pc.onicecandidate = (ev) => {
            if (ev.candidate) socket.emit("voice:signal", { room_id: roomId, to: from, from: socket.id, signal: { candidate: ev.candidate } });
          };
        }
        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("voice:signal", { room_id: roomId, to: from, from: socket.id, signal: { sdp: pc.localDescription } });
          }
        } else if (signal.candidate) {
          try { await pc.addIceCandidate(signal.candidate); } catch {}
        }
      });
      return () => { socket.off("voice:signal"); };
    }
  }, [socket]);

  const join = async () => {
    if (cfg.mock) { setJoined(true); return; }
    if (!socket) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = stream;
      localAudioRef.current.muted = true;
      localAudioRef.current.play();
    }
    setJoined(true);
    // create offer for current peers is omitted for brevity; rely on them to create offers when they see presence
  };

  const leave = () => {
    setJoined(false);
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
  };

  const toggleMute = () => {
    const enabled = !(muted);
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = enabled);
    setMuted(!muted);
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
      {!joined ? (
        <button onClick={join}>Join Voice</button>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={leave}>Leave Voice</button>
          <button onClick={toggleMute}>{muted ? "Unmute" : "Mute"}</button>
          <audio ref={localAudioRef} />
        </div>
      )}
    </div>
  );
}
