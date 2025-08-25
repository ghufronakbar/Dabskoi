// src/socket/types.ts
import { EnumGender, EnumPaymentType } from "@/types/enum";

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

export type ChatMessage = {
  id: string;
  type: ChatType;
  role: Role;
  createdAt: string | Date;
  chat: {
    product: {
      id: string;
      name: string;
      images: string[];
      type: EnumPaymentType;
      gender: EnumGender;
      length: number;
      weight: number;
      price: number;
      description: string;
      certificate: string | null;
    } | null;
    content: string;
    reference: string | null;
  };
  user?: { id: string; name: string; picture: string | null } | null;
  readByAdmin: boolean;
  readByUser: boolean;
};

export type InformationMessage = {
  sells: unknown[];
  negos: unknown[];
  auctions: unknown[];
};

export type UserNewEnvelope = {
  message: ChatMessage;
  userId: string;
  i?: InformationMessage;
};

export type AdminNewEnvelope = {
  message: ChatMessage;
  userId: string;
  i: InformationMessage;
};

export type UnreadEnvelope = {
  userId: string;
  unread: number;
  lastMessage?: ChatMessage;
};

/** ===== Auction notify payload (mirror dari backend) ===== */
export interface AuctionNotifyPayload {
  type: "NEW_BID" | "FINISHED";
  message: string; // ringkasan siap tampil
  userIds: string[]; // semua peserta (info)
  user: {
    // pelaku bid / pemenang
    id: string;
    name: string;
    picture: string | null;
  };
  bid: {
    // bid terkait event
    id: string;
    price: number;
    koiAuctionId: string;
    userId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  auction: {
    // info auction minimal untuk UI
    id: string;
    name: string;
    price: number; // starting price
    startAt: string | Date;
    endAt: string | Date;
    // tambahkan field lain kalau butuh
  };
}

export interface ServerToClientEvents {
  "chat:new": (payload: UserNewEnvelope) => void;
  "admin:chat:new": (payload: AdminNewEnvelope) => void;
  "admin:unreadCount": (payload: UnreadEnvelope) => void;

  /** notifikasi auction untuk peserta (user) */
  "auction:notify": (payload: AuctionNotifyPayload) => void;

  /** notifikasi auction feed untuk admin */
  "admin:auction:notify": (payload: AuctionNotifyPayload) => void;
}

export interface ClientToServerEvents {
  // debug only: untuk produksi kamu kirim via REST
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
}
