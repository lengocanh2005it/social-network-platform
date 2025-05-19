import { useCallback, useRef } from "react";

export const useInfiniteScroll = (callback: () => void, hasMore: boolean) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const setLastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();

      if (node && hasMore) {
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            callback();
          }
        });

        observer.current.observe(node);
      }

      lastElementRef.current = node;
    },
    [callback, hasMore],
  );

  return setLastElementRef;
};
