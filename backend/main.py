import os
import time
import random
import string
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
import jwt
import socketio

# ----- ENV -----
JWT_SECRET = os.environ.get("JWT_SECRET", "dev_secret_change_me")
JWT_ALG = os.environ.get("JWT_ALG", "HS256")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

# ----- In-Memory DB -----
db = {
    "users": {},     # email -> user
    "rooms": {},     # room_id -> room
    "messages": [],  # list of messages
}

# Default GENERAL room
db["rooms"]["general"] = {
    "_id": "general",
    "name": "General",
    "owner_id": "system",
    "is_public": True,
    "access_code": None,
    "current_video_url": "",
    "video_state": {"playing": False, "timestamp": 0},
    "members": [],
    "created_at": time.time()
}

# ----- Models -----
class RegisterDTO(BaseModel):
    email: str
    password: str
    username: str
    avatar_base64: Optional[str] = None
    preferred_language: Optional[str] = "tr"

class LoginDTO(BaseModel):
    email: str
    password: str

class RoomDTO(BaseModel):
    name: str
    is_public: bool = True

class MessageDTO(BaseModel):
    room_id: str
    text: str

# ----- Auth utils -----
def create_jwt(payload: Dict[str, Any]) -> str:
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_jwt(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing Bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_jwt(token)
    except Exception:
        raise HTTPException(401, "Invalid token")
    email = payload.get("email")
    user = db["users"].get(email)
    if not user:
        raise HTTPException(401, "User not found")
    return user

# ----- SocketIO + FastAPI -----
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = FastAPI(title="🎬 MovieChat Backend")
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

# ----- CORS -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Helpers -----
def generate_room_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

# ----- AUTH -----
@app.post("/auth/register")
def register(dto: RegisterDTO):
    if dto.email in db["users"]:
        raise HTTPException(400, "Email already registered")
    pwd_hash = bcrypt.hashpw(dto.password.encode(), bcrypt.gensalt()).decode()
    user = {
        "_id": dto.email,
        "email": dto.email,
        "password_hash": pwd_hash,
        "username": dto.username,
        "avatar_base64": dto.avatar_base64 or "",
        "preferred_language": dto.preferred_language or "tr",
        "created_at": time.time()
    }
    db["users"][dto.email] = user
    token = create_jwt({"email": dto.email, "username": dto.username, "iat": int(time.time())})
    return {"token": token, "user": user}

@app.post("/auth/login")
def login(dto: LoginDTO):
    user = db["users"].get(dto.email)
    if not user or not bcrypt.checkpw(dto.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Invalid credentials")
    token = create_jwt({"email": user["email"], "username": user["username"], "iat": int(time.time())})
    return {"token": token, "user": user}

# ----- ROOMS -----
@app.post("/rooms", dependencies=[Depends(get_current_user)])
def create_room(dto: RoomDTO, user: Dict[str, Any] = Depends(get_current_user)):
    room_id = f"room_{int(time.time() * 1000)}"
    access_code = None if dto.is_public else generate_room_code()
    room = {
        "_id": room_id,
        "name": dto.name,
        "owner_id": user["_id"],
        "is_public": dto.is_public,
        "access_code": access_code,
        "current_video_url": "",
        "video_state": {"playing": False, "timestamp": 0},
        "members": [],
        "created_at": time.time(),
    }
    db["rooms"][room_id] = room
    return room

@app.get("/rooms", dependencies=[Depends(get_current_user)])
def list_rooms(user: Dict[str, Any] = Depends(get_current_user)):
    return [r for r in db["rooms"].values() if r["is_public"] or r["owner_id"] == user["_id"]]

@app.post("/rooms/join", dependencies=[Depends(get_current_user)])
def join_room(data: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    room_id = data.get("room_id")
    code = data.get("access_code")
    room = db["rooms"].get(room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    if not room["is_public"] and room["access_code"] != code:
        raise HTTPException(403, "Wrong access code")
    if user["_id"] not in room["members"]:
        room["members"].append(user["_id"])
    return {"ok": True, "room": room}

@app.get("/rooms/{room_id}", dependencies=[Depends(get_current_user)])
def get_room(room_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    room = db["rooms"].get(room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    if not room["is_public"] and room["owner_id"] != user["_id"]:
        raise HTTPException(403, "Forbidden")
    return room

# ----- MESSAGES -----
@app.get("/messages/{room_id}", dependencies=[Depends(get_current_user)])
def get_messages(room_id: str):
    return [m for m in db["messages"] if m["room_id"] == room_id]

# ----- SOCKET.IO -----
@sio.event
async def connect(sid, environ):
    print("Client connected:", sid)

@sio.event
async def disconnect(sid):
    print("Client disconnected:", sid)

@sio.on("join_room")
async def join_room_socket(sid, data):
    room_id = data.get("room_id", "general")
    username = data.get("username", "anon")
    await sio.save_session(sid, {"room_id": room_id, "username": username})
    await sio.enter_room(sid, room_id)
    await sio.emit("presence:update", {"type": "join", "sid": sid, "username": username}, to=room_id)

@sio.on("leave_room")
async def leave_room_socket(sid, data):
    session = await sio.get_session(sid)
    room_id = session.get("room_id", "general")
    username = session.get("username", "anon")
    await sio.leave_room(sid, room_id)
    await sio.emit("presence:update", {"type": "leave", "sid": sid, "username": username}, to=room_id)

@sio.on("chat:message")
async def chat_message(sid, data):
    room_id = data.get("room_id", "general")
    user = data.get("user", {})
    text = data.get("text", "")
    msg = {
        "_id": f"msg_{int(time.time() * 1000)}",
        "room_id": room_id,
        "user_id": user.get("_id", user.get("email", "")),
        "username": user.get("username", "anon"),
        "text": text,
        "timestamp": time.time(),
    }
    db["messages"].append(msg)
    await sio.emit("chat:message", msg, to=room_id)

@sio.on("video:control")
async def video_control(sid, data):
    room_id = data.get("room_id", "general")
    await sio.emit("video:control", data, to=room_id)

@sio.on("voice:signal")
async def voice_signal(sid, data):
    to_sid = data.get("to")
    await sio.emit("voice:signal", data, to=to_sid)

@app.get("/health")
def health():
    return {"ok": True, "time": time.time()}
