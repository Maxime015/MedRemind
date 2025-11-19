import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/home.styles";

export default function MedicationCard({ medication, taken, onTakeDose }) {
  return (
    <View key={medication.id} style={styles.doseCard}>
      <View style={[styles.doseBadge, { backgroundColor: `${medication.color}15` }]}>
        <Ionicons name="medical" size={24} color={medication.color} />
      </View>

      <View style={styles.doseInfo}>
        <View>
          <Text style={styles.medicineName}>{medication.name}</Text>
          <Text style={styles.dosageInfo}>{medication.dosage}</Text>
        </View>
        <View style={styles.doseTime}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeText}>{medication.times?.[0] || "No time set"}</Text>
        </View>
      </View>

      {taken ? (
        <View style={styles.takenBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.takenText}>Taken</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.takeDoseButton, { backgroundColor: medication.color }]}
          onPress={() => onTakeDose(medication)}
        >
          <Text style={styles.takeDoseText}>Take</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
