// src/realtime/types.ts
import type { KoiAuction, Bid, User } from "@prisma/client";
import type { InformationMessage } from "./emitters";
import type { ChatMessage } from "../helper/format-chat-product";

export type Role = "ADMIN" | "USER";

export type ChatType =
  | "TEXT"
  | "IMAGE"
  | "REFERENCE_SELL"
  | "REFERENCE_NEGO"
  | "REFERENCE_AUCTION"
  | "NEGO_RESPONSE_ACCEPT"
  | "NEGO_RESPONSE_REJECT"
  | "NEGO_REQUEST"
  | "AUCTION_RESPONSE_ACCEPT"
  | "AUCTION_RESPONSE_REJECT";

export interface JwtPayload {
  id: string;
  role: Role;
}

/** Payload notifikasi auction yang dikirim via WS */
export interface AuctionNotifyPayload {
  auction: KoiAuction;
  bid: Bid;
  user: User; // pelaku bid (NEW_BID) / pemenang (FINISHED)
  type: "NEW_BID" | "FINISHED";
  userIds: string[]; // semua peserta
  message: string; // ringkasan siap tampil
}

export interface ServerToClientEvents {
  "chat:new": (payload: {
    message: ChatMessage;
    userId: string;
    i: InformationMessage;
  }) => void;

  "admin:unreadCount": (payload: {
    userId: string;
    unread: number;
    lastMessage: ChatMessage;
  }) => void;

  "admin:chat:new": (payload: {
    message: ChatMessage;
    userId: string;
    i: InformationMessage;
  }) => void;

  /** Notifikasi auction untuk USER */
  "auction:notify": (payload: AuctionNotifyPayload) => void;

  /** Notifikasi auction untuk ADMIN feed */
  "admin:auction:notify": (payload: AuctionNotifyPayload) => void;
}

export interface ClientToServerEvents {
  "chat:send": (
    payload: {
      targetUserId?: string; // wajib untuk ADMIN
      type: ChatType;
      content: string;
      reference?: string | null;
    },
    ack: (
      res: { ok: true; message: ChatMessage } | { ok: false; error: string }
    ) => void
  ) => void;

  "admin:joinChat": (
    payload: { userId: string },
    ack: (res: { ok: true } | { ok: false; error: string }) => void
  ) => void;

  "admin:leaveChat": (
    payload: { userId: string },
    ack: (res: { ok: true } | { ok: false; error: string }) => void
  ) => void;
}

export interface InterServerEvents {} // none

export interface SocketData {
  user: { id: string; role: Role };
}

export const userRoom = (userId: string) => `chat:${userId}`;
