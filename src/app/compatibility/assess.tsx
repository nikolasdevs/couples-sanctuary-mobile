import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { BottomNav } from "@/components/dashboard/BottomNav";
import { ModeSelect } from "@/components/sync/ModeSelect";
import { JoinPartner } from "@/components/sync/JoinPartner";
import { WaitingRoom } from "@/components/sync/WaitingRoom";
import {
  compatQuestions,
  DIMENSIONS,
  DIMENSION_META,
  type Dimension,
} from "@/data/compatQuestions";
import { scoreCompatibility, type CompatResponses } from "@/lib/compatScoring";
import { useCompatStorage } from "@/lib/useCompatStorage";
import { useDashboard } from "@/lib/useDashboard";
import { useSync } from "@/lib/useSync";

type Phase =
  | "mode-select"
  | "pick-partner"
  | "join"
  | "answering"
  | "waiting"
  | "sync-waiting"
  | "done";

export default function CompatAssessmentScreen() {
  const router = useRouter();
  const { sync: urlSyncCode, partner: urlPartner } = useLocalSearchParams<{
    sync?: string;
    partner?: "A" | "B";
  }>();
  const { savePartnerResponses, getResponses, saveResult } = useCompatStorage();
  const { update: updateDashboard } = useDashboard();
  const sync = useSync();

  const questions = useMemo(() => compatQuestions, []);

  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState(false);

  const [phase, setPhase] = useState<Phase>("mode-select");
  const [currentPartner, setCurrentPartner] = useState<"A" | "B">("A");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<CompatResponses>({});
  const [ready, setReady] = useState(false);
  const [aCompleted, setACompleted] = useState(false);
  const [bCompleted, setBCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getResponses();
      if (saved.partnerA) setACompleted(true);
      if (saved.partnerB) setBCompleted(true);

      if (urlSyncCode && urlPartner) {
        setSyncCode(urlSyncCode);
        setSyncMode(true);
        setCurrentPartner(urlPartner);
        setPhase("answering");
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQ = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;
  const progress = ((questionIndex + 1) / questions.length) * 100;

  const currentDim = currentQ?.dimension as Dimension;
  const dimMeta = currentDim ? DIMENSION_META[currentDim] : null;
  const prevDim = questionIndex > 0 ? questions[questionIndex - 1]?.dimension : null;
  const isDimChange = currentDim !== prevDim;

  const handleTogether = useCallback(() => setPhase("pick-partner"), []);

  const handleApart = useCallback(async () => {
    const code = await sync.createSession("compatibility");
    if (code) {
      setSyncCode(code);
      setSyncMode(true);
      setCurrentPartner("A");
      setPhase("answering");
    }
  }, [sync]);

  const handleJoinScreen = useCallback(() => setPhase("join"), []);

  const handleJoinCode = useCallback(
    async (code: string) => {
      const session = await sync.getSession(code);
      if (!session) return;
      setSyncCode(code);
      setSyncMode(true);
      const partner = session.partnerA ? "B" : "A";
      setCurrentPartner(partner);
      setPhase("answering");
    },
    [sync],
  );

  const handleSelectPartner = useCallback(
    async (partner: "A" | "B") => {
      const saved = await getResponses();
      if (partner === "A" && saved.partnerA) {
        setCurrentPartner("B");
        setPhase("answering");
        return;
      }
      if (partner === "B" && saved.partnerB) {
        setCurrentPartner("A");
        setPhase("answering");
        return;
      }
      setCurrentPartner(partner);
      setPhase("answering");
    },
    [getResponses],
  );

  const scoreAndFinish = useCallback(
    (respA: CompatResponses, respB: CompatResponses) => {
      const result = scoreCompatibility(respA, respB);
      saveResult(result);
      updateDashboard({ compatibilityDone: true });
      setPhase("done");
      setTimeout(() => router.push("/compatibility/results"), 800);
    },
    [saveResult, updateDashboard, router],
  );

  const handleAnswer = useCallback(
    async (optionLabel: string) => {
      if (!currentQ) return;
      const next = { ...responses, [currentQ.id]: optionLabel };
      setResponses(next);

      if (isLast) {
        if (syncMode && syncCode) {
          const result = await sync.submitResponses(
            syncCode,
            currentPartner,
            currentPartner === "A" ? "Partner A" : "Partner B",
            next as Record<string, unknown>,
          );

          await savePartnerResponses(currentPartner, next);

          if (result.complete) {
            const session = await sync.getSession(syncCode);
            if (session?.partnerA && session?.partnerB) {
              const respA = (currentPartner === "A" ? next : session.partnerA.responses) as CompatResponses;
              const respB = (currentPartner === "B" ? next : session.partnerB.responses) as CompatResponses;
              scoreAndFinish(respA, respB);
            }
          } else {
            setPhase("sync-waiting");
          }
        } else {
          await savePartnerResponses(currentPartner, next);
          const saved = await getResponses();
          const otherDone =
            currentPartner === "A" ? saved.partnerB !== null : saved.partnerA !== null;

          if (otherDone) {
            const respA = currentPartner === "A" ? next : saved.partnerA!;
            const respB = currentPartner === "B" ? next : saved.partnerB!;
            scoreAndFinish(respA, respB);
          } else {
            if (currentPartner === "A") setACompleted(true);
            else setBCompleted(true);
            setPhase("waiting");
          }
        }
      } else {
        setQuestionIndex((i) => i + 1);
      }
    },
    [
      currentQ,
      isLast,
      responses,
      currentPartner,
      syncMode,
      syncCode,
      sync,
      savePartnerResponses,
      getResponses,
      scoreAndFinish,
    ],
  );

  const handleContinueAsOther = useCallback(() => {
    setCurrentPartner((p) => (p === "A" ? "B" : "A"));
    setQuestionIndex(0);
    setResponses({});
    setPhase("answering");
  }, []);

  const pollForPartner = useCallback(async (): Promise<boolean> => {
    if (!syncCode) return false;
    const session = await sync.getSession(syncCode);
    if (!session) return false;
    if (session.partnerA && session.partnerB) {
      const respA = session.partnerA.responses as CompatResponses;
      const respB = session.partnerB.responses as CompatResponses;
      scoreAndFinish(respA, respB);
      return true;
    }
    return false;
  }, [syncCode, sync, scoreAndFinish]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-28 pt-8">
        {phase === "mode-select" && (
          <ModeSelect
            title="Compatibility Assessment"
            icon="🔮"
            accentColor="#9333ea"
            onSelectTogether={handleTogether}
            onSelectApart={handleApart}
            onJoin={handleJoinScreen}
            loading={sync.loading}
            error={sync.error}
          />
        )}

        {phase === "join" && (
          <JoinPartner
            accentColor="#9333ea"
            onJoin={handleJoinCode}
            onBack={() => setPhase("mode-select")}
            loading={sync.loading}
            error={sync.error}
          />
        )}

        {phase === "pick-partner" && (
          <View className="items-center gap-8 pt-6">
            <View className="h-16 w-16 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10">
              <Text className="text-3xl">🔮</Text>
            </View>
            <Text className="text-xl font-semibold text-text">Compatibility Assessment</Text>
            <Text className="max-w-xs text-center text-sm leading-relaxed text-white/50">
              {questions.length} questions across {DIMENSIONS.length} dimensions.
              Each partner answers independently — no peeking. Takes about 12
              minutes per person.
            </Text>

            <View className="w-full gap-3">
              <Pressable
                onPress={() => handleSelectPartner("A")}
                disabled={aCompleted}
                className="flex-row items-center justify-between rounded-2xl border border-border bg-white/5 p-5 active:bg-white/[0.07] disabled:opacity-40"
              >
                <View>
                  <Text className="text-sm font-semibold text-text">Partner A</Text>
                  <Text className="text-xs text-white/40">
                    {aCompleted ? "Completed ✓" : "Tap to start"}
                  </Text>
                </View>
                <Text className="text-lg">{aCompleted ? "✅" : "→"}</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelectPartner("B")}
                disabled={bCompleted}
                className="flex-row items-center justify-between rounded-2xl border border-border bg-white/5 p-5 active:bg-white/[0.07] disabled:opacity-40"
              >
                <View>
                  <Text className="text-sm font-semibold text-text">Partner B</Text>
                  <Text className="text-xs text-white/40">
                    {bCompleted ? "Completed ✓" : "Tap to start"}
                  </Text>
                </View>
                <Text className="text-lg">{bCompleted ? "✅" : "→"}</Text>
              </Pressable>
            </View>

            {(aCompleted || bCompleted) && !(aCompleted && bCompleted) && (
              <Text className="text-center text-xs text-purple-300/70">
                One partner has completed. Hand the phone to the other to
                unlock results.
              </Text>
            )}
          </View>
        )}

        {phase === "answering" && currentQ && (
          <View className="gap-5 pt-6">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => {
                  if (questionIndex > 0) setQuestionIndex((i) => i - 1);
                  else setPhase(syncMode ? "mode-select" : "pick-partner");
                }}
              >
                <Text className="text-sm text-white/40">←</Text>
              </Pressable>
              <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <View
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-xs text-white/40">
                {questionIndex + 1}/{questions.length}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-purple-500" />
                <Text className="text-xs text-white/50">
                  Partner {currentPartner}
                  {syncMode && " (remote)"}
                </Text>
              </View>
              {dimMeta && (
                <Text className="text-xs font-medium" style={{ color: dimMeta.color }}>
                  {dimMeta.icon} {currentDim}
                </Text>
              )}
            </View>

            {isDimChange && dimMeta && (
              <View className="items-center rounded-xl border border-border bg-white/[0.03] p-4">
                <Text className="text-2xl">{dimMeta.icon}</Text>
                <Text className="mt-1 text-sm font-semibold text-text">{currentDim}</Text>
                <Text className="text-xs text-white/40">{dimMeta.description}</Text>
              </View>
            )}

            <View key={currentQ.id} className="rounded-2xl border border-border bg-white/5 p-6">
              <Text className="text-base leading-relaxed text-zinc-100">{currentQ.text}</Text>
            </View>

            <View className="gap-2">
              {currentQ.options.map((opt) => (
                <Pressable
                  key={opt.label}
                  onPress={() => handleAnswer(opt.label)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3.5 active:bg-white/[0.08]"
                >
                  <Text className="text-sm text-zinc-200">{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {phase === "waiting" && (
          <View className="items-center gap-6 pt-8">
            <View className="h-20 w-20 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10">
              <Text className="text-4xl">🤝</Text>
            </View>
            <Text className="text-lg font-semibold text-text">
              Partner {currentPartner} is done!
            </Text>
            <Text className="max-w-xs text-center text-sm leading-relaxed text-white/50">
              Hand the phone to your partner. Once both complete the
              assessment, your compatibility map will be revealed.
            </Text>
            <Pressable
              onPress={handleContinueAsOther}
              className="rounded-full bg-purple-500 px-6 py-3 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-white">
                Continue as Partner {currentPartner === "A" ? "B" : "A"}
              </Text>
            </Pressable>
          </View>
        )}

        {phase === "sync-waiting" && syncCode && (
          <WaitingRoom
            code={syncCode}
            partnerLabel={currentPartner}
            accentColor="#9333ea"
            onPartnerDone={() => {
              /* scoring handled inside pollForPartner */
            }}
            pollFn={pollForPartner}
          />
        )}

        {phase === "done" && (
          <View className="items-center gap-4 pt-24">
            <Text className="text-5xl">✨</Text>
            <Text className="text-lg font-semibold text-text">Assessment complete!</Text>
            <Text className="text-sm text-white/50">Loading your compatibility map…</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}
