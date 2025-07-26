import { SocketNamespace } from "@/utils";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const sockets: Record<string, Socket> = {};

export const getSocket = (namespace: string, fingerprint: string): Socket => {
  if (!sockets[namespace]) {
    sockets[namespace] = io(`${SOCKET_SERVER_URL}/ws/${namespace}`, {
      withCredentials: true,
      transports: ["websocket"],
      query: {
        fingerprint,
      },
    });
  }

  sockets[namespace].on("connect", () => {
    if (namespace === SocketNamespace.PRESENCE)
      setInterval(() => {
        sockets[namespace].emit("ping");
      }, 20000);
  });

  return sockets[namespace];
};
