import { Text, View } from "react-native";

interface InsightCardProps {
  insight: string | null; // null = no insight yet
}

export function InsightCard({ insight }: InsightCardProps) {
  if (!insight) return null;

  return (
    <View className="rounded-2xl border border-border bg-white/5 p-5">
      <View className="mb-3 flex-row items-center gap-2">
        <Text className="text-lg">💡</Text>
        <Text className="text-sm font-semibold text-text">Weekly Insight</Text>
      </View>
      <Text className="text-sm leading-relaxed text-white/60">{insight}</Text>
    </View>
  );
}
