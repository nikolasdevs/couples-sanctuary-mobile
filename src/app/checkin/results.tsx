import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import { BottomNav } from "@/components/dashboard/BottomNav";
import { HealthGauge } from "@/components/dashboard/HealthGauge";
import type { PerceptionGap, PillarScore } from "@/lib/checkinScoring";
import { useCheckinStorage } from "@/lib/useCheckinStorage";

const PILLAR_COLORS: Record<string, string> = {
  "Emotional Safety": "#22c55e",
  Communication: "#3b82f6",
  "Intimacy & Affection": "#ec4899",
  "Quality Time": "#eab308",
  "Trust & Respect": "#8b5cf6",
  "Growth & Gratitude": "#f97316",
};

function pillarColor(pillar: string): string {
  return PILLAR_COLORS[pillar] ?? "#a1a1aa";
}

export default function CheckInResultsScreen() {
  const { latestResult, ready } = useCheckinStorage();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!latestResult) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
        <View className="flex-1 items-center gap-6 px-5 pt-16">
          <Text className="text-4xl">📊</Text>
          <Text className="text-center text-sm text-white/50">
            No check-in results yet. Complete your first weekly check-in to see
            your relationship health breakdown.
          </Text>
          <Link href="/checkin" className="text-sm text-amber-400 underline">
            Go to Check-In →
          </Link>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  const { overallScore, pillarScores, gaps, insight } = latestResult;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-28 pt-8">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Link href="/checkin" className="text-sm text-white/40">
            ← Back
          </Link>
          <Text className="text-lg font-semibold text-text">This Week&apos;s Results</Text>
        </View>

        {/* Overall score */}
        <View className="rounded-2xl border border-border bg-white/5 p-6">
          <Text className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-white/40">
            Relationship Health
          </Text>
          <HealthGauge score={overallScore} />
        </View>

        {/* Pillar breakdown */}
        <View className="rounded-2xl border border-border bg-white/5 p-5">
          <Text className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            Pillar Breakdown
          </Text>
          <View className="gap-4">
            {pillarScores.map((ps) => (
              <PillarBar key={ps.pillar} pillarScore={ps} />
            ))}
          </View>
        </View>

        {/* Perception Gaps */}
        {gaps.length > 0 && (
          <View className="rounded-2xl border border-border bg-white/5 p-5">
            <Text className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
              Perception Gaps
            </Text>
            <View className="gap-3">
              {gaps.map((gap, i) => (
                <GapCard key={i} gap={gap} />
              ))}
            </View>
          </View>
        )}

        {/* Insight */}
        <View className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Text className="text-lg">💡</Text>
            <Text className="text-sm font-semibold text-text">Weekly Insight</Text>
          </View>
          <Text className="text-sm leading-relaxed text-white/60">{insight}</Text>
        </View>

        {/* Actions */}
        <View className="gap-3 pb-4">
          <Link
            href="/bond"
            className="rounded-full border border-border bg-white/5 px-5 py-3 text-center text-sm font-semibold text-text"
          >
            🕯️ Start a Bonding Session
          </Link>
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

function PillarBar({ pillarScore }: { pillarScore: PillarScore }) {
  const color = pillarColor(pillarScore.pillar);

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-zinc-200">{pillarScore.pillar}</Text>
        <Text className="text-xs font-semibold" style={{ color }}>
          {pillarScore.combined}
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-white/10">
        <View
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${pillarScore.combined}%` }}
        />
      </View>
      <View className="flex-row gap-4">
        <Text className="text-[10px] text-white/30">A: {pillarScore.scoreA}</Text>
        <Text className="text-[10px] text-white/30">B: {pillarScore.scoreB}</Text>
        {pillarScore.gap >= 2 && (
          <Text className="text-[10px] text-amber-400/60">Gap: {pillarScore.gap}</Text>
        )}
      </View>
    </View>
  );
}

function GapCard({ gap }: { gap: PerceptionGap }) {
  const isBlindSpot = gap.severity === "blind-spot";

  return (
    <View
      className={
        isBlindSpot
          ? "rounded-xl border border-rose-500/20 bg-rose-500/5 p-4"
          : "rounded-xl border border-amber-500/15 bg-amber-500/5 p-4"
      }
    >
      <View className="mb-2 flex-row items-center gap-2">
        <Text className="text-xs font-medium" style={{ color: pillarColor(gap.pillar) }}>
          {gap.pillar}
        </Text>
        <View
          className={
            isBlindSpot
              ? "rounded-full bg-rose-500/10 px-2 py-0.5"
              : "rounded-full bg-amber-500/10 px-2 py-0.5"
          }
        >
          <Text
            className={
              isBlindSpot
                ? "text-[10px] font-medium text-rose-300"
                : "text-[10px] font-medium text-amber-300"
            }
          >
            {isBlindSpot ? "Blind Spot" : "Perception Gap"}
          </Text>
        </View>
      </View>
      <Text className="mb-2 text-sm leading-relaxed text-white/60">
        &ldquo;{gap.question}&rdquo;
      </Text>
      <View className="flex-row gap-4">
        <Text className="text-xs text-white/40">
          Partner A: <Text className="font-semibold text-zinc-200">{gap.valueA}/5</Text>
        </Text>
        <Text className="text-xs text-white/40">
          Partner B: <Text className="font-semibold text-zinc-200">{gap.valueB}/5</Text>
        </Text>
      </View>
    </View>
  );
}
