import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

import { BottomNav } from "@/components/dashboard/BottomNav";
import { ModeSelect } from "@/components/sync/ModeSelect";
import { JoinPartner } from "@/components/sync/JoinPartner";
import { WaitingRoom } from "@/components/sync/WaitingRoom";
import {
  currentWeekKey,
  currentWeekSeed,
  getWeeklyQuestions,
  type CheckInQuestion,
} from "@/data/checkinQuestions";
import { scoreCheckIn, type Responses } from "@/lib/checkinScoring";
import { useDashboard } from "@/lib/useDashboard";
import { useCheckinStorage } from "@/lib/useCheckinStorage";
import { useSync } from "@/lib/useSync";

type Phase =
  | "mode-select"
  | "pick-partner"
  | "join"
  | "answering"
  | "waiting"
  | "sync-waiting"
  | "done";

export default function CheckInActiveScreen() {
  const router = useRouter();
  const { sync: urlSyncCode, partner: urlPartner } = useLocalSearchParams<{
    sync?: string;
    partner?: "A" | "B";
  }>();
  const { savePartnerResponses, getWeekResponses, saveResult } = useCheckinStorage();
  const { update: updateDashboard } = useDashboard();
  const sync = useSync();

  const weekKey = useMemo(() => currentWeekKey(), []);
  const weekSeed = useMemo(() => currentWeekSeed(), []);
  const questions = useMemo(() => getWeeklyQuestions(weekSeed), [weekSeed]);

  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState(false);

  const [phase, setPhase] = useState<Phase>("mode-select");
  const [currentPartner, setCurrentPartner] = useState<"A" | "B">("A");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [ready, setReady] = useState(false);

  const [aCompleted, setACompleted] = useState(false);
  const [bCompleted, setBCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const weekData = await getWeekResponses(weekKey);
      if (weekData.partnerA) setACompleted(true);
      if (weekData.partnerB) setBCompleted(true);

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

  const handleTogether = useCallback(() => setPhase("pick-partner"), []);

  const handleApart = useCallback(async () => {
    const code = await sync.createSession("checkin", weekKey);
    if (code) {
      setSyncCode(code);
      setSyncMode(true);
      setCurrentPartner("A");
      setPhase("answering");
    }
  }, [sync, weekKey]);

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
      const weekData = await getWeekResponses(weekKey);
      if (partner === "A" && weekData.partnerA) {
        setCurrentPartner("B");
        setPhase("answering");
        return;
      }
      if (partner === "B" && weekData.partnerB) {
        setCurrentPartner("A");
        setPhase("answering");
        return;
      }
      setCurrentPartner(partner);
      setPhase("answering");
    },
    [weekKey, getWeekResponses],
  );

  const scoreAndFinish = useCallback(
    (responsesA: Responses, responsesB: Responses) => {
      const result = scoreCheckIn(questions, responsesA, responsesB, weekKey);
      saveResult(result);
      updateDashboard({
        healthScore: result.overallScore,
        latestInsight: result.insight,
        checkinsDone: 1,
      });
      setPhase("done");
      setTimeout(() => router.push("/checkin/results"), 800);
    },
    [questions, weekKey, saveResult, updateDashboard, router],
  );

  const handleAnswer = useCallback(
    async (value: number | string) => {
      if (!currentQ) return;
      const next = { ...responses, [currentQ.id]: value };
      setResponses(next);

      if (isLast) {
        if (syncMode && syncCode) {
          const result = await sync.submitResponses(
            syncCode,
            currentPartner,
            currentPartner === "A" ? "Partner A" : "Partner B",
            next as Record<string, unknown>,
          );

          await savePartnerResponses(weekKey, currentPartner, next);

          if (result.complete) {
            const session = await sync.getSession(syncCode);
            if (session?.partnerA && session?.partnerB) {
              const respA = (currentPartner === "A" ? next : session.partnerA.responses) as Responses;
              const respB = (currentPartner === "B" ? next : session.partnerB.responses) as Responses;
              scoreAndFinish(respA, respB);
            }
          } else {
            setPhase("sync-waiting");
          }
        } else {
          await savePartnerResponses(weekKey, currentPartner, next);
          const weekData = await getWeekResponses(weekKey);
          const otherDone =
            currentPartner === "A" ? weekData.partnerB !== null : weekData.partnerA !== null;

          if (otherDone) {
            const responsesA = currentPartner === "A" ? next : weekData.partnerA!;
            const responsesB = currentPartner === "B" ? next : weekData.partnerB!;
            scoreAndFinish(responsesA, responsesB);
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
      weekKey,
      syncMode,
      syncCode,
      sync,
      savePartnerResponses,
      getWeekResponses,
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
      const respA = session.partnerA.responses as Responses;
      const respB = session.partnerB.responses as Responses;
      scoreAndFinish(respA, respB);
      return true;
    }
    return false;
  }, [syncCode, sync, scoreAndFinish]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-28 pt-8">
        <Link href="/dashboard" className="mb-6 text-xs text-white/40">
          ← Dashboard
        </Link>

        {phase === "mode-select" && (
          <ModeSelect
            title="Weekly Check-In"
            icon="💬"
            accentColor="#f59e0b"
            onSelectTogether={handleTogether}
            onSelectApart={handleApart}
            onJoin={handleJoinScreen}
            loading={sync.loading}
            error={sync.error}
          />
        )}

        {phase === "join" && (
          <JoinPartner
            accentColor="#f59e0b"
            onJoin={handleJoinCode}
            onBack={() => setPhase("mode-select")}
            loading={sync.loading}
            error={sync.error}
          />
        )}

        {phase === "pick-partner" && (
          <View className="items-center gap-8 pt-6">
            <View className="h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
              <Text className="text-3xl">💬</Text>
            </View>
            <Text className="text-xl font-semibold text-text">Weekly Check-In</Text>
            <Text className="max-w-xs text-center text-sm leading-relaxed text-white/50">
              Each partner answers independently. Hand the phone to your
              partner when it&apos;s their turn — no peeking.
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
              <Text className="text-center text-xs text-amber-400/70">
                One partner has completed. Hand the phone to the other to
                unlock results.
              </Text>
            )}
          </View>
        )}

        {phase === "answering" && currentQ && (
          <View className="gap-6 pt-8">
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
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-xs text-white/40">
                {questionIndex + 1}/{questions.length}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-amber-500" />
              <Text className="text-xs text-white/50">
                Partner {currentPartner} answering
                {syncMode && " (remote)"}
              </Text>
            </View>

            <View
              key={currentQ.id}
              className="rounded-2xl border border-border bg-white/5 p-6"
            >
              <Text className="mb-1 text-[10px] font-medium uppercase tracking-wider text-amber-500/60">
                {currentQ.pillar}
              </Text>
              <Text className="text-base leading-relaxed text-zinc-100">
                {currentQ.text}
              </Text>
            </View>

            <QuestionInput
              key={`input-${currentQ.id}`}
              question={currentQ}
              onAnswer={handleAnswer}
            />
          </View>
        )}

        {phase === "waiting" && (
          <View className="items-center gap-6 pt-8">
            <View className="h-20 w-20 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
              <Text className="text-4xl">🤝</Text>
            </View>
            <Text className="text-lg font-semibold text-text">
              Partner {currentPartner} is done!
            </Text>
            <Text className="max-w-xs text-center text-sm leading-relaxed text-white/50">
              Hand the phone to your partner. Once both of you complete the
              check-in, your results will be revealed.
            </Text>
            <Pressable
              onPress={handleContinueAsOther}
              className="rounded-full bg-amber-500 px-6 py-3 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-black">
                Continue as Partner {currentPartner === "A" ? "B" : "A"}
              </Text>
            </Pressable>
          </View>
        )}

        {phase === "sync-waiting" && syncCode && (
          <WaitingRoom
            code={syncCode}
            partnerLabel={currentPartner}
            accentColor="#f59e0b"
            onPartnerDone={() => {
              /* scoring handled inside pollForPartner */
            }}
            pollFn={pollForPartner}
          />
        )}

        {phase === "done" && (
          <View className="items-center gap-4 pt-24">
            <Text className="text-5xl">✨</Text>
            <Text className="text-lg font-semibold text-text">Check-in complete!</Text>
            <Text className="text-sm text-white/50">Loading your results…</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

// ── Answer input components ─────────────────────────────────────

function QuestionInput({
  question,
  onAnswer,
}: {
  question: CheckInQuestion;
  onAnswer: (value: number | string) => void;
}) {
  if (question.type === "scale") return <ScaleInput onAnswer={onAnswer} />;
  if (question.type === "yesno") return <YesNoInput onAnswer={onAnswer} />;
  return <TextAnswerInput onAnswer={onAnswer} />;
}

function ScaleInput({ onAnswer }: { onAnswer: (v: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const labels = ["Strongly\nDisagree", "Disagree", "Neutral", "Agree", "Strongly\nAgree"];

  return (
    <View className="gap-4">
      <View className="flex-row justify-between gap-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <Pressable
            key={val}
            onPress={() => setSelected(val)}
            className={`flex-1 items-center gap-2 rounded-xl border p-3 ${
              selected === val
                ? "border-amber-500/50 bg-amber-500/10"
                : "border-border bg-white/5"
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                selected === val ? "text-amber-300" : "text-white/40"
              }`}
            >
              {val}
            </Text>
            <Text
              className={`text-center text-[9px] leading-tight ${
                selected === val ? "text-amber-300" : "text-white/40"
              }`}
            >
              {labels[val - 1]}
            </Text>
          </Pressable>
        ))}
      </View>
      {selected !== null && (
        <Pressable
          onPress={() => onAnswer(selected)}
          className="self-end rounded-full bg-amber-500 px-5 py-2.5 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-black">Next →</Text>
        </Pressable>
      )}
    </View>
  );
}

function YesNoInput({ onAnswer }: { onAnswer: (v: number) => void }) {
  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={() => onAnswer(1)}
        className="flex-1 items-center rounded-xl border border-border bg-white/5 py-4 active:bg-white/[0.07]"
      >
        <Text className="text-sm font-semibold text-text">Yes</Text>
      </Pressable>
      <Pressable
        onPress={() => onAnswer(5)}
        className="flex-1 items-center rounded-xl border border-border bg-white/5 py-4 active:bg-white/[0.07]"
      >
        <Text className="text-sm font-semibold text-text">No</Text>
      </Pressable>
    </View>
  );
}

function TextAnswerInput({ onAnswer }: { onAnswer: (v: string) => void }) {
  const [text, setText] = useState("");

  return (
    <View className="gap-3">
      <RNTextInput
        value={text}
        onChangeText={(t) => setText(t.slice(0, 500))}
        placeholder="Share your thoughts…"
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="w-full rounded-xl border border-border bg-white/5 p-4 text-sm text-zinc-100"
      />
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] text-white/30">{text.length}/500</Text>
        <Pressable
          onPress={() => onAnswer(text || "(no response)")}
          className="rounded-full bg-amber-500 px-5 py-2.5 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-black">Next →</Text>
        </Pressable>
      </View>
    </View>
  );
}
