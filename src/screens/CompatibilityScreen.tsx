import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  compatQuestions,
  DIMENSIONS,
  DIMENSION_META,
  type Dimension,
  type CompatQuestion,
} from "@/data/compatQuestions";
import type { CompatResponses } from "@/lib/compatScoring";

type ViewState = "overview" | "flow" | "results";

/** Dominant tag + the option label that produced it, per dimension */
interface DimensionProfile {
  dimension: Dimension;
  dominantTag: string;
  dominantLabel: string;
  answeredCount: number;
}

function buildProfile(responses: CompatResponses): DimensionProfile[] {
  return DIMENSIONS.map((dim) => {
    const qs = compatQuestions.filter((q) => q.dimension === dim);
    const tagCount: Record<string, { count: number; label: string }> = {};

    for (const q of qs) {
      const answer = responses[q.id];
      if (!answer) continue;
      const opt = q.options.find((o) => o.label === answer);
      if (!opt) continue;
      if (!tagCount[opt.tag]) tagCount[opt.tag] = { count: 0, label: answer };
      tagCount[opt.tag].count++;
    }

    let maxCount = 0;
    let dominantTag = "";
    let dominantLabel = "";
    for (const [tag, { count, label }] of Object.entries(tagCount)) {
      if (count > maxCount) {
        maxCount = count;
        dominantTag = tag;
        dominantLabel = label;
      }
    }

    const answeredCount = qs.filter((q) => !!responses[q.id]).length;
    return { dimension: dim, dominantTag, dominantLabel, answeredCount };
  });
}

export default function CompatibilityScreen() {
  const [view, setView] = useState<ViewState>("overview");
  const [responses, setResponses] = useState<CompatResponses>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profile, setProfile] = useState<DimensionProfile[]>([]);

  const total = compatQuestions.length;

  function startAssessment() {
    setResponses({});
    setCurrentIndex(0);
    setView("flow");
  }

  function handleAnswer(q: CompatQuestion, label: string) {
    const updated = { ...responses, [q.id]: label };
    setResponses(updated);

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setProfile(buildProfile(updated));
      setView("results");
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      setView("overview");
    }
  }

  // ── Flow view ──────────────────────────────────────────────────
  if (view === "flow") {
    const q = compatQuestions[currentIndex];
    const dimMeta = DIMENSION_META[q.dimension as Dimension];
    const prevDimension =
      currentIndex > 0 ? compatQuestions[currentIndex - 1].dimension : null;
    const dimensionChanged = q.dimension !== prevDimension;

    // Questions in this dimension so far
    const dimQs = compatQuestions.filter((cq) => cq.dimension === q.dimension);
    const dimIndex = dimQs.findIndex((cq) => cq.id === q.id);

    return (
      <SafeAreaView className="flex-1 bg-sanctuary-bg">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Pressable onPress={goBack} hitSlop={8}>
            <Text className="text-zinc-400 text-sm">← Back</Text>
          </Pressable>
          <Text className="text-zinc-500 text-sm">
            {currentIndex + 1} / {total}
          </Text>
        </View>

        {/* Overall progress */}
        <View className="mx-6 h-1 rounded-full bg-white/10">
          <View
            className="h-1 rounded-full bg-violet-500"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </View>

        {/* Dimension label */}
        <View className="px-6 pt-6 pb-2 flex-row items-center gap-2">
          <Text className="text-lg">{dimMeta.icon}</Text>
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
            {q.dimension}
          </Text>
          <Text className="text-zinc-700 text-xs">
            · {dimIndex + 1}/{dimQs.length}
          </Text>
        </View>

        {/* Question + options */}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-white text-lg leading-7 font-medium mt-4 mb-6">
            {q.text}
          </Text>

          <View className="gap-3">
            {q.options.map((opt) => {
              const selected = responses[q.id] === opt.label;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => handleAnswer(q, opt.label)}
                  className="rounded-2xl border p-4 active:opacity-80"
                  style={{
                    borderColor: selected
                      ? dimMeta.color
                      : "rgba(255,255,255,0.1)",
                    backgroundColor: selected
                      ? `${dimMeta.color}18`
                      : "rgba(255,255,255,0.03)",
                  }}
                >
                  <Text className="text-white text-sm leading-5">{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Results view ───────────────────────────────────────────────
  if (view === "results") {
    return (
      <SafeAreaView className="flex-1 bg-sanctuary-bg">
        <ScrollView
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Pressable onPress={() => setView("overview")} hitSlop={8}>
            <Text className="text-zinc-400 text-sm mb-4">← Back</Text>
          </Pressable>

          <Text className="text-2xl font-bold text-white tracking-tight">
            Your Style Profile
          </Text>
          <Text className="text-sm text-zinc-400 mt-1">
            Based on your {total} answers
          </Text>

          <View className="mt-6 gap-4">
            {profile.map(({ dimension, dominantLabel }) => {
              const meta = DIMENSION_META[dimension];
              return (
                <View
                  key={dimension}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-xl">{meta.icon}</Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: meta.color }}
                    >
                      {dimension}
                    </Text>
                  </View>
                  <Text className="text-zinc-400 text-xs mb-2">
                    {meta.description}
                  </Text>
                  {dominantLabel ? (
                    <View
                      className="rounded-xl px-3 py-2"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Text className="text-white text-sm font-medium">
                        {dominantLabel}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-zinc-600 text-sm italic">
                      No answer recorded
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Partner prompt */}
          <View className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <Text className="text-rose-400 text-sm font-semibold">
              See your alignment
            </Text>
            <Text className="text-zinc-400 text-xs mt-1 leading-4">
              When your partner completes the assessment, you'll see how your
              styles align across all 8 dimensions.
            </Text>
          </View>

          <Pressable
            onPress={startAssessment}
            className="mt-4 rounded-full border border-white/10 py-3.5 active:opacity-80"
          >
            <Text className="text-zinc-400 text-center text-sm font-semibold">
              Retake Assessment
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Overview view ──────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text className="text-2xl font-bold text-white tracking-tight">
          Compatibility
        </Text>
        <Text className="text-sm text-zinc-400 mt-1">
          Understand your alignment
        </Text>

        <View className="mt-6 gap-3">
          {Object.entries(DIMENSION_META).map(([key, meta]) => (
            <View
              key={key}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">{meta.icon}</Text>
                <Text className="text-sm font-semibold" style={{ color: meta.color }}>
                  {key}
                </Text>
              </View>
              <Text className="text-xs text-zinc-400 mt-1 leading-4">
                {meta.description}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <Text className="text-zinc-400 text-xs leading-4">
            {total} questions across 8 dimensions. Takes about 10–15 minutes.
            Both partners complete it independently for alignment results.
          </Text>
        </View>

        <Pressable
          onPress={startAssessment}
          className="mt-6 bg-violet-600 rounded-full py-3.5 active:opacity-80"
        >
          <Text className="text-white text-center text-sm font-semibold">
            Start Assessment
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
