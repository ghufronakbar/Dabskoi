/* eslint-disable no-console */
import { io, Socket } from "socket.io-client";
import readline from "readline";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ChatType,
} from "../../realtime/types";
import { ChatMessage } from "../../helper/format-chat-product";

// ====== GLOBAL CONST (ISI SENDIRI) ======
const WS_URL = "http://localhost:2000";
const ADMIN_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE1ZTA2YWFlLTcwYmYtNDk0YS04YjI2LTk5ZWY0NzViYmMyNCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1NTQzODM4NX0.XDtpGdFeaRYTb8_q6Xj_g5-9hPZURKt7bszvXzULRsU";
const AUTO_JOIN_USER_ID = ""; // optional: isi jika ingin auto join ke room user tertentu
// =======================================

type AckSend =
  | { ok: true; message: ChatMessage }
  | { ok: false; error: string };

type AckOk = { ok: true } | { ok: false; error?: string };

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WS_URL, {
  auth: { token: ADMIN_JWT },
});

function logMessage(prefix: string, msg: ChatMessage): void {
  console.log(`[${prefix}] ${msg.role} -> ${msg.user?.id}`);
  console.log(msg);
}

socket.on("connect", () => {
  console.log(`✅ Connected as ADMIN: ${socket.id}`);
  if (AUTO_JOIN_USER_ID) {
    socket.emit(
      "admin:joinChat",
      { userId: AUTO_JOIN_USER_ID },
      (ack: AckOk) => {
        console.log(
          ack.ok === true
            ? `Joined chat:${AUTO_JOIN_USER_ID}`
            : `Join failed: ${ack?.error}`
        );
      }
    );
  }
});

socket.on("chat:new", ({ message, userId }) => {
  logMessage(`NEW for ${userId}`, message);
});

socket.on("admin:chat:new", ({ message, userId }) => {
  logMessage(`ADMIN FEED ${userId}`, message);
});

// ... (imports & setup tetap)
socket.on("admin:auction:notify", (p) => {
  // p: AuctionNotifyPayload
  console.log(`[AUCT][ADMIN][${p.type}] ${p.message}`);
  console.log({
    auctionId: p.auction.id,
    auctionName: p.auction.name,
    bidder: p.user.name,
    bid: p.bid.price,
    participants: p.userIds.length,
  });
});

socket.on("admin:unreadCount", ({ userId, unread }) => {
  console.log(`🔔 Unread for user:${userId} = ${unread}`);
});

socket.on("disconnect", () => console.log("❌ Disconnected"));

// ---------------- CLI ----------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "admin> ",
});
rl.prompt();

function parseArgs(line: string): string[] {
  // simple split that respects quotes
  const regex = /"([^"]+)"|'([^']+)'|(\S+)/g;
  const args: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    args.push(m[1] ?? m[2] ?? m[3]);
  }
  return args;
}

function help(): void {
  console.log(`
Commands:
  /join <userId>
  /leave <userId>
  /send <userId> <type> <text>          (type: TEXT|IMAGE|REFERENCE_SELL|REFERENCE_NEGO|REFERENCE_AUCTION)
  /sendref <userId> <type> <refId> <text>
  /help
  /exit
Examples:
  /join 7f30-...
  /send 7f30-... TEXT "Halo dari admin"
  /sendref 7f30-... REFERENCE_NEGO 12ab-... "Tanya nego ini ya"
`);
}

rl.on("line", (line) => {
  const args = parseArgs(line.trim());
  const cmd = (args.shift() ?? "").toLowerCase();

  switch (cmd) {
    case "/join": {
      const userId = args[0];
      if (!userId) {
        console.log("userId required");
        break;
      }
      socket.emit("admin:joinChat", { userId }, (ack: AckOk) => {
        console.log(
          ack.ok === true ? `Joined ${userId}` : `Join failed: ${ack?.error}`
        );
      });
      break;
    }
    case "/leave": {
      const userId = args[0];
      if (!userId) {
        console.log("userId required");
        break;
      }
      socket.emit("admin:leaveChat", { userId }, (ack: AckOk) => {
        console.log(
          ack.ok === true ? `Left ${userId}` : `Leave failed: ${ack.error}`
        );
      });
      break;
    }
    case "/send": {
      const userId = args[0];
      const type = args[1] as ChatType;
      const content = args.slice(2).join(" ");
      if (!userId || !type || !content) {
        console.log("Usage: /send <userId> <type> <text>");
        break;
      }
      socket.emit(
        "chat:send",
        { targetUserId: userId, type, content, reference: null },
        (ack: AckSend) => {
          if (ack.ok === true) logMessage("SENT", ack.message);
          else console.log(`ERR: ${ack?.error}`);
        }
      );
      break;
    }
    case "/sendref": {
      const userId = args[0];
      const type = args[1] as ChatType;
      const refId = args[2];
      const content = args.slice(3).join(" ");
      if (!userId || !type || !refId || !content) {
        console.log("Usage: /sendref <userId> <type> <refId> <text>");
        break;
      }
      socket.emit(
        "chat:send",
        { targetUserId: userId, type, content, reference: refId },
        (ack: AckSend) => {
          if (ack.ok === true) logMessage("SENT", ack.message);
          else console.log(`ERR: ${ack?.error}`);
        }
      );
      break;
    }
    case "/help":
      help();
      break;
    case "/exit":
      rl.close();
      break;
    case "":
      break;
    default:
      console.log("Unknown command. /help");
  }
  rl.prompt();
});

rl.on("close", () => {
  socket.disconnect();
  process.exit(0);
});
