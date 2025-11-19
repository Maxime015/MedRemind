import { Image } from "expo-image";
import { View, StyleSheet, Animated, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { COLORS } from "../../constants/colors";

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 30,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/landing");
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.image}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.slogan,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          Take care of your health, on time 💊
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 15,
  },
  image: {
    width: 240,
    height: 240,
  },
  slogan: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
