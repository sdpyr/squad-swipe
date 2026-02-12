import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { DEFAULT_DECK, DeckItem } from "@/lib/deck";
import { db } from "@/lib/firebase";

export type RoomStatus = "lobby" | "decide" | "wheel" | "share";
export type VoteValue = "yes" | "no";

export type RoomMember = {
  memberId: string;
  name: string;
};

export type WheelWinner = {
  memberId: string;
  name: string;
};

export type RoomDoc = {
  status: RoomStatus;
  createdAt?: Timestamp;
  matchMode: "unanimous" | "majority";
  members: RoomMember[];
  deck: DeckItem[];
  votes: Record<string, Record<string, VoteValue>>;
  currentIndex: number;
  matchedItemId?: string;
  wheelWinner?: WheelWinner;
};

function roomRef(roomId: string) {
  return doc(db, "rooms", roomId);
}

export async function createRoom(roomId: string, member: RoomMember) {
  await setDoc(roomRef(roomId), {
    status: "lobby",
    createdAt: serverTimestamp(),
    matchMode: "majority",
    members: [member],
    deck: DEFAULT_DECK,
    votes: {},
    currentIndex: 0
  } satisfies RoomDoc);
}

export async function joinRoom(roomId: string, member: RoomMember) {
  await runTransaction(db, async (tx) => {
    const ref = roomRef(roomId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("room-not-found");
    const room = snap.data() as RoomDoc;

    const alreadyIn = room.members.some((m) => m.memberId === member.memberId);
    const members = alreadyIn
      ? room.members.map((m) => (m.memberId === member.memberId ? member : m))
      : [...room.members, member];

    tx.update(ref, { members });
  });
}

export async function startRoom(roomId: string) {
  await updateDoc(roomRef(roomId), { status: "decide" });
}

export async function submitVote(params: {
  roomId: string;
  memberId: string;
  itemId: string;
  vote: VoteValue;
}) {
  const { roomId, memberId, itemId, vote } = params;

  await runTransaction(db, async (tx) => {
    const ref = roomRef(roomId);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as RoomDoc;
    if (room.status !== "decide") return;

    const votes = room.votes ?? {};
    const itemVotes = votes[itemId] ?? {};
    itemVotes[memberId] = vote;
    votes[itemId] = itemVotes;

    const memberCount = room.members.length;
    const yesCount = Object.values(itemVotes).filter((v) => v === "yes").length;

    const matched =
      room.matchMode === "unanimous"
        ? memberCount > 0 && yesCount === memberCount
        : memberCount > 0 && yesCount >= Math.ceil(memberCount * 0.6);

    if (matched) {
      tx.update(ref, {
        votes,
        matchedItemId: itemId,
        status: "wheel"
      });
      return;
    }

    const currentItemId = room.deck[room.currentIndex]?.id;
    const hasAnyVoteForCurrent = !!(currentItemId && votes[currentItemId]?.[memberId]);
    const nextIndex = hasAnyVoteForCurrent
      ? Math.min(room.currentIndex + 1, room.deck.length - 1)
      : room.currentIndex;

    tx.update(ref, {
      votes,
      currentIndex: nextIndex
    });
  });
}

export async function spinWheel(roomId: string) {
  await runTransaction(db, async (tx) => {
    const ref = roomRef(roomId);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as RoomDoc;
    if (room.status !== "wheel") return;
    if (!room.members.length) return;

    const winner = room.members[Math.floor(Math.random() * room.members.length)];
    tx.update(ref, {
      wheelWinner: winner,
      status: "share"
    });
  });
}

export async function newRound(roomId: string) {
  await updateDoc(roomRef(roomId), {
    status: "lobby",
    votes: {},
    currentIndex: 0,
    matchedItemId: null,
    wheelWinner: null
  });
}

export function subscribeRoom(roomId: string, cb: (room: (RoomDoc & { id: string }) | null) => void) {
  return onSnapshot(roomRef(roomId), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb({ id: snap.id, ...(snap.data() as RoomDoc) });
  });
}
