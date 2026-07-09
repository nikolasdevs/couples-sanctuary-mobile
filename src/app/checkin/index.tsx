import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import { BottomNav } from "@/components/dashboard/BottomNav";
import { HealthGauge } from "@/components/dashboard/HealthGauge";
import { useCheckinStorage } from "@/lib/useCheckinStorage";

export default function CheckInHubScreen() {
  const { latestResult, history, ready } = useCheckinStorage();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const hasResults = history.results.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-28 pt-8">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
            <Text className="text-xl">💬</Text>
          </View>
          <View>
            <Text className="text-lg font-semibold text-text">Check-In</Text>
            <Text className="text-xs text-white/40">Weekly relationship reflection</Text>
          </View>
        </View>

        {/* Current health / CTA */}
        {hasResults ? (
          <View className="rounded-2xl border border-border bg-white/5 p-6">
            <Text className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-white/40">
              Latest Score
            </Text>
            <HealthGauge score={latestResult?.overallScore ?? null} size={140} />
          </View>
        ) : (
          <View className="items-center rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/5 p-6">
            <Text className="mb-3 text-3xl">📊</Text>
            <Text className="text-center text-sm leading-relaxed text-white/50">
              Your first check-in will reveal your relationship health score.
              Both partners answer 12 questions independently, then see where
              you align.
            </Text>
          </View>
        )}

        {/* Start check-in button */}
        <Link
          href="/checkin/active"
          className="w-full rounded-full bg-amber-500 py-3.5 text-center text-sm font-semibold text-black"
        >
          {hasResults ? "Start This Week's Check-In" : "Begin Your First Check-In"}
        </Link>

        {/* Past results */}
        {hasResults && (
          <View className="rounded-2xl border border-border bg-white/5 p-5">
            <Text className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
              History
            </Text>
            <View className="gap-2">
              {history.results.map((r) => (
                <Link key={r.weekKey} href="/checkin/results" asChild>
                  <Pressable className="flex-row items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3 active:bg-white/[0.06]">
                    <Text className="text-xs text-white/50">Week of {r.weekKey}</Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color:
                          r.overallScore >= 75
                            ? "#22c55e"
                            : r.overallScore >= 60
                              ? "#eab308"
                              : "#f97316",
                      }}
                    >
                      {r.overallScore}/100
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Latest insight */}
        {latestResult?.insight && (
          <View className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
            <View className="mb-3 flex-row items-center gap-2">
              <Text className="text-lg">💡</Text>
              <Text className="text-sm font-semibold text-text">Latest Insight</Text>
            </View>
            <Text className="text-sm leading-relaxed text-white/60">
              {latestResult.insight}
            </Text>
            <Link href="/checkin/results" className="mt-3 text-xs text-amber-400 underline">
              View full results →
            </Link>
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
