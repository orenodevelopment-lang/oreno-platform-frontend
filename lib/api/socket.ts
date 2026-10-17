import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./client";

let socket: Socket | undefined;

export function messagingSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_ORENO_SOCKET_URL ?? API_BASE_URL, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectMessagingSocket() {
  const client = messagingSocket();
  if (!client.connected) client.connect();
  return client;
}

export function disconnectMessagingSocket() {
  socket?.disconnect();
}
