import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import { styles } from "../assets/styles/NoMedicationsFound.styles";

const NoMedicationsFound = ({
  title = "No medications yet",
  text = "Start tracking your health routine by adding your first medication.",
  showButton = true,
}) => {
  const router = useRouter();

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="medical-outline"
        size={60}
        color={COLORS.textLight}
        style={styles.emptyStateIcon}
      />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateText}>{text}</Text>

      {showButton && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => router.push("/(modals)/createMedication")}
        >
          <Ionicons name="add-circle" size={18} color={COLORS.white} />
          <Text style={styles.emptyStateButtonText}>Add medication</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NoMedicationsFound;