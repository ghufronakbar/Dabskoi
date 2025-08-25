/* eslint-disable no-console */
import { io, Socket } from "socket.io-client";
import readline from "readline";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ChatType,
} from "../../realtime/types";
import db from "../../config/db";
import jwt from "jsonwebtoken";
import { ChatMessage } from "src/helper/format-chat-product";

// ====== GLOBAL CONST (ISI SENDIRI) ======
const WS_URL = "http://localhost:2000";
const USER_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgyZTVkZDAyLTc2NjctNGI0OS05Mjc3LWIxOTU0NTRkYzkzYiIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzU1NDgyNTc5fQ.cOsT3wqb5Db_hwlYU2BF1UcyjIsZnkMoyL3FA407v0w";
// =======================================

type AckSend =
  | { ok: true; message: ChatMessage }
  | { ok: false; error: string };

type AckOk = { ok: true } | { ok: false; error: string };

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WS_URL, {
  auth: { token: USER_JWT },
});

function logMessage(prefix: string, msg: ChatMessage): void {
  console.log(`[${prefix}] ${msg.role} -> me`);
  console.log(msg);
}

socket.on("connect", async () => {
  const decoded = jwt.decode(USER_JWT) as { id: string };
  const user = await db.user.findUnique({
    where: {
      id: decoded.id,
    },
  });
  console.log(`✅ Connected as USER: ${user?.name} (${user?.id})`);
});

socket.on("chat:new", ({ message }) => {
  console.log("[NEW MSG] ", message.createdAt);
  let formattedMessage = message.chat.content;
  if (message.type === "IMAGE") {
    formattedMessage = `Admin mengirim gambar`;
  }
});

// ... (imports & setup tetap)
socket.on("auction:notify", (p) => {
  // p: AuctionNotifyPayload
  console.log(`[AUCT][USER][${p.type}] ${p.message}`);
  console.log({
    auctionId: p.auction.id,
    auctionName: p.auction.name,
    bidder: p.user.name,
    bid: p.bid.price,
    message: p.message,
  });
});

socket.on("disconnect", () => console.log("❌ Disconnected"));

// ---------------- CLI ----------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "user> ",
});
rl.prompt();

function parseArgs(line: string): string[] {
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
  /send <text>                          (type TEXT)
  /sendtype <type> <text>               (type: TEXT|IMAGE|REFERENCE_SELL|REFERENCE_NEGO|REFERENCE_AUCTION)
  /sendref <type> <refId> <text>

  /help
  /exit
Examples:
  /send "Halo admin"
  /sendtype REFERENCE_SELL "Saya mau tanya barang ini"
  /sendref REFERENCE_NEGO 12ab-... "Mau nego segini ya"
`);
}

rl.on("line", (line) => {
  const args = parseArgs(line.trim());
  const cmd = (args.shift() ?? "").toLowerCase();

  switch (cmd) {
    case "/send": {
      const content = args.join(" ");
      if (!content) {
        console.log("Usage: /send <text>");
        break;
      }
      socket.emit(
        "chat:send",
        { type: "TEXT", content, reference: null },
        (ack: AckSend) => {
          if (ack.ok === true) logMessage("SENT", ack.message);
          else console.log(`ERR: ${ack?.error}`);
        }
      );
      break;
    }
    case "/sendtype": {
      const type = args[0] as ChatType;
      const content = args.slice(1).join(" ");
      if (!type || !content) {
        console.log("Usage: /sendtype <type> <text>");
        break;
      }
      socket.emit(
        "chat:send",
        { type, content, reference: null },
        (ack: AckSend) => {
          if (ack.ok === true) logMessage("SENT", ack.message);
          else console.log(`ERR: ${ack?.error}`);
        }
      );
      break;
    }
    case "/sendref": {
      const type = args[0] as ChatType;
      const refId = args[1];
      const content = args.slice(2).join(" ");
      if (!type || !refId || !content) {
        console.log("Usage: /sendref <type> <refId> <text>");
        break;
      }
      socket.emit(
        "chat:send",
        { type, content, reference: refId },
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
