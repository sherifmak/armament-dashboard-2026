import { useState, useEffect } from 'react';
import type { DailyTrackingEntry } from '../types';

export function useTrackingData() {
  const [data, setData] = useState<DailyTrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/tracking.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load tracking data: ${res.status}`);
        return res.json();
      })
      .then((json: DailyTrackingEntry[]) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
