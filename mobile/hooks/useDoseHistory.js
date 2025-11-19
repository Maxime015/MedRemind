import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://medremind-api.onrender.com/api';

export const useDoseHistory = () => {
  const { getToken } = useAuth();
  const [doseHistory, setDoseHistory] = useState([]);
  const [todaysDoses, setTodaysDoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetchedToday, setHasFetchedToday] = useState(false);

  const apiCall = async (endpoint, options = {}) => {
    try {
      const token = await getToken();
      if (!token) {
        console.warn('No authentication token available');
        return null;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...options,
      };

      if (options.body) {
        config.body = JSON.stringify(options.body);
      }

      console.log(`Making API call to: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, config);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          console.log("Could not parse error response as JSON");
        }
        console.warn(errorMessage);
        return null;
      }

      // ✅ CORRECTION : Retourner les données JSON
      const data = await response.json();
      return data;
      
    } catch (err) {
      console.warn("API call failed:", err);
      return null;
    }
  };

  const fetchDoseHistory = async (startDate, endDate, medicationId) => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = '/dose-history';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (medicationId) params.append('medicationId', medicationId);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const data = await apiCall(endpoint);
      console.log('Fetched dose history:', data); // Debug log
      
      if (data) {
        setDoseHistory(data);
      } else {
        setDoseHistory([]);
      }
      return data;
      
    } catch (err) {
      const errorMessage = `Failed to fetch dose history: ${err.message}`;
      console.warn(errorMessage);
      setDoseHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysDoses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/dose-history/today');
      console.log('Fetched today doses:', data); // Debug log
      
      if (data) {
        setTodaysDoses(data);
      } else {
        setTodaysDoses([]);
      }
      setHasFetchedToday(true);
      return data;
      
    } catch (err) {
      const errorMessage = `Failed to fetch today's doses: ${err.message}`;
      console.warn(errorMessage);
      setTodaysDoses([]);
    } finally {
      setLoading(false);
    }
  };

  const recordDose = async (medicationId, taken, timestamp = new Date().toISOString()) => {
    try {
      setError(null);
      
      const doseData = {
        medicationId,
        taken,
        timestamp
      };
      
      const newDose = await apiCall('/dose-history', {
        method: 'POST',
        body: doseData,
      });
      
      // Mettre à jour les états locaux seulement si l'appel a réussi
      if (newDose) {
        setDoseHistory(prev => [newDose, ...prev]);
        setTodaysDoses(prev => [newDose, ...prev]);
      }
      
      return newDose;
      
    } catch (err) {
      const errorMessage = `Failed to record dose: ${err.message}`;
      console.warn(errorMessage);
    }
  };

  const deleteMedicationHistory = async (medicationId) => {
    try {
      setError(null);
      
      const result = await apiCall(`/dose-history/medication/${medicationId}`, {
        method: 'DELETE',
      });
      
      // Mettre à jour les états locaux seulement si l'appel a réussi
      if (result !== null) {
        setDoseHistory(prev => prev.filter(dose => dose.medicationId !== medicationId));
        setTodaysDoses(prev => prev.filter(dose => dose.medicationId !== medicationId));
      }
      
    } catch (err) {
      const errorMessage = `Failed to delete medication history: ${err.message}`;
      console.warn(errorMessage);
    }
  };

  // Charger les prises du jour au montage - UNE SEULE FOIS
  useEffect(() => {
    if (!hasFetchedToday) {
      fetchTodaysDoses();
    }
  }, [hasFetchedToday]);

  return {
    doseHistory: doseHistory || [],
    todaysDoses: todaysDoses || [],
    loading,
    error,
    fetchDoseHistory,
    fetchTodaysDoses,
    recordDose,
    deleteMedicationHistory,
  };
};
