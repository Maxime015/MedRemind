import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flex: 1,
    paddingBottom: 10,
  },

  /** ----- CALENDRIER ----- **/
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 24,
    marginTop: 0,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },

  monthText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },

  navButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
  },

  weekdayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4,
  },

  weekdayText: {
    flex: 1,
    textAlign: "center",
    color: COLORS.textLight,
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },

  calendarDay: {
    width: "12%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 2,
    position: "relative",
  },

  dayText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
  },

  today: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  todayText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  selected: {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  selectedText: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  hasEvents: {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },

  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: "absolute",
    bottom: 3,
  },

  /** ----- PLANNING / MÉDICAMENTS ----- **/
  scheduleContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 14,
    marginBottom: -30,
  },

  scheduleTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 16,
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  /** ----- CARTE DE MÉDICAMENT ----- **/
  medicationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },

  medicationColor: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: 12,
  },

  medicationInfo: {
    flex: 1,
  },

  medicationName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 3,
    letterSpacing: 0.2,
  },

  medicationDosage: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 3,
    fontWeight: "500",
  },

  medicationTime: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },

  /** ----- BOUTON PRENDRE UNE DOSE ----- **/
  takeDoseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },

  takeDoseText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  /** ----- STATUT PRIS ----- **/
  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  takenText: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 6,
    letterSpacing: 0.3,
  },

  /** ----- CAS AUCUN MÉDICAMENT ----- **/
  noMedicationsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 30,
  },

  noMedicationsText: {
    fontSize: 15,
    color: COLORS.textLight,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },

    loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
