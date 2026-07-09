import { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Link } from "expo-router";

import FeedbackForm from "@/components/bond/FeedbackForm";
import { useDashboard } from "@/lib/useDashboard";

export default function BondEndScreen() {
  const { recordSession } = useDashboard();
  const recorded = useRef(false);

  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      recordSession();
    }
  }, [recordSession]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <Image
        source="https://res.cloudinary.com/dpnzmcban/image/upload/v1768177737/IMG_7222_aiwfpo.jpg"
        style={{ position: "absolute", inset: 0 }}
        contentFit="cover"
      />
      <View className="absolute inset-0 bg-black/80" />

      <ScrollView className="flex-1" contentContainerClassName="items-center gap-8 px-6 py-12">
        <View className="items-center rounded-2xl border border-border bg-white/5 p-6">
          <View className="mb-4 self-center rounded-full border border-white/10 bg-black/30 px-4 py-2">
            <Text className="text-xs font-semibold tracking-widest text-white/75">
              SESSION COMPLETE
            </Text>
          </View>

          <Text className="text-center text-2xl font-semibold tracking-tight text-text">
            Closing the Sanctuary
          </Text>

          <Text className="mt-4 max-w-sm text-center text-sm leading-relaxed text-zinc-200">
            Look at your partner. Say one promise you want to keep for us.
          </Text>

          <Text className="mt-6 text-xs text-white/55">
            Thank you for choosing presence.
          </Text>
        </View>

        <FeedbackForm />

        <Link
          href="/dashboard"
          className="rounded-full border border-border bg-white/5 px-5 py-3 text-sm font-semibold text-text"
        >
          Return to Dashboard
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
