"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/room";

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    setError("");
    if (!nickname.trim()) return setError("Please enter nickname.");

    setLoading(true);
    try {
      const memberId = makeId("member");
      const roomId = makeId("room");
      const name = nickname.trim();

      localStorage.setItem("squad.memberId", memberId);
      localStorage.setItem("squad.nickname", name);

      await createRoom(roomId, { memberId, name });
      router.push(`/room/${roomId}`);
    } catch {
      setError("Could not create room.");
    } finally {
      setLoading(false);
    }
  }

  async function join() {
    setError("");
    if (!nickname.trim()) return setError("Please enter nickname.");
    if (!roomIdInput.trim()) return setError("Please enter room ID.");

    setLoading(true);
    try {
      const memberId = makeId("member");
      const name = nickname.trim();
      const roomId = roomIdInput.trim();

      localStorage.setItem("squad.memberId", memberId);
      localStorage.setItem("squad.nickname", name);

      await joinRoom(roomId, { memberId, name });
      router.push(`/room/${roomId}`);
    } catch {
      setError("Could not join room. Check Room ID.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>SQUAD</h1>
      <p className="small">Decide → Spin → Share</p>

      <div className="card">
        <label>Nickname</label>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Your name" />

        <div style={{ height: 12 }} />
        <button className="btn-primary" onClick={create} disabled={loading}>Create Room</button>

        <div style={{ height: 16 }} />
        <label>Room ID</label>
        <input value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value)} placeholder="room-xxxx" />

        <div style={{ height: 12 }} />
        <button className="btn-neutral" onClick={join} disabled={loading}>Join Room</button>

        {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
      </div>
    </main>
  );
}
