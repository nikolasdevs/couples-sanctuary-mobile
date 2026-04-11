import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { decks } from "@/data";

const categories = [
  { id: "connection", title: "Connection", icon: "🕯️", description: "Emotional intimacy and awareness", questions: decks.connection },
  { id: "memory", title: "Memory", icon: "💭", description: "Shared history and milestones", questions: decks.memory },
  { id: "vulnerability", title: "Vulnerability", icon: "💔", description: "Emotional openness and fears", questions: decks.vulnerability },
  { id: "desire", title: "Desire", icon: "🔥", description: "Physical and romantic intimacy", questions: decks.desire },
  { id: "challenge", title: "Challenge", icon: "⭐", description: "Interactive actions and prompts", questions: decks.challenge },
];

export default function BondingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white tracking-tight">
          Bonding
        </Text>
        <Text className="text-sm text-zinc-400 mt-1">
          Choose an experience
        </Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Pressable className="rounded-2xl border border-white/10 bg-white/5 p-5 active:opacity-80">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">{item.icon}</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  {item.title}
                </Text>
                <Text className="text-xs text-zinc-400 mt-0.5">
                  {item.questions.length} prompts
                </Text>
              </View>
            </View>
            <Text
              className="text-sm text-zinc-400 mt-2 leading-5"
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
