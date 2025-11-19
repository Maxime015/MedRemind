import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { styles } from "../assets/styles/calendar.styles";

export default function MedicationList({ 
  selectedDate, 
  medications, 
  doseHistory, 
  onTakeDose,
  onRefresh,
  isRefreshing = false 
}) {
  const selectedStr = selectedDate.toDateString();
  const dosesOfDay = doseHistory.filter(
    (dose) => new Date(dose.timestamp).toDateString() === selectedStr
  );

  const handleRefresh = () => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
  };

  if (!medications.length) {
    return (
      <View style={styles.noMedicationsContainer}>
        <Ionicons
          name="calendar-outline"
          size={64}
          color={COLORS.textLight}
          style={{ opacity: 0.3, marginBottom: 16 }}
        />
        <Text style={styles.noMedicationsText}>
          No medications scheduled for this date
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
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
      {medications.map((med) => {
        const taken = dosesOfDay.some(
          (dose) => dose.medicationId === med.id && dose.taken
        );

        return (
          <View key={med.id} style={styles.medicationCard}>
            <View style={[styles.medicationColor, { backgroundColor: med.color }]} />
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <Text style={styles.medicationDosage}>{med.dosage}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={COLORS.textLight}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.medicationTime}>
                  {med.times?.[0] || "No time set"}
                </Text>
              </View>
            </View>

            {taken ? (
              <View style={styles.takenBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                <Text style={styles.takenText}>Taken</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.takeDoseButton, { backgroundColor: med.color }]}
                onPress={() => onTakeDose(med)}
                activeOpacity={0.8}
              >
                <Text style={styles.takeDoseText}>Take</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}