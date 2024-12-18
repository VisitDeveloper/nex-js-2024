import { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface UseFetchReadyToUse {
  service: (body?: Record<string, any> | null | undefined, customHeaders?: Record<string, string>) => Promise<any>;
  options?: Options;
}

interface Options {
  headers?: Record<string, string>;
  body?: Record<string, any> | null; // Add body to options
}

export const useFetch = <T>({ service, options }: UseFetchReadyToUse) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Use useMemo to stabilize the headers reference
  const memoizedOptions = useMemo(() => ({
    headers: JSON.stringify(options?.headers || {}),
    body: JSON.stringify(options?.body || null),
  }), [options?.headers, options?.body]);



  const fetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const result: T = await service(JSON.parse(memoizedOptions?.body),JSON.parse(memoizedOptions?.headers));
      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Only trigger fetchData when necessary
  useEffect(() => {
    fetch();
  }, [memoizedOptions.headers , memoizedOptions.body]);

  return { data, error, loading };
};
