import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  medicationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  medicationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationColor: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  supplyContainer: {
    marginBottom: 8,
  },
  supplyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  supplyLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  supplyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  progressBarContainer: {
    marginBottom: -12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: "right",
  },
  refillInfo: {
    marginTop: 8,
  },
  refillLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  lastRefillDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  refillButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  refillButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  emptyStateWrapper: {
    flex: 1,
    alignItems: "center",     
    justifyContent: "flex-start", 
    paddingHorizontal: 20,
    paddingTop: 80,          
  },

    loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});