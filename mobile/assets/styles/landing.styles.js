import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slide: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "6%",
    paddingBottom: "8%",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8%", // 🔼 abaissé de 15% → 8% pour remonter l'image
  },
  imageBackdrop: {
    position: "absolute",
    width: "95%",
    height: "95%",
    backgroundColor: COLORS.primary,
    opacity: 0.08,
    borderRadius: 200,
    transform: [{ scale: 1.1 }],
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10, // réduit légèrement pour garder la cohérence visuelle
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 10,
    letterSpacing: -0.5,
  },
  slideText: {
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  navigation: {
    width: "100%",
    marginTop: 20, // 🔽 réduit pour rapprocher les boutons
    marginBottom: 20,
  },
  navContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    minWidth: 60,
  },
  skipText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  inactiveDot: {
    backgroundColor: COLORS.border,
    width: 8,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    minWidth: 100,
  },
  nextButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});