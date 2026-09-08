import { useCallback, useEffect, useState, type DependencyList } from 'react';

export function useResource<T>(load: () => Promise<T>, dependencies: DependencyList) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(r => r + 1), []);
  useEffect(() => {
    let active = true; setLoading(true); setError(undefined);
    load().then(value => { if (active) setData(value); }).catch(e => { if (active) setError(e); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [...dependencies, revision]);
  return { data, error, loading, reload, setData };
}
