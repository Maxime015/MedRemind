// app/(tabs)/reminders.jsx
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  View
} from "react-native";

// Composants et hooks
import { styles } from "../../assets/styles/reminders.styles";
import Header from "../../components/Header";
import NoMedicationsFound from "../../components/NoMedicationsFound";
import NotificationsModal from "../../components/NotificationsModal";
import PageLoader from "../../components/PageLoader";
import { COLORS } from "../../constants/colors";
import { useDoseHistory } from "../../hooks/useDoseHistory";
import { useMedications } from "../../hooks/useMedications";
import { useReminders } from "../../hooks/useReminders";

export default function RemindersScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Hooks personnalisés
  const { loading: medicationsLoading } = useMedications();
  const { fetchTodaysDoses, loading: doseHistoryLoading } = useDoseHistory();
  const { 
    todaysMedications, 
    medicationStats, 
    loading: remindersLoading,
    fetchMedicationStats,
  } = useReminders();

  // Animation d'apparition
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Charger les données initiales
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchMedicationStats(),
        fetchTodaysDoses()
      ]);
    } catch (error) {
      if (!error.message.includes("429")) {
        console.warn("Error", "Failed to load statistics data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchMedicationStats, fetchTodaysDoses]);

  // Rafraîchissement manuel
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

  // Recharger à chaque focus
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => loadData(), 500);
      return () => clearTimeout(timer);
    }, [loadData])
  );

  // Afficher le PageLoader pendant le chargement initial uniquement
  if (isLoading && !isRefreshing) {
    return <PageLoader />;
  }

  // ✅ CORRECTION : Vérifier que medicationStats est défini et utiliser medicationStats?.length
  const stats = medicationStats || [];

  return (
    <View style={styles.container}>
      {/* Header avec todaysMedications */}
      <Header
        todaysMedications={todaysMedications || []}
        onShowNotifications={() => setShowNotifications(true)}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Contenu principal */}
        <ScrollView
          style={styles.tabContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ CORRECTION : Utiliser stats.length au lieu de medicationStats.length */}
          {stats.length === 0 ? (
            <View style={styles.emptyState}>
              <NoMedicationsFound
                title="No statistics available"
                text="Start taking your medications to see adherence statistics."
                showButton={true}
              />
            </View>
          ) : (
            <View style={styles.tabContent}>

              {/* Liste des statistiques par médicament */}
              <View style={styles.statsList}>
                {/* ✅ CORRECTION : Utiliser stats au lieu de medicationStats */}
                {stats.map((stat) => (
                  <View key={stat.id} style={styles.statItem}>
                    <View style={styles.statHeader}>
                      <View style={styles.medicationInfo}>
                        <View style={[styles.colorIndicator, { backgroundColor: stat.color }]} />
                        <View>
                          <Text style={styles.medicationName}>{stat.name}</Text>
                          <Text style={styles.medicationDosage}>{stat.dosage}</Text>
                        </View>
                      </View>
                      <View style={styles.adherenceBadge}>
                        <Text style={styles.adherenceValue}>
                          {stat.adherenceRate}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailedStats}>
                      <View style={styles.statRow}>
                        <View style={styles.statItemDetail}>
                          <Text style={styles.statNumber}>{stat.takenDoses}</Text>
                          <Text style={styles.statLabel}>Taken</Text>
                        </View>
                        <View style={styles.statItemDetail}>
                          <Text style={styles.statNumber}>{stat.missedDoses}</Text>
                          <Text style={styles.statLabel}>Missed</Text>
                        </View>
                        <View style={styles.statItemDetail}>
                          <Text style={styles.statNumber}>{stat.totalDoses}</Text>
                          <Text style={styles.statLabel}>Total</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.adherenceBar}>
                      <View 
                        style={[
                          styles.adherenceFill,
                          { 
                            width: `${stat.adherenceRate}%`,
                            backgroundColor: stat.adherenceRate >= 80 ? '#4CAF50' : 
                                           stat.adherenceRate >= 60 ? '#FF9800' : '#F44336'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Modal de notifications */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        medications={todaysMedications || []}
      />
    </View>
  );
}
