import React, { useState } from "react";
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

type Deck = (typeof categories)[0];

export default function BondingScreen() {
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);

  function openDeck(deck: Deck) {
    setActiveDeck(deck);
    setPromptIndex(0);
  }

  function close() {
    setActiveDeck(null);
  }

  if (activeDeck) {
    const prompt = activeDeck.questions[promptIndex];
    const total = activeDeck.questions.length;
    const isFirst = promptIndex === 0;
    const isLast = promptIndex === total - 1;
    const progress = (promptIndex + 1) / total;

    return (
      <SafeAreaView className="flex-1 bg-sanctuary-bg">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Pressable onPress={close} hitSlop={8}>
            <Text className="text-zinc-400 text-sm">← Back</Text>
          </Pressable>
          <Text className="text-zinc-500 text-sm">
            {promptIndex + 1} / {total}
          </Text>
        </View>

        {/* Progress bar */}
        <View className="mx-6 h-1 rounded-full bg-white/10">
          <View
            className="h-1 rounded-full bg-rose-500"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        {/* Deck label */}
        <View className="px-6 pt-6 pb-2 flex-row items-center gap-2">
          <Text className="text-xl">{activeDeck.icon}</Text>
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
            {activeDeck.title}
          </Text>
        </View>

        {/* Prompt card */}
        <View className="flex-1 justify-center px-6">
          <View className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <Text className="text-white text-xl leading-8 font-medium text-center">
              {prompt}
            </Text>
          </View>
          <Text className="text-zinc-600 text-xs text-center mt-4">
            Discuss this together
          </Text>
        </View>

        {/* Navigation */}
        <View className="flex-row gap-3 px-6 pb-8">
          <Pressable
            onPress={() => setPromptIndex((i) => i - 1)}
            disabled={isFirst}
            className="flex-1 rounded-full border border-white/10 py-3.5"
            style={{ opacity: isFirst ? 0.3 : 1 }}
          >
            <Text className="text-white text-center text-sm font-semibold">
              ← Prev
            </Text>
          </Pressable>
          {isLast ? (
            <Pressable
              onPress={close}
              className="flex-1 rounded-full bg-rose-600 py-3.5 active:opacity-80"
            >
              <Text className="text-white text-center text-sm font-semibold">
                Done ✓
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setPromptIndex((i) => i + 1)}
              className="flex-1 rounded-full bg-rose-600 py-3.5 active:opacity-80"
            >
              <Text className="text-white text-center text-sm font-semibold">
                Next →
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white tracking-tight">
          Bonding
        </Text>
        <Text className="text-sm text-zinc-400 mt-1">Choose an experience</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openDeck(item)}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 active:opacity-80"
          >
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
              <Text className="text-zinc-600 text-sm">→</Text>
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
