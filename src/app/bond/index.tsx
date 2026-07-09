import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";

type SanctuaryLen = "quick" | "standard" | "deep";

const cards: {
  title: string;
  src: string;
  href: "/bond/play";
  params: Record<string, string>;
  featured?: boolean;
  description: string;
  meta: string;
}[] = [
  {
    title: "Sanctuary Flow",
    src: "https://res.cloudinary.com/dpnzmcban/image/upload/v1768177741/IMG_7221_otbxdj.jpg",
    href: "/bond/play",
    params: { mode: "sanctuary" },
    featured: true,
    description: "A guided progression designed to deepen connection step by step.",
    meta: "Best first choice • 10–15 min",
  },
  {
    title: "Shuffle Mode",
    src: "https://res.cloudinary.com/dpnzmcban/image/upload/v1768177745/IMG_7223_wqbwk8.jpg",
    href: "/bond/play",
    params: { mode: "shuffle" },
    description: "Jump into a mix of prompts—surprising, playful, and spontaneous.",
    meta: "Fast start • 5–10 min",
  },
  {
    title: "Choose a Category",
    src: "https://res.cloudinary.com/dpnzmcban/image/upload/v1768177737/IMG_7222_aiwfpo.jpg",
    href: "/bond/play",
    params: { mode: "category" },
    description: "Pick a theme that fits the moment (communication, intimacy, future, etc.).",
    meta: "Most control • any pace",
  },
];

const sanctuaryMeta: Record<SanctuaryLen, { total: number; hint: string }> = {
  quick: { total: 20, hint: "15–25 min" },
  standard: { total: 40, hint: "30–50 min" },
  deep: { total: 60, hint: "50–80 min" },
};

export default function BondHubScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [len, setLen] = useState<SanctuaryLen>("standard");

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-16 pt-8">
        <View className="flex-row items-center justify-between">
          <Link href="/dashboard" className="rounded-full border border-border bg-white/5 px-4 py-2">
            <Text className="text-sm font-medium text-zinc-100">← Dashboard</Text>
          </Link>
          <Text className="text-xs text-white/55">Private • No tracking</Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl font-semibold tracking-tight text-text">
            Choose your experience
          </Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-zinc-200">
            Pick a pace that matches your mood. You can pause, breathe, and
            return whenever you&apos;re ready.
          </Text>
        </View>

        <View className="gap-5">
          {cards.map((card) => (
            <Pressable
              key={card.title}
              onPress={() => {
                if (card.params.mode === "sanctuary") {
                  setShowModal(true);
                } else {
                  router.push({ pathname: card.href, params: card.params });
                }
              }}
              className={`aspect-[4/5] w-full overflow-hidden rounded-2xl border ${
                card.featured ? "border-accent/35" : "border-border"
              }`}
            >
              <Image
                source={card.src}
                style={{ position: "absolute", inset: 0 }}
                contentFit="cover"
              />
              <View className="absolute inset-0 bg-black/50" />
              {card.featured && (
                <View className="absolute left-4 top-4 rounded-full border border-accent/35 bg-accent/15 px-3 py-1">
                  <Text className="text-xs font-semibold text-text">Recommended</Text>
                </View>
              )}
              <View className="absolute inset-x-0 bottom-0 gap-2 p-5">
                <View className="self-start rounded-full border border-white/10 bg-black/35 px-4 py-2">
                  <Text className="text-base font-semibold tracking-tight text-text">
                    {card.title}
                  </Text>
                </View>
                <Text className="text-sm leading-relaxed text-white/80">{card.description}</Text>
                <Text className="text-xs text-white/60">{card.meta}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text className="text-center text-xs leading-relaxed text-white/60">
          Tip: put phones on silent and sit close. If anything feels too
          intense, you can stop at any time.
        </Text>
      </ScrollView>

      <Modal transparent animationType="fade" visible={showModal}>
        <View className="flex-1 items-center justify-center bg-black/70 px-6">
          <View className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#161616] p-6">
            <Text className="text-xs font-semibold tracking-widest text-white/70">SANCTUARY</Text>
            <Text className="mt-2 text-xl font-semibold text-text">Choose your session length</Text>
            <Text className="mt-1 text-xs text-white/60">
              {sanctuaryMeta[len].total} prompts • {sanctuaryMeta[len].hint}
            </Text>

            <View className="mt-5 flex-row items-center gap-2 rounded-full border border-white/10 bg-black/25 p-1">
              {(["quick", "standard", "deep"] as SanctuaryLen[]).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLen(l)}
                  className={`flex-1 items-center rounded-full px-4 py-2 ${
                    len === l ? "border border-white/15 bg-white/10" : "border border-white/10"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      len === l ? "text-text" : "text-white/70"
                    }`}
                  >
                    {l}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => {
                setShowModal(false);
                router.push({ pathname: "/bond/play", params: { mode: "sanctuary", len } });
              }}
              className="mt-5 w-full items-center rounded-full bg-accent py-4 active:opacity-90"
            >
              <Text className="text-base font-semibold text-white">Start Sanctuary</Text>
            </Pressable>

            <Text className="mt-3 text-center text-xs text-white/55">
              You can pause anytime. Use Safe if anything feels intense.
            </Text>

            <Pressable onPress={() => setShowModal(false)} className="mt-3 items-center py-2">
              <Text className="text-xs font-semibold text-white/70">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
