import { useCallback, useRef, useState } from "react";

function useInView<T extends Element>() {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect();

    if (!node) {
      return;
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    });

    observerRef.current.observe(node);
  }, []);

  return { ref, isInView };
}

export { useInView };
