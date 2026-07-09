import { Text, View } from "react-native";

interface StreakTrackerProps {
  streak: number;
}

export function StreakTracker({ streak }: StreakTrackerProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-white/5 px-5 py-4">
      <Text className="text-2xl">🔥</Text>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-text">
          {streak > 0 ? `${streak}-session streak` : "Start your streak"}
        </Text>
        <Text className="text-xs text-white/50">
          {streak > 0
            ? "Keep the connection going"
            : "Complete a bonding session to begin"}
        </Text>
      </View>
      {streak > 0 && (
        <View className="flex-row gap-1">
          {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
            <View key={i} className="h-2 w-2 rounded-full bg-amber-500/80" />
          ))}
          {streak > 7 && (
            <Text className="ml-0.5 text-[10px] font-medium text-amber-500/70">
              +{streak - 7}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
