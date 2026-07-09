import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/lib/useDashboard";
import { HealthGauge } from "@/components/dashboard/HealthGauge";
import { PillarCard } from "@/components/dashboard/PillarCard";
import { StreakTracker } from "@/components/dashboard/StreakTracker";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { BottomNav } from "@/components/dashboard/BottomNav";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getCheckinStatus(checkinDay: number, checkinsDone: number): string {
  if (checkinsDone === 0) return "Start first check-in";
  const today = new Date().getDay();
  if (today === checkinDay) return "Ready now";
  return `Due ${DAYS[checkinDay].slice(0, 3)}`;
}

export default function DashboardScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const { data, ready } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user || !ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#b11226" />
      </View>
    );
  }

  const displayName = user.name || user.email || "";
  const names =
    data.partnerA && data.partnerB
      ? `${data.partnerA} & ${data.partnerB}`
      : null;
  const greeting = getGreeting();
  const checkinStatus = getCheckinStatus(data.checkinDay, data.checkinsDone);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-28 pt-8"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-3">
            <Image
              source="https://res.cloudinary.com/dpnzmcban/image/upload/v1768054589/Group_2263-_riwvag.png"
              style={{ width: 40, height: 40 }}
              contentFit="contain"
            />
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-sm font-semibold text-text"
              >
                {greeting}
                {displayName ? `, ${displayName}` : ""}
              </Text>
              {names && <Text className="text-xs text-white/50">{names}</Text>}
            </View>
          </View>

          <Pressable
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            <Text className="text-xs text-white/30">Sign out</Text>
          </Pressable>
        </View>

        {/* Health Score */}
        <View className="rounded-2xl border border-border bg-white/5 p-6">
          <Text className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-white/40">
            Relationship Health
          </Text>
          <HealthGauge score={data.healthScore} />
        </View>

        {/* Three Pillars */}
        <View>
          <Text className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            Your Journey
          </Text>
          <View className="flex-row gap-3">
            <PillarCard
              href="/bond"
              icon="🕯️"
              title="Bond"
              subtitle="Connect through shared moments"
              accent="#B11226"
              status={data.streak > 0 ? `${data.streak} done` : "Start"}
            />
            <PillarCard
              href="/compatibility"
              icon="🔮"
              title="Compatibility"
              subtitle="Understand your alignment"
              accent="#9333ea"
              status={data.compatibilityDone ? "Done ✓" : "New"}
            />
            <PillarCard
              href="/checkin"
              icon="💬"
              title="Check-In"
              subtitle="Weekly reflection together"
              accent="#f59e0b"
              status={checkinStatus}
            />
          </View>
        </View>

        {/* Streak */}
        <StreakTracker streak={data.streak} />

        {/* Insight */}
        <InsightCard insight={data.latestInsight} />

        {/* Empty state prompt if no names set */}
        {!names && (
          <View className="rounded-2xl border border-dashed border-border bg-white/[0.02] p-5">
            <Text className="text-center text-sm leading-relaxed text-white/50">
              Welcome to Sanctuary. Start a{" "}
              <Text className="font-medium text-text">Bonding</Text> session
              to begin your journey together.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}
