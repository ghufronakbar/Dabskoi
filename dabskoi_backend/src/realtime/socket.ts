// src/realtime/socket.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import db from "../config/db";
import {
  ClientToServerEvents,
  InterServerEvents,
  JwtPayload,
  ServerToClientEvents,
  SocketData,
  Role,
  userRoom,
} from "./types";
import { emitChatNew, emitUnreadToAdmins } from "./emitters";

let ioRef: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;
export const setIO = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  ioRef = io;
};
export const getIO = (): Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> => {
  if (!ioRef) throw new Error("IO not initialized");
  return ioRef!;
};

function isJwtPayload(val: unknown): val is JwtPayload {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;
  return (
    typeof obj.id === "string" && (obj.role === "ADMIN" || obj.role === "USER")
  );
}

export function initSocket(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  setIO(io);

  io.use(async (socket, next) => {
    const tokenHeader = socket.handshake.headers.authorization;
    const tokenQuery =
      typeof socket.handshake.query?.token === "string"
        ? socket.handshake.query.token
        : undefined;
    const tokenAuth =
      typeof socket.handshake.auth?.token === "string"
        ? socket.handshake.auth.token
        : undefined;

    const raw =
      tokenAuth ??
      tokenQuery ??
      (tokenHeader ? tokenHeader.replace(/^Bearer\s+/i, "") : undefined);
    if (!raw) return next(new Error("Unauthorized: no token"));

    try {
      const decoded = jwt.verify(raw, process.env.JWT_SECRET as string);
      if (!isJwtPayload(decoded))
        return next(new Error("Unauthorized: bad token"));
      const user = await db.user.findUnique({ where: { id: decoded.id } });
      if (!user) return next(new Error("Unauthorized: user not found"));
      socket.data.user = { id: user.id, role: user.role as Role };
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on(
    "connection",
    (
      socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >
    ) => {
      const me = socket.data.user.id;
      const role = socket.data.user.role;

      if (role === "USER") {
        socket.join(userRoom(me));
      } else {
        // semua admin selalu tergabung di room "admins"
        socket.join("admins");
      }

      socket.on("admin:joinChat", ({ userId }, ack) => {
        if (role !== "ADMIN") return ack({ ok: false, error: "Only admin" });
        socket.join(userRoom(userId));
        ack({ ok: true });
      });

      socket.on("admin:leaveChat", ({ userId }, ack) => {
        if (role !== "ADMIN") return ack({ ok: false, error: "Only admin" });
        socket.leave(userRoom(userId));
        ack({ ok: true });
      });

    //   // Kirim pesan via WS (dipersilakan hanya untuk debug; produksi pakai REST)
    //   socket.on("chat:send", async (payload, ack) => {
    //     try {
    //       const targetUserId = role === "USER" ? me : payload.targetUserId;
    //       if (!targetUserId)
    //         return ack({
    //           ok: false,
    //           error: "targetUserId is required for admin",
    //         });

    //       const user = await db.user.findUnique({
    //         where: { id: targetUserId },
    //       });
    //       if (!user) return ack({ ok: false, error: "Target user not found" });

    //       const now = new Date();
    //       const chat = await db.chat.create({
    //         data: {
    //           userId: targetUserId,
    //           content: payload.content,
    //           type: payload.type,
    //           reference: payload.reference ?? null,
    //           role,
    //           createdAt: now,
    //           updatedAt: now,
    //           readByAdmin: role === "ADMIN",
    //           readByUser: role === "USER",
    //         },
    //       });

    //       // Siapkan InformationMessage untuk reference (kalau ada)
    //       const refIds = chat.reference ? [chat.reference] : [];
    //       const [sells, negos, auctions] = await Promise.all([
    //         db.koiSell.findMany({ where: { id: { in: refIds } } }),
    //         db.koiNego.findMany({ where: { id: { in: refIds } } }),
    //         db.koiAuction.findMany({ where: { id: { in: refIds } } }),
    //       ]);
    //       const i = { sells, negos, auctions };

    //       // Emit ke user room + broadcast ke admin feed; juga update unread
    //       const message = await emitChatNew(targetUserId, chat, i);
    //       await emitUnreadToAdmins(targetUserId, i);

    //       ack({ ok: true, message });
    //     } catch (e) {
    //       ack({ ok: false, error: "Failed to send chat" });
    //     }
    //   });
    }
  );
}
