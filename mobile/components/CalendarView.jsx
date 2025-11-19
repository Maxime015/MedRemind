import { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/calendar.styles";
import { COLORS } from "../constants/colors";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({ selectedDate, doseHistory, onChangeMonth, onSelectDate }) {
  /** Génération de la grille du calendrier */
  const calendarWeeks = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const weeks = [];

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - firstDay + 1;
      const date = new Date(year, month, dayNum);
      const isValid = dayNum > 0 && dayNum <= daysInMonth;
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const hasDoses = doseHistory.some(
        (dose) => new Date(dose.timestamp).toDateString() === date.toDateString()
      );

      const cell = isValid ? (
        <TouchableOpacity
          key={i}
          style={[
            styles.calendarDay,
            isToday && styles.today,
            isSelected && !isToday && styles.selected,
            hasDoses && !isToday && !isSelected && styles.hasEvents,
          ]}
          onPress={() => onSelectDate(date)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayText,
              isToday && styles.todayText,
              isSelected && !isToday && styles.selectedText,
            ]}
          >
            {dayNum}
          </Text>
          {hasDoses && !isToday && !isSelected && <View style={styles.eventDot} />}
        </TouchableOpacity>
      ) : (
        <View key={i} style={[styles.calendarDay, { opacity: 0 }]} />
      );

      if (i % 7 === 0) weeks.push([]);
      weeks[weeks.length - 1].push(cell);
    }

    return weeks.map((week, index) => (
      <View key={`week-${index}`} style={styles.calendarWeek}>
        {week}
      </View>
    ));
  }, [selectedDate, doseHistory]);

  return (
    <View style={styles.calendarContainer}>
      {/* HEADER DU MOIS */}
      <View style={styles.monthHeader}>
        <TouchableOpacity style={styles.navButton} onPress={() => onChangeMonth(-1)} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </Text>

        <TouchableOpacity style={styles.navButton} onPress={() => onChangeMonth(1)} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* EN-TÊTES DES JOURS */}
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* GRILLE DU CALENDRIER */}
      {calendarWeeks}
    </View>
  );
}
