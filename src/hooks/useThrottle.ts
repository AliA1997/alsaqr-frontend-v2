import { useEffect, useRef, useState } from "react";

export function useThrottle(callback: (...args: any[]) => void, delay: number) {
  const lastCallTime = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [argsToCall, setArgsToCall] = useState<any[] | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle throttled execution
  useEffect(() => {
    if (!argsToCall) return;

    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime.current;

    if (timeSinceLastCall >= delay) {
      callback(...argsToCall);
      lastCallTime.current = now;
      setArgsToCall(null);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callback(...argsToCall);
        lastCallTime.current = Date.now();
        setArgsToCall(null);
      }, delay - timeSinceLastCall);
    }
  }, [argsToCall, callback, delay]);

  // Return throttled function
  return (...args: any[]) => {
    setArgsToCall(args);
  };
}