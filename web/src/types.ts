
export type User = {
  _id: string;
  email: string;
  username: string;
  avatar_base64?: string;
  preferred_language?: string;
};

export type Room = {
  _id: string;
  name: string;
  owner_id: string;
  is_public: boolean;
  access_code?: string | null;
  current_video_url: string;
  video_state: { playing: boolean; timestamp: number };
  members: { user_id: string; username: string; joined_at: number }[];
  created_at: number;
};

export type Message = {
  _id: string;
  room_id: string;
  user_id: string;
  username: string;
  text: string;
  timestamp: number;
};
