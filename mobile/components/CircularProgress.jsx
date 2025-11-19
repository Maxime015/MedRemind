import { useEffect, useRef } from "react";
import { Animated, View, Text, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgress({ progress, totalDoses, completedDoses }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const size = width * 0.4;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
        <Text style={styles.progressDetails}>{completedDoses} of {totalDoses} doses</Text>
      </View>
      <Svg width={size} height={size} style={styles.progressRing}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}
