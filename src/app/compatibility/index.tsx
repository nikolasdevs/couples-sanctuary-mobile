import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import { BottomNav } from "@/components/dashboard/BottomNav";
import { DIMENSION_META, type Dimension } from "@/data/compatQuestions";
import { useCompatStorage } from "@/lib/useCompatStorage";

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  return "#f97316";
}

export default function CompatibilityHubScreen() {
  const { result, ready } = useCompatStorage();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  const hasResult = result !== null;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-28 pt-8">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10">
            <Text className="text-xl">🔮</Text>
          </View>
          <View>
            <Text className="text-lg font-semibold text-text">Compatibility</Text>
            <Text className="text-xs text-white/40">Understand your alignment</Text>
          </View>
        </View>

        {/* Score or intro */}
        {hasResult && result ? (
          <View className="items-center rounded-2xl border border-border bg-white/5 p-6">
            <Text className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
              Overall Alignment
            </Text>
            <Text
              className="text-5xl font-bold"
              style={{ color: scoreColor(result.overallAlignment) }}
            >
              {result.overallAlignment}%
            </Text>
            <Text className="mt-1 text-xs text-white/40">
              {result.overallAlignment >= 80
                ? "Deeply aligned"
                : result.overallAlignment >= 60
                  ? "Solid foundation"
                  : "Room to grow together"}
            </Text>
          </View>
        ) : (
          <View className="items-center rounded-2xl border border-dashed border-purple-500/20 bg-purple-500/5 p-6">
            <Text className="mb-3 text-3xl">🔮</Text>
            <Text className="text-center text-sm leading-relaxed text-white/50">
              Discover how aligned you are across love language, conflict
              style, life vision, and more. Both partners answer independently
              — then see where you connect and where you can grow.
            </Text>
          </View>
        )}

        {/* CTA */}
        <Link
          href="/compatibility/assess"
          className="w-full rounded-full bg-purple-600 py-3.5 text-center text-sm font-semibold text-white"
        >
          {hasResult ? "Retake Assessment" : "Start Assessment"}
        </Link>

        {/* Dimension breakdown */}
        {hasResult && result && (
          <View className="rounded-2xl border border-border bg-white/5 p-5">
            <Text className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
              Dimensions
            </Text>
            <View className="gap-3">
              {result.dimensions.map((d) => {
                const meta = DIMENSION_META[d.dimension as Dimension];
                const color = scoreColor(d.alignment);
                return (
                  <View key={d.dimension} className="flex-row items-center gap-3">
                    <Text className="text-lg">{meta?.icon ?? "•"}</Text>
                    <View className="flex-1">
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text className="text-xs text-zinc-50">{d.dimension}</Text>
                        <Text className="text-xs font-semibold" style={{ color }}>
                          {d.alignment}%
                        </Text>
                      </View>
                      <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${d.alignment}%`, backgroundColor: color }}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <Link href="/compatibility/results" className="mt-4 text-xs text-purple-400 underline">
              View full results →
            </Link>
          </View>
        )}

        {/* Strengths & Growth */}
        {hasResult && result && result.strengths.length > 0 && (
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-green-500/15 bg-green-500/5 p-4">
              <Text className="mb-2 text-xs font-medium text-green-400">Strengths</Text>
              {result.strengths.map((s) => (
                <Text key={s.dimension} className="text-xs leading-relaxed text-white/60">
                  {DIMENSION_META[s.dimension as Dimension]?.icon} {s.dimension}
                </Text>
              ))}
            </View>
            <View className="flex-1 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4">
              <Text className="mb-2 text-xs font-medium text-amber-400">Growth Areas</Text>
              {result.growthAreas.map((g) => (
                <Text key={g.dimension} className="text-xs leading-relaxed text-white/60">
                  {DIMENSION_META[g.dimension as Dimension]?.icon} {g.dimension}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Back to dashboard */}
        <Link href="/dashboard" className="pb-2 text-center text-sm text-white/40 underline">
          ← Back to Dashboard
        </Link>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}
