import { useEffect, useMemo, useState } from "react";

import qs from "qs";

interface UseFetchReadyToUse {
  service: (
    body?: Record<string, any> | null | undefined,
    customHeaders?: Record<string, string>,
    params?: Record<string, any>
  ) => Promise<any>;
  options?: Options;
}

interface Options {
  headers?: Record<string, string>;
  body?: Record<string, any> | null; // Add body to options
  params?: Record<string, any>;
}

export const useFetch = <T>({ service, options }: UseFetchReadyToUse) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Use useMemo to stabilize the headers reference
  const memoizedOptions = useMemo(
    () => ({
      headers: JSON.stringify(options?.headers || {}),
      body: JSON.stringify(options?.body || null),
      params: qs.stringify(options?.params || null),
    }),
    [options?.headers, options?.body, options?.params]
  );

  const fetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const result: T = await service(
        JSON.parse(memoizedOptions?.body),
        JSON.parse(memoizedOptions?.headers),
        qs.parse(memoizedOptions?.params)
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => {
    fetch();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [memoizedOptions.headers, memoizedOptions.body, memoizedOptions.params]);

  return { data, error, loading };
};
