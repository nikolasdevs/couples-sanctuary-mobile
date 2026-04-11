import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

export default function ProfileScreen() {
  const { user, couple, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-2xl font-bold text-white tracking-tight">
          Profile
        </Text>

        {/* User info */}
        <View className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <Text className="text-lg font-semibold text-white">
            {user?.name || "—"}
          </Text>
          <Text className="text-sm text-zinc-400 mt-1">{user?.email}</Text>
        </View>

        {/* Partner info */}
        <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <Text className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Partner
          </Text>
          {couple?.status === "active" ? (
            <Text className="text-base font-semibold text-rose-400">
              {couple.partnerName ?? "Connected"}
            </Text>
          ) : (
            <Text className="text-sm text-zinc-500">Not paired yet</Text>
          )}
        </View>

        {/* Actions */}
        <Pressable
          onPress={handleLogout}
          className="mt-8 border border-red-500/20 rounded-full py-3 active:opacity-80"
        >
          <Text className="text-red-400 text-center text-sm font-semibold">
            Log Out
          </Text>
        </Pressable>

        <Text className="text-xs text-zinc-600 text-center mt-8">
          The Couples Sanctuary v1.0.0
        </Text>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
