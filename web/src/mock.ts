
import { Room, Message, User } from "./types";

let currentUser: User = {
  _id: "user_mock@example.com",
  email: "user_mock@example.com",
  username: "MockUser",
  avatar_base64: "",
  preferred_language: "tr"
};

let rooms: Room[] = [
  {
    _id: "room_mock",
    name: "Public Room (Mock)",
    owner_id: "user_mock@example.com",
    is_public: true,
    access_code: null,
    current_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    video_state: { playing: false, timestamp: 0 },
    members: [],
    created_at: Date.now()
  }
];

let messages: Message[] = [];

export const mockApi = {
  login: async (email: string, password: string) => {
    return { token: "mocktoken", user: currentUser };
  },
  register: async (email: string, password: string, username: string) => {
    currentUser = { ...currentUser, email, _id: email, username };
    return { token: "mocktoken", user: currentUser };
  },
  listRooms: async (): Promise<Room[]> => rooms,
  createRoom: async (name: string, is_public: boolean): Promise<Room> => {
    const r: Room = {
      _id: "room_" + Date.now(),
      name,
      owner_id: currentUser._id,
      is_public,
      access_code: is_public ? null : String(Math.floor(Math.random() * 1e6)).padStart(6, "0"),
      current_video_url: "",
      video_state: { playing: false, timestamp: 0 },
      members: [],
      created_at: Date.now()
    };
    rooms.push(r);
    return r;
  },
  getMessages: async (room_id: string): Promise<Message[]> => messages.filter(m => m.room_id === room_id),
  sendMessage: async (room_id: string, text: string): Promise<Message> => {
    const msg: Message = {
      _id: "msg_" + Date.now(),
      room_id,
      user_id: currentUser._id,
      username: currentUser.username,
      text,
      timestamp: Date.now()
    };
    messages.push(msg);
    return msg;
  }
};
