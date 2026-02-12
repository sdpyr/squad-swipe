"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/room";

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!nickname.trim()) return setError("Please enter nickname");
    setLoading(true);
    setError("");
    try {
      const newRoomId = makeId("room");
      const memberId = makeId("member");
      localStorage.setItem("squadSwipe.memberId", memberId);
      localStorage.setItem("squadSwipe.nickname", nickname.trim());
      await createRoom(newRoomId, memberId, nickname.trim());
      router.push(`/room/${newRoomId}`);
    } catch {
      setError("Could not create room");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!nickname.trim()) return setError("Please enter nickname");
    if (!roomId.trim()) return setError("Please enter room id");
    setLoading(true);
    setError("");
    try {
      const memberId = makeId("member");
      localStorage.setItem("squadSwipe.memberId", memberId);
      localStorage.setItem("squadSwipe.nickname", nickname.trim());
      await joinRoom(roomId.trim(), memberId, nickname.trim());
      router.push(`/room/${roomId.trim()}`);
    } catch {
      setError("Could not join room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>SQUAD SWIPE</h1>
      <p className="small">Pick as a team, fast.</p>
      <div className="card">
        <label>Nickname</label>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <div style={{ height: 10 }} />
        <button className="btn-primary" onClick={handleCreate} disabled={loading}>Create Room</button>
      </div>
      <div className="card">
        <label>Room ID</label>
        <input value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        <div style={{ height: 10 }} />
        <button className="btn-neutral" onClick={handleJoin} disabled={loading}>Join Room</button>
      </div>
      {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
    </main>
  );
}
