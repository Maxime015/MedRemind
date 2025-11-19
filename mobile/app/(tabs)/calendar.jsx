import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Animated, AppState, Text, View } from "react-native";
import { styles } from "../../assets/styles/calendar.styles";
import CalendarView from "../../components/CalendarView";
import Header from "../../components/Header";
import MedicationList from "../../components/MedicationList";
import NotificationsModal from "../../components/NotificationsModal";
import PageLoader from "../../components/PageLoader";
import { useDoseHistory } from "../../hooks/useDoseHistory";
import { useMedications } from "../../hooks/useMedications";
import {
  registerForPushNotificationsAsync,
  scheduleMedicationReminder,
} from "../../utils/notifications";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showNotifications, setShowNotifications] = useState(false);
  const [todaysMedications, setTodaysMedications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { medications, fetchMedications, loading: medicationsLoading } = useMedications();
  const { doseHistory, fetchDoseHistory, recordDose, loading: doseHistoryLoading } = useDoseHistory();

  // Animation d'apparition
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // 🔄 Chargement des données
  const loadData = useCallback(
    async (date = selectedDate) => {
      try {
        await Promise.all([
          fetchMedications(),
          fetchDoseHistory(
            new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0],
            new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0]
          )
        ]);

        // Filtrer les médicaments actifs pour le jour sélectionné
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
              today <=
                new Date(startDate.getTime() + durationDays * 86400000))
          );
        });
        setTodaysMedications(todayMeds);
      } catch (error) {
        if (!error.message.includes("429")) {
          console.warn("Error", "Failed to load data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate, medications, fetchMedications, fetchDoseHistory]
  );

  // 🔄 Fonction de rafraîchissement manuel
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadData();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  // 🔔 Initialisation des notifications
  useEffect(() => {
    loadData();
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        for (const med of medications) {
          if (med.reminderEnabled) {
            await scheduleMedicationReminder(med);
          }
        }
      }
    };
    setupNotifications();

    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") loadData();
    });
    return () => subscription.remove();
  }, []);

  // Rechargement quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => loadData(), 500);
      return () => clearTimeout(timer);
    }, [loadData])
  );

  // Rechargement si le mois change
  useEffect(() => {
    loadData();
  }, [selectedDate.getMonth(), selectedDate.getFullYear()]);

  // Marquer une dose comme prise
  const handleTakeDose = async (med) => {
    await recordDose(med.id, true, selectedDate.toISOString());
    await loadData(selectedDate);
  };

  // Navigation entre mois
  const handleChangeMonth = (offset) => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1)
    );
  };

  // Afficher le PageLoader pendant le chargement initial uniquement
  if (isLoading && !isRefreshing) {
    return <PageLoader />;
  }

  return (
    <View style={styles.container}>
      {/* ✅ Header avec notifications */}
      <Header
        todaysMedications={todaysMedications}
        onShowNotifications={() => setShowNotifications(true)}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* ✅ Vue du calendrier */}
        <CalendarView
          selectedDate={selectedDate}
          doseHistory={doseHistory}
          onChangeMonth={handleChangeMonth}
          onSelectDate={setSelectedDate}
        />

        {/* ✅ Liste des médicaments pour la date */}
        <View style={styles.scheduleContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.scheduleTitle}>
              {selectedDate.toLocaleDateString("default", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <MedicationList
            selectedDate={selectedDate}
            medications={medications}
            doseHistory={doseHistory}
            onTakeDose={handleTakeDose}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </View>
      </Animated.View>

      {/* ✅ Notifications modal */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        medications={todaysMedications}
      />
    </View>
  );
}