import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AppState,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../assets/styles/refills.styles";
import Header from "../../components/Header";
import NoMedicationsFound from "../../components/NoMedicationsFound";
import NotificationsModal from "../../components/NotificationsModal";
import PageLoader from "../../components/PageLoader";
import { COLORS } from "../../constants/colors";
import { useMedications } from "../../hooks/useMedications";
import {
  registerForPushNotificationsAsync,
  scheduleMedicationReminder,
} from "../../utils/notifications";

export default function RefillTrackerScreen() {
  
  // Utilisation du hook personnalisé pour les médicaments
  const { medications, fetchMedications, updateMedicationSupply, loading: medicationsLoading } = useMedications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [todaysMedications, setTodaysMedications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadMedications = useCallback(async () => {
    try {
      await fetchMedications();
    } catch (error) {
      console.error("Error loading medications:", error);
      if (!error.message.includes("429")) {
        console.warn("Error", "Failed to load medications. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchMedications]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadMedications();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadMedications]);

  useEffect(() => {
    const today = new Date();
    const todayMeds = medications.filter((med) => {
      if (!med.startDate) return false;
      const startDate = new Date(med.startDate);
      const durationDays =
        med.duration === "Ongoing"
          ? -1
          : parseInt(med.duration?.split(" ")[0] || "0");
      return (
        durationDays === -1 ||
        (today >= startDate &&
          today <= new Date(startDate.getTime() + durationDays * 86400000))
      );
    });

    setTodaysMedications(todayMeds);
  }, [medications]);

  useEffect(() => {
    loadMedications();
    const setup = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        for (const med of medications) {
          if (med.reminderEnabled) await scheduleMedicationReminder(med);
        }
      }
    };
    setup();

    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") loadMedications();
    });
    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => loadMedications(), 500);
      return () => clearTimeout(timer);
    }, [loadMedications])
  );

  const handleRefill = async (medication) => {
    try {
      // Utiliser la fonction updateMedicationSupply du hook
      await updateMedicationSupply(medication.id, {
        currentSupply: medication.totalSupply,
        lastRefillDate: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD pour la base de données
      });

      Alert.alert(
        "Refill Recorded",
        `${medication.name} has been refilled to ${medication.totalSupply} units.`
      );
    } catch (error) {
      console.error("Error recording refill:", error);
      Alert.alert("Error", "Failed to record refill. Please try again.");
    }
  };

  const getSupplyStatus = (medication) => {
    // Vérifier que les valeurs existent pour éviter les erreurs de division par zéro
    if (!medication.currentSupply || !medication.totalSupply || medication.totalSupply === 0) {
      return {
        status: "Unknown",
        color: COLORS.textLight,
        backgroundColor: COLORS.background,
      };
    }

    const percentage = (medication.currentSupply / medication.totalSupply) * 100;
    
    if (percentage <= medication.refillAt) {
      return {
        status: "Low",
        color: "#F44336",
        backgroundColor: "#FFEBEE",
      };
    } else if (percentage <= 50) {
      return {
        status: "Medium",
        color: "#FF9800",
        backgroundColor: "#FFF3E0",
      };
    } else {
      return {
        status: "Good",
        color: "#4CAF50",
        backgroundColor: "#E8F5E9",
      };
    }
  };

  // Filtrer les médicaments qui ont le suivi des réapprovisionnements activé
  const medicationsWithRefillTracking = medications.filter(med => 
    med.refillReminder === true
  );

  // Afficher le PageLoader pendant le chargement initial uniquement
  if (isLoading && !isRefreshing) {
    return <PageLoader />;
  }

  return (
    <View style={styles.container}>
      
      <Header
        todaysMedications={todaysMedications}
        onShowNotifications={() => setShowNotifications(true)}
      />

      <View style={styles.content}>
        {medicationsWithRefillTracking.length === 0 ? (
          // Etat vide : centré verticalement et horizontalement, *hors* du ScrollView
          <View style={styles.emptyStateWrapper}>
            <NoMedicationsFound
              title="No medications to track"
              text="Medications with refill reminders enabled will appear here."
              showButton={true}
            />
          </View>
        ) : (
          // Liste normale dans un ScrollView uniquement quand il y a des éléments
          <ScrollView
            style={styles.medicationsContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#4FC3F7"]} 
                tintColor="#4FC3F7" 
                title="Loading..." 
                titleColor="#4FC3F7" 
              />
            }
          >
            {medicationsWithRefillTracking.map((medication) => {
              const supplyStatus = getSupplyStatus(medication);
              
              // Calcul sécurisé du pourcentage
              let supplyPercentage = 0;
              if (medication.currentSupply && medication.totalSupply && medication.totalSupply > 0) {
                supplyPercentage = (medication.currentSupply / medication.totalSupply) * 100;
              }

              return (
                <View key={medication.id} style={styles.medicationCard}>
                  <View style={styles.medicationHeader}>
                    <View
                      style={[
                        styles.medicationColor,
                        { backgroundColor: medication.color },
                      ]}
                    />
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>
                        {medication.name}
                      </Text>
                      <Text style={styles.medicationDosage}>
                        {medication.dosage}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: supplyStatus.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: supplyStatus.color },
                        ]}
                      >
                        {supplyStatus.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.supplyContainer}>
                    <View style={styles.supplyInfo}>
                      <Text style={styles.supplyLabel}>Current Supply</Text>
                      <Text style={styles.supplyValue}>
                        {medication.currentSupply || 0} units
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(supplyPercentage, 100)}%`,
                              backgroundColor: supplyStatus.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(supplyPercentage)}%
                      </Text>
                    </View>
                    <View style={styles.refillInfo}>
                      <Text style={styles.refillLabel}>
                        Refill at: {medication.refillAt || 0}%
                      </Text>
                      {medication.lastRefillDate && (
                        <Text style={styles.lastRefillDate}>
                          Last refill:{" "}
                          {new Date(medication.lastRefillDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.refillButton,
                      {
                        backgroundColor:
                          supplyPercentage < 100 ? medication.color : COLORS.border,
                      },
                    ]}
                    onPress={() => handleRefill(medication)}
                    disabled={supplyPercentage >= 100}
                  >
                    <Text style={styles.refillButtonText}>
                      {supplyPercentage >= 100 ? "Fully Stocked" : "Record Refill"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        medications={todaysMedications}
      />
    </View>
  );
}