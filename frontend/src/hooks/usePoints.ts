import { useState, useEffect, useCallback } from "react"

export interface Point {
    id: number; name: string; area: number; status: boolean;
    date_create: string; type:number; lon: number; lat: number;
}

export function usePoints() {
    const [points, setPoints] = useState<Point[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);                                    
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [ordering, setOrdering] = useState("");
    const [total, setTotal] = useState(0);


  const fetchPoints = useCallback(async (params: URLSearchParams, signal: AbortSignal) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/features/?${params}`, {signal});
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPoints(data.items);
      setTotal(data.count_filtered);
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; 
        setError("Не удалось загрузить"); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  //добавляем дебаунс для поиска
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search])

  useEffect(() => {
    setPage(1);
  },  [debouncedSearch]);
  
useEffect(() => {
         const params = new URLSearchParams({
             page: String(page),
             page_size: String(pageSize),
         });
         if (debouncedSearch) params.set("q", debouncedSearch);
         if (ordering) params.set("ordering", ordering);
         const controller = new AbortController();
         fetchPoints(params, controller.signal);
         return () => controller.abort();
  }, [debouncedSearch, ordering, page, pageSize, fetchPoints]);

  return{ points, loading, error, page, setPage, total, pageSize, search, setSearch, ordering, setOrdering };
}