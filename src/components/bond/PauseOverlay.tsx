import { Modal, Pressable, Text, View } from "react-native";

export default function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onResume}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-6"
        onPress={onResume}
      >
        <Pressable className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161616] p-6">
          <Text className="text-center text-2xl font-semibold tracking-tight text-text">
            Pause
          </Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-zinc-200">
            Take a breath. Stay where you are.
          </Text>

          <Pressable
            onPress={onResume}
            className="mt-6 w-full items-center rounded-full bg-accent py-3.5 active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">Resume</Text>
          </Pressable>
          <Text className="mt-3 text-center text-xs text-white/55">
            Tap outside to close.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
