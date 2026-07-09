import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import PauseOverlay from "@/components/bond/PauseOverlay";
import SafeFlow from "@/components/bond/SafeFlow";
import SafeConfirm from "@/components/bond/SafeConfirm";
import CategoryRedirect from "@/components/bond/CategoryRedirect";
import Progress from "@/components/bond/Progress";
import { decks } from "@/data";
import { sanctuaryFlow } from "@/data/sanctuaryFlow";
import { randomItem } from "@/lib/random";

type Card = { category: string; text: string };
type SafeState = null | "active" | "confirm" | "redirect";
type SanctuaryLen = "quick" | "standard" | "deep";

const SAFE_REDIRECT_COUNT = 3;
const sanctuaryTotalByLen: Record<SanctuaryLen, number> = { quick: 20, standard: 40, deep: 60 };

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSanctuarySequence(total: number, seed: number) {
  const base = sanctuaryFlow;
  const out: string[] = [];
  for (let i = 0; i < Math.min(total, base.length); i++) out.push(base[i]);

  const rnd = mulberry32(seed);
  while (out.length < total) {
    const last = out[out.length - 1];
    let pick = last;
    for (let guard = 0; guard < 6 && pick === last; guard++) {
      pick = base[Math.floor(rnd() * base.length)]!;
    }
    out.push(pick);
  }
  return out;
}

export default function BondPlayScreen() {
  const router = useRouter();
  const { mode: modeParam, len: lenParam } = useLocalSearchParams<{
    mode?: string;
    len?: string;
  }>();
  const mode = modeParam || "shuffle";

  const sanctuaryLen: SanctuaryLen =
    lenParam === "quick" || lenParam === "standard" || lenParam === "deep" ? lenParam : "standard";
  const sanctuaryTotal = mode === "sanctuary" ? sanctuaryTotalByLen[sanctuaryLen] : 0;

  const [sanctuarySeed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const sanctuarySequence = useMemo(() => {
    if (mode !== "sanctuary") return [];
    return buildSanctuarySequence(sanctuaryTotal, sanctuarySeed);
  }, [mode, sanctuaryTotal, sanctuarySeed]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const needsCategoryPick = mode === "category" && !selectedCategory;

  const storageKey = useMemo(() => {
    if (mode === "category") return `sanctuary-current-card:${mode}:${selectedCategory ?? ""}`;
    if (mode === "sanctuary") return `sanctuary-current-card:${mode}:${sanctuaryLen}`;
    return `sanctuary-current-card:${mode}`;
  }, [mode, selectedCategory, sanctuaryLen]);

  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);
  const [safe, setSafe] = useState<SafeState>(null);

  const [forcedCategory, setForcedCategory] = useState<string | null>(null);
  const [forcedRemaining, setForcedRemaining] = useState(0);

  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const [cardHistory, setCardHistory] = useState<Record<string, Set<string>>>({});

  const getNextCardFromDeck = (deckKey: string): string => {
    const deck = decks[deckKey as keyof typeof decks];
    const history = cardHistory[deckKey] ?? new Set<string>();

    if (history.size >= deck.length) {
      const newHistory: Record<string, Set<string>> = { ...cardHistory };
      newHistory[deckKey] = new Set();
      setCardHistory(newHistory);
      return randomItem(deck);
    }

    let attempts = 0;
    let card = randomItem(deck);
    while (history.has(card) && attempts < 50) {
      card = randomItem(deck);
      attempts++;
    }

    const newHistory: Record<string, Set<string>> = { ...cardHistory };
    newHistory[deckKey] = new Set(history);
    newHistory[deckKey].add(card);
    setCardHistory(newHistory);

    return card;
  };

  const generateCard = (nextIndex: number, overrideCategory?: string | null): Card => {
    if (overrideCategory) {
      return { category: overrideCategory, text: getNextCardFromDeck(overrideCategory) };
    }
    if (mode === "sanctuary") {
      const category = sanctuarySequence[nextIndex] ?? sanctuarySequence[sanctuarySequence.length - 1];
      return { category, text: getNextCardFromDeck(category) };
    }
    if (mode === "category" && selectedCategory) {
      return { category: selectedCategory, text: getNextCardFromDeck(selectedCategory) };
    }
    const categories = Object.keys(decks) as (keyof typeof decks)[];
    const category = randomItem(categories);
    return { category, text: getNextCardFromDeck(category) };
  };

  // Initialize / restore whenever mode or selectedCategory changes
  useEffect(() => {
    (async () => {
      if (needsCategoryPick) {
        setCurrentCard(null);
        setIndex(0);
        setCardHistory({});
        setReady(true);
        return;
      }

      const saved = await AsyncStorage.getItem(storageKey);
      const historyKey = `${storageKey}:history`;
      const savedHistory = await AsyncStorage.getItem(historyKey);

      if (saved) {
        try {
          const parsed = JSON.parse(saved) as {
            index: number;
            card: Card;
            mode: string;
            selectedCategory: string | null;
            forcedCategory?: string | null;
            forcedRemaining?: number;
          };

          const okCategory = mode !== "category" || parsed.selectedCategory === (selectedCategory ?? null);

          if (parsed.mode === mode && okCategory) {
            setIndex(parsed.index);
            setCurrentCard(parsed.card);
            setForcedCategory(parsed.forcedCategory ?? null);
            setForcedRemaining(parsed.forcedRemaining ?? 0);

            if (savedHistory) {
              try {
                const historyData = JSON.parse(savedHistory) as Record<string, string[]>;
                const historyMap: Record<string, Set<string>> = {};
                for (const [key, cards] of Object.entries(historyData)) {
                  historyMap[key] = new Set(cards);
                }
                setCardHistory(historyMap);
              } catch {
                setCardHistory({});
              }
            }
            setReady(true);
            return;
          }
        } catch {
          // ignore
        }
      }

      setIndex(0);
      setCurrentCard(generateCard(0, null));
      setForcedCategory(null);
      setForcedRemaining(0);
      setCardHistory({});
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedCategory, needsCategoryPick, storageKey]);

  useEffect(() => {
    if (!ready || !currentCard) return;

    AsyncStorage.setItem(
      storageKey,
      JSON.stringify({
        card: currentCard,
        index,
        mode,
        selectedCategory: mode === "category" ? (selectedCategory ?? null) : null,
        forcedCategory: mode === "category" ? null : forcedCategory,
        forcedRemaining: mode === "category" ? 0 : forcedRemaining,
      }),
    ).catch(() => {});

    const historyKey = `${storageKey}:history`;
    const historyData: Record<string, string[]> = {};
    for (const [key, cardSet] of Object.entries(cardHistory)) {
      historyData[key] = Array.from(cardSet);
    }
    AsyncStorage.setItem(historyKey, JSON.stringify(historyData)).catch(() => {});
  }, [ready, currentCard, index, mode, selectedCategory, storageKey, forcedCategory, forcedRemaining, cardHistory]);

  const endSession = () => {
    AsyncStorage.removeItem(storageKey).catch(() => {});
    router.push("/bond/end");
  };

  const handleNext = () => {
    if (!ready || pause || safe || busy) return;

    if (mode === "sanctuary" && index + 1 >= sanctuaryTotal) {
      endSession();
      return;
    }

    setBusy(true);
    const nextIndex = index + 1;
    const shouldForce = mode !== "category" && forcedCategory && forcedRemaining > 0;
    const nextCard = generateCard(nextIndex, shouldForce ? forcedCategory : null);

    setIndex(nextIndex);
    setCurrentCard(nextCard);

    if (shouldForce) {
      setForcedRemaining((n) => {
        const next = n - 1;
        if (next <= 0) {
          setForcedCategory(null);
          return 0;
        }
        return next;
      });
    }

    setTimeout(() => setBusy(false), 280);
  };

  const skipCard = () => {
    setSafe(null);
    handleNext();
  };

  const touchStartX = useRef<number | null>(null);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gesture) => {
        touchStartX.current = gesture.x0;
      },
      onPanResponderRelease: (_, gesture) => {
        if (touchStartX.current === null) return;
        if (gesture.dx < -60) handleNext();
        touchStartX.current = null;
      },
    }),
  ).current;

  if (!ready) return <View className="flex-1 bg-bg" />;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]} {...panResponder.panHandlers}>
      <Image
        source="https://res.cloudinary.com/dpnzmcban/image/upload/v1768124994/ba8728b6-a5a4-4659-b3d5-3b2946b04fcb_qtq1yh.jpg"
        style={{ position: "absolute", inset: 0 }}
        contentFit="cover"
      />
      <View className="absolute inset-0 bg-black/80" />

      {pause && <PauseOverlay onResume={() => setPause(false)} />}

      {safe === "active" && (
        <SafeFlow
          onRedirect={() => setSafe("redirect")}
          onSkip={() => setSafe("confirm")}
          onEnd={endSession}
          onReconsider={() => setSafe(null)}
        />
      )}

      {safe === "confirm" && (
        <SafeConfirm
          onConfirm={skipCard}
          onCancel={() => setSafe("redirect")}
          onReconsider={() => setSafe("active")}
        />
      )}

      {safe === "redirect" && (
        <CategoryRedirect
          onSelect={(category) => {
            setSafe(null);

            if (mode === "category") {
              setSelectedCategory(category);
              setIndex(0);
              setCurrentCard({ category, text: getNextCardFromDeck(category) });
              setCardHistory({ [category]: new Set([currentCard?.text || ""]) });
              return;
            }

            setForcedCategory(category);
            setForcedRemaining(SAFE_REDIRECT_COUNT);
            setCurrentCard({ category, text: getNextCardFromDeck(category) });
          }}
        />
      )}

      {needsCategoryPick && (
        <CategoryRedirect
          onSelect={(category) => {
            setSelectedCategory(category);
            setIndex(0);
            setCurrentCard({ category, text: getNextCardFromDeck(category) });
            setCardHistory({ [category]: new Set() });
          }}
        />
      )}

      {!needsCategoryPick && currentCard && (
        <View className="flex-1 justify-center px-6 py-10">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable
              onPress={() => setPause(true)}
              className="rounded-full border border-border bg-white/5 px-4 py-2 active:bg-white/10"
            >
              <Text className="text-sm font-semibold text-text">Pause</Text>
            </Pressable>

            {mode === "sanctuary" ? (
              <View className="min-w-[180px]">
                <Progress current={Math.min(index + 1, sanctuaryTotal)} total={sanctuaryTotal} />
              </View>
            ) : (
              <Text className="text-xs text-white/55">Swipe left for next</Text>
            )}

            <Pressable
              onPress={() => {
                setSafe("active");
                setPause(false);
              }}
              className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 active:bg-emerald-500/15"
            >
              <Text className="text-sm font-semibold text-emerald-200">Safe</Text>
            </Pressable>
          </View>

          <View className="rounded-2xl border border-border bg-white/5 p-6">
            <View className="mb-3 flex-row flex-wrap items-center justify-center gap-2">
              <View className="rounded-full border border-white/10 bg-black/30 px-4 py-2">
                <Text className="text-xs font-semibold tracking-widest text-amber-200">
                  {currentCard.category.toUpperCase()}
                </Text>
              </View>
              {mode !== "category" && forcedCategory && forcedRemaining > 0 && (
                <View className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <Text className="text-[11px] font-semibold text-white/70">
                    Direction: {forcedCategory} • {forcedRemaining} left
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-center text-2xl font-semibold leading-snug text-text">
              {currentCard.text}
            </Text>
          </View>

          <View className="mt-6 gap-3">
            <Pressable
              onPress={handleNext}
              disabled={busy || pause || !!safe}
              className="w-full items-center rounded-full bg-accent py-4 active:opacity-90 disabled:opacity-60"
            >
              <Text className="text-base font-semibold text-white">Next</Text>
            </Pressable>

            <View className="flex-row items-center justify-between gap-3">
              {mode === "category" && selectedCategory && (
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  className="rounded-full border border-border bg-white/5 px-5 py-3 active:bg-white/10"
                >
                  <Text className="text-sm font-semibold text-amber-200">Change category</Text>
                </Pressable>
              )}

              <Pressable
                onPress={endSession}
                className="ml-auto rounded-full border border-accent/60 px-5 py-3 active:bg-accent/10"
              >
                <Text className="text-sm font-semibold text-accent">End session</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
