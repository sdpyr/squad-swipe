"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DECK_BY_ID } from "@/lib/deck";
import { RoomDoc, subscribeRoom } from "@/lib/room";

export default function MatchPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const [room, setRoom] = useState<(RoomDoc & { id: string }) | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => subscribeRoom(roomId, setRoom), [roomId]);

  const item = useMemo(() => (room?.matchedItemId ? DECK_BY_ID[room.matchedItemId] : null), [room?.matchedItemId]);

  async function share() {
    const text = `We matched on ${item?.title ?? "a pick"} in SQUAD SWIPE!`;
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "SQUAD SWIPE", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setMsg("Copied!");
      }
    } catch {
      setMsg("Could not share.");
    }
  }

  return (
    <main>
      <h1>🎉 MATCH!</h1>
      <div className="card">
        <h2>{item?.title ?? "Waiting for match..."}</h2>
        {item?.meta ? <p className="small">{item.meta}</p> : null}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn-primary" onClick={share}>Share</button>
        <Link href={`/room/${roomId}`}>Back to room</Link>
      </div>
      {msg ? <p className="small">{msg}</p> : null}
    </main>
  );
}
