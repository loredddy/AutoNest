import { useEffect, useRef } from "react";

export function useAutoRefresh(fetchFn, intervalMs = 10 * 60 * 1000) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  useEffect(() => {
    fetchRef.current();
    const interval = setInterval(() => {
      fetchRef.current();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
}
