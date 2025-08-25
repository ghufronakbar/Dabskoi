"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  ChatMessage,
  ChatType,
} from "./types";
import { API_URL } from "@/constants";

const ACCESS_TOKEN_KEY = "accessToken";

type Ctx = {
  connected: boolean;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  reconnect: () => void;
  sendChat: (args: {
    targetUserId?: string;
    type: ChatType;
    content: string;
    reference?: string | null;
  }) => Promise<ChatMessage>; // debug
};

const SocketCtx = createContext<Ctx | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [connected, setConnected] = useState(false);
  const tokenRef = useRef<string | null>(null);

  const getToken = useCallback(() => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }, []);

  const connect = useCallback(() => {
    const token = getToken();
    tokenRef.current = token;
    if (!token) return;

    // avoid duplicate connections
    if (socketRef.current?.connected) return;

    const s = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    socketRef.current = s;

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    // keep empty listeners: komponen lain subscribe lewat useSocketEvent()
    // but we log minimal errors if needed:
    s.on("connect_error", (err) => {
      console.error("[socket] connect_error", err.message);
    });
  }, [getToken]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  // init & storage sync
  useEffect(() => {
    // first connect
    connect();

    // reconnect if token changes in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN_KEY) reconnect();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      disconnect();
    };
  }, [connect, disconnect, reconnect]);

  const sendChat = useCallback(
    (args: {
      targetUserId?: string;
      type: ChatType;
      content: string;
      reference?: string | null;
    }) => {
      return new Promise<ChatMessage>((resolve, reject) => {
        socketRef.current?.emit("chat:send", args, (ack) => {
          if (!ack) return reject(new Error("No ACK"));
          if ("ok" in ack && ack.ok === true) resolve(ack.message);
          else reject(new Error(("error" in ack && ack.error) || "Failed"));
        });
      });
    },
    []
  );

  const value = useMemo<Ctx>(
    () => ({
      connected,
      socket: socketRef.current,
      reconnect,
      sendChat,
    }),
    [connected, reconnect, sendChat]
  );

  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}

/** Ambil context */
export function useSocket() {
  const ctx = useContext(SocketCtx);
  if (!ctx) throw new Error("useSocket must be used within <SocketProvider>");
  return ctx;
}

/**
 * Subscribe ke event socket dengan callback.
 * Pemakaian:
 *   useSocketEvent("admin:chat:new", (env) => { ... });
 *   useSocketEvent("chat:new", (env) => { ... });
 */
export function useSocketEvent<E extends keyof ServerToClientEvents>(
  event: E,
  handler: ServerToClientEvents[E] | null
) {
  const { socket } = useSocket();
  const saved = useRef<typeof handler>(handler);

  // Simpan handler terbaru di ref agar tidak rebind tiap render
  useEffect(() => {
    saved.current = handler;
  }, [handler]);

  // Helper: tuple args dari event ini
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type EventArgs = ServerToClientEvents[E] extends (...a: infer A) => any
    ? A
    : never;

  useEffect(() => {
    if (!socket || !handler) return;

    const wrapped = (...args: EventArgs) => {
      // cast agar TS yakin ini function dengan argumen tuple yang benar
      const fn = saved.current as ((...a: EventArgs) => void) | null;
      fn?.(...args);
    };

    // Penting: cast di titik binding untuk menghindari overload reserved events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event as unknown as any, wrapped as unknown as any);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off(event as unknown as any, wrapped as unknown as any);
    };
  }, [socket, event, handler]);
}
