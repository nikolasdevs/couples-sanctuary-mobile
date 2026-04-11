import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DIMENSION_META } from "@/data/compatQuestions";

export default function CompatibilityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-2xl font-bold text-white tracking-tight">
          Compatibility
        </Text>
        <Text className="text-sm text-zinc-400 mt-1">
          Understand your alignment
        </Text>

        {/* Dimensions preview */}
        <View className="mt-6 gap-3">
          {Object.entries(DIMENSION_META).map(([key, meta]) => (
            <View
              key={key}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">{meta.icon}</Text>
                <Text className={`text-sm font-semibold text-violet-400`}>
                  {key}
                </Text>
              </View>
              <Text className="text-xs text-zinc-400 mt-1 leading-4">
                {meta.description}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Pressable className="mt-8 bg-violet-600 rounded-full py-3.5 active:opacity-80">
          <Text className="text-white text-center text-sm font-semibold">
            Start Assessment
          </Text>
        </Pressable>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
