import { LinearGradient } from "expo-linear-gradient";
import { Link, useFocusEffect } from "expo-router";
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
import { styles } from "../../assets/styles/home.styles";
import CircularProgress from "../../components/CircularProgress";
import Header from "../../components/Header";
import MedicationCard from "../../components/MedicationCard";
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

export default function HomeScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [todaysMedications, setTodaysMedications] = useState([]);
  const [completedDoses, setCompletedDoses] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { medications, fetchMedications, loading: medicationsLoading } = useMedications();
  const { todaysDoses, recordDose, fetchTodaysDoses, loading: doseHistoryLoading } = useDoseHistory();

  const loadData = useCallback(async () => {
    try {
      await Promise.all([fetchMedications(), fetchTodaysDoses()]);
    } catch (error) {
      if (!error.message.includes("429")) {
        console.warn("Error", "Failed to load data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchMedications, fetchTodaysDoses]);

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

  useEffect(() => {
    const today = new Date();
    // ✅ CORRECTION : Vérifier que medications est défini avant d'utiliser .filter()
    const todayMeds = medications ? medications.filter((med) => {
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
    }) : []; // ✅ Retourner un tableau vide si medications est undefined

    setTodaysMedications(todayMeds);
    
    // ✅ CORRECTION : Vérifier que todaysDoses est défini avant d'utiliser .filter()
    const completedCount = todaysDoses ? todaysDoses.filter((d) => d.taken).length : 0;
    setCompletedDoses(completedCount);
  }, [medications, todaysDoses]);

  useEffect(() => {
    loadData();
    const setup = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        for (const med of medications || []) { // ✅ Ajouter une vérification ici aussi
          if (med.reminderEnabled) await scheduleMedicationReminder(med);
        }
      }
    };
    setup();

    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") loadData();
    });
    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => loadData(), 500);
      return () => clearTimeout(timer);
    }, [loadData])
  );

  const handleTakeDose = async (med) => {
    await recordDose(med.id, true);
    await fetchTodaysDoses();
  };

  const isDoseTaken = (id) =>
    todaysDoses ? todaysDoses.some((d) => d.medicationId === id && d.taken) : false;

  const progress = todaysMedications.length
    ? completedDoses / todaysMedications.length
    : 0;

  // Afficher le PageLoader pendant le chargement initial uniquement
  if (isLoading && !isRefreshing) {
    return <PageLoader />;
  }

  return (
    <View style={styles.container}>
      {/* Header principal */}
      <Header
        todaysMedications={todaysMedications}
        onShowNotifications={() => setShowNotifications(true)}
      />

      {/* Zone de progression */}
          <LinearGradient colors={[COLORS.primary, COLORS.textLight]} style={styles.header}>
            <CircularProgress
              progress={progress}
              totalDoses={todaysMedications.length}
              completedDoses={completedDoses}
            />
          </LinearGradient>

      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Link href="/calendar" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* ✅ Scroll avec RefreshControl uniquement manuel */}
        <ScrollView
          style={{ maxHeight: 420 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
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
          {todaysMedications.length === 0 ? (
            <NoMedicationsFound />
          ) : (
            todaysMedications.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                taken={isDoseTaken(med.id)}
                onTakeDose={handleTakeDose}
              />
            ))
          )}
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
