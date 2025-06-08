import { getSocket } from "@/lib/socket";
import { useCallback, useRef } from "react";
import { Socket } from "socket.io-client";

type EventHandler = (...args: any[]) => void;

export const useSocket = () => {
  const socketRef = useRef<Socket>(getSocket());

  const on = useCallback((event: string, handler: EventHandler) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler: EventHandler) => {
    socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event: string, ...args: any[]) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  return {
    socket: socketRef.current,
    on,
    off,
    emit,
  };
};
