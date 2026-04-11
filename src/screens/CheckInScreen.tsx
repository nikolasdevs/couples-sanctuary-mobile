import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PILLARS } from "@/data/checkinQuestions";

const PILLAR_META: Record<string, { emoji: string; color: string }> = {
  "emotional-safety": { emoji: "🛡️", color: "text-emerald-400" },
  communication: { emoji: "🗣️", color: "text-blue-400" },
  "intimacy-affection": { emoji: "💕", color: "text-pink-400" },
  "quality-time": { emoji: "⏳", color: "text-amber-400" },
  "trust-respect": { emoji: "🤝", color: "text-teal-400" },
  "growth-gratitude": { emoji: "🌱", color: "text-lime-400" },
};

export default function CheckInScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-2xl font-bold text-white tracking-tight">
          Check-In
        </Text>
        <Text className="text-sm text-zinc-400 mt-1">
          Weekly relationship reflection
        </Text>

        {/* Pillar overview */}
        <View className="mt-6 gap-3">
          {PILLARS.map((pillar) => {
            const meta = PILLAR_META[pillar] ?? { emoji: "•", color: "text-zinc-400" };
            return (
              <View
                key={pillar}
                className="rounded-xl border border-white/10 bg-white/5 p-4 flex-row items-center gap-3"
              >
                <Text className="text-xl">{meta.emoji}</Text>
                <Text className={`text-sm font-semibold capitalize ${meta.color}`}>
                  {pillar.replace(/-/g, " ")}
                </Text>
              </View>
            );
          })}
        </View>

        {/* CTA */}
        <Pressable className="mt-8 bg-amber-600 rounded-full py-3.5 active:opacity-80">
          <Text className="text-white text-center text-sm font-semibold">
            Start This Week's Check-In
          </Text>
        </Pressable>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
