import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Swiper from "react-native-swiper";
import { authStyles as styles } from "../../assets/styles/landing.styles";
import SafeScreen from "../../components/SafeScreen";

const slides = [
  {
    title: "Simplify Your Health Management",
    message: "Easily organize all your medications in one intuitive application.",
    image: require("../../assets/images/a.png"),
  },
  {
    title: "Never Forget Again",
    message: "Gentle reminders ensure you never miss a dose of your medication.",
    image: require("../../assets/images/b.png"),
  },
  {
    title: "Stay Ahead of Your Needs",
    message: "MedRemind tracks your medication supply and notifies you when it's time to refill.",
    image: require("../../assets/images/c.png"),
  },
]; 

export default function LandingPage() {
  const { width, height } = useWindowDimensions();
  const [slide, setSlide] = useState(0);
  const swiper = useRef();
  const router = useRouter();

  // Animations principales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animation du backdrop pulsant
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de pulsation continue du backdrop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Reset des animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);
    rotateAnim.setValue(-5);

    // Animations parallèles pour l'entrée du contenu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide]);

  const handleSkip = () => router.push("/sign-in");

  const rotation = rotateAnim.interpolate({
    inputRange: [-5, 0],
    outputRange: ['-5deg', '0deg'],
  });

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Swiper
          ref={swiper}
          showsPagination={false}
          loop={false}
          onIndexChanged={setSlide}
        >
          {slides.map(({ title, message, image }, index) => (
            <View key={index} style={styles.slide}>
              {/* Container d'image animé avec rotation */}
              <Animated.View
                style={[
                  styles.imageContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { scale: scaleAnim },
                      { rotate: rotation },
                    ],
                  },
                ]}
              >
                {/* Backdrop pulsant */}
                <Animated.View
                  style={[
                    styles.imageBackdrop,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                />
                <Image
                  source={image}
                  resizeMode="contain"
                  style={{
                    width: width * 0.8,
                    height: height * 0.4,
                    alignSelf: "center",
                  }}
                />
              </Animated.View>

              {/* Contenu animé */}
              <Animated.View
                style={[
                  styles.contentContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={styles.slideTitle}>{title}</Text>
                <Text style={styles.slideText}>{message}</Text>
              </Animated.View>

              {/* Navigation avec animations */}
              <Animated.View 
                style={[
                  styles.navigation,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }
                ]}
              >
                <View style={styles.navContent}>
                  <TouchableOpacity 
                    onPress={handleSkip}
                    style={styles.skipButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity>

                  {/* Dots de pagination animés */}
                  <View style={styles.pagination}>
                    {slides.map((_, i) => (
                      <Animated.View
                        key={i}
                        style={[
                          styles.dot,
                          i === slide ? styles.activeDot : styles.inactiveDot,
                          {
                            transform: [{
                              scale: i === slide ? 1 : 0.8
                            }],
                          },
                        ]}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (slide === slides.length - 1) {
                        router.push("/sign-in");
                      } else {
                        swiper.current.scrollBy(1);
                      }
                    }}
                    style={styles.nextButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>
                      {slide === slides.length - 1 ? "Get Started" : "Next"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          ))}
        </Swiper>
      </View>
    </SafeScreen>
  );
}