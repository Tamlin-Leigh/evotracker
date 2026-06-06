import { useState, useEffect } from 'react';
import api from '../services/api';

export function useMeasurements() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/measurements');
      setMeasurements(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { measurements, loading, error, refetch: fetch };
}
