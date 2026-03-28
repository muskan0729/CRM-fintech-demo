// new code 
import { useEffect, useRef } from "react";
import { useGet } from "./useGet";

export default function useAutoFetch(endpoint, intervalMs = 60000) {
  const { data, loading, error, refetch } = useGet(endpoint);
  const intervalRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) return; // ✅ prevent duplicate intervals

      intervalRef.current = setInterval(async () => {
        if (isFetchingRef.current) return; // ✅ prevent overlapping calls

        try {
          isFetchingRef.current = true;
          await refetch();
        } finally {
          isFetchingRef.current = false;
        }
      }, intervalMs);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopPolling(); // ✅ stop when tab inactive
      else startPolling(); // ✅ resume when active
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling(); // ✅ hard cleanup
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [endpoint, intervalMs]); // ✅ refetch removed from deps

  return { data, loading, error, refetch };
}
