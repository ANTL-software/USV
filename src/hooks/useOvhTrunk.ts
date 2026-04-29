import { useState, useEffect } from 'react';
import { ovhService, OvhTrunkStatus, OvhTrunkConsumption } from '../utils/services/ovh.service';

export interface OvhTrunkData {
  status: OvhTrunkStatus;
  consumption: OvhTrunkConsumption;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

/**
 * Hook personnalisé pour le monitoring du trunk OVH
 * Rafraîchit les données toutes les 60 secondes
 */
export const useOvhTrunk = (refreshInterval = 60000): OvhTrunkData => {
  const [status, setStatus] = useState<OvhTrunkStatus>({
    status: 'disabled',
    message: 'Chargement...',
    lastCheck: new Date().toISOString()
  });
  const [consumption, setConsumption] = useState<OvhTrunkConsumption>({
    appels: 0,
    dureeTotale: 0,
    dureeFormatee: '0h 0min',
    limite: null,
    pourcentage: 0,
    periode: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusData, consumptionData] = await Promise.all([
        ovhService.getTrunkStatus(),
        ovhService.getTrunkConsumption()
      ]);

      setStatus(statusData);
      setConsumption(consumptionData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('[OVH] Erreur récupération données:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    status,
    consumption,
    loading,
    error,
    lastUpdate
  };
};
