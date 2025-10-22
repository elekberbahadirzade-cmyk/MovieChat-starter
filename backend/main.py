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

# ----- DATABASE (RAM-da saxlanılır) -----
db = {
    "users": {},     # email -> user
    "rooms": {},     # room_id -> room
    "messages": [],  # all chat messages
}

# Default "General" otaq
db["rooms"]["general"] = {
    "_id": "general",
    "name": "General",
    "owner_id": "system",
    "is_public": True,
    "access_code": None,
    "current_video_url": "",
    "video_state": {"playing": False, "timestamp": 0},
    "members": [],
    "created_at": time.time(),
}

# ----- MODELS -----
class RegisterDTO(BaseModel):
    email: str
    password: str
    username: str

class LoginDTO(BaseModel):
    email: str
    password: str

class RoomDTO(BaseModel):
    name: str
    is_public: bool = True

# ----- JWT -----
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

# ----- SOCKET.IO + FASTAPI -----
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

# ----- HELPERS -----
def generate_room_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

# ----- ROUTES -----
@app.get("/")
def root():
    return {"message": "🎬 MovieChat Backend is running!", "time": time.time()}

@app.get("/health")
def health():
    return {"ok": True, "time": time.time()}

# --- AUTH ---
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
        "created_at": time.time(),
    }
    db["users"][dto.email] = user
    token = create_jwt({"email": dto.email, "username": dto.username})
    return {"token": token, "user": user}

@app.post("/auth/login")
def login(dto: LoginDTO):
    user = db["users"].get(dto.email)
    if not user or not bcrypt.checkpw(dto.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Invalid credentials")
    token = create_jwt({"email": user["email"], "username": user["username"]})
    return {"token": token, "user": user}

# --- ROOMS ---
@app.post("/rooms")
def create_room(dto: RoomDTO, user: Dict[str, Any] = Depends(get_current_user)):
    room_id = f"room_{int(time.time() * 1000)}"
    access_code = None if dto.is_public else generate_room_code()
    room = {
        "_id": room_id,
        "name": dto.name,
        "owner_id": user["_id"],
        "is_public": dto.is_public,
        "access_code": access_code,
        "created_at": time.time(),
    }
    db["rooms"][room_id] = room
    return room

@app.get("/rooms")
def list_rooms(user: Dict[str, Any] = Depends(get_current_user)):
    return [r for r in db["rooms"].values() if r["is_public"] or r["owner_id"] == user["_id"]]

# ----- SOCKET.IO EVENTS -----
@sio.event
async def connect(sid, environ):
    print("✅ Client connected:", sid)

@sio.event
async def disconnect(sid):
    print("❌ Client disconnected:", sid)

@sio.on("chat:message")
async def chat_message(sid, data):
    room_id = data.get("room_id", "general")
    user = data.get("user", {})
    text = data.get("text", "")
    msg = {
        "_id": f"msg_{int(time.time() * 1000)}",
        "room_id": room_id,
        "user": user,
        "text": text,
        "timestamp": time.time(),
    }
    db["messages"].append(msg)
    await sio.emit("chat:message", msg, to=room_id)
