import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PILLARS,
  getWeeklyQuestions,
  currentWeekSeed,
  currentWeekKey,
  type CheckInQuestion,
} from "@/data/checkinQuestions";
import { scoreCheckIn, type CheckInResult, type Responses } from "@/lib/checkinScoring";

const PILLAR_META: Record<string, { emoji: string; color: string; bar: string }> = {
  "emotional-safety": { emoji: "🛡️", color: "text-emerald-400", bar: "#10b981" },
  communication: { emoji: "🗣️", color: "text-blue-400", bar: "#3b82f6" },
  "intimacy-affection": { emoji: "💕", color: "text-pink-400", bar: "#f472b6" },
  "quality-time": { emoji: "⏳", color: "text-amber-400", bar: "#f59e0b" },
  "trust-respect": { emoji: "🤝", color: "text-teal-400", bar: "#14b8a6" },
  "growth-gratitude": { emoji: "🌱", color: "text-lime-400", bar: "#84cc16" },
};

function pillarToKey(pillar: string): string {
  return pillar.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-");
}

type ViewState = "overview" | "flow" | "results";

const QUESTIONS = getWeeklyQuestions(currentWeekSeed());

export default function CheckInScreen() {
  const [view, setView] = useState<ViewState>("overview");
  const [responses, setResponses] = useState<Responses>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [textDraft, setTextDraft] = useState("");

  function startFlow() {
    setResponses({});
    setCurrentIndex(0);
    setTextDraft("");
    setView("flow");
  }

  function advance(questionId: string, value: number | string) {
    const updated = { ...responses, [questionId]: value };
    setResponses(updated);
    setTextDraft("");

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      const weekKey = currentWeekKey();
      const scored = scoreCheckIn(QUESTIONS, updated, updated, weekKey);
      setResult(scored);
      setView("results");
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setTextDraft("");
    } else {
      setView("overview");
    }
  }

  // ── Flow view ──────────────────────────────────────────────────
  if (view === "flow") {
    const q = QUESTIONS[currentIndex];
    const total = QUESTIONS.length;
    const pillarKey = pillarToKey(q.pillar);
    const meta = PILLAR_META[pillarKey] ?? { emoji: "•", color: "text-zinc-400", bar: "#71717a" };
    const currentAnswer = responses[q.id];

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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

          {/* Progress bar */}
          <View className="mx-6 h-1 rounded-full bg-white/10">
            <View
              className="h-1 rounded-full"
              style={{
                width: `${((currentIndex + 1) / total) * 100}%`,
                backgroundColor: meta.bar,
              }}
            />
          </View>

          {/* Pillar label */}
          <View className="px-6 pt-6 pb-2 flex-row items-center gap-2">
            <Text>{meta.emoji}</Text>
            <Text className={`text-xs font-semibold uppercase tracking-widest ${meta.color}`}>
              {q.pillar}
            </Text>
          </View>

          {/* Question + answer */}
          <View className="flex-1 justify-center px-6">
            <Text className="text-white text-lg leading-7 font-medium text-center mb-8">
              {q.text}
            </Text>

            {q.type === "scale" && (
              <View>
                <View className="flex-row justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const selected = currentAnswer === val;
                    return (
                      <Pressable
                        key={val}
                        onPress={() => advance(q.id, val)}
                        className="flex-1 rounded-2xl border py-4 items-center active:opacity-80"
                        style={{
                          borderColor: selected ? meta.bar : "rgba(255,255,255,0.1)",
                          backgroundColor: selected ? `${meta.bar}22` : "rgba(255,255,255,0.03)",
                        }}
                      >
                        <Text className="text-white text-base font-semibold">{val}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View className="flex-row justify-between mt-2 px-1">
                  <Text className="text-zinc-600 text-xs">Disagree</Text>
                  <Text className="text-zinc-600 text-xs">Agree</Text>
                </View>
              </View>
            )}

            {q.type === "yesno" && (
              <View className="flex-row gap-4">
                {(["Yes", "No"] as const).map((label) => {
                  const val = label.toLowerCase();
                  const selected = currentAnswer === val;
                  return (
                    <Pressable
                      key={label}
                      onPress={() => advance(q.id, val)}
                      className="flex-1 rounded-full border py-4 active:opacity-80"
                      style={{
                        borderColor: selected ? meta.bar : "rgba(255,255,255,0.1)",
                        backgroundColor: selected ? `${meta.bar}22` : "rgba(255,255,255,0.03)",
                      }}
                    >
                      <Text className="text-white text-center font-semibold">{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {q.type === "text" && (
              <View>
                <TextInput
                  className="text-white rounded-2xl border border-white/10 bg-white/5 p-4 text-base"
                  style={{ minHeight: 96, textAlignVertical: "top" }}
                  placeholder="Type your answer…"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  multiline
                  value={textDraft}
                  onChangeText={setTextDraft}
                />
                <Pressable
                  onPress={() => advance(q.id, textDraft)}
                  disabled={!textDraft.trim()}
                  className="mt-4 rounded-full py-3.5 active:opacity-80"
                  style={{ backgroundColor: textDraft.trim() ? meta.bar : "rgba(255,255,255,0.1)" }}
                >
                  <Text className="text-white text-center text-sm font-semibold">
                    {currentIndex < QUESTIONS.length - 1 ? "Continue" : "Finish"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── Results view ───────────────────────────────────────────────
  if (view === "results" && result) {
    return (
      <SafeAreaView className="flex-1 bg-sanctuary-bg">
        <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
          <Pressable onPress={() => setView("overview")} hitSlop={8}>
            <Text className="text-zinc-400 text-sm mb-4">← Back</Text>
          </Pressable>

          <Text className="text-2xl font-bold text-white tracking-tight">
            Your Check-In
          </Text>
          <Text className="text-sm text-zinc-400 mt-1">Week of {result.weekKey}</Text>

          {/* Overall score */}
          <View className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 items-center">
            <Text className="text-6xl font-bold text-amber-400">
              {result.overallScore}
            </Text>
            <Text className="text-zinc-400 text-xs mt-1">out of 100</Text>
          </View>

          {/* Insight */}
          <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <Text className="text-white text-sm leading-6">{result.insight}</Text>
          </View>

          {/* Pillar breakdown */}
          <Text className="text-white font-semibold mt-6 mb-3">Pillar Breakdown</Text>
          <View className="gap-3">
            {result.pillarScores.map((ps) => {
              const key = pillarToKey(ps.pillar);
              const meta = PILLAR_META[key] ?? { emoji: "•", color: "text-zinc-400", bar: "#71717a" };
              return (
                <View
                  key={ps.pillar}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <Text>{meta.emoji}</Text>
                      <Text className={`text-sm font-semibold ${meta.color}`}>
                        {ps.pillar}
                      </Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">
                      {ps.scoreA}/100
                    </Text>
                  </View>
                  <View className="h-1.5 rounded-full bg-white/10">
                    <View
                      className="h-1.5 rounded-full"
                      style={{ width: `${ps.scoreA}%`, backgroundColor: meta.bar }}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Partner prompt */}
          <View className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <Text className="text-violet-400 text-sm font-semibold">
              Want full insights?
            </Text>
            <Text className="text-zinc-400 text-xs mt-1 leading-4">
              When your partner completes their check-in, you'll see perception
              gaps and blind spots side by side.
            </Text>
          </View>

          <Pressable
            onPress={startFlow}
            className="mt-4 rounded-full border border-white/10 py-3.5 active:opacity-80"
          >
            <Text className="text-zinc-400 text-center text-sm font-semibold">
              Retake Check-In
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Overview view ──────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-white tracking-tight">
          Check-In
        </Text>
        <Text className="text-sm text-zinc-400 mt-1">
          Weekly relationship reflection
        </Text>

        <View className="mt-6 gap-3">
          {PILLARS.map((pillar) => {
            const key = pillarToKey(pillar);
            const meta = PILLAR_META[key] ?? { emoji: "•", color: "text-zinc-400", bar: "#71717a" };
            return (
              <View
                key={pillar}
                className="rounded-xl border border-white/10 bg-white/5 p-4 flex-row items-center gap-3"
              >
                <Text className="text-xl">{meta.emoji}</Text>
                <Text className={`text-sm font-semibold capitalize ${meta.color}`}>
                  {pillar}
                </Text>
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={startFlow}
          className="mt-8 bg-amber-600 rounded-full py-3.5 active:opacity-80"
        >
          <Text className="text-white text-center text-sm font-semibold">
            Start This Week's Check-In
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
