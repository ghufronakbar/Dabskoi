import "dotenv/config";
import express from "express";
import cors from "cors";
import { APP_NAME, PORT } from "./constant";
import router from "./routes/index";
import morgan from "morgan";
import db from "./config/db";
import os from "node:os";
import { Server } from "socket.io";
import { initSocket } from "./realtime/socket";
import http from "http";
import { refreshAuctionCron } from "./schedule/auction-schedule";

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

function getIPv4Addresses(): string[] {
  const ifaces = os.networkInterfaces();
  const addrs: string[] = [];

  for (const name of Object.keys(ifaces)) {
    for (const info of ifaces[name] ?? []) {
      if (!info) continue;
      if (info.family === "IPv4" && !info.internal) {
        addrs.push(info.address);
      }
    }
  }
  return addrs;
}

// Routes
app.get("/", async (req, res) => {
  try {
    const users = await db.user.count();
    return res.json({
      message: "Welcome to " + APP_NAME,
      db: {
        status: "connected",
        users,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

app.use("/api", router);

const server = http.createServer(app);
const io = new Server(server);
initSocket(io);

// Start server
server.listen(PORT, async () => {
  await refreshAuctionCron();
  console.log(
    `\n\n\n===============   SERVER ${APP_NAME} IS RUNNING ON   ===============`
  );
  const ipv4Addresses = getIPv4Addresses();
  const BASE_URLS = {
    local: `http://localhost:${PORT}`,
  };
  ipv4Addresses.forEach((address) => {
    BASE_URLS["network"] = `http://${address}:${PORT}`;
  });
  console.table(BASE_URLS);
  console.log("Enjoy your day!\n\n");
});
