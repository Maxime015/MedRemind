import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { styles } from "../../assets/styles/createMedication.styles.js";
import { COLORS } from "../../constants/colors";
import { useMedications } from "../../hooks/useMedications";
import {
  scheduleMedicationReminder,
  scheduleRefillReminder,
} from "../../utils/notifications";

const FREQUENCIES = [
  {
    id: "1",
    label: "Once daily",
    icon: "sunny-outline",
    times: ["09:00"],
  },
  {
    id: "2",
    label: "Twice daily",
    icon: "sync-outline",
    times: ["09:00", "21:00"],
  },
  {
    id: "3",
    label: "Three times daily",
    icon: "time-outline",
    times: ["09:00", "15:00", "21:00"],
  },
  {
    id: "4",
    label: "Four times daily",
    icon: "repeat-outline",
    times: ["09:00", "13:00", "17:00", "21:00"],
  },
  { id: "5", label: "As needed", icon: "calendar-outline", times: [] },
];

const DURATIONS = [
  { id: "1", label: "7 days", value: 7 },
  { id: "2", label: "14 days", value: 14 },
  { id: "3", label: "30 days", value: 30 },
  { id: "4", label: "90 days", value: 90 },
  { id: "5", label: "Ongoing", value: -1 },
];

export default function AddMedicationScreen() {
  const router = useRouter();
  const { createMedication } = useMedications();
  
  const [modalVisible, setModalVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    startDate: new Date(),
    times: ["09:00"],
    notes: "",
    reminderEnabled: true,
    refillReminder: false,
    currentSupply: "",
    refillAt: "",
  });

  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Medication name is required";
    }

    if (!form.dosage.trim()) {
      newErrors.dosage = "Dosage is required";
    }

    if (!form.frequency) {
      newErrors.frequency = "Frequency is required";
    }

    if (!form.duration) {
      newErrors.duration = "Duration is required";
    }

    if (form.refillReminder) {
      if (!form.currentSupply) {
        newErrors.currentSupply = "Current supply is required for refill tracking";
      }
      if (!form.refillAt) {
        newErrors.refillAt = "Refill alert threshold is required";
      }
      if (Number(form.refillAt) >= Number(form.currentSupply)) {
        newErrors.refillAt = "Refill alert must be less than current supply";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSave = async () => {
      try {
        if (!validateForm()) {
          Alert.alert("Error", "Please fill in all required fields correctly");
          return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

            // 🎨 Palette étendue avec 40 couleurs (tons froids + chauds, vifs)
            const colors = [
              // 🔥 Chaudes (rouges / oranges / jaunes)
              "#FF0000", "#FF1A1A", "#FF3333", "#FF4D4D", "#FF6666",
              "#FF7F7F", "#FF9900", "#FFB000", "#FFC300", "#FFD700",
              "#FF8C00", "#FF6F00", "#FF4500", "#E65100", "#FF5722",
              "#FF7043", "#F4511E", "#E53935", "#D32F2F", "#C62828",
              "#B71C1C", "#F44336", "#EF5350", "#E57373", "#FFCA28",

              // 🌈 Roses / Magenta
              "#FF1493", "#FF007F", "#FF2D95", "#E91E63", "#EC407A",
              "#F06292", "#D81B60", "#C2185B", "#AD1457", "#880E4F",

              // 💜 Violets
              "#9C27B0", "#AB47BC", "#BA68C8", "#CE93D8", "#7B1FA2",
              "#6A1B9A", "#4A148C", "#8E24AA", "#AA00FF", "#B388FF",

              // ❄️ Froides (bleus / cyans / indigos)
              "#0000FF", "#1A1AFF", "#3333FF", "#4D4DFF", "#6666FF",
              "#2196F3", "#1E88E5", "#1976D2", "#0D47A1", "#2962FF",
              "#3F51B5", "#5C6BC0", "#7986CB", "#283593", "#1A237E",
              "#00B0FF", "#0091EA", "#0288D1", "#0277BD", "#03A9F4",

              // 🧊 Turquoises / Cyan / Aqua
              "#00FFFF", "#1AFFD5", "#00E5FF", "#00ACC1", "#00B8D4",
              "#0097A7", "#00838F", "#4DD0E1", "#80DEEA", "#B2EBF2",

              // 🌿 Verts
              "#00FF00", "#1AFF1A", "#33FF33", "#4DFF4D", "#66FF66",
              "#4CAF50", "#43A047", "#2E7D32", "#1B5E20", "#66BB6A",
              "#81C784", "#9CCC65", "#AED581", "#8BC34A", "#689F38",

              // 🟤 Bruns / Neutres / Gris contrastés
              "#795548", "#6D4C41", "#5D4037", "#3E2723", "#A1887F",
              "#8D6E63", "#9E9E9E", "#616161", "#424242", "#212121",
            ];


            // ✅ Fonction pour tirer une couleur plus "vraiment aléatoire"
            // → évite que la même couleur revienne trop souvent
            let lastColorIndex = -1;
            const getRandomColor = () => {
              let index;
              do {
                index = Math.floor(Math.random() * colors.length);
              } while (index === lastColorIndex);
              lastColorIndex = index;
              return colors[index];
            };

            // Utilisation
            const randomColor = getRandomColor();


          const medicationData = {
            name: form.name,
            dosage: form.dosage,
            times: form.times,
            startDate: form.startDate.toISOString().split('T')[0],
            duration: form.duration,
            color: randomColor,
            reminderEnabled: form.reminderEnabled,
            currentSupply: form.currentSupply ? Number(form.currentSupply) : 0,
            totalSupply: form.currentSupply ? Number(form.currentSupply) : 0,
            refillAt: form.refillAt ? Number(form.refillAt) : 0,
            refillReminder: form.refillReminder,
            notes: form.notes,
          };

          const newMedication = await createMedication(medicationData);

          // ✅ VÉRIFIER si newMedication est null avant de continuer
          if (!newMedication) {
            throw new Error("Failed to create medication - API returned null");
          }

          // ✅ MAINTENANT nous pouvons utiliser newMedication.id en sécurité
          if (medicationData.reminderEnabled) {
            await scheduleMedicationReminder({
              ...medicationData,
              id: newMedication.id
            });
          }
          if (medicationData.refillReminder) {
            await scheduleRefillReminder({
              ...medicationData,
              id: newMedication.id
            });
          }

          setModalVisible(false);
          Alert.alert(
            "Success",
            "Medication added successfully",
            [{ text: "OK", onPress: () => router.back() }],
            { cancelable: false }
          );
        } catch (error) {
          console.error("Save error:", error);
          Alert.alert(
            "Error",
            "Failed to save medication. Please try again.",
            [{ text: "OK" }],
            { cancelable: false }
          );
        } finally {
          setIsSubmitting(false);
        }
      };


  const handleFrequencySelect = (freq) => {
    setSelectedFrequency(freq);
    const selectedFreq = FREQUENCIES.find((f) => f.label === freq);
    setForm((prev) => ({
      ...prev,
      frequency: freq,
      times: selectedFreq?.times || [],
    }));
    if (errors.frequency) {
      setErrors((prev) => ({ ...prev, frequency: "" }));
    }
  };

  const handleDurationSelect = (dur) => {
    setSelectedDuration(dur);
    setForm((prev) => ({ ...prev, duration: dur }));
    if (errors.duration) {
      setErrors((prev) => ({ ...prev, duration: "" }));
    }
  };

  const handleTimeChange = (index, selectedTime) => {
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const newTime = `${hours}:${minutes}`;

      setForm((prev) => {
        const updatedTimes = [...prev.times];
        updatedTimes[index] = newTime;
        return { ...prev, times: updatedTimes };
      });
    }
    setShowTimePicker(false);
    setEditingTimeIndex(null);
  };

  const addTimeSlot = () => {
    setForm((prev) => ({
      ...prev,
      times: [...prev.times, "09:00"]
    }));
  };

  const removeTimeSlot = (index) => {
    if (form.times.length > 1) {
      setForm((prev) => ({
        ...prev,
        times: prev.times.filter((_, i) => i !== index)
      }));
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => router.back(), 300);
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return form.name.trim() && form.dosage.trim();
    }
    if (currentStep === 2) {
      return form.frequency && form.duration;
    }
    return true;
  };

  const renderProgressBar = () => {
    const steps = 3;
    return (
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              currentStep >= step && styles.progressStepActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="medical" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>Medication Details</Text>
        <Text style={styles.stepSubtitle}>Let's start with the basics</Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconWrapper}>
            <Ionicons name="medkit-outline" size={20} color={COLORS.primary} />
          </View>
          <TextInput
            style={[styles.modalInput, errors.name && styles.inputError]}
            placeholder="Medication Name"
            placeholderTextColor={COLORS.textLight}
            value={form.name}
            onChangeText={(text) => {
              setForm({ ...form, name: text });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconWrapper}>
            <Ionicons name="flask-outline" size={20} color={COLORS.primary} />
          </View>
          <TextInput
            style={[styles.modalInput, errors.dosage && styles.inputError]}
            placeholder="Dosage (e.g., 500mg)"
            placeholderTextColor={COLORS.textLight}
            value={form.dosage}
            onChangeText={(text) => {
              setForm({ ...form, dosage: text });
              if (errors.dosage) setErrors({ ...errors, dosage: "" });
            }}
          />
        </View>
        {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="time" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>Schedule</Text>
        <Text style={styles.stepSubtitle}>When should you take it?</Text>
      </View>

      <Text style={styles.sectionLabel}>Frequency</Text>
      {errors.frequency && <Text style={styles.errorText}>{errors.frequency}</Text>}
      <View style={styles.modalOptionsGrid}>
        {FREQUENCIES.map((freq) => (
          <TouchableOpacity
            key={freq.id}
            style={[
              styles.modalOptionCard,
              selectedFrequency === freq.label && styles.modalOptionCardSelected,
            ]}
            onPress={() => handleFrequencySelect(freq.label)}
          >
            <Ionicons
              name={freq.icon}
              size={24}
              color={selectedFrequency === freq.label ? COLORS.white : COLORS.primary}
            />
            <Text
              style={[
                styles.modalOptionText,
                selectedFrequency === freq.label && styles.modalOptionTextSelected,
              ]}
            >
              {freq.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Duration</Text>
      {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
      <View style={styles.modalOptionsGrid}>
        {DURATIONS.map((dur) => (
          <TouchableOpacity
            key={dur.id}
            style={[
              styles.modalOptionCard,
              selectedDuration === dur.label && styles.modalOptionCardSelected,
            ]}
            onPress={() => handleDurationSelect(dur.label)}
          >
            <Text
              style={[
                styles.durationValue,
                selectedDuration === dur.label && styles.durationValueSelected,
              ]}
            >
              {dur.value > 0 ? dur.value : "∞"}
            </Text>
            <Text
              style={[
                styles.modalOptionText,
                selectedDuration === dur.label && styles.modalOptionTextSelected,
              ]}
            >
              {dur.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timesSection}>
        <View style={styles.timesHeader}>
          <Text style={styles.sectionLabel}>Times</Text>
          {form.frequency !== "As needed" && (
            <TouchableOpacity style={styles.addTimeButton} onPress={addTimeSlot}>
              <Ionicons name="add" size={20} color={COLORS.primary} />
              <Text style={styles.addTimeText}>Add Time</Text>
            </TouchableOpacity>
          )}
        </View>

        {form.times.map((time, index) => (
          <View key={index} style={styles.timeItem}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                setEditingTimeIndex(index);
                setShowTimePicker(true);
              }}
            >
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.timeText}>{time}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            
            {form.times.length > 1 && (
              <TouchableOpacity 
                style={styles.removeTimeButton}
                onPress={() => removeTimeSlot(index)}
              >
                <Ionicons name="close" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {form.times.length === 0 && (
          <Text style={styles.noTimesText}>
            No specific times set for "As needed" medication
          </Text>
        )}
      </View>

      {showTimePicker && editingTimeIndex !== null && (
        <DateTimePicker
          mode="time"
          value={
            new Date(
              `1970-01-01T${form.times[editingTimeIndex] || "09:00"}:00`
            )
          }
          onChange={(event, selectedTime) => {
            handleTimeChange(editingTimeIndex, selectedTime);
          }}
        />
      )}

      <Text style={styles.sectionLabel}>Date</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.datePickerText}>
          Starts {form.startDate.toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={form.startDate}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setForm({ ...form, startDate: date });
          }}
        />
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="notifications" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>Preferences</Text>
        <Text style={styles.stepSubtitle}>Customize your reminders</Text>
      </View>

      <View style={styles.toggleCard}>
        <View style={styles.toggleHeader}>
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Reminders</Text>
            <Text style={styles.toggleSubtitle}>Get notified on time</Text>
          </View>
          <Switch
            value={form.reminderEnabled}
            onValueChange={(value) => setForm({ ...form, reminderEnabled: value })}
            trackColor={{ false: "#ddd", true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.toggleCard}>
        <View style={styles.toggleHeader}>
          <Ionicons name="reload" size={24} color={COLORS.primary} />
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Refill Tracking</Text>
            <Text style={styles.toggleSubtitle}>Never run out</Text>
          </View>
          <Switch
            value={form.refillReminder}
            onValueChange={(value) => {
              setForm({ ...form, refillReminder: value });
              if (!value) {
                setErrors({ ...errors, currentSupply: "", refillAt: "" });
              }
            }}
            trackColor={{ false: "#ddd", true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        {form.refillReminder && (
          <View style={styles.refillContainer}>
            <View style={styles.refillRow}>
              <View style={styles.refillInputWrapper}>
                <TextInput
                  style={[styles.refillInput, errors.currentSupply && styles.inputError]}
                  placeholder="Current Supply"
                  placeholderTextColor={COLORS.textLight}
                  value={form.currentSupply}
                  onChangeText={(text) => {
                    setForm({ ...form, currentSupply: text });
                    if (errors.currentSupply) setErrors({ ...errors, currentSupply: "" });
                  }}
                  keyboardType="numeric"
                />
                {errors.currentSupply && (
                  <Text style={styles.errorText}>{errors.currentSupply}</Text>
                )}
              </View>

              <View style={styles.refillInputWrapper}>
                <TextInput
                  style={[styles.refillInput, errors.refillAt && styles.inputError]}
                  placeholder="Alert at"
                  placeholderTextColor={COLORS.textLight}
                  value={form.refillAt}
                  onChangeText={(text) => {
                    setForm({ ...form, refillAt: text });
                    if (errors.refillAt) setErrors({ ...errors, refillAt: "" });
                  }}
                  keyboardType="numeric"
                />
                {errors.refillAt && (
                  <Text style={styles.errorText}>{errors.refillAt}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.notesCard}>
        <View style={styles.notesHeader}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
          <Text style={styles.notesLabel}>Notes (Optional)</Text>
        </View>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any special instructions..."
          placeholderTextColor={COLORS.textLight}
          value={form.notes}
          onChangeText={(text) => setForm({ ...form, notes: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Medication</Text>
              <View style={styles.placeholderButton} />
            </View>

            {renderProgressBar()}

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </ScrollView>

            <View style={styles.modalFooter}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setCurrentStep(currentStep - 1)}
                >
                  <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              )}

              {currentStep < 3 ? (
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !canGoNext() && styles.nextButtonDisabled,
                  ]}
                  onPress={() => setCurrentStep(currentStep + 1)}
                  disabled={!canGoNext()}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary]}
                    style={styles.nextButtonGradient}
                  >
                    <Text style={styles.nextButtonText}>Continue</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
                  onPress={handleSave}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary]}
                    style={styles.nextButtonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={styles.nextButtonText}>
                      {isSubmitting ? "Saving..." : "Add Medication"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}