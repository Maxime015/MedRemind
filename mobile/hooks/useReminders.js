// hooks/useReminders.jsx
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://medremind-api.onrender.com/api';

export const useReminders = () => {
  const { getToken } = useAuth();
  const [todaysMedications, setTodaysMedications] = useState([]);
  const [medicationStats, setMedicationStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint, options = {}) => {
    try {
      const token = await getToken();
      if (!token) {
        console.warn('No authentication token available');
        return null;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
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

        if (response.status === 401) {
          console.warn("Authentication failed. Please sign in again.");
        }
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

  // Récupérer les médicaments du jour avec rappels
  const fetchTodaysMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/reminders/today');
      console.log('Fetched today medications:', data); // Debug log
      
      if (data) {
        setTodaysMedications(data);
      } else {
        setTodaysMedications([]);
      }
      return data;
      
    } catch (err) {
      const errorMessage = `Failed to fetch today's medications: ${err.message}`;
      console.warn(errorMessage);
      setTodaysMedications([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des médicaments
  const fetchMedicationStats = async (days = 30) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(`/stats?days=${days}`);
      console.log('Fetched medication stats:', data); // Debug log
      
      if (data) {
        setMedicationStats(data);
      } else {
        setMedicationStats([]);
      }
      return data;
      
    } catch (err) {
      const errorMessage = `Failed to fetch medication stats: ${err.message}`;
      console.warn(errorMessage);
      setMedicationStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    fetchTodaysMedications();
    fetchMedicationStats();
  }, []);

  return {
    // États
    todaysMedications: todaysMedications || [],
    medicationStats: medicationStats || [],
    loading,
    error,
    
    // Actions
    fetchTodaysMedications,
    fetchMedicationStats,
    
    // Réinitialiser l'erreur
    clearError: () => setError(null),
  };
};
