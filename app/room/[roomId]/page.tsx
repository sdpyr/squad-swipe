"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DECK_BY_ID } from "@/lib/deck";
import {
  newRound,
  RoomDoc,
  spinWheel,
  startRoom,
  submitFinalVote,
  submitVote,
  subscribeRoom,
  trackShare
} from "@/lib/room";
import { generateShareImage } from "@/lib/share-image";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const [room, setRoom] = useState<(RoomDoc & { id: string }) | null>(null);
  const [memberId, setMemberId] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    const mId = localStorage.getItem("squad.memberId") || "";
    const name = localStorage.getItem("squad.nickname") || "";
    if (!mId || !name) {
      setError("Set nickname first. Redirecting...");
      setTimeout(() => router.replace("/"), 1200);
      return;
    }
    setMemberId(mId);
    setNickname(name);

    const unsub = subscribeRoom(roomId, setRoom);
    return () => unsub();
  }, [roomId, router]);

  const currentItem = useMemo(() => {
    if (!room) return null;
    return room.deck[room.currentIndex] || null;
  }, [room]);

  const shareText = useMemo(() => {
    if (!room) return "";
    const item = room.matchedItemId ? DECK_BY_ID[room.matchedItemId]?.title : "Seçim yok";
    const winner = room.wheelWinner?.name || "-";
    return `Bu akşam: ${item}. Çark: ${winner}. (SQUAD)`;
  }, [room]);

  const finalCandidates = useMemo(() => {
    if (!room?.finalCandidates?.length) return [];
    return room.finalCandidates
      .map((id) => DECK_BY_ID[id])
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [room]);

  async function handleVote(vote: "yes" | "no") {
    if (!room || !currentItem || !memberId) return;
    try {
      await submitVote({ roomId, memberId, itemId: currentItem.id, vote });
    } catch {
      setError("Vote failed.");
    }
  }

  async function handleFinalVote(itemId: string) {
    if (!memberId) return;
    try {
      await submitFinalVote({ roomId, memberId, itemId });
    } catch {
      setError("Final vote failed.");
    }
  }

  async function handleDownloadImage() {
    if (!room) return;
    try {
      const matchedTitle = room.matchedItemId ? DECK_BY_ID[room.matchedItemId]?.title || "Seçim yok" : "Seçim yok";
      const winnerName = room.wheelWinner?.name || "-";
      const { dataUrl } = await generateShareImage({ matchedTitle, winnerName });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "squad-story.png";
      a.click();
    } catch {
      setShareMsg("Görsel indirilemedi.");
    }
  }

  async function handleShareImage() {
    if (!room) return;
    try {
      const matchedTitle = room.matchedItemId ? DECK_BY_ID[room.matchedItemId]?.title || "Seçim yok" : "Seçim yok";
      const winnerName = room.wheelWinner?.name || "-";
      const { file } = await generateShareImage({ matchedTitle, winnerName });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "SQUAD",
          text: shareText
        });
        await trackShare(roomId, memberId);
        setShareMsg("");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      await trackShare(roomId, memberId);
      setShareMsg("Paylaşım desteklenmiyor. Metin panoya kopyalandı.");
    } catch {
      setShareMsg("Paylaşım kullanılamıyor.");
    }
  }

  async function handleCopyFallback() {
    try {
      await navigator.clipboard.writeText(shareText);
      await trackShare(roomId, memberId);
      setShareMsg("Kopyalandı.");
    } catch {
      setShareMsg("Kopyalama başarısız.");
    }
  }

  return (
    <main>
      <h1>Room: {roomId}</h1>
      <p className="small">Hi {nickname}</p>
      <p>Status: {room?.status || "loading..."}</p>

      <div className="card">
        <h3>Members ({room?.members.length || 0})</h3>
        <ul className="list">
          {room?.members.map((m) => (
            <li key={m.memberId}>{m.name}</li>
          ))}
        </ul>
      </div>

      {room?.status === "lobby" ? (
        <div className="card">
          <button className="btn-primary" onClick={() => startRoom(roomId, memberId)}>
            Start
          </button>
        </div>
      ) : null}

      {room?.status === "decide" ? (
        <div className="card">
          {currentItem ? (
            <>
              <h3>{currentItem.title}</h3>
              {currentItem.meta ? <p className="small">{currentItem.meta}</p> : null}
              <div className="row">
                <button className="btn-primary" onClick={() => handleVote("yes")}>
                  YES
                </button>
                <button className="btn-secondary" onClick={() => handleVote("no")}>
                  NO
                </button>
              </div>
              <p className="small">
                Card {room.currentIndex + 1}/{room.deck.length}
              </p>
            </>
          ) : (
            <p>No cards left.</p>
          )}
        </div>
      ) : null}

      {room?.status === "final_vote" ? (
        <div className="card">
          <h3>Final Vote</h3>
          <p className="small">Eşleşme çıkmadı. Top 3 arasından birini seç.</p>
          <div className="row">
            {finalCandidates.map((item) => {
              const count = Object.keys(room.finalVotes?.[item.id] ?? {}).length;
              return (
                <button key={item.id} className="btn-neutral" onClick={() => handleFinalVote(item.id)}>
                  {item.title} ({count})
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {room?.status === "wheel" ? (
        <div className="card">
          <h3>Fortune Wheel</h3>
          <button className="btn-primary" onClick={() => spinWheel(roomId, memberId)}>
            SPIN
          </button>
        </div>
      ) : null}

      {room?.status === "share" ? (
        <div className="card">
          <h3>Share</h3>
          <p>{shareText}</p>
          <div className="row">
            <button className="btn-primary" onClick={handleDownloadImage}>
              Download image
            </button>
            <button className="btn-neutral" onClick={handleShareImage}>
              Share image
            </button>
            <button className="btn-secondary" onClick={handleCopyFallback}>
              Copy fallback
            </button>
            <button className="btn-neutral" onClick={() => newRound(roomId)}>
              New Round
            </button>
          </div>
          {shareMsg ? <p className="small">{shareMsg}</p> : null}
        </div>
      ) : null}

      {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
    </main>
  );
}
