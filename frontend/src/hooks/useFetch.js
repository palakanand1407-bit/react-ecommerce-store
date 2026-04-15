// ============================================================
//  src/hooks/useFetch.js
//  Clean version (no ESLint issues, production-ready)
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";

function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mounted = useRef(true);

  // Track component mount/unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Fetch function
  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetcher();
      if (mounted.current) {
        setData(res.data);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err.message || "Something went wrong");
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, deps);

  // Run on mount + dependency change
  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}

export default useFetch;