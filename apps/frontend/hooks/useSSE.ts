import { useEffect, useRef } from "react";

type UseSSEOptions = {
  userId: string;
  onMessage: (data: any) => void;
  onError?: (error: any) => void;
};

export function useSSE({ userId, onMessage, onError }: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/sse/${userId}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.warn("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      onError?.(err);
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [userId, onMessage, onError]);
}
