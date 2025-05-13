import { useEffect, useState } from "react";

type FetchPageFunction<T> = (page: number) => Promise<T[]>;

const usePaginatedFetch = <T>(
  fetchFunction: FetchPageFunction<T>,
  autoFetch = true
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (pageNumber = 1, append = false) => {
    if (loading || loadingMore) return;

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const result = await fetchFunction(pageNumber);
      if (result.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => (append ? [...prev, ...result] : result));
        setPage(pageNumber);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchData(page + 1, true);
    }
  };

  const reset = () => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  };

  useEffect(() => {
    if (autoFetch) fetchData(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    loadingMore,
    error,
    loadMore,
    hasMore,
    refetch: () => fetchData(1, false),
    reset,
  };
};

export default usePaginatedFetch;
