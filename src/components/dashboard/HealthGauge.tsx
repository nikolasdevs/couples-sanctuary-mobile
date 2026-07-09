import { useEffect } from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HealthGaugeProps {
  score: number | null; // 0-100, or null if no check-in yet
  size?: number;
}

function getLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Thriving", color: "#22c55e" };
  if (score >= 75) return { text: "Healthy", color: "#22c55e" };
  if (score >= 60) return { text: "Needs Attention", color: "#eab308" };
  if (score >= 40) return { text: "Strained", color: "#f97316" };
  return { text: "Critical", color: "#ef4444" };
}

export function HealthGauge({ score, size = 160 }: HealthGaugeProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Arc = 270 degrees (3/4 of circle), starting from bottom-left
  const arcLength = circumference * 0.75;
  const dashOffset = score !== null ? arcLength * (1 - score / 100) : arcLength;

  const label = score !== null ? getLabel(score) : null;

  const animatedOffset = useSharedValue(arcLength);

  useEffect(() => {
    animatedOffset.value = withDelay(
      300,
      withTiming(dashOffset, {
        duration: 1200,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      }),
    );
  }, [dashOffset, animatedOffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedOffset.value,
  }));

  return (
    <View className="items-center gap-2">
      <View style={{ width: size, height: size }}>
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: [{ rotate: "135deg" }] }}
        >
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Score arc */}
          {score !== null && (
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={label!.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
              animatedProps={animatedProps}
            />
          )}
        </Svg>

        <View className="absolute inset-0 items-center justify-center">
          {score !== null ? (
            <>
              <Text className="text-3xl font-semibold text-zinc-50">{score}</Text>
              <Text className="text-xs text-white/50">out of 100</Text>
            </>
          ) : (
            <Text className="px-4 text-center text-sm text-white/40">
              Complete your first check-in
            </Text>
          )}
        </View>
      </View>

      {label && (
        <Text style={{ color: label.color }} className="text-sm font-medium">
          {label.text}
        </Text>
      )}
    </View>
  );
}
