import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://medremind-api.onrender.com/api';

export const useMedications = () => {
  const { getToken } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

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

  const fetchMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/medications');
      console.log('Fetched medications:', data); // Debug log
      
      if (data) {
        setMedications(data);
      } else {
        setMedications([]);
      }
      setHasFetched(true);
      return data;
      
    } catch (err) {
      const errorMessage = `Failed to fetch medications: ${err.message}`;
      console.warn(errorMessage);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

    // useMedications.js - Corriger la fonction createMedication
const createMedication = async (medicationData) => {
  try {
    setError(null);
    
    console.log('🔄 Creating medication with data:', medicationData);
    
    const newMedication = await apiCall('/medications', {
      method: 'POST',
      body: medicationData,
    });
    
    console.log('📦 API Response:', newMedication);
    
    if (newMedication) {
      console.log('✅ Medication created successfully:', newMedication.id);
      setMedications(prev => [newMedication, ...prev]);
      return newMedication;
    } else {
      console.warn('❌ Failed to create medication: API returned null');
      return null;
    }
    
  } catch (err) {
    const errorMessage = `Failed to create medication: ${err.message}`;
    console.warn('❌ Error in createMedication:', errorMessage);
    return null;
  }
};

  const updateMedication = async (id, medicationData) => {
    try {
      setError(null);
      
      const updatedMedication = await apiCall(`/medications/${id}`, {
        method: 'PUT',
        body: medicationData,
      });
      
      if (updatedMedication) {
        setMedications(prev => 
          prev.map(med => med.id === id ? updatedMedication : med)
        );
      }
      return updatedMedication;
      
    } catch (err) {
      const errorMessage = `Failed to update medication: ${err.message}`;
      console.warn(errorMessage);
    }
  };

  const deleteMedication = async (id) => {
    try {
      setError(null);
      
      const result = await apiCall(`/medications/${id}`, {
        method: 'DELETE',
      });
      
      if (result !== null) { // Si l'appel a réussi (même si pas de retour)
        setMedications(prev => prev.filter(med => med.id !== id));
      }
      
    } catch (err) {
      const errorMessage = `Failed to delete medication: ${err.message}`;
      console.warn(errorMessage);
    }
  };

  const updateMedicationSupply = async (id, supplyData) => {
    try {
      setError(null);
      
      const updatedMedication = await apiCall(`/medications/${id}/supply`, {
        method: 'PATCH',
        body: supplyData,
      });
      
      if (updatedMedication) {
        setMedications(prev => 
          prev.map(med => med.id === id ? updatedMedication : med)
        );
      }
      return updatedMedication;
      
    } catch (err) {
      const errorMessage = `Failed to update medication supply: ${err.message}`;
      console.warn(errorMessage);
    }
  };

  // Effet pour charger les médicaments au montage du composant - UNE SEULE FOIS
  useEffect(() => {
    if (!hasFetched) {
      fetchMedications();
    }
  }, [hasFetched]);

  return {
    medications: medications || [],
    loading,
    error,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    updateMedicationSupply,
  };
};
