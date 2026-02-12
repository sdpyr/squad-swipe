"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DEFAULT_DECK } from "@/lib/deck";
import {
  MatchMode,
  MemberDoc,
  RoomDoc,
  setMatchMode,
  startRoom,
  submitSwipe,
  subscribeItemVotes,
  subscribeMembers,
  subscribeMemberSwipes,
  subscribeRoom
} from "@/lib/room";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params.roomId;

  const [room, setRoom] = useState<(RoomDoc & { id: string }) | null>(null);
  const [members, setMembers] = useState<MemberDoc[]>([]);
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [voteCounts, setVoteCounts] = useState({ yes: 0, no: 0 });

  useEffect(() => {
    const localMemberId = localStorage.getItem("squadSwipe.memberId") || "";
    const localNickname = localStorage.getItem("squadSwipe.nickname") || "";
    if (!localMemberId || !localNickname) {
      setError("Nickname missing. Redirecting to home...");
      setTimeout(() => router.replace("/"), 1200);
      return;
    }

    setMemberId(localMemberId);

    const unsubRoom = subscribeRoom(roomId, setRoom);
    const unsubMembers = subscribeMembers(roomId, setMembers);
    const unsubMine = subscribeMemberSwipes(roomId, localMemberId, setSwipedIds);
    return () => {
      unsubRoom();
      unsubMembers();
      unsubMine();
    };
  }, [roomId, router]);

  const currentItem = useMemo(() => {
    const done = new Set(swipedIds);
    return DEFAULT_DECK.find((i) => !done.has(i.id)) ?? null;
  }, [swipedIds]);

  useEffect(() => {
    if (!currentItem || room?.status !== "swiping") return;
    const unsub = subscribeItemVotes(roomId, currentItem.id, setVoteCounts);
    return () => unsub();
  }, [roomId, currentItem?.id, room?.status]);

  useEffect(() => {
    if (room?.status === "matched") router.replace(`/match/${roomId}`);
  }, [room?.status, roomId, router]);

  async function handleVote(vote: "yes" | "no") {
    if (!currentItem || !memberId) return;
    try {
      await submitSwipe(roomId, memberId, currentItem.id, vote);
    } catch {
      setError("Vote failed");
    }
  }

  async function handleModeChange(mode: MatchMode) {
    try {
      await setMatchMode(roomId, mode);
    } catch {
      setError("Could not update mode");
    }
  }

  async function copyInvite() {
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied("Invite copied!");
    } catch {
      setCopied(url);
    }
  }

  return (
    <main>
      <h1>Room {roomId}</h1>
      <p>Status: {room?.status ?? "loading..."}</p>

      <div className="card">
        <h3>Members ({members.length})</h3>
        <ul>
          {members.map((m) => (
            <li key={m.memberId}>{m.name}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Invite Link</h3>
        <button className="btn-neutral" onClick={copyInvite}>Copy</button>
        {copied ? <p className="small">{copied}</p> : null}
      </div>

      {room?.status === "lobby" ? (
        <div className="card">
          <h3>Match Mode</h3>
          <div className="segment">
            <button
              className={room.matchMode === "unanimous" ? "active" : ""}
              onClick={() => handleModeChange("unanimous")}
            >
              Unanimous
            </button>
            <button
              className={room.matchMode === "majority" ? "active" : ""}
              onClick={() => handleModeChange("majority")}
            >
              Majority 60%
            </button>
          </div>
          <p className="small">Current mode: {room.matchMode}</p>
          <button className="btn-primary" onClick={() => startRoom(roomId)}>Start</button>
        </div>
      ) : null}

      {room?.status === "swiping" ? (
        <div className="card">
          <h3>Vote</h3>
          {currentItem ? (
            <>
              <h2>{currentItem.title}</h2>
              {currentItem.meta ? <p className="small">{currentItem.meta}</p> : null}
              <p className="small">YES: {voteCounts.yes} / {members.length}</p>
              <p className="small">NO: {voteCounts.no} / {members.length}</p>
              <div className="row">
                <button className="btn-primary" onClick={() => handleVote("yes")}>YES</button>
                <button className="btn-danger" onClick={() => handleVote("no")}>NO</button>
              </div>
              <p className="small">Card {swipedIds.length + 1} / {DEFAULT_DECK.length}</p>
            </>
          ) : (
            <p>No match yet.</p>
          )}
        </div>
      ) : null}

      {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
    </main>
  );
}
