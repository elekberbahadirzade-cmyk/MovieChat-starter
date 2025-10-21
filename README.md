
# MovieChat — Full-Stack Mobile & Web App (Starter)

This is a **working starter** for your MovieChat idea. It ships with:
- **Web (React 18 + TS + Vite)**: i18n (EN/TR), mock mode, YouTube sync, text chat, basic WebRTC signaling (voice).
- **Backend (FastAPI + Socket.IO)**: JWT auth, rooms/messages endpoints, Socket.IO events for chat/video/voice signal.
- **Mobile (Expo)**: scaffold placeholder wired to the same APIs (to be expanded).

> ✅ Starts in **offline/mock mode** by default for the Web. Flip one env var to connect to the backend later.

---

## 1) Quick Start (Mock Mode — Web only)
```bash
cd web
npm i
npm run dev
```
Open http://localhost:5173

## 2) Start Backend (when you're ready)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # (edit secrets if you like)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The Socket.IO + REST API will be at `http://localhost:8000`.

Then switch Web to real backend:
- In `web/.env.local` set: `VITE_MOCK=false` and `VITE_API_BASE=http://localhost:8000`

## 3) Mobile (Expo) — scaffold
```bash
cd mobile
npm i
npm start
```
Currently shows UI scaffold with language switch & room join; wire real APIs as you go.

---

## ENV
- **Web**: `.env.local` (see `.env.example` in `web/`)
- **Backend**: `.env` (see `.env.example` in `backend/`)

---

## Notes
- Voice chat uses **WebRTC** with **Socket.IO signaling**. In mock mode, signaling is simulated; in real mode, the backend relays signals.
- For STUN (MVP), we use public Google STUN: `stun:stun.l.google.com:19302`.
- Admin panel is under `/admin` route in Web.
- This is a solid, minimal foundation; you can extend schemas, validation, and persistence (MongoDB) as needed.
