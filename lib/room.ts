import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type MatchMode = "unanimous" | "majority";
export type RoomStatus = "lobby" | "swiping" | "matched";
export type SwipeVote = "yes" | "no";

export type RoomDoc = {
  status: RoomStatus;
  deckId: "default";
  matchMode: MatchMode;
  matchedItemId?: string;
};

export type MemberDoc = {
  memberId: string;
  name: string;
};

export async function createRoom(roomId: string, memberId: string, name: string) {
  await setDoc(doc(db, "rooms", roomId), {
    status: "lobby",
    deckId: "default",
    matchMode: "unanimous",
    createdAt: serverTimestamp()
  });
  await joinRoom(roomId, memberId, name);
}

export async function joinRoom(roomId: string, memberId: string, name: string) {
  await setDoc(
    doc(db, "rooms", roomId, "members", memberId),
    { memberId, name, joinedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function startRoom(roomId: string) {
  await updateDoc(doc(db, "rooms", roomId), { status: "swiping" });
}

export async function setMatchMode(roomId: string, matchMode: MatchMode) {
  await updateDoc(doc(db, "rooms", roomId), { matchMode });
}

export async function submitSwipe(roomId: string, memberId: string, itemId: string, vote: SwipeVote) {
  await setDoc(doc(db, "rooms", roomId, "swipes", `${memberId}_${itemId}`), {
    memberId,
    itemId,
    vote,
    at: serverTimestamp()
  });

  if (vote !== "yes") return;

  const roomRef = doc(db, "rooms", roomId);
  const membersRef = collection(db, "rooms", roomId, "members");
  const swipesYesRef = query(collection(db, "rooms", roomId, "swipes"), where("itemId", "==", itemId), where("vote", "==", "yes"));

  await runTransaction(db, async (tx) => {
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) return;

    const room = roomSnap.data() as RoomDoc;
    if (room.status === "matched") return;

    const membersSnap = await tx.get(membersRef);
    const yesSnap = await tx.get(swipesYesRef);

    const memberCount = membersSnap.size;
    if (memberCount === 0) return;

    const yesCount = yesSnap.size;
    const threshold = room.matchMode === "majority" ? Math.ceil(memberCount * 0.6) : memberCount;

    if (yesCount >= threshold) {
      tx.update(roomRef, { status: "matched", matchedItemId: itemId });
    }
  });
}

export function subscribeRoom(roomId: string, cb: (room: (RoomDoc & { id: string }) | null) => void) {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => cb(snap.exists() ? ({ id: snap.id, ...(snap.data() as RoomDoc) }) : null));
}

export function subscribeMembers(roomId: string, cb: (members: MemberDoc[]) => void) {
  return onSnapshot(query(collection(db, "rooms", roomId, "members"), orderBy("joinedAt", "asc")), (snap) => {
    cb(snap.docs.map((d) => d.data() as MemberDoc));
  });
}

export function subscribeMemberSwipes(roomId: string, memberId: string, cb: (itemIds: string[]) => void) {
  return onSnapshot(query(collection(db, "rooms", roomId, "swipes"), where("memberId", "==", memberId)), (snap) => {
    cb(snap.docs.map((d) => d.data().itemId as string));
  });
}

export function subscribeItemVotes(roomId: string, itemId: string, cb: (counts: { yes: number; no: number }) => void) {
  return onSnapshot(query(collection(db, "rooms", roomId, "swipes"), where("itemId", "==", itemId)), (snap) => {
    let yes = 0;
    let no = 0;
    snap.docs.forEach((d) => {
      const vote = d.data().vote as SwipeVote;
      if (vote === "yes") yes += 1;
      if (vote === "no") no += 1;
    });
    cb({ yes, no });
  });
}
