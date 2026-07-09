import { Modal, Pressable, Text, View } from "react-native";

export default function SafeFlow({
  onRedirect,
  onSkip,
  onEnd,
  onReconsider,
}: {
  onRedirect: () => void;
  onSkip: () => void;
  onEnd: () => void;
  onReconsider: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161616] p-6">
          <View className="mx-auto mb-3 self-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2">
            <Text className="text-xs font-semibold text-emerald-200">Safe moment</Text>
          </View>

          <Text className="text-center text-2xl font-semibold tracking-tight text-text">
            A boundary was set
          </Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-zinc-200">
            You don&apos;t need to explain it. Choose what feels best for both
            of you.
          </Text>

          <View className="mt-6 gap-3">
            <Pressable
              onPress={onRedirect}
              className="w-full items-center rounded-xl border border-white/12 bg-white/5 py-3 active:bg-white/10"
            >
              <Text className="text-sm font-semibold text-text">Change direction</Text>
            </Pressable>

            <Pressable
              onPress={onSkip}
              className="w-full items-center rounded-xl border border-white/12 bg-white/5 py-3 active:bg-white/10"
            >
              <Text className="text-sm font-semibold text-text">Skip this card</Text>
            </Pressable>

            <View className="pt-2">
              <Pressable onPress={onReconsider} className="w-full items-center py-3">
                <Text className="text-sm font-medium text-emerald-200 underline">
                  Reconsider
                </Text>
              </Pressable>

              <Pressable onPress={onEnd} className="mt-1 w-full items-center py-3">
                <Text className="text-sm font-semibold text-accent underline">
                  End session
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
