import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "@/navigation/MainTabs";

type Props = {
  navigation: BottomTabNavigationProp<MainTabParamList, "Dashboard">;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function PillarCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-2xl border border-white/10 p-4 active:opacity-80"
      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
    >
      <Text className="text-2xl">{icon}</Text>
      <Text className={`text-sm font-semibold mt-2 ${color}`}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }: Props) {
  const { user, couple } = useAuthStore();
  const partnerName = couple?.partnerName;
  const greeting = getGreeting();

  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Header */}
        <Text className="text-2xl font-bold text-white tracking-tight">
          {greeting},{"\n"}
          <Text className="text-rose-400">{user?.name ?? "you"}</Text>
          {partnerName ? (
            <Text className="text-white"> & {partnerName}</Text>
          ) : null}
        </Text>

        {!couple || couple.status !== "active" ? (
          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate("Pair")
            }
            className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4"
          >
            <Text className="text-rose-400 font-semibold text-sm">
              Connect with your partner
            </Text>
            <Text className="text-zinc-400 text-xs mt-1">
              Tap to invite or enter a code
            </Text>
          </Pressable>
        ) : null}

        {/* Pillar Cards */}
        <View className="flex-row gap-3 mt-8">
          <PillarCard
            icon="🕯️"
            label="Bond"
            color="text-rose-400"
            onPress={() => navigation.navigate("Bonding")}
          />
          <PillarCard
            icon="🔮"
            label="Compat"
            color="text-violet-400"
            onPress={() => navigation.navigate("Compatibility")}
          />
          <PillarCard
            icon="💬"
            label="Check-In"
            color="text-amber-400"
            onPress={() => navigation.navigate("CheckIn")}
          />
        </View>

        {/* Quick info card */}
        <View className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <Text className="text-base font-semibold text-white">
            Your Sanctuary
          </Text>
          <Text className="text-sm text-zinc-400 mt-2 leading-5">
            Choose an experience above to deepen your connection. Bond with
            intimate prompts, assess your compatibility, or do a weekly
            check-in on your relationship health.
          </Text>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
