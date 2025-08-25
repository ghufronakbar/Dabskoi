// src/realtime/emitters.ts
import { Bid, Chat, KoiAuction, KoiNego, KoiSell, User } from "@prisma/client";
import db from "../config/db";
import { getIO } from "./socket";
import { userRoom } from "./types";
import { ChatMessage, formatChatProduct } from "../helper/format-chat-product";
import { formatRupiah } from "../helper/format-rupiah";

export interface InformationMessage {
  sells: KoiSell[];
  negos: KoiNego[];
  auctions: KoiAuction[];
}

export async function toWireMessage(
  c: Chat,
  i: InformationMessage
): Promise<ChatMessage> {
  const user = await db.user.findUnique({
    where: { id: c.userId },
    select: { name: true, picture: true },
  });

  const product = formatChatProduct(c, {
    sells: i.sells,
    negos: i.negos,
    auctions: i.auctions,
  });

  return {
    id: c.id,
    type: c.type,
    role: c.role,
    createdAt: c.createdAt,
    readByAdmin: c.readByAdmin,
    readByUser: c.readByUser,
    chat: {
      product,
      content: c.content,
      reference: c.reference,
    },
    user: {
      id: c.userId,
      name: user?.name ?? "",
      picture: user?.picture ?? null,
    },
  };
}

export async function emitChatNew(
  userId: string,
  chat: Chat,
  i: InformationMessage
): Promise<ChatMessage> {
  const io = getIO();
  const message = await toWireMessage(chat, i);
  // ke user room
  if (message.role === "ADMIN") {
    io.to(userRoom(userId)).emit("chat:new", { message, userId, i });
  }
  // ke admin feed
  if (message.role === "USER") {
    io.to("admins").emit("admin:chat:new", { message, userId, i });
  }
  return message;
}

/** Hitung ulang unread untuk admin & broadcast ke dashboard */
export async function emitUnreadToAdmins(
  userId: string,
  i: InformationMessage
): Promise<{ lastMessage: ChatMessage; unread: number }> {
  const io = getIO();
  const [unread, chat] = await Promise.all([
    db.chat.count({ where: { userId, readByAdmin: false } }),
    db.chat.findFirst({
      where: { userId, readByAdmin: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const lastMessage = chat
    ? await toWireMessage(chat, i)
    : (null as unknown as ChatMessage);
  io.to("admins").emit("admin:unreadCount", {
    userId,
    unread,
    lastMessage,
  });
  return { lastMessage, unread };
}

// ===================== AUCTION EMITTERS =====================

interface EmitAuctionPayload {
  auction: KoiAuction;
  bid: Bid; // bid terbaru (NEW_BID) atau bid pemenang (FINISHED)
  user: User; // pelaku bid / pemenang
  type: "NEW_BID" | "FINISHED";
  userIds: string[]; // semua peserta lelang (akan dibroadcast ke tiap room user)
}

/** Bangun pesan ringkas default */
function buildAuctionMessage(p: EmitAuctionPayload): string {
  const rp = formatRupiah(p.bid.price);
  if (p.type === "NEW_BID") {
    return `${p.user.name} menawar ${rp} pada lelang "${p.auction.name}"`;
  }
  // FINISHED
  return `Lelang "${p.auction.name}" selesai. Pemenang: ${p.user.name} (${rp})`;
}

/** Emit event auction ke semua peserta & semua admin */
export async function emitAucion(
  params: EmitAuctionPayload
): Promise<EmitAuctionPayload & { message: string }> {
  const io = getIO();

  // dedupe userIds
  const uniqueUserIds = Array.from(new Set(params.userIds.filter(Boolean)));

  const message = buildAuctionMessage(params);
  const payload = { ...params, message };

  // 1) broadcast ke semua peserta (masing-masing room user)
  for (const uid of uniqueUserIds) {
    io.to(userRoom(uid)).emit("auction:notify", payload);
  }

  // 2) broadcast ke semua admin
  io.to("admins").emit("admin:auction:notify", payload);

  return payload;
}
