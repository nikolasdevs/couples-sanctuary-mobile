import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";

import { BottomNav } from "@/components/dashboard/BottomNav";
import { RadarChart } from "@/components/compatibility/RadarChart";
import { DIMENSION_META, type Dimension } from "@/data/compatQuestions";
import { getConversationStarter, type DimensionScore } from "@/lib/compatScoring";
import { useCompatStorage } from "@/lib/useCompatStorage";

function alignmentLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Deeply Aligned", color: "#4ade80" };
  if (score >= 60) return { text: "Room to Grow", color: "#fcd34d" };
  return { text: "Important Conversation", color: "#fda4af" };
}

export default function CompatResultsScreen() {
  const { result, ready, reset } = useCompatStorage();
  const router = useRouter();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  if (!result) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
        <View className="flex-1 items-center gap-6 px-5 pt-16">
          <Text className="text-4xl">🔮</Text>
          <Text className="text-center text-sm text-white/50">
            No compatibility results yet. Complete the assessment with your
            partner to see your alignment map.
          </Text>
          <Link href="/compatibility" className="text-sm text-purple-400 underline">
            Go to Compatibility →
          </Link>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  const { dimensions, overallAlignment, strengths, growthAreas } = result;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-28 pt-8">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Link href="/compatibility" className="text-sm text-white/40">
            ← Back
          </Link>
          <Text className="text-lg font-semibold text-text">Your Compatibility Map</Text>
        </View>

        {/* Overall score */}
        <View className="items-center rounded-2xl border border-border bg-white/5 p-6">
          <Text className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
            Overall Alignment
          </Text>
          <Text className="text-5xl font-bold text-purple-400">{overallAlignment}%</Text>
          <Text className="mt-1 text-sm text-white/50">
            across {dimensions.length} dimensions
          </Text>
        </View>

        {/* Radar chart */}
        <View className="rounded-2xl border border-border bg-white/5 p-4">
          <RadarChart scores={dimensions} />
        </View>

        {/* Strengths */}
        <View className="rounded-2xl border border-green-500/15 bg-green-500/5 p-5">
          <Text className="mb-3 text-xs font-medium uppercase tracking-wider text-green-400/60">
            💪 Your Strengths
          </Text>
          <View className="gap-2">
            {strengths.map((s) => (
              <StrengthRow key={s.dimension} score={s} />
            ))}
          </View>
        </View>

        {/* Growth areas */}
        <View className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
          <Text className="mb-3 text-xs font-medium uppercase tracking-wider text-amber-400/60">
            🌱 Growth Areas
          </Text>
          <View className="gap-3">
            {growthAreas.map((s) => (
              <GrowthRow key={s.dimension} score={s} />
            ))}
          </View>
        </View>

        {/* Full dimension breakdown */}
        <View className="rounded-2xl border border-border bg-white/5 p-5">
          <Text className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            All Dimensions
          </Text>
          <View className="gap-4">
            {dimensions.map((d) => (
              <DimensionRow key={d.dimension} score={d} />
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3 pb-4">
          <Pressable
            onPress={() => {
              reset();
              router.push("/compatibility");
            }}
            className="items-center rounded-full border border-border bg-white/5 px-5 py-3 active:bg-white/[0.07]"
          >
            <Text className="text-sm font-semibold text-text">🔄 Retake Assessment</Text>
          </Pressable>
          <Link href="/dashboard" className="text-center text-sm text-white/40 underline">
            Return to Dashboard
          </Link>
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function StrengthRow({ score }: { score: DimensionScore }) {
  const meta = DIMENSION_META[score.dimension as Dimension];
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-zinc-200">
        {meta?.icon} {score.dimension}
      </Text>
      <Text className="text-sm font-semibold text-green-400">{score.alignment}%</Text>
    </View>
  );
}

function GrowthRow({ score }: { score: DimensionScore }) {
  const meta = DIMENSION_META[score.dimension as Dimension];
  const starter = getConversationStarter(score.dimension as Dimension, score);

  return (
    <View>
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-sm text-zinc-200">
          {meta?.icon} {score.dimension}
        </Text>
        <Text className="text-sm font-semibold text-amber-400">{score.alignment}%</Text>
      </View>
      <Text className="text-xs leading-relaxed text-white/40">{starter}</Text>
    </View>
  );
}

function DimensionRow({ score }: { score: DimensionScore }) {
  const meta = DIMENSION_META[score.dimension as Dimension];
  const label = alignmentLabel(score.alignment);

  return (
    <View>
      <View className="mb-1.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm">{meta?.icon}</Text>
          <Text className="text-xs text-zinc-200">{score.dimension}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className="rounded-full border px-2 py-0.5"
            style={{ borderColor: `${label.color}33`, backgroundColor: `${label.color}1a` }}
          >
            <Text className="text-[10px] font-medium" style={{ color: label.color }}>
              {label.text}
            </Text>
          </View>
          <Text className="text-xs font-semibold" style={{ color: meta?.color }}>
            {score.alignment}%
          </Text>
        </View>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <View
          className="h-full rounded-full"
          style={{ backgroundColor: meta?.color ?? "#8b5cf6", width: `${score.alignment}%` }}
        />
      </View>
      {!score.matched && (
        <View className="mt-1 flex-row gap-3">
          <Text className="text-[10px] text-white/30">A: {score.tagA}</Text>
          <Text className="text-[10px] text-white/30">B: {score.tagB}</Text>
        </View>
      )}
    </View>
  );
}
