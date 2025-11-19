import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
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
import { styles } from "../../assets/styles/history.styles";
import Header from "../../components/Header";
import NoMedicationsFound from "../../components/NoMedicationsFound";
import NotificationsModal from "../../components/NotificationsModal";
import PageLoader from "../../components/PageLoader";
import { COLORS } from "../../constants/colors";
import { useDoseHistory } from "../../hooks/useDoseHistory";
import { useMedications } from "../../hooks/useMedications";
import {
  registerForPushNotificationsAsync,
  scheduleMedicationReminder,
} from "../../utils/notifications";

export default function HistoryScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [todaysMedications, setTodaysMedications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks personnalisés
  const { medications, fetchMedications, deleteMedication, loading: medicationsLoading } = useMedications();
  const { doseHistory, fetchDoseHistory, deleteMedicationHistory, loading: doseHistoryLoading } = useDoseHistory();

  // Charger les données
  const loadHistory = useCallback(async () => {
    try {
      await Promise.all([fetchMedications(), fetchDoseHistory()]);
    } catch (error) {
      console.error("Error loading history:", error);
      if (!error.message.includes("429")) {
        console.warn("Error", "Failed to load history. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchMedications, fetchDoseHistory]);

  // Fonction de rafraîchissement manuel
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadHistory();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadHistory]);

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
    loadHistory();
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
      if (next === "active") loadHistory();
    });
    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => loadHistory(), 500);
      return () => clearTimeout(timer);
    }, [loadHistory])
  );

  // Combiner les données
  const enrichedHistory = doseHistory.map((dose) => ({
    ...dose,
    medication: medications.find((med) => med.id === dose.medicationId),
  }));

  const groupHistoryByDate = () => {
    const grouped = enrichedHistory.reduce((acc, dose) => {
      const date = new Date(dose.timestamp).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(dose);
      return acc;
    }, {});
    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const filteredHistory = enrichedHistory.filter((dose) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "taken") return dose.taken;
    if (selectedFilter === "missed") return !dose.taken;
    return true;
  });

  const groupedHistory = groupHistoryByDate();

  // ✅ Fonction pour tout effacer (historique + médicaments)
  const handleClearAllData = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to clear all medication history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              // Supprimer tout l'historique
              for (const med of medications) {
                await deleteMedicationHistory(med.id);
              }
              // Supprimer tous les médicaments
              for (const med of medications) {
                await deleteMedication(med.id);
              }

              Alert.alert("Success", "All medication data has been cleared.");
              await loadHistory();
            } catch (error) {
              console.error("Failed to clear data:", error);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Afficher le PageLoader pendant le chargement initial uniquement
  if (isLoading && !isRefreshing) {
    return <PageLoader />;
  }

  // ✅ État vide (après le chargement)
  if (enrichedHistory.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          todaysMedications={todaysMedications}
          onShowNotifications={() => setShowNotifications(true)}
        />
        <View style={styles.content}>
          <View style={styles.emptyStateWrapper}>
            <NoMedicationsFound
              title="No dose history yet"
              subtitle="Start tracking your medications to see your progress here."
            />
          </View>
        </View>
        
        <NotificationsModal
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          medications={todaysMedications}
        />
      </View>
    );
  }

  // ✅ Historique principal
  return (
    <View style={styles.container}>
      <Header
        todaysMedications={todaysMedications}
        onShowNotifications={() => setShowNotifications(true)}
      />
      
      <View style={styles.content}>
        {/* Filtres */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["all", "taken", "missed"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste historique avec RefreshControl */}
        <ScrollView 
          style={styles.historyContainer}
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
          {groupedHistory.map(([date, doses]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>
                {new Date(date).toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {doses.map((dose) => (
                <View key={dose.id} style={styles.historyCard}>
                  <View
                    style={[
                      styles.medicationColor,
                      { backgroundColor: dose.medication?.color || COLORS.border },
                    ]}
                  />
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>
                      {dose.medication?.name || "Unknown Medication"}
                    </Text>
                    <Text style={styles.medicationDosage}>
                      {dose.medication?.dosage || "No dosage information"}
                    </Text>
                    
                    <View style={styles.doseTime}>
                        <Ionicons name="time-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }}/>
                        <Text style={styles.timeText}>
                          {new Date(dose.timestamp).toLocaleTimeString("default", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    {dose.taken ? (
                      <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={[styles.statusText, { color: "#4CAF50" }]}>
                          Taken
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: "#FFEBEE" }]}>
                        <Ionicons name="close-circle" size={16} color="#F44336" />
                        <Text style={[styles.statusText, { color: "#F44336" }]}>
                          Missed
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.clearDataContainer}>
            <TouchableOpacity
              style={styles.clearDataButton}
              onPress={handleClearAllData}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
              <Text style={styles.clearDataText}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        medications={todaysMedications}
      />
    </View>
  );
}