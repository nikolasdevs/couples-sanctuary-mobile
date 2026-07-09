import { Modal, Pressable, Text, View } from "react-native";

export default function SafeConfirm({
  onConfirm,
  onCancel,
  onReconsider,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  onReconsider: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161616] p-6">
          <Text className="text-center text-2xl font-semibold tracking-tight text-text">
            Before continuing
          </Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-zinc-200">
            You paused for safety. Are you both comfortable continuing now?
          </Text>

          <View className="mt-6 gap-3">
            <Pressable
              onPress={onConfirm}
              className="w-full items-center rounded-full bg-accent py-3.5 active:opacity-90"
            >
              <Text className="text-base font-semibold text-white">
                We&apos;re okay to continue
              </Text>
            </Pressable>

            <Pressable
              onPress={onCancel}
              className="w-full items-center rounded-xl border border-white/12 bg-white/5 py-3 active:bg-white/10"
            >
              <Text className="text-sm font-semibold text-text">
                Choose another direction
              </Text>
            </Pressable>

            <Pressable onPress={onReconsider} className="w-full items-center py-3">
              <Text className="text-sm font-medium text-emerald-200 underline">
                Not yet — go back
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
