import { useCallback, useRef } from "react";

export const useInfiniteScroll = (callback: () => void, hasMore: boolean) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const setLastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();

      if (node && hasMore) {
        observer.current = new IntersectionObserver((entries) => {
          const firstEntry = entries[0];
          if (firstEntry.isIntersecting && !isFetchingRef.current) {
            isFetchingRef.current = true;
            callback();

            setTimeout(() => {
              isFetchingRef.current = false;
            }, 500);
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
