import { useEffect, useState } from "react";

export function useDebounce(func: (...args: any[]) => void, delay: number) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  // Cancel pending debounces on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (...args: Parameters<typeof func>) => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => func(...args), delay);
    setTimeoutId(id);
  };
}
