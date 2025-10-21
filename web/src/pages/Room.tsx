
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Chat from "../components/Chat";
import VideoSync from "../components/VideoSync";
import VoicePanel from "../components/VoicePanel";

export default function Room() {
  const { roomId = "" } = useParams();
  const { user } = useAuth();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
      <VideoSync roomId={roomId} />
      <Chat roomId={roomId} user={user} />
      <VoicePanel roomId={roomId} username={user?.username || "anon"} />
    </div>
  );
}
